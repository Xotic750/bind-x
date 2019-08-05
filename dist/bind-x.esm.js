var _this = this;

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }

import assertIsFunction from 'assert-is-function-x';
import slice from 'array-slice-x';
import attempt from 'attempt-x';
import isPrimitive from 'is-primitive';
var nb = assertIsFunction.bind;
var nativeBind = typeof nb === 'function' && nb;
var isWorking;

if (nativeBind) {
  /* eslint-disable-next-line no-void */
  var gra = void 0;
  /* eslint-disable-next-line no-void */

  var context = void 0;
  /* eslint-disable-next-line no-unused-vars */

  var fn = function fn(arg1, arg2) {
    /* eslint-disable-next-line babel/no-invalid-this */
    context = this;
    gra = arg1;
    /* eslint-disable-next-line prefer-rest-params */

    return arguments;
  };

  var testThis = [];
  var res = attempt.call(fn, nativeBind, testThis, 1);
  isWorking = res.threw === false && typeof res.value === 'function';

  if (isWorking) {
    res = attempt(res.value, 2, 3);
    isWorking = res.threw === false && gra === 1 && context === testThis && res.value.length === 3;
  }

  if (isWorking) {
    var oracle = [1, 2, 3];

    var Ctr = function Ctr() {
      isWorking = this !== oracle;
      return oracle;
    };

    res = attempt.call(Ctr, nativeBind, null);
    isWorking = res.threw === false && typeof res.value === 'function';

    if (isWorking) {
      res = attempt(function () {
        _newArrowCheck(this, _this);

        /* eslint-disable-next-line babel/new-cap,new-cap */
        return new res.value();
      }.bind(this));

      if (isWorking) {
        isWorking = res.threw === false && res.value === oracle;
      }
    }
  }
}
/* eslint-disable-next-line no-unused-vars */


var patchedBind = function bind(target, thisArg) {
  /* eslint-disable-next-line prefer-rest-params */
  return nativeBind.apply(assertIsFunction(target), slice(arguments, 1));
};

var concat = function concat(a, b) {
  var aLength = a.length;
  var bLength = b.length;
  var result = slice(a);
  result.length += bLength;

  for (var index = 0; index < bLength; index += 1) {
    result[aLength + index] = b[index];
  }

  return result;
};
/* eslint-disable-next-line lodash/prefer-noop */


var Empty = function Empty() {};

export var implementation = function bind(target, thisArg) {
  assertIsFunction(target);
  /* eslint-disable-next-line prefer-rest-params */

  var args = slice(arguments, 2);
  var bound;

  var binder = function _binder() {
    /* eslint-disable-next-line babel/no-invalid-this */
    if (this instanceof bound) {
      /* eslint-disable-next-line babel/no-invalid-this,prefer-rest-params */
      var result = target.apply(this, concat(args, arguments));
      /* eslint-disable-next-line babel/no-invalid-this */

      return isPrimitive(result) ? this : result;
    }
    /* eslint-disable-next-line prefer-rest-params */


    return target.apply(thisArg, concat(args, arguments));
  };

  var boundLength = target.length - args.length;

  if (boundLength < 0) {
    boundLength = 0;
  }

  var lastIndex = boundLength - 1;
  var boundArgs = '';

  for (var index = 0; index < boundLength; index += 1) {
    boundArgs += "$_".concat(index, "_$").concat(index < lastIndex ? ',' : '');
  }
  /* eslint-disable-next-line no-new-func */


  bound = Function('binder', 'slice', "return function (".concat(boundArgs, "){ return binder.apply(this,slice(arguments)); }"))(binder, slice);

  if (target.prototype) {
    Empty.prototype = target.prototype;
    bound.prototype = new Empty();
    Empty.prototype = null;
  }

  return bound;
};
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
 */

var $bind = isWorking ? patchedBind : implementation;
export default $bind;

//# sourceMappingURL=bind-x.esm.js.map