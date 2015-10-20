/// <reference path="typings/tsd.d.ts"/>
/// <reference path="lodashExt.d.ts"/>

import 'lodash';

/**
 * Модуль, добавляющий в lodash разные полезные методы, отсутствующие из коробки.
 *
 * @file lodashExt
 */


/**
 * Добавляет в массив `source` элементы массива `items`
 *
 * @param {Array} source массив, в который будут добавлены элементы
 * @param {Array} items массив, элементы которого будут добавлены в `source`
 * @return {Array} `source` массив
 */
function addItems<T>(source: T[], items: T[]) {
    for (var i = 0, l = items.length; i < l; i += 1) {
        var item = items[i];
        source.push(item);
    }
    return source;
}

/**
 * Добавляет элемент в конец массива, если его в массиве еще нет
 * Если элемент тоже массив, то добавляет поэлементно
 *
 * @param {Array} list Массив
 * @param {Object|Array} item Элемент или массив элементов которые будет добавлены
 * @return {boolean} Признак, был ли изменен массив `list`
 */
function addUniq<T>(list: T[], item: T) {
    var hasBeenAdded = false;
    if (_.isArray(item)) {
        _.forEach(item, function (i) {
            if (addUniq(list, i)) {
                hasBeenAdded = true;
            }
        });
    } else {
        if (!_.includes(list, item)) {
            list.push(item);
            hasBeenAdded = true;
        }
    }
    return hasBeenAdded;
}

/**
 * Подписывается на DOM-событие. Отписывается когда `scope` уничтожается
 *
 * Специфичный метод, только для angular-приложенний
 *
 * @param {ng.IScope} scope
 * @param {HTMLElement|jQuery} elm
 * @param {string} event название событие или несколько событий, разделенных пробелом
 * @param {Function} handler функция-обработчик
 */
function bindDomEventToScope(scope: ng.IScope, elm: JQuery, event: string, handler: Function) {
    elm = angular.element(elm);
    elm.on(event, handler);
    scope.$on('$destroy', function () {
        elm.off(event, (e) => handler(e));
    });
}

/**
 * Нормализует (рекурсивно) объект, преобразуя все ключи к camelCase
 *
 * @param {Object} obj объект, ключи котого будут нормализованы
 * @returns {Object} тот же объект, что на входе
 */
function camelizeObject(obj: any) {
    if (!_.isObject(obj) || _.isFunction(obj)) {
        return;
    }
    var mapToRename: any = {};
    _.forEach(obj, (value: any, key: string) => {
            if (_.isArray(value)) {
                _.forEach(value, camelizeObject);
            } else if (_.isObject(value)) {
                camelizeObject(value);
            }
            mapToRename[key] = _.camelCase(key);
        }
    )
    ;
    renameFields(obj, mapToRename);
    return obj;
}

/**
 * Удаляет поля со значениями по-умолчанию (или пустыми значениями)
 *
 * Пустота определяется методом {@link lodashExt#isValuable _.isValuable}
 * Эквивалентность - методом [_.isEqual](https://lodash.com/docs#isEqual)
 *
 * Нужен для очистки лишних параметров запросов к WebApi
 *
 * @param {Object} obj объект
 * @param {Object} [defaults] объект со значениями по-умолчанию
 */
function clearDefaults(obj: any, defaults: any = {}) {
    var result: any = {};

    _.forIn(omitPrivateFields(obj), function (val, key) {
        if (isValuable(val) && !_.isEqual(defaults[key], val)) {
            result[key] = val;
        }
    });

    return result;
}

// просто обёртка, чтобы не гадить в скоуп выше
function truncFactory() {
    // разные символы конца строк
    // взято из исходников SugarJS:
    // https://github.com/andrewplummer/Sugar/blob/308d598795fe7a15cfebc02c38aa54839430c091/lib/common.js#L272
    var splitChars =
        '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003' +
        '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF';
    var splitRegExp = new RegExp('(?=[' + splitChars + '])');

    var ellipsis = '…';
    var ellipsisCount = ellipsis.length;

    /**
     * Отбрасывает конец строки, если длина строки выходит за лимит
     *
     * Похож на метод [_.trunc](https://lodash.com/docs#trunc),
     * но умеет бить по границам слов и поддерживает кириллицу
     *
     * Если строка была укорочена, то добавляет в конец мнототочие `…`
     *
     * @method emTrunc
     * @param {string} input обрезаемая строка
     * @param {number} limit лимит по длине
     * @param {boolean} [byWord=false] резать только по границам слов
     * @returns {string}
     */
    return function (input: string, limit: number, byWord = false) {
        if (_.isUndefined(input) || _.isNull(input)) {
            return '';
        }
        input = input.toString();
        // Если и так короткая - возвращаем без изменений
        if (input.length <= limit + ellipsisCount) {
            return input;
        }

        // Если бить по словам не надо, просто возвращаем укороченную версию
        if (!byWord) {
            return input.slice(0, limit) + ellipsis;
        }

        // Бьём по словам, потом начинаем собирать новую строку,
        // предварительно проверяя, чтобы она не вышла за рамки
        var words = input.split(splitRegExp);
        var result = '';
        for (var i = 0, l = words.length; i < l; i += 1) {
            var word = words[i];
            if ((result.length + word.length) >= limit + ellipsisCount) {
                break;
            }
            result += word;
        }
        return result + ellipsis;
    };
}

/**
 * Кроссбраузерный способ получить символ из события keypress
 *
 * `event.type` должен быть `keypress`
 *
 * Взято [отсюда](https://learn.javascript.ru/keyboard-events)
 *
 * @param {Event} event
 * @returns {string|null} null  строка с символом или `null`, если нажатая клавиша не вводит никаких символов
 */
function getCharFromKeypress(event: KeyboardEvent) {
    if (event.which === null) { // IE
        // спец. символ
        if (event.keyCode < 32) {
            return null;
        }
        return String.fromCharCode(event.keyCode);
    }

    if (event.which !== 0 && event.charCode !== 0) { // все кроме IE
        // спец. символ
        if (event.which < 32) {
            return null;
        }
        return String.fromCharCode(event.which); // остальные
    }

    return null; // спец. символ
}

/**
 * Проверяет, что объект содержит какие-нибудь полезные значения
 *
 * Т.к. метод рекурсивный, содержит защиту от циклических ссылок
 *
 * @param obj
 * @param _objects
 * @returns {boolean}
 */
function hasValues(obj: any, _objects?: any): boolean {
    if (!_.isArray(_objects)) {
        _objects = [];
    }

    if (!_.isObject(obj) || _.isEmpty(obj)) {
        return false;
    }

    _objects.push(obj);

    return _(obj)
        .values()
        .some((val: any) => {
            if (_.isObject(val)) {

                if (_.includes(_objects, val)) {
                    throw 'Recursion!';
                }

                return hasValues(val, _objects);
            }
            return !(_.isNull(val) || _.isUndefined(val));
        });
}

/**
 * Функция наследования (через прототипы)
 *
 * Отличительной особенностью является то,
 * что не вызывает конструктор родительского класса при объявлении наследника
 *
 * @param {Function} Child Конструктор дочернего класса
 * @param {Function} Parent Конструктор родительского класса
 * @param {Object} overrides Дополнительные поля (добавляются в прототип Child)
 */
/* tslint:disable:variable-name */
function inherit(Child: Function, Parent: Function, overrides: any) {
    class F {
    }
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    _.assign(Child.prototype, overrides);
}
/* tslint:enable:variable-name */

/**
 * Инвертированный вариант [_.isUndefined](https://lodash.com/docs#isUndefined)
 * @method isDefined
 */

/**
 * Проверяет, что объект является обещанием
 *
 * Проверяет наличие методов `then`, `catch`, `finally`
 *
 * @param {Object} promise
 * @returns {boolean}
 */
function isPromise(promise: ng.IPromise<any>) {
    return _.isObject(promise) &&
        _.isFunction(promise.then) &&
        _.isFunction(promise.catch) &&
        _.isFunction(promise.finally);
}

/**
 * Проверяет, значимое ли значение
 *
 * [_.isEmpty](https://lodash.com/docs#isEmpty) не работает на числах и булевых значениях.
 * Исправляем этот огрех.
 *
 * @param {*} value любое значение
 * @returns {boolean} содержит ли оно что-нибудь полезное
 */
function isValuable(value: any) {
    if ((_.isNumber(value) && !_.isNaN(value)) || _.isObject(value) || _.isBoolean(value)) {
        return true;
    }
    return !_.isEmpty(value);
}

/**
 * Ограничивает число снизу и сверху
 *
 * Если передано не число или `Math.NaN`, то возвращается минимальное значение
 *
 * @param {number} value число
 * @param {number} min минимально возможное значение
 * @param {number} max максимально возможное значение
 * @returns {number}
 */
function limitTo(value: number, min: number, max: number) {
    if (!_.isNumber(value) || _.isNaN(value)) {
        return min;
    }

    if (value > max) {
        return max;
    }

    if (value < min) {
        return min;
    }

    return value;
}

/**
 * Удаляет из объекта все поля с приватными префиксами `$`, `_`
 *
 * @param {Object} obj исходный объект
 * @param {string[]} [prefixies] приватные префиксы, если нужны другие
 * @returns {Object} Копия объекта, но без приватных полей
 */
function omitPrivateFields(obj: any, prefixies = ['$', '_']): any {
    if (!_.isObject(obj)) {
        return obj;
    }

    if (_.isArray(obj)) {
        return _.map(obj, function (item) {
            return omitPrivateFields(item, prefixies);
        });
    }

    var keysToReject = _(obj)
        .keys()
        .filter(function (key) {
            return _.some(prefixies, function (prefix) {
                return _.startsWith(key, prefix);
            });
        })
        .value();

    return _.mapValues(_.omit(obj, keysToReject), function (value) {
        return _.isObject(value) ?
            omitPrivateFields(value, prefixies) :
            value;
    });
}

/**
 * Нормализует (рекурсивно) объект, преобразуя все ключи к snake_case
 *
 * @param {Object} obj объект, ключи котого будут нормализованы
 * @returns {Object} тот же объект, что на входе
 */
function pythonizeObject(obj: any) {
    if (!_.isObject(obj) || _.isFunction(obj)) {
        return;
    }
    var mapToRename: any = {};
    _.forEach(obj, (value: any, key: string) => {
        if (_.isArray(value)) {
            _.forEach(value, pythonizeObject);
        } else if (_.isObject(value)) {
            pythonizeObject(value);
        }
        mapToRename[key] = _.snakeCase(key);
    });
    renameFields(obj, mapToRename);
    return obj;
}

/**
 * Удаляет элемент из массива
 *
 * @param {Array} list Массив
 * @param {Object} item Элемент
 * @return {boolean} был ли изменен массив `list`
 */
function removeItem<T>(list: T[], item: T) {
    return _.remove(list, function (i) {
            return i === item;
        }).length > 0;
}

/**
 * Удаляет из массива список элементов
 *
 * @param {Array} list исходный массив
 * @param {Array} items список элементов на удаление
 * @return {boolean} был ли изменен массив `list`
 */
function removeItems<T>(list: T[], items: T[]) {
    return _.remove(list, function (i) {
        return _.includes(items, i);
    });
}

/**
 * Преобразует объект, переименовывая его поля согласно переданному шаблону
 *
 * Например:
 *
 *     _.renameFields({x:2,y:3}, {x:'a',y:'b'})
 *     // вернет {a:2,b:3}
 *
 * @param {Object} obj исходный объект
 * @param {Object} hash шаблон
 * @returns {Object} исходный объект, но с переименованными полями
 */
function renameFields(obj: any, hash: any) {
    if (!_.isObject(obj)) {
        return obj;
    }
    _.forEach(hash, (newFieldName: string, oldFieldName: string) => {
        if (newFieldName !== oldFieldName && _.has(obj, oldFieldName)) {
            obj[newFieldName] = obj[oldFieldName];
            delete obj[oldFieldName];
        }
    });
    return obj;
}

interface IWaitForConfig {
    check: Function;
    then?: Function;
    timeout?: Function;
    cancel?: Function;
    interval?: number;
    max?: number;
    context?: any;
}
/**
 * Ожидает, пока функция проверки вернет нужно значение
 *
 * Пример использования:
 *
 *     _.waitFor({
 *       check: function(){
 *         // ожидаем появления модального окна
 *         return $('.modal').length > 0;
 *       },
 *       then: function(){
 *         // печатаем текст в поле поиска
 *         $('.modal input.search').val('bla, bla');
 *       }
 *     });
 *
 *
 * @method waitFor
 * @param config
 * @param {Function} [config.check] функция проверки, должна вернуть truthy значение,
 * чтобы сработал колбек `then`
 * @param {Function} [config.then] колбек
 * @param {Function} [config.timeout] функция срабатывает после истечения `max`
 * @param {Function} [config.cancel] функция срабатывает, когда проверка отменяется вручную
 * @param {number} [config.interval=100] интервал проверки в мс.
 * @param {number} [config.max=10000] максимальное время ожидания в мс.
 * @param {Object} [context] контекст (this) в котором будут выполнятся коллбеки
 * @returns {{cancel: Function}} объект с одним методом `cancel()`, позволяющий отменить проверку
 */
function waitFor(config: IWaitForConfig, context: any): {cancel: Function} {
    config = _.defaults<IWaitForConfig, IWaitForConfig>(config, {
        check: _.noop,
        then: _.noop,
        timeout: _.noop,
        cancel: _.noop,
        interval: config.interval || 100,  // 100 ms
        max: config.max || 10000           // 10 s
    });

    var maxCount = config.max / config.interval;
    var count = 0;
    var canceled = false;
    var timerId: number;

    function check() {
        count += 1;
        if (count > maxCount) {
            config.timeout.call(context);
            canceled = true;
            return;
        }
        if (config.check()) {
            config.then.call(context);
            canceled = true;
            return;
        }
        timerId = _.delay(check, config.interval);
    }

    check();

    return {
        cancel: function () {
            canceled = true;
            clearTimeout(timerId);
            config.cancel.call(context);
        }
    };
}

/**
 * Пропатченный метод [`_.words`](https://lodash.com/docs#words) из lodash, добавлена поддержка кириллицы
 *
 * Автор [не захотел](https://github.com/lodash/lodash/pull/913) добавлять это в lodash
 *
 * Если вдруг понадобиться оригинальный `_.words`,
 * то он доступен как {@link lodashExt#wordsOriginal _.wordsOriginal}
 *
 * @method words
 * @param {string} text
 * @return {string[]}
 */
var reWords = (function () {
    var upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde\\u0401\\u0410-\\u042F]';
    var lower = '[a-z\\xdf-\\xf6\\xf8-\\xff\\u0451\\u0430-\\u044F]+';
    var pattern = upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+';
    return new RegExp(pattern, 'g');
}());

/**
 * Оригинальный [`_.word`](https://lodash.com/docs#words)
 * @method wordsOriginal
 * @param {string} text
 * @return {string[]}
 */

_.mixin({
    addItems: addItems,
    addUniq: addUniq,
    bindDomEventToScope: bindDomEventToScope,
    camelizeObject: camelizeObject,
    clearDefaults: clearDefaults,
    emTrunc: truncFactory(),
    getCharFromKeypress: getCharFromKeypress,
    hasValues: hasValues,
    inherit: inherit,
    isDefined: _.negate(_.isUndefined),
    isPromise: isPromise,
    isValuable: isValuable,
    limitTo: limitTo,
    omitPrivateFields: omitPrivateFields,
    pythonizeObject: pythonizeObject,
    removeItem: removeItem,
    removeItems: removeItems,
    renameFields: renameFields,
    waitFor: waitFor,
    words: _.partial(_.words, _, reWords),
    wordsOriginal: _.words
}, { chain: false });

export default _;
