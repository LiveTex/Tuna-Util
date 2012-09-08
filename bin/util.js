/**
 * TUNA FRAMEWORK
 *
 * Copyright (c) 2012, Sergey Kononenko
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 * * Names of contributors may be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL SERGEY KONONENKO BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


if (typeof console !== 'object') {
  console = {};
}

if (typeof console.log !== 'function') {
  console.log = function(var_args) {
    alert(Array.prototype.slice.call(arguments).join(', '));
  };
}

if (typeof console.info !== 'function') {
  console.info = function(var_args) {
    console.log.apply(null, arguments);
  };
}

if (typeof console.warn !== 'function') {
  console.warn = function(var_args) {
    console.log.apply(null, arguments);
  };
}

if (typeof console.error !== 'function') {
  console.error = function(var_args) {
    console.log.apply(null, arguments);
  };
}

if (typeof JSON !== 'object') {
  throw Error('"JSON" object must exists.');
}

if (typeof JSON.stringify !== 'function') {
  throw Error('"JSON.stringify()" method must exists.');
}

if (typeof JSON.parse !== 'function') {
  throw Error('"JSON.parse()" method must exists.');
}
var util = {};
util.VERSION = "0.0.1";
util.IS_IE = !!eval("'\v' == 'v'");
util.__ExtendLink = function() {
};
util.inherits = function(Class, Parent) {
  util.__ExtendLink.prototype = Parent.prototype;
  Class.prototype = new util.__ExtendLink;
  Class.prototype.constructor = Class
};
util.bind = function(func, context) {
  if(typeof func.bind === "function") {
    return func.bind(context)
  }else {
    return function() {
      return func.apply(context, util.toArray(arguments))
    }
  }
};
util.async = function(callback) {
  setTimeout(callback, 0)
};
util.clone = function(object) {
  try {
    return JSON.parse(JSON.stringify(object))
  }catch(error) {
    console.error(error)
  }
  return null
};
util.merge = function(base, target) {
  for(var key in target) {
    base[key] = target[key]
  }
};
util.areEqual = function(first, second) {
  try {
    return first === second || JSON.stringify(first) === JSON.stringify(second)
  }catch(error) {
    console.error(error)
  }
  return false
};
util.toArray = function(list) {
  return Array.prototype.slice.call(list)
};
util.cloneArray = function(array) {
  return array.slice(0)
};
util.indexOf = function(element, array) {
  if(array.indexOf !== undefined) {
    return array.indexOf(element)
  }else {
    var i = 0, l = array.length;
    while(i < l) {
      if(array[i] === element) {
        return i
      }
      i++
    }
  }
  return-1
};
util.encodeJsonData = function(object) {
  try {
    return JSON.stringify(object)
  }catch(error) {
    console.error(error)
  }
  return""
};
util.decodeJsonData = function(data) {
  try {
    return JSON.parse(data)
  }catch(error) {
    console.error(error)
  }
  return null
};
util.encodeFormData = function(object) {
  return util.__splitUrlData(object).join("&")
};
util.__splitUrlData = function(object, opt_path) {
  var result = [];
  if(opt_path === undefined) {
    opt_path = []
  }
  if(typeof object === "object") {
    for(var key in object) {
      var newPath = opt_path.length === 0 ? [key] : (opt_path.join(",") + "," + key).split(",");
      result = result.concat(util.__splitUrlData(object[key], newPath))
    }
  }else {
    result = [opt_path.shift() + (opt_path.length > 0 ? "[" + opt_path.join("][") + "]=" : "=") + encodeURIComponent(String(object))]
  }
  return result
};
util.decodeFormData = function(data) {
  var result = new util.SafeObject({});
  var values = decodeURIComponent(data).split("&");
  var i = 0, l = values.length;
  var pair = [];
  while(i < l) {
    pair = values[i].split("=");
    if(pair[1] !== undefined) {
      result.setByPath(pair[1], util.parseUrlPathToken(pair[0]))
    }
    i++
  }
  return result.getCore()
};
util.parseUrlPathToken = function(token) {
  if(token.charAt(token.length - 1) !== "]") {
    return[token]
  }
  var nameLength = token.indexOf("[");
  return[token.substring(0, nameLength)].concat(token.substring(nameLength + 1, token.length - 1).split("]["))
};
util.SafeObject = function(data) {
  this.__core = data
};
util.SafeObject.prototype.getCore = function() {
  return this.__core
};
util.SafeObject.prototype.get = function(var_keys) {
  return this.getByPath(util.toArray(arguments))
};
util.SafeObject.prototype.set = function(value, var_keys) {
  var path = Array.prototype.slice.call(arguments);
  this.setByPath(path.shift(), path)
};
util.SafeObject.prototype.getByPath = function(path) {
  var result = this.__core;
  var i = 0, l = path.length;
  var value = null;
  while(i < l) {
    if(result === null || path[i] === "") {
      break
    }
    value = result[path[i]];
    if(value !== undefined) {
      result = value
    }else {
      result = null
    }
    i++
  }
  return result === this.__core ? null : result
};
util.SafeObject.prototype.setByPath = function(value, path) {
  var scope = this.__core;
  var i = 0, l = path.length;
  var key = null;
  while(i < l) {
    key = path[i++];
    if(key === "") {
      key = 0;
      while(scope[key] !== undefined) {
        key++
      }
    }
    if(i === l) {
      scope[key] = value
    }else {
      if(scope[key] === undefined) {
        scope[key] = isNaN(path[i]) ? {} : []
      }
    }
    scope = scope[key]
  }
};
