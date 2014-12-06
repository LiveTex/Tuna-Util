/**
 * util FRAMEWORK
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
 * @type {!Node}
 */
util.dom.DUMMY_NODE = document;


/**
 * Фильтрация набора элементов с условием соответствия CSS-селектору.
 *
 * @param {string} selector CSS-селектор которому должны соответсвовать
 *        элементы.
 * @param {!Array.<Node>} elements Массив элементов, которые необходимо
 *        отфильтровать.
 * @return {!Array.<Node>} Отфильтрованный массив элементов.
 */
util.dom.matches = function(selector, elements) {
  return [];
};


/**
 * Проверка соответствия элемента CSS-селектору.
 *
 * @param {!Node} element DOM-элемент соответствие которого нужно проверить.
 * @param {string} selector CSS-селектор которому должен соответсвовать
 *        элемент.
 * @return {boolean} Результат проверки.
 */
util.dom.matchesSelector = function(element, selector) {
  return false;
};


/**
 * @see util.dom.setSelectorEngine
 */
util.dom.__selectorEngine = null;


/**
 * Оповещение слушателей о событии DOM-элемента типа <code>type</code>.
 *
 * @see util.dom.addEventListener
 * @see util.dom.removeEventListener
 * @param {!Node|!Window} element DOM-элемент о событии которого необходимо
 *        оповестить.
 * @param {string} type Тип события.
 * @return {boolean} Успех результата оповещения.
 */
util.dom.dispatchEvent = function(element, type) {
  var result = false;

  var event = null;
  if (document.createEventObject !== undefined) {
    event = document.createEventObject();

    var eventName = 'on' + type;
    if (element[eventName] === undefined) {
      util.dom.__dispatchCustomIEEvent(element, event, type);
    } else {
      result = element.fireEvent(eventName, event);
    }
  } else {
    event = document.createEvent('UIEvents');
    event.initUIEvent(type, true, true, window, 1);

    result = !element.dispatchEvent(event);
  }

  return result;
};


/**
 * Добавление обработчика события DOM-елемента.
 *
 * Все обработчик событий вызываются в контексте элемента, оповещение о событии
 * которого произошло.
 *
 * @see util.dom.dispatchEvent
 * @param {!Node|!Window} element DOM-элемент, событие которого нужно
 *    обрабатывать.
 * @param {string} type Тип обрабатываемого события.
 * @param {!function(Event)} handler Функция-обработчик события.
 */
util.dom.addEventListener = function(element, type, handler) {
  if (element.addEventListener !== undefined) {
    element.addEventListener(type, handler, false);
  } else if (element.attachEvent !== undefined) {
    var eventName = 'on' + type;
    if (element[eventName] === undefined) {
      util.dom.__addCustomIEListener(element, type, handler);
    } else {
      if (element['__ieTargetId'] === undefined) {
        element['__ieTargetId'] = 'element_' + util.dom.__lastElementId++;
      }

      var listenerId = element['__ieTargetId'] + '_' + type;
      handler[listenerId] = function(event) {
        handler.call(element, event);
      };

      element.attachEvent(eventName, handler[listenerId]);
    }
  }
};


/**
 * Удаление обработчика события DOM-элемента.
 *
 * @param {!Node|!Window} element DOM-элемент, обработчик события которого нужно
 *        удалить.
 * @param {string} type Тип обрабатываемого события.
 * @param {!function(Event)} handler Функция-обработчик события.
 */
util.dom.removeEventListener = function(element, type, handler) {
  if (element.removeEventListener !== undefined) {
    element.removeEventListener(type, handler, false);
  } else if (element.detachEvent !== undefined) {
    var eventName = 'on' + type;
    if (element[eventName] === undefined) {
      util.dom.__removeCustomIEListener(element, type, handler);
    } else {
      var listenerId = element['__ieTargetId'] + '_' + type;
      if (handler[listenerId] !== undefined) {
        element.detachEvent('on' + type, handler[listenerId]);

        delete handler[listenerId];
      }
    }
  }
};


/**
 * Добавление единовременного обработчика события.
 *
 * После первого вызова обработчик события удаляется.
 *
 * @param {!Node} element DOM-элемент, событие которого нужно обрабатывать.
 * @param {string} type Тип обрабатываемого события.
 * @param {!function(Event)} handler Функция-обработчик события.
 */
util.dom.addOneEventListener = function(element, type, handler) {
  if (element['__onceTargetId'] === undefined) {
    element['__onceTargetId'] = 'element_' + util.dom.__lastElementId++;
  }

  var listenerId = element['__onceTargetId'] + '_' + type;
  handler[listenerId] = function(event) {
    handler.call(element, event);
    util.dom.removeOneEventListener(element, type, handler);
  };

  util.dom.addEventListener(element, type, handler[listenerId]);
};


/**
 * Удаление единовременного обработчика события.
 *
 * @see util.dom.addOneEventListener
 * @param {!Node} element DOM-элемент, единовременный обработчик события
 *        которого нужно удалить.
 * @param {string} type Тип обрабатываемого события.
 * @param {!function(Event)} handler Функция-обработчик события.
 */
util.dom.removeOneEventListener = function(element, type, handler) {
  var listenerId = element['__onceTargetId'] + '_' + type;

  if (handler[listenerId] !== undefined) {
    util.dom.removeEventListener(element, type, handler[listenerId]);

    delete handler[listenerId];
  }
};


/**
 * Установка обработчика событий дочерних элементов выбранного DOM-элемента.
 *
 * Данный обработчик возможно использовать лишь для тех событий, для которых
 * возможен баблинг.
 *
 * Для указания дочерних элементов, события которых необходимо отлавливать
 * используется CSS-селектор. В случае если выбранный DOM-элемент удовлетворяет
 * селектору дочерних элементов обработчик не срабатывает.
 *
 * @see util.dom.getParentMatches
 * @param {!Node} element DOM-элемент, событие дочерних элементов которого
 *        нужно обрабатывать.
 * @param {string} selector CSS-селектор дочерних элементов.
 * @param {string} type Тип обрабатываемого события.
 * @param {function(!Event, !Node)} handler Функция-обработчик события.
 */
util.dom.addChildEventListener = function(element, selector, type, handler) {
  if (selector !== '') {
    if (element['__childTargetId'] === undefined) {
      element['__childTargetId'] = 'element_' + util.dom.__lastElementId++;
    }

    var listenerId = element['__childTargetId'] + '_' + type + '_' + selector;
    handler[listenerId] =
        util.dom.__createChildListener(element, selector, handler);

    util.dom.addEventListener(element, type, handler[listenerId]);
  }
};


/**
 * @param {!Node} element DOM-элемент, событие дочерних элементов которого
 *        нужно обрабатывать.
 * @param {string} selector CSS-селектор дочерних элементов.
 * @param {!function(!Event, !Node)} handler Функция-обработчик события.
 * @return {!function(!Event, !Node)} Созданный обработчик события.
 */
util.dom.__createChildListener = function(element, selector, handler) {
  return function(event) {
    if (event !== null) {
      var target = util.dom.getEventTarget(event);
      var child = null;

      if (target !== null) {
        if (util.dom.matchesSelector(target, selector)) {
          child = target;
        } else {
          child = util.dom.getParentMatches(target, selector, element);
        }
      }

      if (child !== null) {
        handler.call(child, event, child);
        util.dom.stopPropagation(event);
      }
    }
  };
};


/**
 * Удаление обработчика событий дочерних элементов выбранного DOM-элемента.
 *
 * @see util.dom.addChildEventListener
 * @param {!Node} element DOM-элемент, обработчик события дочерних элементов
 *        которого нужно удалить.
 * @param {string} selector CSS-селектор дочерних элементов.
 * @param {string} type Тип обрабатываемого события.
 * @param {function(!Event, !Node)} handler Функция-обработчик события.
 */
util.dom.removeChildEventListener = function(element, selector, type, handler) {
  if (selector !== '') {
    var listenerId = element['__childTargetId'] + '_' + type + '_' + selector;

    if (handler[listenerId] !== undefined) {
      util.dom.removeEventListener(element, type, handler[listenerId]);

      delete handler[listenerId];
    }
  }
};


/**
 * Добавление обработчика нестандартного события в Internet Explorer.
 *
 * В качестве вспомогательного события, данный метод использует событие
 * <code>'onhelp'</code>.
 *
 * @see util.dom.__dispatchCustomIEEvent
 * @param {!Node|!Window} element DOM-елемент, событие которого нужно
 *    обрабатывать.
 * @param {string} type Тип обрабатываемого события.
 * @param {!function(Event)} handler Функция-обработчик события.
 */
util.dom.__addCustomIEListener = function(element, type, handler) {
  if (element['__customListener'] === undefined) {
    element['__customListener'] = function(event) {
      if (event['__type'] !== undefined) {
        var type = event['__type'];
        delete event['__type'];

        var handlers = element['__' + type];
        for (var i in handlers) {
          handlers[i].call(element, event);
        }
      }
    };

    element.attachEvent('onhelp', element['__customListener']);
  }

  if (element['__' + type] === undefined) {
    element['__' + type] = [];
  }

  element['__' + type].push(handler);
};


/**
 * Удаление нестандартного события в Internet Explorer.
 *
 * @see util.dom.__addCustomIEListener
 * @param {!Node|!Window} element DOM-елемент, слушатель события которого нужно
 *    удалить.
 * @param {string} type Тип удаляемого события.
 * @param {!function(Event)} handler Удаляемая функция-обработчик события.
 */
util.dom.__removeCustomIEListener = function(element, type, handler) {
  var handlers = element['__' + type];
  if (handlers !== undefined) {
    var i = handlers.length - 1;
    while (i >= 0) {
      if (handlers[i] === handler) {
        handlers.splice(i, 1);
      }

      i--;
    }
  }
};


/**
 * Оповещение слушателей нестандартного события в Internet Explorer.
 *
 * Также как и функция <code>util.dom.__addCustomIEListener()</code> использует
 * в качестве вспомогательного событие <code>'onhelp'/code>.
 *
 * @see util.dom.__addCustomIEListener
 * @param {!Node|!Window} element DOM-елемент, событие которого нужно
 *    обрабатывать.
 * @param {!Event} event Объект события стандартной событийной модели браузера.
 * @param {string} type Тип не стандартного события.
 * @return {boolean} Успех оповещения о событии.
 */
util.dom.__dispatchCustomIEEvent = function(element, event, type) {
  event['__type'] = type;
  return element.fireEvent('onhelp', event);
};


/**
 * @type {number}
 */
util.dom.__lastElementId = 0;


/**
 * Кросс-браузерная обертка остановки дествия события по-умолчанию.
 *
 * @param {Event} event Объект DOM-события.
 */
util.dom.preventDefault = function(event) {
  if (event !== null) {
    if (event.preventDefault !== undefined) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  }
};


/**
 * Кросс-браузерная обертка остановки распространения события.
 *
 * @param {Event} event Объект DOM-события.
 */
util.dom.stopPropagation = function(event) {
  if (event !== null) {
    if (event.stopPropagation !== undefined) {
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
  }
};


/**
 * @param {!Event} event Объект DOM-события.
 * @return {Node} Узел с которым произошло событие.
 */
util.dom.getEventTarget = function(event) {
  if (event.target instanceof Node) {
    return event.target;
  }

  if (event.srcElement instanceof Node) {
    return event.srcElement;
  }

  return null;
};


/**
 * @param {!Node} element DOM-элемент родителя которого нужно найти.
 * @param {!Node} parent Родителя которого необходимо найти.
 * @return {boolean} Есть ли такой родитель.
 */
util.dom.hasParent = function(element, parent) {
  return parent.contains(element);
};


/**
 * @param {!Node} element DOM-элемент родителя которого нужно найти.
 * @param {Node=} opt_context DOM-элемент ограничивающий поиск родителя.
 * @return {!Array.<!Node>} Есть ли такой родитель.
 */
util.dom.getParents = function(element, opt_context) {
  var context = opt_context || document.documentElement;
  var result = [];

  var nextParent = element.parentNode;
  while (nextParent !== context.parentNode && nextParent !== null) {
    result.push(nextParent);

    nextParent = nextParent.parentNode;
  }

  return result;
};


/**
 * Взятие ближайшего родителя DOM-элемента соответсвующего выбранному
 * CSS-селектору.
 *
 * @see util.dom.matches
 * @param {!Node} element DOM-элемент родителя которого нужно найти.
 * @param {string} selector CSS-селектор которому должен соответсовать
 *        родительский элемент.
 * @param {Node=} opt_context DOM-элемент ограничивающий поиск родителя.
 * @return {Node} Hайденный родительский элемент или <code>null</code>.
 */
util.dom.getParentMatches = function(element, selector, opt_context) {
  var parent = element.parentNode;

  while (parent !== null && parent !== opt_context &&
      !util.dom.matchesSelector(parent, selector)) {

    parent = parent.parentNode;
  }

  return parent === opt_context ? null : parent;
};


/**
 * Взятие ближайшего родителя DOM-элемента который имеет выбранный CSS-класс.
 *
 * @param {!Node} element DOM-элемент родителя которого нужно найти.
 * @param {string} className Название CSS-класса родителя с которым необходимо
 *        найти.
 * @param {Node=} opt_context DOM-элемент ограничивающий поиск родителя.
 * @return {Node} Hайденный родительский элемент или <code>null</code>.
 */
util.dom.getParentWithClass = function(element, className, opt_context) {
  var parent = element.parentNode;

  while (parent !== null && parent !== opt_context &&
      !util.dom.hasClass(parent, className)) {

    parent = parent.parentNode;
  }

  return parent === opt_context ? null : parent;
};


/**
 * Поиск элементов с указанным CSS-классом, в указанном контексте.
 *
 * @param {string} className Название CSS-класса.
 * @param {!Node=} opt_element DOM-элемент в котором необходимо провести поиск.
 * @return {!Array.<!Node>} Массив  найденных элементов.
 */
util.dom.getElementsByClassName = function(className, opt_element) {
  var element = opt_element || document;
  return util.toArray(element.getElementsByClassName(className));
};


/**
 * Поиск первого элемента с указанным CSS-классом, в указанном контексте.
 *
 * @param {string} className Название CSS-класса.
 * @param {!Node=} opt_element DOM-элемент в котором необходимо провести поиск.
 * @return {Node} Найденный элемент.
 */
util.dom.getElementByClassName = function(className, opt_element) {
  var elements = util.dom.getElementsByClassName(className, opt_element);
  return elements[0] || null;
};


/**
 * Проверка наличия CSS-класса элемента.
 *
 * @param {!Node} element DOM-элемент наличие класса которого нужно проверить.
 * @param {string} className Название CSS-класса.
 * @return {boolean} Результат проверки.
 */
util.dom.hasClass = function(element, className) {
  if (element.classList !== undefined) {
    return element.classList.contains(className);
  } else if (element.className !== undefined) {
    var classRegExp = new RegExp('(\\s|^)' + className + '(\\s|$)');
    return element.className.match(classRegExp) !== null;
  }

  return false;
};


/**
 * Добавление CSS-класса элементу.
 *
 * В случае наличия класса у элемента ничего не происходит.
 *
 * @param {!Node} element DOM-элемент класс которому нужно добавить.
 * @param {string} className CSS-класс который нужно добавить.
 */
util.dom.addClass = function(element, className) {
  if (element.classList !== undefined) {
    element.classList.add(className);
  } else if (!util.dom.hasClass(element, className)) {
    element.className += ' ' + className;
  }
};


/**
 * Удаление CSS-класса у элемента.
 *
 * @param {!Node} element DOM-элемент класс готорого нужно удалить.
 * @param {string} className CSS-класс который нужно удалить.
 */
util.dom.removeClass = function(element, className) {
  if (element.classList !== undefined) {
    element.classList.remove(className);
  } else if (util.dom.hasClass(element, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    element.className = element.className.replace(reg, ' ');
  }
};


/**
 * Установка наличия CSS-класса у DOM-элемента.
 *
 * @param {!Node} element DOM-элемент наличие CSS-класса которого необходимо
 *        установить.
 * @param {string} className CSS-класс наличие которого необходимо установить.
 * @param {boolean} isExist Флаг наличия CSS-класса.
 */
util.dom.setClassExist = function(element, className, isExist) {
  if (!isExist && util.dom.hasClass(element, className)) {
    util.dom.removeClass(element, className);
  } else if (isExist && !util.dom.hasClass(element, className)) {
    util.dom.addClass(element, className);
  }
};


/**
 * Извлечение данных DOM-элемента установленных в аттрибутах с префиксом
 * <code>data-</code>.
 *
 * Результатом извлечения является хеш-таблица в которой ключами являются имена
 * аттрибутов без указанного префикса (Поу молчанию <code>data-</code>).
 *
 * Например, для элемента
 * <code>
 *     <p data-name="Paragraph" data-some-value="23"></p>
 * </code>
 * извлеченные данные будут иметь вид:
 * <code>
 *     { 'name': 'Paragraph', 'some-value': '23' }
 * </code>
 *
 * @param {!Node} element DOM-элемент, данные которого необходимо извлечь.
 * @param {string=} opt_prefix Префикс аттрибутов.
 * @return {!Object.<string, string>} Таблица данных элемента.
 */
util.dom.getAttributesData = function(element, opt_prefix) {
  var result = {};

  var prefix = opt_prefix || 'data-';

  var attrs = element.attributes;
  var i = 0,
      l = attrs.length;

  while (i < l) {
    if (attrs[i].name.indexOf(prefix) === 0) {
      result[attrs[i].name.substr(prefix.length)] = attrs[i].value;
    }

    i++;
  }

  return result;
};


/**
 * Создание экземпряра класса DocumentFragment cожержащий указанный HTML
 * контент.
 *
 * @param {string} html Строка HTML-верстки контента.
 * @return {DocumentFragment} Экземпляр класса DocumentFragment.
 */
util.dom.createFragment = function(html) {
  var fragment = document.createDocumentFragment();

  var tempContainer = document.createElement('div');
  tempContainer.innerHTML = html;

  var children = tempContainer.childNodes;
  var i = 0,
      l = children.length;

  while (i < l) {
    fragment.appendChild(children.item(0));

    i++;
  }

  return fragment;
};


/**
 * @return {number} pageYOffset in any browser
 */
util.dom.getWindowScrollTop = function() {
  var pageYOffset = window.pageYOffset;
  if (pageYOffset === undefined) {
    if (document.documentElement.clientHeight) {
      pageYOffset = document.documentElement.scrollTop;
    } else if (document.body !== null) {
      pageYOffset = document.body.scrollTop;
    } else {
      pageYOffset = 0;
    }
  }
  return pageYOffset;
};


/**
 * @return {number} pageXOffset in any browser
 */
util.dom.getWindowScrollLeft = function() {
  var pageXOffset = window.pageXOffset;
  if (pageXOffset === undefined) {
    if (document.documentElement.clientWidth) {
      pageXOffset = document.documentElement.scrollLeft;
    } else if (document.body !== null) {
      pageXOffset = document.body.scrollLeft;
    } else {
      pageXOffset = 0;
    }
  }
  return pageXOffset;
};


/**
 * @return {number} Whole document height.
 */
util.dom.getDocumentHeight = function() {
  var bodyHeight = 0;
  if (document.body !== null) {
    bodyHeight = Math.max(document.body.scrollHeight,
        document.body.offsetHeight);
  }

  var docElement = document.documentElement;
  return Math.max(bodyHeight, docElement.clientHeight, docElement.scrollHeight,
      docElement.offsetHeight);
};


/**
 * @return {number} Whole document width.
 */
util.dom.getDocumentWidth = function() {
  var bodyWidth = 0;
  if (document.body !== null) {
    bodyWidth = Math.max(document.body.scrollWidth,
        document.body.offsetWidth);
  }

  var docElement = document.documentElement;
  return Math.max(bodyWidth, docElement.clientWidth, docElement.scrollWidth,
      docElement.offsetWidth);
};
