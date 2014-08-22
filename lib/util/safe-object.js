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
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL SERGEY KONONENKO BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



/**
 * @constructor
 * @param {!Object} data Исходные данные.
 */
util.SafeObject = function(data) {

  /**
   * @type {!Object}
   */
  this.__core = data;
};


/**
 * @return {!Object} Исходные данные.
 */
util.SafeObject.prototype.getCore = function() {
  return this.__core;
};


/**
 * @param {...(string|number)} var_args Путь к значению.
 * @return {string|number|boolean|Object} Данные.
 */
util.SafeObject.prototype.get = function(var_args) {
  return this.getByPath(Array.prototype.slice.call(arguments));
};


/**
 * @param {string|number|boolean|Object} value Данные.
 * @param {...(string|number)} var_args Путь к значению.
 */
util.SafeObject.prototype.set = function(value, var_args) {
  var path = Array.prototype.slice.call(arguments);
  this.setByPath(path.shift(), path);
};


/**
 * @param {!Array.<(string|number)>} path Путь к значению.
 * @return {string|number|boolean|Object} Данные.
 */
util.SafeObject.prototype.getByPath = function(path) {
  var result = this.__core;

  var i = 0,
      l = path.length;

  var value = null;
  while (i < l) {
    if (result === null || path[i] === '') {
      break;
    }

    value = result[path[i]];
    if (value !== undefined) {
      result = value;
    } else {
      result = null;
    }

    i++;
  }

  return result;
};


/**
 * @param {string|number|boolean|Object} value Данные.
 * @param {!Array.<(string|number)>} path Путь к значению.
 */
util.SafeObject.prototype.setByPath = function(value, path) {
  var scope = this.__core;

  var i = 0,
      l = path.length;

  var key = null;
  while (i < l) {
    key = path[i];
    i += 1;

    if (key === '') {
      key = 0;

      while (scope[key] !== undefined) {
        key++;
      }
    }

    if (i === l) {
      scope[key] = value;
    } else if (scope[key] === undefined) {
      scope[key] = isNaN(path[i]) ? {} : [];
    }

    scope = scope[key];
  }
};
