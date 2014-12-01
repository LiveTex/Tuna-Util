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
 * @namespace
 */
var util = {};


/**
 * Версия библиотеки.
 *
 * @type {string}
 */
util.VERSION = '0.0.1';


/**
 * @const
 * @type {string}
 */
util.__BASE64_KEYS_STR =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';


/**
 * @namespace
 */
util.dom = {};



/**
 * @constructor
 */
util.__ExtendLink = function() {};


/**
 * Наследование типа.
 *
 * Передает прототип родительского класса дочернему классу без ссылки на
 * него, сохраняя конструктор.
 *
 * @param {!Object} Class Класс который должен наследовать тип.
 * @param {!Object} Parent Родительский класс.
 */
util.inherits = function(Class, Parent) {
  util.__ExtendLink.prototype = Parent.prototype;

  Class.prototype = new util.__ExtendLink();
  Class.prototype.constructor = Class;
};


/**
 * Привязывание определенного контекста к функции или методу.
 *
 * @param {!Function} func Функция.
 * @param {Object} context Контекст.
 * @return {!Function} Привязанная к контексту функция.
 */
util.bind = function(func, context) {
  return function() {
    return func.apply(context, arguments);
  };
};


/**
 * Отложенное выполнение функции.
 *
 * @param {function()} callback Функция.
 */
util.async = function(callback) {
  setTimeout(callback, 0);
};


/**
 * Ничего не выполняющая функция.
 */
util.nop = function() {};


/**
 * Клонирование объекта.
 *
 * @param {*} object Объект.
 * @return {*} Копия объекта.
 */
util.clone = function(object) {
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (error) {
    console.error(error);
  }

  return null;
};


/**
 * @param {!Object} base Базовый объект.
 * @param {!Object} target Объект для наложения на базовый.
 */
util.merge = function(base, target) {
  for (var key in target) {
    base[key] = target[key];
  }
};


/**
 * @param {Object} first Объект для сравнения.
 * @param {Object} second Другой объект для сравнения.
 * @return {boolean} Результат сравнения.
 */
util.areEqual = function(first, second) {
  try {
    return first === second || JSON.stringify(first) === JSON.stringify(second);
  } catch (error) {
    console.error(error);
  }

  return false;
};


/**
 * Преобразование объекта с индесами в массив.
 *
 * @param {{length: number}} list Объект похожий на массив.
 * @return {!Array} Массив.
 */
util.toArray = function(list) {
  return Array.prototype.slice.call(list);
};


/**
 * Клонирование массива.
 *
 * @param {!Array} array Массив.
 * @return {!Array} Копия массива.
 */
util.cloneArray = function(array) {
  return array.slice(0);
};


/**
 * Поиск индекса объекта в массиве.
 *
 * @param {*} element Объект поиска.
 * @param {!Array} array Массив.
 * @return {number} Индекс найденного элемента.
 */
util.indexOf = function(element, array) {
  if (array.indexOf !== undefined) {
    return array.indexOf(element);
  } else {
    var i = 0,
        l = array.length;

    while (i < l) {
      if (array[i] === element) {
        return i;
      }

      i++;
    }
  }

  return -1;
};


/**
 * @param {Object} object Объект кодирования.
 * @return {string} Кодированный в строку объект.
 */
util.encodeJsonData = function(object) {
  try {
    return JSON.stringify(object);
  } catch (error) {}

  return '';
};


/**
 * @param {string} data Закодированный объект.
 * @return {*} Раскодированный объект.
 */
util.decodeJsonData = function(data) {
  try {
    return JSON.parse(data);
  } catch (error) {}

  return null;
};


/**
 * Кодирование объекта в x-www-form-urlencoded форму.
 *
 * @param {!Object} object Объект кодирования.
 * @param {string=} opt_separator Разделитель.
 * @return {string} Перекодированный в строку объект.
 */
util.encodeFormData = function(object, opt_separator) {
  return util.tokenizeUrlData(object).join(opt_separator || '&');
};


/**
 * Рекурсивное разбиение объекта н данные для кодирования в
 * x-www-form-urlencoded.
 *
 * @param {!Object} object Объект кодирования.
 * @param {!Array.<string>=} opt_path Путь к элементарной единице данных.
 * @return {!Array.<string>} Массив элементарных данных составляющих объект.
 */
util.tokenizeUrlData = function(object, opt_path) {
  var result = [];

  if (opt_path === undefined) {
    opt_path = [];
  }

  if (typeof object === 'object') {
    for (var key in object) {
      var newPath = opt_path.length === 0 ?
          [encodeURIComponent(String(key))] : (opt_path.join(',') + ',' +
          encodeURIComponent(String(key))).split(',');

      result = result.concat(util.tokenizeUrlData(object[key], newPath));
    }
  } else if (object !== undefined) {
    result = [
      opt_path.shift() +
          (opt_path.length > 0 ? '[' + opt_path.join('][') + ']=' : '=') +
              encodeURIComponent(String(object))
    ];
  }


  return result;
};


/**
 * @param {string} data Закодированный объект.
 * @return {*} Раскодированный объект.
 */
util.decodeFormData = function(data) {
  var result = new util.SafeObject({});

  var values = decodeURIComponent(data).split('&');
  var i = 0,
      l = values.length;

  var pair = [];
  while (i < l) {
    pair = values[i].split('=');

    if (pair[1] !== undefined) {
      result.setByPath(pair[1], util.parseUrlPathToken(pair[0]));
    }

    i++;
  }

  return result.getCore();
};


/**
 * @param {string} token Имя элементарного узла данных.
 * @return {!Array.<string>} Массив строк пути к узлу.
 */
util.parseUrlPathToken = function(token) {
  if (token.charAt(token.length - 1) !== ']') {
    return [token];
  }

  var nameLength = token.indexOf('[');
  return [token.substring(0, nameLength)].concat(
      token.substring(nameLength + 1, token.length - 1).split(']['));
};


/**
 * @param {string} string
 * @param {boolean=} opt_forUrl
 * @return {string}
 */
util.encodeBase64 = function(string, opt_forUrl) {
  var result = '';

  var str = util.__utfEncode(string);

  if (window.btoa !== undefined) {
    result = window.btoa(str);
  } else {
    var chr1, chr2, chr3,
        enc1, enc2, enc3, enc4;

    var i = 0;
    while (i < str.length) {

      chr1 = str.charCodeAt(i++);
      chr2 = str.charCodeAt(i++);
      chr3 = str.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      result += util.__BASE64_KEYS_STR.charAt(enc1) +
          util.__BASE64_KEYS_STR.charAt(enc2) +
          util.__BASE64_KEYS_STR.charAt(enc3) +
          util.__BASE64_KEYS_STR.charAt(enc4);

    }
  }

  if (opt_forUrl) {
    result = result.replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+\s*$/g, '');
  }

  return result;
};


/**
 * @param {string} string
 * @param {boolean=} opt_forUrl
 * @return {string}
 */
util.decodeBase64 = function(string, opt_forUrl) {
  if (opt_forUrl) {
    string = string.replace(/-/g, '+').replace(/_/g, '/') +
        ('====').slice(0, -(string.length % 4));
  }

  var result = '';

  if (window.atob !== undefined) {
    result = window.atob(string);
  } else {
    var chr1, chr2, chr3,
        enc1, enc2, enc3, enc4;

    var i = 0;

    string = string.replace(/[^A-Za-z0-9\+\/=]/g, '');

    while (i < string.length) {

      enc1 = util.__BASE64_KEYS_STR.indexOf(string.charAt(i++));
      enc2 = util.__BASE64_KEYS_STR.indexOf(string.charAt(i++));
      enc3 = util.__BASE64_KEYS_STR.indexOf(string.charAt(i++));
      enc4 = util.__BASE64_KEYS_STR.indexOf(string.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      result += String.fromCharCode(chr1);

      if (enc3 != 64) {
        result += String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        result += String.fromCharCode(chr3);
      }

    }
  }

  return util.__utfDecode(result);
};


/**
 * @param {string} string
 * @return {string}
 */
util.__utfEncode = function(string) {
  string = string.replace(/\r\n/g, '\n');
  var utftext = '';

  for (var n = 0; n < string.length; n++) {

    var c = string.charCodeAt(n);

    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }

  }

  return utftext;
};


/**
 * @param {string} utftext
 * @return {string}
 */
util.__utfDecode = function(utftext) {
  var string = '';
  var i = 0;
  var c = 0;
  var c2 = 0;
  var c3 = 0;

  while (i < utftext.length) {

    c = utftext.charCodeAt(i);

    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    } else if ((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i + 1);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i + 1);
      c3 = utftext.charCodeAt(i + 2);
      string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));

      i += 3;
    }

  }

  return string;
};


/**
 * @param {string} name Имя переменной.
 * @param {string} value Значение.
 * @param {number=} opt_time Время хранения.
 */
util.setCookie = function(name, value, opt_time) {
  var expires = '';

  if (opt_time !== undefined) {
    var date = new Date();
    date.setTime(opt_time + date.getTime());

    expires = '; expires=' + date.toGMTString();
  }

  document.cookie = name + '=' + value + expires + '; path=/';
};


/**
 * @param {string} name Имя переменной.
 * @return {string} Значение переменной.
 */
util.getCookie = function(name) {
  var cookies = document.cookie;

  var token = name + '=';
  var tokenIndex = cookies.indexOf(token);
  if (tokenIndex !== -1) {
    var semicolonIndex = cookies.indexOf(';', tokenIndex);
    if (semicolonIndex === -1) {
      return cookies.substring(tokenIndex + token.length);
    } else {
      return cookies.substring(tokenIndex + token.length, semicolonIndex);
    }
  }

  return '';
};


/**
 * @param {string=} opt_prefix Cookie name prefix.
 * @return {!Object.<string, string>} Набор кукисов.
 */
util.getCookies = function(opt_prefix) {
  return util.__parseCookies(document.cookie.toString(), opt_prefix);
};


/**
 * @param {string} cookiesString Cookies data.
 * @param {string=} opt_prefix Cookie name prefix.
 * @return {!Object.<string, string>} Набор кукисов.
 */
util.__parseCookies = function(cookiesString, opt_prefix) {
  var cookies = cookiesString.split('; ');

  var prefix = opt_prefix || '';
  var result = {};
  var i = 0,
      l = cookies.length;

  while (i < l) {
    if (cookies[i].indexOf(prefix) === 0) {
      var cookie = cookies[i].split('=');

      result[cookie.shift()] = cookie.shift();
    }

    i += 1;
  }

  return result;
};


/**
 * @param {string} key Local storage key.
 * @return {!Object.<string, string>} Набор кукисов.
 */
util.getCookiesFromStorage = function(key) {
  var cookies = util.loadFromStorage(key);
  return util.__parseCookies(cookies);
};


/**
 * @param {string} pattern Cookies pattern.
 * @return {!Object} Cookies object.
 */
util.getCookiesValues = function(pattern) {
  var cookies = document.cookie;
  var values = {};
  pattern += '=[^;]+';
  var matched = cookies.match(new RegExp(pattern, 'g'));
  if (matched !== null) {
    for (var i = 0, l = matched.length; i < l; i += 1) {
      var match = matched[i].split('=');
      values[match[0]] = match[1];
    }
  }
  return values;
};


/**
 * @param {string} name Имя переменной.
 */
util.removeCookie = function(name) {
  var date = new Date();
  date.setTime(date.getTime() - 1000);

  document.cookie = name + '=0; expires=' + date.toGMTString() + '; path=/';
};


/**
 * @return {number} Ширина экрана.
 */
util.getWindowWidth = function() {
  return window.innerWidth || document.documentElement.clientWidth;
};


/**
 * @return {number} Высота экрана.
 */
util.getWindowHeight = function() {
  return window.innerHeight || document.documentElement.clientHeight;
};


/**
 * @param {string} str Строка.
 * @return {string} Строка.
 */
util.trim = function(str) {
  return str.replace(/^\s+|\s+$/g, '');
};


/**
 * @param {string} data Данные.
 * @param {number=} opt_expireTime Время хранения в миллисекундах.
 * @return {string} Элемент хранилища.
 */
util.__encodeStorageItem = function(data, opt_expireTime) {
  return util.encodeJsonData({
    data: data,
    time: opt_expireTime ?
        new Date().getTime() + opt_expireTime : undefined
  });
};


/**
 * @param {string} item Закодированный элемент хранилища.
 * @return {*} Раскодированный элемент хранилища.
 */
util.__decodeStorageItem = function(item) {
  return util.decodeJsonData(item);
};


/**
 * @param {string} key Ключ.
 * @param {string} data Данные.
 * @param {number=} opt_expireTime Время хранения в миллисекундах.
 */
util.saveToStorage = function(key, data, opt_expireTime) {
  try {
    window['localStorage'].setItem(key,
        util.__encodeStorageItem(data, opt_expireTime));
  } catch (error) {
    util.setCookie(key, data, opt_expireTime);
  }
};


/**
 * @param {string} key Ключ.
 */
util.removeFromStorage = function(key) {
  try {
    window['localStorage'].removeItem(key);
  } catch (error) {
    if (util.getCookie(key) !== '') {
      util.removeCookie(key);
    }
  }
};


/**
 * @param {string} key Ключ.
 * @return {string} Раскодированный элемент хранилища.
 */
util.loadFromStorage = function(key) {
  try {
    var item = util.__decodeStorageItem(window['localStorage'].getItem(key));

    if (item !== null) {
      if (item['time'] === undefined ||
          new Date().getTime() < item['time']) {
        return item['data'];
      } else {
        util.removeFromStorage(key);
      }
    }

    return '';
  } catch (error) {}

  return util.getCookie(key);
};


/**
 * @return {boolean}
 */
util.isSecure = function() {
  return window.location.protocol === 'https:';
};
