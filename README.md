<a href="https://travis-ci.org/Xotic750/bind-x"
   title="Travis status">
<img
   src="https://travis-ci.org/Xotic750/bind-x.svg?branch=master"
   alt="Travis status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/bind-x"
   title="Dependency status">
<img src="https://david-dm.org/Xotic750/bind-x.svg"
   alt="Dependency status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/bind-x#info=devDependencies"
   title="devDependency status">
<img src="https://david-dm.org/Xotic750/bind-x/dev-status.svg"
   alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/bind-x" title="npm version">
<img src="https://badge.fury.io/js/bind-x.svg"
   alt="npm version" height="18"/>
</a>
<a name="module_bind-x"></a>

## bind-x
Creates a new function with a bound sequence of arguments.

**Version**: 3.0.0  
**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  
<a name="exp_module_bind-x--module.exports"></a>

### `module.exports` ⇒ <code>function</code> ⏏
The bind() method creates a new function that, when called, has its this
keyword set to the provided value, with a given sequence of arguments
preceding any provided when the new function is called.

**Kind**: Exported member  
**Returns**: <code>function</code> - The bound function.  
**Throws**:

- <code>TypeError</code> If target is not a function.


| Param | Type | Description |
| --- | --- | --- |
| target | <code>function</code> | The target function. |
| thisArg | <code>\*</code> | The value to be passed as the this parameter to the target  function when the bound function is called. The value is ignored if the  bound function is constructed using the new operator. |
| [args] | <code>\*</code> | Arguments to prepend to arguments provided to the bouund  function when invoking the target function. |

**Example**  
```js
var bind = require('bind-x');

this.x = 9;    // this refers to global "window" object here in the browser
var module = {
  x: 81,
  getX: function() { return this.x; }
};

module.getX(); // 81

var retrieveX = module.getX;
retrieveX();
// returns 9 - The function gets invoked at the global scope

// Create a new function with 'this' bound to module
// New programmers might confuse the
// global var x with module's property x
var boundGetX = bind(retrieveX, module);
boundGetX(); // 81
```
