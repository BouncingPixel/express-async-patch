const express = require('express');
const app = express();
require('..')(app);

let asyncMiddleware;
let asyncErrMiddleware;

try {
  asyncMiddleware = eval('(async function asyncMiddleware(req, res, next) {\nconst message = await makeDelayedMessage("from async/await\\n");\nres.write(message);\nnext();\n})');

  asyncErrMiddleware = eval('(async function asyncErrMiddleware(err, req, res, _next) {\nconst message = await makeDelayedMessage("from async/await\\n");\nres.end("error handling " + message);\n})');
} catch (_e) {
  asyncMiddleware = (req, res, next) => {
    res.write('no async support, from normal function\n');
    next();
  };
  asyncErrMiddleware = (err, req, res, _next) => {
    res.end('error handling: no async support, from normal function');
  };
}

app.get(
  '/',

  (req, res, next) => {
    res.write('from normal function\n');
    next();
  },

  function*(req, res, next) {
    const message = yield makeDelayedMessage('from generator\n');
    res.write(message);
    next();
  },

  asyncMiddleware,

  (req, res, next) => {
    next('fake error');
  },

  (err, req, res, next) => {
    res.write('error handling from normal fn\n');
    next('fake error');
  },

  function*(err, req, res, next) {
    const message = yield makeDelayedMessage('from generator\n');
    res.write('error handling ' + message);
    next('fake error');
  },

  asyncErrMiddleware
);

app.listen(3000, () => {
  console.log('Server listening on port 3000'); // eslint-disable-line no-console
});

function makeDelayedMessage(message) {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(message);
    }, 100);
  });
}
