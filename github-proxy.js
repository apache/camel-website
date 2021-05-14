const PID_FILE = '.github-proxy.pid';

if (process.argv.indexOf('stop') > 0) {
  const { readFile, existsSync, unlink } = require('fs');

  if (!existsSync(PID_FILE)) {
    return;
  }

  readFile(PID_FILE, (err, data) => {
    if (err) {
      throw err;
    }

    try {
      process.kill(Number.parseInt(data), 'SIGINT');
    } catch (e) {
      unlink(PID_FILE);
    }
  });
} else if (process.argv.indexOf('start') > 0) {
  const fs = require('fs');

  const log = fs.createWriteStream('.github-proxy.log', { flags: 'a' });
  process.stdout.write = process.stderr.write = log.write.bind(log);

  if (!(process.env.GITHUB_USR && process.env.GITHUB_PSW)) {
    console.log('No GITHUB_USR and GITHUB_PSW environment variables set');
    process.exit(1);
  }

  fs.writeFile(PID_FILE, process.pid.toString());
  process.on('SIGINT', (code) => {
    console.log('Stopping');
    log.uncork();
    log.end();
    fs.unlink(PID_FILE);
    process.exit(0);
  });

  const httpProxy = require('http-proxy');

  const proxy = httpProxy.createProxyServer({
    auth: `${process.env.GITHUB_USR}:${process.env.GITHUB_PSW}`,
    changeOrigin: true,
    target: 'https://api.github.com'
  }).listen(22635)
  console.info('Proxy started.');

  proxy.on('error', console.error);
} else {
  const { spawn } = require('child_process');

  const proxy = spawn(process.argv[0], ['github-proxy.js', 'start'], {
    detached: true,
    stdio: 'ignore'
  });

  proxy.unref();
}
