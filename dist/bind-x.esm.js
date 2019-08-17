import hasWorkingBind from 'has-working-bind-x';
import assertIsFunction from 'assert-is-function-x';
import slice from 'array-slice-x';
import isPrimitive from 'is-primitive-x';
var nativeBind = assertIsFunction.bind,
    apply = assertIsFunction.apply;
var methodizedBind = hasWorkingBind ? apply.bind(nativeBind) : null;
/* eslint-disable-next-line no-unused-vars */

var patchedBind = function bind(target, thisArg) {
  /* eslint-disable-next-line prefer-rest-params */
  return methodizedBind(assertIsFunction(target), slice(arguments, 1));
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

var getBoundArgs = function getBoundArgs(target, args) {
  var boundLength = target.length - args.length;

  if (boundLength < 0) {
    boundLength = 0;
  }

  var lastIndex = boundLength - 1;
  var boundArgs = '';

  for (var index = 0; index < boundLength; index += 1) {
    boundArgs += "$_".concat(index, "_$").concat(index < lastIndex ? ',' : '');
  }

  return boundArgs;
};

var getBound = function getBound(boundArgs, binder) {
  /* eslint-disable-next-line no-new-func */
  return Function('binder', 'slice', "return function (".concat(boundArgs, "){ return binder.apply(this,slice(arguments)); }"))(binder, slice);
};

var setProto = function setProto(target, bound) {
  if (target.prototype) {
    Empty.prototype = target.prototype;
    bound.prototype = new Empty();
    Empty.prototype = null;
  }

  return bound;
};

export var implementation = function bind(target, thisArg) {
  assertIsFunction(target);
  /* eslint-disable-next-line prefer-rest-params */

  var args = slice(arguments, 2);
  var bound;

  var binder = function binder() {
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

  var boundArgs = getBoundArgs(target, args);
  bound = getBound(boundArgs, binder);
  return setProto(target, bound);
};
/**
 * The bind() method creates a new function that, when called, has its this
 * keyword set to the provided value, with a given sequence of arguments
 * preceding any provided when the new function is called.
 *
 * @function bind
 * @param {Function} target - The target function.
 * @param {*} thisArg - The value to be passed as the this parameter to the target
 *  function when the bound function is called. The value is ignored if the
 *  bound function is constructed using the new operator.
 * @param {*} [args] - Arguments to prepend to arguments provided to the bound
 *  function when invoking the target function.
 * @throws {TypeError} If target is not a function.
 * @returns {Function} The bound function.
 */

var $bind = hasWorkingBind ? patchedBind : implementation;
export default $bind;

//# sourceMappingURL=bind-x.esm.js.map