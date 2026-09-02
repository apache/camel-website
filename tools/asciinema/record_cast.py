#!/usr/bin/env python3
"""Record a terminal program to an asciicast v2 file, driving it from a VHS-style tape.

The Camel TUI probes the terminal on startup (primary DA, cursor position report, DECRQM
for mode 2027) and blocks until it gets answers, so a bare pty is not enough. This script
plays the part of the emulator: it replies to those queries, injects the tape's keystrokes
on schedule, and timestamps every byte the program writes as it arrives.
"""
import codecs
import json
import os
import pty
import re
import select
import shlex
import signal
import struct
import sys
import termios
import time
import fcntl

COLS, ROWS = 160, 44

KEYS = {
    'Enter': '\r',
    'Escape': '\x1b',
    'Down': '\x1b[B',
    'Up': '\x1b[A',
    'Left': '\x1b[D',
    'Right': '\x1b[C',
    'Tab': '\t',
    'Space': ' ',
    'Backspace': '\x7f',
}

# Answers the TUI waits for. Anything not listed here is reported so it can be added.
REPLIES = [
    (re.compile(rb'\x1b\[\?2027\$p'), b'\x1b[?2027;1$y'),   # DECRQM: mode known, reset
    (re.compile(rb'\x1b\[>0?q'), b'\x1bP>|vhs-stub\x1b\\'),  # XTVERSION
    (re.compile(rb'\x1b\[>c'), b'\x1b[>0;10;1c'),            # secondary DA
    (re.compile(rb'\x1b\[c'), b'\x1b[?62;1;2;6;9;15;22c'),   # primary DA
    (re.compile(rb'\x1b\[6n'), b'\x1b[1;1R'),                # cursor position report
    (re.compile(rb'\x1b\[\?u'), b'\x1b[?0u'),                # kitty keyboard protocol
    (re.compile(rb'\x1b\]1[01];\?(?:\x07|\x1b\\)'), b'\x1b]11;rgb:1e1e/1e1e/1e1e\x07'),
]
# Preserve enough raw output to recognize any supported query split across PTY reads.
PROBE_OVERLAP = 64


def parse_tape(path):
    """Turn a tape into [(delay_seconds, bytes_to_send)]; Set/Output lines are ignored."""
    steps = []
    for line in open(path):
        line = line.strip()
        if not line or line.startswith('#') or line.split()[0] in ('Set', 'Output', 'Require', 'Hide', 'Show'):
            continue
        head, _, rest = line.partition(' ')
        rest = rest.strip()
        if head == 'Sleep':
            steps.append((parse_duration(rest), b''))
        elif head == 'Type':
            steps.append((0.0, shlex.split(rest)[0].encode()))
        elif head in KEYS:
            count = int(rest) if rest.isdigit() else 1
            steps.append((0.0, KEYS[head].encode() * count))
        else:
            print(f'warning: ignoring tape command {line!r}', file=sys.stderr)
    return steps


def parse_duration(text):
    text = text.strip().lower()
    if text.endswith('ms'):
        return float(text[:-2]) / 1000
    if text.endswith('s'):
        return float(text[:-1])
    return float(text)


def main():
    tape, cast_path, settle = sys.argv[1], sys.argv[2], float(sys.argv[3])
    command = sys.argv[4:]
    steps = [(settle, b'')] + parse_tape(tape) + [(2.0, b'q'), (1.5, b'\r'), (3.0, b'')]

    pid, master = pty.fork()
    if pid == 0:
        # NOTE the size has to be set here, before exec. Setting it on the master after the fork
        # lets the program draw one frame at the default 80x24 and then resize, which leaves stale
        # rows from the first frame on screen for the rest of the recording.
        fcntl.ioctl(0, termios.TIOCSWINSZ, struct.pack('HHHH', ROWS, COLS, 0, 0))
        os.environ['TERM'] = 'xterm-256color'
        os.environ['COLORTERM'] = 'truecolor'
        os.execvp(command[0], command)

    events = []
    start = time.monotonic()
    deadline = start
    pending = list(steps)
    unanswered = set()
    probe_buffer = b''
    # NOTE an incremental decoder, not chunk.decode(). A read can split a multi-byte sequence
    # across two chunks, and decoding each chunk on its own turns the halves into U+FFFD. Every
    # replacement character costs a column, because a 2-wide emoji becomes a 1-wide box, and the
    # rest of that row ends up drawn one cell to the left of where the program thinks it is.
    decoder = codecs.getincrementaldecoder('utf-8')('replace')

    with open(cast_path, 'w') as out:
        out.write(json.dumps({
            'version': 2, 'width': COLS, 'height': ROWS,
            'timestamp': int(time.time()), 'idle_time_limit': 2.0,
            'title': 'Apache Camel TUI', 'env': {'TERM': 'xterm-256color'},
        }) + '\n')

        while True:
            now = time.monotonic()
            if pending and now >= deadline:
                delay, keys = pending.pop(0)
                deadline = now + delay
                if keys:
                    os.write(master, keys)
                continue
            if not pending and now >= deadline:
                break
            timeout = max(0.0, min(deadline - now, 0.05))
            readable, _, _ = select.select([master], [], [], timeout)
            if not readable:
                continue
            try:
                chunk = os.read(master, 65536)
            except OSError:
                break
            if not chunk:
                break
            probe_data = probe_buffer + chunk
            for pattern, reply in REPLIES:
                if any(match.end() > len(probe_buffer) for match in pattern.finditer(probe_data)):
                    os.write(master, reply)
            for match in re.finditer(rb'\x1b[\[\]][^\x07\x1b]*[\$a-zA-Z\x07]', probe_data):
                query = match.group()
                if (
                    match.end() > len(probe_buffer)
                    and query.endswith((b'n', b'c', b'$p', b'u'))
                    and not any(p.search(query) for p, _ in REPLIES)
                ):
                    unanswered.add(query)
            probe_buffer = probe_data[-PROBE_OVERLAP:]
            text = decoder.decode(chunk)
            if not text:
                continue
            events.append((time.monotonic() - start, text))
            out.write(json.dumps([round(events[-1][0], 6), 'o', text]) + '\n')

        os.kill(pid, signal.SIGTERM)
        os.waitpid(pid, 0)

    span = events[-1][0] - events[0][0] if events else 0
    print(f'events={len(events)} chars={sum(len(c) for _, c in events)} '
          f'replacement_chars={sum(c.count(chr(0xFFFD)) for _, c in events)} '
          f'first={events[0][0]:.2f}s last={events[-1][0]:.2f}s span={span:.2f}s')
    if unanswered:
        print('unanswered queries:', sorted(unanswered), file=sys.stderr)


main()
