const express = require('express');
const app = express();
require('..')(app);

let asyncMiddleware;
try {
  asyncMiddleware = eval('(async function asyncMiddleware(req, res, next) {\nconst message = await makeDelayedMessage("from async/await\\n");\nres.write(message);\nnext();\n})');
} catch (_e) {
  asyncMiddleware = (req, res, next) => {
    res.write('no async support, from normal function\n');
    next();
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

  (req, res) => {
    res.end('Request complete');
  }
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
