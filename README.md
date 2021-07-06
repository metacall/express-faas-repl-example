# [MetaCall](https://github.com/metacall/core/) Express FaaS REPL Example

An example of building a FaaS server with NodeJS and Express, which implements a REPL protocol, suitable for projects like IPython / Jupyter where the `exec` constraints make embedding MetaCall difficult. This offers a multi-language REPL protocol and an inline module loader in order to allow loading and calling functions between languages in the REPL.

## Run it

1) Install MetaCall:
    ```sh
    curl -sL https://raw.githubusercontent.com/metacall/install/master/install.sh | sh
    ```

2) Install dependencies:
    ```sh
    metacall npm install
    ```

3) In a terminal, run:
    ```sh
    metacall server.js
    ```

4) For testing with CURL:

   a) Inline Module Loading:
    ```sh
    curl -X POST -H 'Content-Type: application/json' localhost:7777/eval/node -d '{"data": "module.exports = { f: () => 4 }"}'
    ```
   b) REPL:
    ```sh
    curl -X POST -H 'Content-Type: application/json' localhost:7777/repl/node -d '{"data": "5555555554\n"}'
    ```
   c) Calling the function `f` in the REPL, previously loaded by step `a`:
    ```sh
    curl -X POST -H 'Content-Type: application/json' localhost:7777/repl/node -d '{"data": "require(\"metacall\").metacall(\"f\")\n"}'
    ```

5) In order to close it:
    ```sh
    curl localhost:7777/shutdown
    ```
