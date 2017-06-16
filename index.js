'use strict';

const express = require('express');
const methods = require('methods');

const wrapper = require('./wrap');

module.exports = function expressAsyncPatch() {
  // only need to patch express.Router
  // since an express app uses a Router internally
  patch(express.Router);
};

function patch(thing) {
  const fnsToPatch = ['use', 'all'].concat(methods);

  const oldFns = fnsToPatch.reduce(function(fns, fnName) {
    fns[fnName] = thing[fnName];
    return fns;
  }, {});

  const patches = {
    use: function(...middlewares) {
      const args = middlewares.map(wrapper);
      return oldFns.use.apply(this, args);
    },

    METHOD: function(method) {
      return function(p1, ...middlewares) {
        const args = [p1].concat(middlewares.map(wrapper));
        return oldFns[method].apply(this, args);
      };
    }
  };

  fnsToPatch.forEach((fnName) => {
    if (patches[fnName]) {
      thing[fnName] = patches[fnName];
    } else {
      thing[fnName] = patches.METHOD(fnName);
    }
  });
}
