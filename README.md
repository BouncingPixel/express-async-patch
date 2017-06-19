# express-async-patch

Patches Express router to support generators and Async-await

## Working With

### Requirements

- NodeJS 6+ for generator support
- NodeJS 7.5+ for async and generator support
- Express 4.x

### Installing

Install the package using your JS package manager of choice, such as `npm` or `yarn`.

For example, with `npm` or `yarn`:
```
$ npm install --save express-async-patch

$ yarn add express-async-patch
```

### Using express-async-patch

Simply require in the package and pass your Express instance into the function.
This will wrap Express.Router which will also enable support in the primary Express app.

Middleware will still need to call the `next()` to signal to continue processing.
Error middleware still require all 4, `(err, req, res, next)`, parameters.

This does **not** enable Koa-like support for yield/await `next` to continue processing later.

```js
const express = require('express');
const app = express();

// must pass the app in to patch the app as well
require('express-async-patch')(app);

app.use(function*(req, res, next) {
  yield getAPromise();
  next();
});

app.use(async function(req, res, next) {
  await onAPromise();
  next();
});

app.get(
  '/myroute',

  async function(req, res, next) {
    res.locals.data = await getData();
    next();
  },

  function*(req, res) {
    res.render('mypage');
  },

  async function(err, req, res, next) {
    res.render('specialerror');
  }
);
```
