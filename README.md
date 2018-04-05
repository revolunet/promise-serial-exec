# promise-serial-exec

[![npm](https://img.shields.io/npm/v/promise-serial-exec.svg)](https://www.npmjs.com/package/promise-serial-exec) ![license](https://img.shields.io/npm/l/promise-serial-exec.svg) [![github-issues](https://img.shields.io/github/issues/revolunet/promise-serial-exec.svg)](https://github.com/revolunet/promise-serial-exec/issues) [![Circle CI build status](https://circleci.com/gh/revolunet/promise-serial-exec.svg?style=svg)](https://circleci.com/gh/revolunet/promise-serial-exec)

![nodei.co](https://nodei.co/npm/promise-serial-exec.png?downloads=true&downloadRank=true&stars=true)

Execute promises sequentially, aka sequential `Promise.all`.

Can be useful for CPU-intensive operations, databases, scrapping...

## Usage

```js

const serialExec = require('promise-serial-exec')

const urls = [
  url1,
  url2,
  url3
];

// make the promise callables so they're executed on-demand
const promiseCalls = urls.map((url, i) => () => fetch(url))

// urls will be fetched in order
serialExec(promiseCalls).then(console.log)


// will add a 0-500ms delay between each call
serialExec(promiseCalls, {
  randomTimeout: 500
}).then(console.log)
```

