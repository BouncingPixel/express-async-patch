'use strict';

const co = require('co');

const GeneratorConstructor = tryEvalFor('(function*(){}).constructor');
const AsyncConstructor = tryEvalFor('(async function(){}).constructor');

module.exports = function wrapMiddleware(genFn) {
  const isGenerator = GeneratorConstructor && genFn instanceof GeneratorConstructor;
  const isAsync = AsyncConstructor && genFn instanceof AsyncConstructor;

  // normal functions are passed through as is
  if (!isGenerator && !isAsync) {
    return genFn;
  }

  // if it is an AsyncConstructor, then it is already a promise
  // if not, then wrap the generator with co
  const cr = isAsync ? genFn : co.wrap(genFn);

  // properly wrap error handling functions
  if (genFn.length >= 4) {
    return function(err, req, res, next) {
      // using a custom next to know if the user calls next or not
      let nextCalled = false;
      let nextValue;
      function crNext(error) {
        nextCalled = true;
        nextValue = error;
      }

      cr(err, req, res, crNext).then(function() {
        if (nextCalled) {
          next(nextValue);
        }
      }).catch(next);
    };
  }

  return function(req, res, next) {
    let nextCalled = false;
    let nextValue;
    function crNext(error) {
      nextCalled = true;
      nextValue = error;
    }

    cr(req, res, crNext).then(function() {
      if (nextCalled) {
        next(nextValue);
      }
    }).catch(next);
  };
};

function tryEvalFor(str) {
  let c = null;
  try {
    // ugly, I know. but this keeps it compatible with older versions of node
    c = eval(str);
  } catch (_e) {
    c = null;
  }

  return c;
}
