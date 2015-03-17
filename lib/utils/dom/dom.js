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
 * Оповещение слушателей о событии DOM-элемента типа <code>type</code>.
 *
 * @see utils.dom.addEventListener
 * @see utils.dom.removeEventListener
 * @param {!Node|!Window} element DOM-элемент о событии которого необходимо
 *        оповестить.
 * @param {string} type Тип события.
 * @return {boolean} Успех результата оповещения.
 */
utils.dom.dispatchEvent = function(element, type) {
  var result = false;

  var event = null;
  if (document.createEventObject !== undefined) {
    event = document.createEventObject();

    var eventName = 'on' + type;
    if (element[eventName] === undefined) {
      utils.dom.__dispatchCustomIEEvent(element, event, type);
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
 * @see utils.dom.dispatchEvent
 * @param {!Node|!Window} element DOM-элемент, событие которого нужно
 *    обрабатывать.
 * @param {string} type Тип обрабатываемого события.
 * @param {!function(Event)} handler Функция-обработчик события.
 */
utils.dom.addEventListener = function(element, type, handler) {
  if (element.addEventListener !== undefined) {
    element.addEventListener(type, handler, false);
  } else if (element.attachEvent !== undefined) {
    var eventName = 'on' + type;
    if (element[eventName] === undefined) {
      utils.dom.__addCustomIEListener(element, type, handler);
    } else {
      if (element['__ieTargetId'] === undefined) {
        element['__ieTargetId'] = 'element_' + utils.dom.__lastElementId++;
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
utils.dom.removeEventListener = function(element, type, handler) {
  if (element.removeEventListener !== undefined) {
    element.removeEventListener(type, handler, false);
  } else if (element.detachEvent !== undefined) {
    var eventName = 'on' + type;
    if (element[eventName] === undefined) {
      utils.dom.__removeCustomIEListener(element, type, handler);
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
utils.dom.addOneEventListener = function(element, type, handler) {
  if (element['__onceTargetId'] === undefined) {
    element['__onceTargetId'] = 'element_' + utils.dom.__lastElementId++;
  }

  var listenerId = element['__onceTargetId'] + '_' + type;
  handler[listenerId] = function(event) {
    handler.call(element, event);
    utils.dom.removeOneEventListener(element, type, handler);
  };

  utils.dom.addEventListener(element, type, handler[listenerId]);
};


/**
 * Удаление единовременного обработчика события.
 *
 * @see utils.dom.addOneEventListener
 * @param {!Node} element DOM-элемент, единовременный обработчик события
 *        которого нужно удалить.
 * @param {string} type Тип обрабатываемого события.
 * @param {!function(Event)} handler Функция-обработчик события.
 */
utils.dom.removeOneEventListener = function(element, type, handler) {
  var listenerId = element['__onceTargetId'] + '_' + type;

  if (handler[listenerId] !== undefined) {
    utils.dom.removeEventListener(element, type, handler[listenerId]);

    delete handler[listenerId];
  }
};


/**
 * Добавление обработчика нестандартного события в Internet Explorer.
 *
 * В качестве вспомогательного события, данный метод использует событие
 * <code>'onhelp'</code>.
 *
 * @see utils.dom.__dispatchCustomIEEvent
 * @param {!Node|!Window} element DOM-елемент, событие которого нужно
 *    обрабатывать.
 * @param {string} type Тип обрабатываемого события.
 * @param {!function(Event)} handler Функция-обработчик события.
 */
utils.dom.__addCustomIEListener = function(element, type, handler) {
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
 * @see utils.dom.__addCustomIEListener
 * @param {!Node|!Window} element DOM-елемент, слушатель события которого нужно
 *    удалить.
 * @param {string} type Тип удаляемого события.
 * @param {!function(Event)} handler Удаляемая функция-обработчик события.
 */
utils.dom.__removeCustomIEListener = function(element, type, handler) {
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
 * Также как и функция <code>utils.dom.__addCustomIEListener()</code> использует
 * в качестве вспомогательного событие <code>'onhelp'/code>.
 *
 * @see utils.dom.__addCustomIEListener
 * @param {!Node|!Window} element DOM-елемент, событие которого нужно
 *    обрабатывать.
 * @param {!Event} event Объект события стандартной событийной модели браузера.
 * @param {string} type Тип не стандартного события.
 * @return {boolean} Успех оповещения о событии.
 */
utils.dom.__dispatchCustomIEEvent = function(element, event, type) {
  event['__type'] = type;
  return element.fireEvent('onhelp', event);
};


/**
 * @type {number}
 */
utils.dom.__lastElementId = 0;


/**
 * Кросс-браузерная обертка остановки дествия события по-умолчанию.
 *
 * @param {Event} event Объект DOM-события.
 */
utils.dom.preventDefault = function(event) {
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
utils.dom.stopPropagation = function(event) {
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
utils.dom.getEventTarget = function(event) {
  if (event.target instanceof Node) {
    return event.target;
  }

  if (event.srcElement instanceof Node) {
    return event.srcElement;
  }

  return null;
};
