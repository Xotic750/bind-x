/**
 * @file Creates a new function with a bound sequence of arguments.
 * @version 2.0.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module bind-x
 */

'use strict';

var assertIsFunction = require('assert-is-function-x');
var slice = require('array-slice-x');
var isPrimitive = require('is-primitive');

var concat = function _concat(a, b) {
  var aLength = a.length;
  var bLength = b.length;
  var result = slice(a);
  result.length += bLength;
  for (var index = 0; index < bLength; index += 1) {
    result[aLength + index] = b[index];
  }

  return result;
};

var bind;
var nativeBind = Function.prototype.bind;
if (nativeBind) {
  bind = function _bind(target, thisArg) {
    assertIsFunction(target);
    var args = concat([thisArg], slice(arguments, 2));
    return nativeBind.apply(target, args);
  };

  try {
    var a, context;
    var fn = function _fn(arg) {
      // eslint-disable-next-line no-invalid-this
      context = this;
      a = arg;
    };

    var testThis = [];
    var test = bind(Function.prototype.call, fn, testThis);
    test(1);
    if (a !== 1 || context !== testThis) {
      throw new Error('Incorrect');
    }
  } catch (e) {
    bind = null;
  }
}

if (Boolean(bind) === false) {
  var getFunctionName = require('get-function-name-x');
  var Empty = function _Empty() {};
  bind = function _bind(target, thisArg) {
    assertIsFunction(target);
    var args = slice(arguments, 2);
    var bound;
    var binder = function _binder() {
      // eslint-disable-next-line no-invalid-this
      if (this instanceof bound) {
        // eslint-disable-next-line no-invalid-this
        var result = target.apply(this, concat(args, slice(arguments)));
        // eslint-disable-next-line no-invalid-this
        return isPrimitive(result) ? this : result;
      }

      return target.apply(thisArg, concat(args, slice(arguments)));
    };

    var boundLength = target.length - args.length;
    if (boundLength < 0) {
      boundLength = 0;
    }

    var lastIndex = boundLength - 1;
    var boundArgs = '';
    for (var index = 0; index < boundLength; index += 1) {
      boundArgs += '$_' + index + '_$' + (index < lastIndex ? ',' : '');
    }

    var name = getFunctionName(target);
    // eslint-disable-next-line no-new-func
    bound = Function('binder', 'slice', 'return function ' + name + '(' + boundArgs + '){ return binder.apply(this,slice(arguments)); }')(binder, slice);
    if (target.prototype) {
      Empty.prototype = target.prototype;
      bound.prototype = new Empty();
      Empty.prototype = null;
    }

    return bound;
  };
}

/**
 * The bind() method creates a new function that, when called, has its this
 * keyword set to the provided value, with a given sequence of arguments
 * preceding any provided when the new function is called.
 *
 * @param {Function} target - The target function.
 * @param {*} thisArg - The value to be passed as the this parameter to the target
 *  function when the bound function is called. The value is ignored if the
 *  bound function is constructed using the new operator.
 * @param {*} [args] - Arguments to prepend to arguments provided to the bouund
 *  function when invoking the target function.
 * @throws {TypeError} If target is not a function.
 * @returns {Function} The bound function.
 * @example
 * var bind = require('bind-x');
 *
 * this.x = 9;    // this refers to global "window" object here in the browser
 * var module = {
 *   x: 81,
 *   getX: function() { return this.x; }
 * };
 *
 * module.getX(); // 81
 *
 * var retrieveX = module.getX;
 * retrieveX();
 * // returns 9 - The function gets invoked at the global scope
 *
 * // Create a new function with 'this' bound to module
 * // New programmers might confuse the
 * // global var x with module's property x
 * var boundGetX = bind(retrieveX, module);
 * boundGetX(); // 81
 *
 */
module.exports = bind;
