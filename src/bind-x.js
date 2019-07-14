/**
 * @file Creates a new function with a bound sequence of arguments.
 * @version 3.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module bind-x
 */

const assertIsFunction = require('assert-is-function-x');
const slice = require('array-slice-x');

const nativeBind = typeof Function.prototype.bind === 'function' && Function.prototype.bind;

let isWorking;

if (nativeBind) {
  const attempt = require('attempt-x');
  let gra;
  let context;
  // eslint-disable-next-line no-unused-vars
  const fn = function(arg1, arg2) {
    // eslint-disable-next-line no-invalid-this
    context = this;
    gra = arg1;

    return arguments;
  };

  const testThis = [];
  let res = attempt.call(fn, nativeBind, testThis, 1);
  isWorking = res.threw === false && typeof res.value === 'function';

  if (isWorking) {
    res = attempt(res.value, 2, 3);
    isWorking = res.threw === false && gra === 1 && context === testThis && res.value.length === 3;
  }

  if (isWorking) {
    const oracle = [1, 2, 3];

    const Ctr = function() {
      isWorking = this !== oracle;

      return oracle;
    };

    res = attempt.call(Ctr, nativeBind, null);
    isWorking = res.threw === false && typeof res.value === 'function';

    if (isWorking) {
      res = attempt(function() {
        // eslint-disable-next-line new-cap
        return new res.value();
      });

      if (isWorking) {
        isWorking = res.threw === false && res.value === oracle;
      }
    }
  }
}

let $bind;

if (isWorking) {
  // eslint-disable-next-line no-unused-vars
  $bind = function bind(target, thisArg) {
    return nativeBind.apply(assertIsFunction(target), slice(arguments, 1));
  };
} else {
  const concat = function _concat(a, b) {
    const aLength = a.length;
    const bLength = b.length;
    const result = slice(a);
    result.length += bLength;
    for (let index = 0; index < bLength; index += 1) {
      result[aLength + index] = b[index];
    }

    return result;
  };

  const isPrimitive = require('is-primitive');
  const Empty = function _Empty() {};

  $bind = function _bind(target, thisArg) {
    assertIsFunction(target);
    const args = slice(arguments, 2);
    let bound;

    const binder = function _binder() {
      // eslint-disable-next-line no-invalid-this
      if (this instanceof bound) {
        // eslint-disable-next-line no-invalid-this
        const result = target.apply(this, concat(args, arguments));

        // eslint-disable-next-line no-invalid-this
        return isPrimitive(result) ? this : result;
      }

      return target.apply(thisArg, concat(args, arguments));
    };

    let boundLength = target.length - args.length;

    if (boundLength < 0) {
      boundLength = 0;
    }

    const lastIndex = boundLength - 1;
    let boundArgs = '';
    for (let index = 0; index < boundLength; index += 1) {
      boundArgs += `$_${index}_$${index < lastIndex ? ',' : ''}`;
    }

    // eslint-disable-next-line no-new-func
    bound = Function('binder', 'slice', `return function (${boundArgs}){ return binder.apply(this,slice(arguments)); }`)(
      binder,
      slice,
    );

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
module.exports = $bind;
