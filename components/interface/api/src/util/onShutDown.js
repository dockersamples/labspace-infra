/*

Code adapted from: https://github.com/nikitaeverywhere/node-graceful-shutdown

MIT License

Copyright (c) 2018-2199 Nikita Savchenko (https://nikita.tk)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

const handledEvents = ["SIGINT", "SIGTERM", "SIGQUIT", "SIGUSR2"];

const dependencyTree = new Map(); // name => [dependency name, ...]
const handlers = new Map(); // name => [handler, ...]
const shutdownErrorHandlers = [];

/**
 * Gracefully terminate application's modules on shutdown.
 * @param {string} [name] - Name of the handler.
 * @param {array} [dependencies] - Which handlers should be processed first.
 * @param {function} handler - Async or sync function which handles shutdown.
 */
export function onShutdown(name, dependencies, handler) {
  handler =
    typeof name === "function"
      ? name
      : typeof dependencies === "function"
        ? dependencies
        : handler;
  dependencies =
    name instanceof Array
      ? name
      : dependencies instanceof Array
        ? dependencies
        : [];
  name = typeof name === "string" ? name : Math.random().toString(36);

  if (dependencies.reduce((acc, dep) => acc || testForCycles(dep), false)) {
    throw new Error(
      `Adding shutdown handler "${name}" will create a dependency loop: aborting`,
    );
  }

  dependencyTree.set(
    name,
    Array.from(new Set((dependencyTree.get(name) || []).concat(dependencies))),
  );
  if (!handlers.has(name)) {
    handlers.set(name, []);
  }
  handlers.get(name).push(handler);
}

/**
 * Optional export to handle shutdown errors.
 * @param {function} callback
 */
export function onShutdownError(callback) {
  shutdownErrorHandlers.push(callback);
}

async function shutdown(name, promisesMap) {
  if (promisesMap.has(name)) {
    return await promisesMap.get(name);
  }

  const nodeCompletedPromise = (async function () {
    const dependencies = dependencyTree.get(name) || [];

    // Wait for all dependencies to shut down.
    await Promise.all(dependencies.map((dep) => shutdown(dep, promisesMap)));

    // Shutdown this item.
    const allHandlers = handlers.get(name) || [];
    if (allHandlers.length) {
      await Promise.all(allHandlers.map((f) => f()));
    }
  })();

  promisesMap.set(name, nodeCompletedPromise);
  await nodeCompletedPromise;
}

let shuttingDown = false;
handledEvents.forEach((event) =>
  process.removeAllListeners(event).addListener(event, () => {
    console.log("Received shutdown event:", event);
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    // Get all unreferenced nodes.
    const unreferencedNames = getAllUnreferencedNames();

    const visited = new Map();
    Promise.all(unreferencedNames.map((name) => shutdown(name, visited)))
      .then(() => exit(0))
      .catch((e) => {
        Promise.all(shutdownErrorHandlers.map((f) => f(e)))
          .then(() => exit(42759))
          .catch(() => exit(42758));
      });
  }),
);

// -------- Utility functions -------- \\

function testForCycles(name, visitedSet = new Set()) {
  // Return true if the cycle is found.
  if (visitedSet.has(name)) {
    return true;
  }
  visitedSet.add(name);
  // If any of the cycles found in dependencies, return true.
  return (dependencyTree.get(name) || []).reduce(
    (acc, name) => acc || testForCycles(name),
    false,
  );
}

function getAllUnreferencedNames() {
  const allNodes = new Set(Array.from(dependencyTree.keys()));
  Array.from(dependencyTree.values()).forEach((deps) =>
    deps.forEach((dep) => allNodes.delete(dep)),
  );
  return Array.from(allNodes);
}

/* STUBBED - DO NOT EDIT */
function exit(code) {
  process.exit(code);
}
