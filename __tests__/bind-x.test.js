let bind;

if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');

  if (typeof JSON === 'undefined') {
    JSON = {};
  }

  require('json3').runInContext(null, JSON);
  require('es6-shim');
  const es7 = require('es7-shim');
  Object.keys(es7).forEach(function(key) {
    const obj = es7[key];

    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  bind = require('../../index.js');
} else {
  bind = returnExports;
}

describe('#bind()', function() {
  let actual;

  const testSubject = {
    push(o) {
      this.a.push(o);
    },
  };

  const func = function _func() {
    Array.prototype.forEach.call(
      arguments,
      function(a) {
        // eslint-disable-next-line no-invalid-this
        this.push(a);
        // eslint-disable-next-line no-invalid-this
      },
      this,
    );

    // eslint-disable-next-line no-invalid-this
    return this;
  };

  beforeEach(function() {
    actual = [];
    testSubject.a = [];
  });

  it('binds properly without a context', function() {
    let context;
    const fn = function _fn() {
      // eslint-disable-next-line no-invalid-this
      context = this;
    };

    testSubject.func = bind(fn);
    testSubject.func();
    const fn1 = function _fn1() {
      // eslint-disable-next-line no-invalid-this
      return this;
    };

    expect(context).toBe(fn1.call());
  });

  it('binds properly without a context, and still supplies bound arguments', function() {
    let a;
    let context;
    const fn = function _fn() {
      a = Array.prototype.slice.call(arguments);
      // eslint-disable-next-line no-invalid-this
      context = this;
    };

    testSubject.func = bind(fn, undefined, 1, 2, 3);
    testSubject.func(1, 2, 3);
    expect(a).toStrictEqual([1, 2, 3, 1, 2, 3]);
    const fn1 = function _fn1() {
      // eslint-disable-next-line no-invalid-this
      return this;
    };

    expect(context).toBe(fn1.call());
  });

  it('binds a context properly', function() {
    testSubject.func = bind(func, actual);
    testSubject.func(1, 2, 3);
    expect(actual).toStrictEqual([1, 2, 3]);
    expect(testSubject.a).toStrictEqual([]);
  });

  it('binds a context and supplies bound arguments', function() {
    testSubject.func = bind(func, actual, 1, 2, 3);
    testSubject.func(4, 5, 6);
    expect(actual).toStrictEqual([1, 2, 3, 4, 5, 6]);
    expect(testSubject.a).toStrictEqual([]);
  });

  it('returns properly without binding a context', function() {
    const fn = function _fn() {
      // eslint-disable-next-line no-invalid-this
      return this;
    };

    testSubject.func = bind(fn);
    const context = testSubject.func();
    const fn1 = function _fn1() {
      // eslint-disable-next-line no-invalid-this
      return this;
    };

    expect(context).toBe(fn1.call());
  });

  it('returns properly without binding a context, and still supplies bound arguments', function() {
    let context;
    const fn = function _fn() {
      // eslint-disable-next-line no-invalid-this
      context = this;

      return Array.prototype.slice.call(arguments);
    };

    testSubject.func = bind(fn, undefined, 1, 2, 3);
    actual = testSubject.func(1, 2, 3);
    const fn1 = function _fn1() {
      // eslint-disable-next-line no-invalid-this
      return this;
    };

    expect(context).toBe(fn1.call());
    expect(actual).toStrictEqual([1, 2, 3, 1, 2, 3]);
  });

  it('returns properly while binding a context properly', function() {
    let ret;
    testSubject.func = bind(func, actual);
    ret = testSubject.func(1, 2, 3);
    expect(ret).toBe(actual);
    expect(ret).not.toBe(testSubject);
  });

  it('returns properly while binding a context and supplies bound arguments', function() {
    let ret;
    testSubject.func = bind(func, actual, 1, 2, 3);
    ret = testSubject.func(4, 5, 6);
    expect(ret).toBe(actual);
    expect(ret).not.toBe(testSubject);
  });

  it("has the new instance's context as a constructor", function() {
    let actualContext;
    const expectedContext = {foo: 'bar'};
    const fn = function _fn() {
      // eslint-disable-next-line no-invalid-this
      actualContext = this;
    };

    testSubject.Func = bind(fn, expectedContext);
    const result = new testSubject.Func();
    expect(result).toBeTruthy();
    expect(actualContext).not.toBe(expectedContext);
  });

  it('passes the correct arguments as a constructor', function() {
    const expected = {name: 'Correct'};
    const fn = function _fn(arg) {
      // eslint-disable-next-line no-invalid-this
      expect(Object.prototype.hasOwnProperty.call(this, 'name')).toBe(false);

      return arg;
    };

    testSubject.Func = bind(fn, {name: 'Incorrect'});
    const ret = new testSubject.Func(expected);
    expect(ret).toBe(expected);
  });

  it('returns the return value of the bound function when called as a constructor', function() {
    const oracle = [1, 2, 3];
    const fn = function _fn() {
      // eslint-disable-next-line no-invalid-this
      expect(this).not.toBe(oracle);

      return oracle;
    };

    const Subject = bind(fn, null);
    const result = new Subject();
    expect(result).toBe(oracle);
  });

  it('returns the correct value if constructor returns primitive', function() {
    const fn = function _fn(oracle) {
      // eslint-disable-next-line no-invalid-this
      expect(this).not.toBe(oracle);

      return oracle;
    };

    const Subject = bind(fn, null);

    const primitives = ['asdf', null, true, 1];
    for (let i = 0; i < primitives.length; ++i) {
      expect(new Subject(primitives[i])).not.toBe(primitives[i]);
    }

    const objects = [[1, 2, 3], {}, function() {}];
    for (let j = 0; j < objects.length; ++j) {
      expect(new Subject(objects[j])).toBe(objects[j]);
    }
  });

  it('returns the value that instance of original "class" when called as a constructor', function() {
    const ClassA = function(x) {
      this.name = x || 'A';
    };

    const ClassB = bind(ClassA, null, 'B');

    const result = new ClassB();
    expect(result instanceof ClassA).toBe(true);
    expect(result instanceof ClassB).toBe(true);
  });

  it('sets a correct length without thisArg', function() {
    const fn = function _fn(a, b, c) {
      return a + b + c;
    };

    const Subject = bind(fn);
    expect(Subject).toHaveLength(3);
  });

  it('sets a correct length with thisArg', function() {
    const fn = function _fn(a, b, c) {
      // eslint-disable-next-line no-invalid-this
      return a + b + c + this.d;
    };

    const Subject = bind(fn, {d: 1});
    expect(Subject).toHaveLength(3);
  });

  it('sets a correct length with thisArg and first argument', function() {
    const fn = function _fn(a, b, c) {
      // eslint-disable-next-line no-invalid-this
      return a + b + c + this.d;
    };

    const Subject = bind(fn, {d: 1}, 1);
    expect(Subject).toHaveLength(2);
  });

  it('sets a correct length without thisArg and first argument', function() {
    const fn = function _fn(a, b, c) {
      return a + b + c;
    };

    const Subject = bind(fn, undefined, 1);
    expect(Subject).toHaveLength(2);
  });

  it('sets a correct length without thisArg and too many argument', function() {
    const fn = function _fn(a, b, c) {
      return a + b + c;
    };

    const Subject = bind(fn, undefined, 1, 2, 3, 4);
    expect(Subject).toHaveLength(0);
  });
});