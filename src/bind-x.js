import hasWorkingBind from 'has-working-bind-x';
import assertIsFunction from 'assert-is-function-x';
import slice from 'array-slice-x';
import isPrimitive from 'is-primitive-x';

const {bind: nativeBind, apply} = assertIsFunction;
const methodizedBind = hasWorkingBind ? apply.bind(nativeBind) : null;

/* eslint-disable-next-line no-unused-vars */
const patchedBind = function bind(target, thisArg) {
  /* eslint-disable-next-line prefer-rest-params */
  return methodizedBind(assertIsFunction(target), slice(arguments, 1));
};

const concat = function concat(a, b) {
  const aLength = a.length;
  const bLength = b.length;
  const result = slice(a);
  result.length += bLength;
  for (let index = 0; index < bLength; index += 1) {
    result[aLength + index] = b[index];
  }

  return result;
};

/* eslint-disable-next-line lodash/prefer-noop */
const Empty = function Empty() {};

const getBoundArgs = function getBoundArgs(target, args) {
  let boundLength = target.length - args.length;

  if (boundLength < 0) {
    boundLength = 0;
  }

  const lastIndex = boundLength - 1;
  let boundArgs = '';
  for (let index = 0; index < boundLength; index += 1) {
    boundArgs += `$_${index}_$${index < lastIndex ? ',' : ''}`;
  }

  return boundArgs;
};

const getBound = function getBound(boundArgs, binder) {
  /* eslint-disable-next-line no-new-func */
  return Function('binder', 'slice', `return function (${boundArgs}){ return binder.apply(this,slice(arguments)); }`)(
    binder,
    slice,
  );
};

const setProto = function setProto(target, bound) {
  if (target.prototype) {
    Empty.prototype = target.prototype;
    bound.prototype = new Empty();
    Empty.prototype = null;
  }

  return bound;
};

export const implementation = function bind(target, thisArg) {
  assertIsFunction(target);
  /* eslint-disable-next-line prefer-rest-params */
  const args = slice(arguments, 2);
  let bound;

  const binder = function binder() {
    /* eslint-disable-next-line babel/no-invalid-this */
    if (this instanceof bound) {
      /* eslint-disable-next-line babel/no-invalid-this,prefer-rest-params */
      const result = target.apply(this, concat(args, arguments));

      /* eslint-disable-next-line babel/no-invalid-this */
      return isPrimitive(result) ? this : result;
    }

    /* eslint-disable-next-line prefer-rest-params */
    return target.apply(thisArg, concat(args, arguments));
  };

  const boundArgs = getBoundArgs(target, args);
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
const $bind = hasWorkingBind ? patchedBind : implementation;

export default $bind;
