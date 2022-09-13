---
title: "Camel Textual Route debugging in Vim"
date: 2022-09-14
authors: [Navyashree0923]
categories: ["Tooling"]
preview: "Camel Textual Route debugging in Vim"
---

A month before it became easier to provide language support inside Vim, Neovim using coc.nvim -[See this blog post](/blog/2022/07/coc-nvim-camel-lsp/). It is now time to use Camel Debug Adapter in Vim[camel-tooling/camel-dap-client-vim](https://github.com/camel-tooling/camel-dap-client-vim).

# VIM Debug Adapter client for Apache Camel

I just got the debug integration for camel in vim running using [vimspector](https://github.com/puremourning/vimspector).

![Demo](images/vimdap.gif)

## Install
Install the vimspector using vim-plug plugin manager.

- Inside `.vimrc` file:

- `Plug 'puremourning/vimspector'`

- `:PlugInstall`

# How to get Camel Debug Adapter server.jar file?
- I found 2 releases of camel DAP server here - https://github.com/camel-tooling/camel-debug-adapter/tags but it doesn't contain any jar files. To get a jar file either you can compile the source or download from the Maven Central repository.
- To download from Maven Central repository
```sh
cd /home
curl -LO https://repo1.maven.org/maven2/com/github/camel-tooling/camel-dap-server/0.4.0/camel-dap-server-0.4.0.jar
  ```
# Inside .vimrc file:
```viml
  call plug#begin()
  " The default plugin directory will be as follows:
  "   - Vim (Linux/macOS): '~/.vim/plugged'
  "   - Vim (Windows): '~/vimfiles/plugged'
  "   - Neovim (Linux/macOS/Windows): stdpath('data') . '/plugged'
  " You can specify a custom plugin directory by passing it as the argument
  "   - e.g. `call plug#begin('~/.vim/plugged')`
  "   - Avoid using standard Vim directory names like 'plugin'
  "
  "
  " Use release branch (recommend)
  Plug 'neoclide/coc.nvim', {'branch': 'release'}
  Plug 'puremourning/vimspector'
  call plug#end()

  " https://github.com/puremourning/vimspector/blob/master/README.md#human-mode
  let g:vimspector_enable_mappings = 'HUMAN'

  " Vimspector key mappings
  nnoremap <Leader>dd :call vimspector#Launch()<CR>
  nnoremap <Leader>dt :call vimspector#ToggleBreakpoint()<CR>
  nnoremap <Leader>dc :call vimspector#Continue()<CR>
  nnoremap <Leader>de :call vimspector#Reset()<CR>
```

# Configure camel-example Debug Gadget
Place this content in `cust_camel-debug-adapter.json` in your vimspector directory (path might be different for you)
```sh
cd ~/.vim/plugged/vimspector/gadgets/linux/.gadgets.d
```
Vimspector adapter configuration:
```json
{
  "adapters": {
    "cust_camel-debug-adapter": {
         "command": [
        "java",
        "-jar",
        "/home/camel-dap-server-0.4.0.jar"
         ]
    }
  }
}
```
# Vimspector Config
 Create a file called `.vimspector.json` in the project root and then place the following content

 Vimspector debugger configuration:
 ```json
{
  "configurations": {
    "Camel Debug Adapter - Attach": {
      "adapter": "cust_camel-debug-adapter",
      "configuration": {
        "request": "attach",
        "sourcePaths": [ "${workspaceRoot}/src/main/java" ],
        "hostName": "localhost",
        "port": "${JVMDebugPort}",
        "stepFilters": {
          "skipClasses": [ "$$JDK" ]
        }
      }
    }
  }
}
```
# How to attach Camel application to vimspector for debugging

* To test the Camel application debugging need a working example. Lot of good examples are provided in this repo, [camel-examples](https://github.com/apache/camel-examples).
* To enable Camel Textual Route debugging, now we can use directly `mvn camel:debug`.

## Make the following changes and run your camel application in window-1
```sh
  cd ~/camel-examples/examples/main
```
- vim src/main/java/org/apache/camel/example/MyBean.java
- Add the following content inside `MyBean.java` file:
```java
package org.apache.camel.example;

public class MyBean {

    private String hi;

    public MyBean(String hi) {
        this.hi = hi;
    }

    public String hello() {
        return hi + " Begin ? ";

    }
     public String bye() {
        return hi + " End ? ";
}
}
```
- vim src/main/java/org/apache/camel/example/MyRouteBuilder.java
- Inside `MyRouteBuilder.java` file:
```java
package org.apache.camel.example;

import org.apache.camel.builder.RouteBuilder;

public class MyRouteBuilder extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        from("timer:foo").routeId("foo")
            .bean("myBean", "hello")
            .log("${body}")
            .bean("myBean", "bye")
            .log("${body}");
    }
}
```
* Compile the source to reflect the new changes
 ```sh
 mvn compile
 ```
* Launch this example in Camel debug mode:
```sh
 mvn camel:debug
```
## Attach this camel example to Vimspector for Camel Textual Route Debugging in window-2
* Open this file in vim `src/main/java/org/apache/camel/example/MyRouteBuilder.java` and then use the following keys to set the breakpoints.
* Start the Camel debugger by again using the following keys.
* Enter `1099` as port number when it is prompted for user input in vimspector.
* Now you should be able to debug your camel application and again use the following key mappings to instruct the debugger.
# Debug It
Now everything is in place. Open the main MyRouteBuilder file and start debugging by `Esc + \`:
| Key          | Function
| ---          | ---
| `dd`         | To start the camel debugger
| `dt`         | To set the breakpoints
| `dc`         | To go to the next breakpoint
| `ctrl+ww`    | To move around the vimspector
`:VimspectortToggleLog` to see the vimspector logs.
`cat $HOME/.vimspector.log` same logs can also be seen here

# Mappings
The goal is to provide keymapping to use controllers of the debugger more easily. To know more about these mappings please follow this doc - https://github.com/puremourning/vimspector/blob/master/README.md#human-mode

Try the following mappings, by adding the following before loading vimspector:
```viml
let g:vimspector_enable_mappings = 'HUMAN'
```

| Key          | Mapping                                       | Function
| ---          | ---                                           | ---
| `F5`         | `<Plug>VimspectorContinue`                    | When debugging, continue. Otherwise start debugging.
| `F3`         | `<Plug>VimspectorStop`                        | Stop debugging.
| `F4`         | `<Plug>VimspectorRestart`                     | Restart debugging with the same configuration.
| `F6`         | `<Plug>VimspectorPause`                       | Pause debuggee.
| `F9`         | `<Plug>VimspectorToggleBreakpoint`            | Toggle line breakpoint on the current line.
| `<leader>F9` | `<Plug>VimspectorToggleConditionalBreakpoint` | Toggle conditional line breakpoint or logpoint on the current line.
| `F8`         | `<Plug>VimspectorAddFunctionBreakpoint`       | Add a function breakpoint for the expression under cursor
| `<leader>F8` | `<Plug>VimspectorRunToCursor`                 | Run to Cursor
