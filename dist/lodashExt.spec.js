"use strict";
var lodashExt_1 = require('./lodashExt');
describe('lodash extensions', function () {
    'use strict';
    describe('addUniq', function () {
        it('should add item, if it not exist', function () {
            var ar = [1, 2, 3, 4];
            var result = lodashExt_1.default.addUniq(ar, 6);
            expect(result).toBe(true);
            expect(ar).toEqual([1, 2, 3, 4, 6]);
        });
        it('should skip adding existing item', function () {
            var ar = [1, 2, 3, 4];
            var result = lodashExt_1.default.addUniq(ar, 3);
            expect(result).toBe(false);
            expect(ar).toEqual([1, 2, 3, 4]);
        });
        it('should work with objects', function () {
            var obj1 = { x: 12 };
            var obj2 = { x: 3 };
            var list = [obj1, obj2];
            var obj3 = { x: 4 };
            var result = lodashExt_1.default.addUniq(list, obj3);
            expect(result).toBe(true);
            expect(list).toEqual([{ x: 12 }, { x: 3 }, { x: 4 }]);
            result = lodashExt_1.default.addUniq(list, obj2);
            expect(result).toBe(false);
            expect(list).toEqual([{ x: 12 }, { x: 3 }, { x: 4 }]);
        });
        it('should add several items', function () {
            var list1 = [1, 2, 3, 4];
            var list2 = [2, 3, 4, 5, 7];
            var result = lodashExt_1.default.addUniq(list1, list2);
            expect(result).toBe(true);
            expect(list1).toEqual([1, 2, 3, 4, 5, 7]);
        });
    });
    describe('assignInjections method', function () {
        it('should skip 0 by default', function () {
            function TestConstructor(a, b, c) {
                lodashExt_1.default.assignInjections(this, TestConstructor, arguments);
            }
            TestConstructor.$inject = ['a', 'b', 'c'];
            var instance = new TestConstructor(1, 2, 3);
            expect(instance.a).toBe(1);
            expect(instance.b).toBe(2);
            expect(instance.c).toBe(3);
        });
        it('should skip first n arguments', function () {
            function TestConstructor(a, b, c) {
                lodashExt_1.default.assignInjections(this, TestConstructor, arguments, 2);
            }
            TestConstructor.$inject = ['a', 'b', 'c'];
            var instance = new TestConstructor(1, 2, 3);
            expect(instance.a).toBeUndefined();
            expect(instance.b).toBeUndefined();
            expect(instance.c).toBe(3);
        });
        it('should not fail if no $inject', function () {
            function TestConstructor(a, b, c) {
                lodashExt_1.default.assignInjections(this, TestConstructor, arguments);
            }
            expect(function () {
                var instance = new TestConstructor(1, 2, 3);
                lodashExt_1.default.noop(instance);
            }).not.toThrow();
        });
    });
    describe('removeItem', function () {
        it('remove, if exists', function () {
            var list = [2, 3, 4];
            var result = lodashExt_1.default.removeItem(list, 4);
            expect(result).toBe(true);
            expect(list).toEqual([2, 3]);
        });
        it('skip remove, if no exists', function () {
            var list = [1, 2, 3];
            var result = lodashExt_1.default.removeItem(list, 4);
            expect(result).toBe(false);
            expect(list).toEqual([1, 2, 3]);
        });
        it('should work with objects', function () {
            var obj1 = { x: 12 };
            var obj2 = { x: 3 };
            var obj3 = { x: 4 };
            var list = [obj1, obj2];
            var result = lodashExt_1.default.removeItem(list, obj2);
            expect(result).toBe(true);
            expect(list).toEqual([{ x: 12 }]);
            result = lodashExt_1.default.removeItem(list, obj3);
            expect(result).toBe(false);
            expect(list).toEqual([{ x: 12 }]);
        });
    });
    it('removeItems should remove existing items', function () {
        spyOn(lodashExt_1.default, 'removeItem');
        var list = [1, 2, 3, 4, 5];
        lodashExt_1.default.removeItems(list, [3, 4, 6]);
        expect(list).toEqual([1, 2, 5]);
    });
    it('addItems should add event duplicates', function () {
        var list = [1, 2, 3, 4, 5];
        lodashExt_1.default.addItems(list, [4, 5, 6]);
        expect(list).toEqual([1, 2, 3, 4, 5, 4, 5, 6]);
    });
    it('isValuable', function () {
        var t = lodashExt_1.default.isValuable;
        expect(t('any')).toBe(true);
        expect(t({})).toBe(true);
        expect(t(0)).toBe(true);
        expect(t(12)).toBe(true);
        expect(t(true)).toBe(true);
        expect(t(false)).toBe(true);
        expect(t('')).toBe(false);
        expect(t(null)).toBe(false);
        expect(t(undefined)).toBe(false);
    });
    describe('inherit', function () {
        function ClassA() {
        }
        ClassA.prototype = {
            x: 1,
            w: 4
        };
        var ClassB = function () {
            ClassA.call(this);
            this.y = 2;
        };
        lodashExt_1.default.inherit(ClassB, ClassA, {
            z: 3,
            w: 5
        });
        var ClassC = function () {
            ClassB.call(this);
        };
        lodashExt_1.default.inherit(ClassC, ClassB, {
            w: 2
        });
        var b = new ClassB();
        it('inherit all properties', function () {
            expect(b.x).toBe(1);
            expect(b.y).toBe(2);
            expect(b.z).toBe(3);
            expect(b.w).toBe(5);
        });
        it('is instance of parent', function () {
            expect(b instanceof ClassA).toBe(true);
        });
        it('can two level inherit', function () {
            var c = new ClassC();
            expect(c instanceof ClassA).toBe(true);
            expect(c instanceof ClassB).toBe(true);
            expect(c.w).not.toBe(b.w);
            expect(c.w).toBe(2);
            expect(c.z).toBe(b.z);
        });
    });
    describe('clearDefaults method', function () {
        it('clear equal fields', function () {
            expect(lodashExt_1.default.clearDefaults({ x: 1, y: 2 }, { x: 1 }))
                .toEqual({ y: 2 });
        });
        it('can accept null in defaults', function () {
            expect(lodashExt_1.default.clearDefaults({ x: 1, y: 2 }))
                .toEqual({ x: 1, y: 2 });
        });
        it('clear system fields', function () {
            expect(lodashExt_1.default.clearDefaults({ $xx: 1, _zz: 3, y: 2 }))
                .toEqual({ y: 2 });
        });
        it('clear empty fields', function () {
            expect(lodashExt_1.default.clearDefaults({ x: null, y: undefined, z: '', w: 2 }))
                .toEqual({ w: 2 });
        });
        it('not clear boolean fields', function () {
            expect(lodashExt_1.default.clearDefaults({ x: true, y: false }))
                .toEqual({ x: true, y: false });
        });
    });
    describe('hasValues method', function () {
        it('should return false for non-objects', function () {
            expect(lodashExt_1.default.hasValues(0)).toBe(false);
            expect(lodashExt_1.default.hasValues(1)).toBe(false);
            expect(lodashExt_1.default.hasValues(null)).toBe(false);
            expect(lodashExt_1.default.hasValues(false)).toBe(false);
            expect(lodashExt_1.default.hasValues('test')).toBe(false);
        });
        it('should return true for plain object with values', function () {
            expect(lodashExt_1.default.hasValues({ x: 0 })).toBe(true);
            expect(lodashExt_1.default.hasValues({ x: 1 })).toBe(true);
            expect(lodashExt_1.default.hasValues({ x: '' })).toBe(true);
            expect(lodashExt_1.default.hasValues({ x: '', y: null })).toBe(true);
        });
        it('should return false for plain objects without values', function () {
            expect(lodashExt_1.default.hasValues({ x: null })).toBe(false);
            expect(lodashExt_1.default.hasValues({ x: null, y: null })).toBe(false);
            expect(lodashExt_1.default.hasValues({ x: undefined })).toBe(false);
        });
        it('should return true when nested object has values', function () {
            expect(lodashExt_1.default.hasValues({ x: { y: 2 } })).toBe(true);
        });
        it('should return false when nested object doesn`t have value', function () {
            expect(lodashExt_1.default.hasValues({})).toBe(false);
            expect(lodashExt_1.default.hasValues({ x: {} })).toBe(false);
            expect(lodashExt_1.default.hasValues({ x: { y: null } })).toBe(false);
        });
        it('should throw exception when nested object has circular references', function () {
            var obj1 = {};
            obj1.x = { y: obj1 };
            expect(function () {
                lodashExt_1.default.hasValues(obj1);
            }).toThrow('Recursion!');
        });
        it('shouldn`t throw exception when used same object as sibling values', function () {
            var obj = { x: 1 };
            var testObj = {
                y: obj,
                z: obj
            };
            expect(function () {
                lodashExt_1.default.hasValues(testObj);
            }).not.toThrow();
        });
    });
    describe('emTrunc method', function () {
        it('keep unchanged if short', function () {
            expect(lodashExt_1.default.emTrunc('very short line', 20)).toBe('very short line');
        });
        it('emTrunc long', function () {
            expect(lodashExt_1.default.emTrunc('123456789', 5)).toBe('12345…');
        });
        it('prevent emTrunc if tail to short', function () {
            expect(lodashExt_1.default.emTrunc('123456789', 8)).toBe('123456789');
        });
        it('don`t throw exception, if no value', function () {
            expect(function () {
                lodashExt_1.default.emTrunc(null, 30);
                lodashExt_1.default.emTrunc(undefined, 30);
                lodashExt_1.default.emTrunc(0, 30);
            }).not.toThrow();
        });
        it('keep words if need', function () {
            expect(lodashExt_1.default.emTrunc('прошло немного времени, прежде чем тесты стали полезными', 20, true))
                .toBe('прошло немного…');
            expect(lodashExt_1.default.emTrunc('прошло немного времени, прежде чем тесты стали полезными', 25, true))
                .toBe('прошло немного времени,…');
        });
    });
    it('renameField', function () {
        var obj = {
            noChange: true,
            x: 1,
            y: 2,
            x_y: 3,
            XY: 45
        };
        lodashExt_1.default.renameFields(obj, {
            x: 'a',
            y: 'b',
            x_y: 'a_b',
            XY: 'AB'
        });
        expect(obj).toEqual({
            noChange: true,
            a: 1,
            b: 2,
            a_b: 3,
            AB: 45
        });
        expect(lodashExt_1.default.renameFields('not object', {})).toBe('not object');
    });
    it('pythonizeObject method', function () {
        var testObj = {
            test: 1,
            testArray: [
                {
                    id: 1,
                    isActive: true
                }
            ],
            testMethod: lodashExt_1.default.noop,
            testObject: {
                id: 3,
                userName: 'tema',
                isActive: false
            },
            start_date: ''
        };
        var result = lodashExt_1.default.pythonizeObject(testObj);
        expect(result).toBe(testObj); // same object
        expect(result).toEqual({
            test: 1,
            test_array: [
                {
                    id: 1,
                    is_active: true
                }
            ],
            test_method: lodashExt_1.default.noop,
            test_object: {
                id: 3,
                user_name: 'tema',
                is_active: false
            },
            start_date: ''
        });
    });
    it('camelizeObject method', function () {
        var testObj = {
            test: 1,
            test_array: [
                {
                    id: 1,
                    is_active: true
                }
            ],
            test_method: lodashExt_1.default.noop,
            test_object: {
                id: 3,
                user_name: 'tema',
                is_active: false
            },
            startDate: ''
        };
        var result = lodashExt_1.default.camelizeObject(testObj);
        expect(result).toBe(testObj); // same object
        expect(result).toEqual({
            test: 1,
            testArray: [
                {
                    id: 1,
                    isActive: true
                }
            ],
            testMethod: lodashExt_1.default.noop,
            testObject: {
                id: 3,
                userName: 'tema',
                isActive: false
            },
            startDate: ''
        });
    });
    it('isDefined method', function () {
        expect(lodashExt_1.default.isDefined(undefined)).toBe(false);
        expect(lodashExt_1.default.isDefined(null)).toBe(true);
        expect(lodashExt_1.default.isDefined(0)).toBe(true);
        expect(lodashExt_1.default.isDefined({})).toBe(true);
        expect(lodashExt_1.default.isDefined('')).toBe(true);
        expect(lodashExt_1.default.isDefined([])).toBe(true);
        expect(lodashExt_1.default.isDefined(new Date())).toBe(true);
    });
    it('limitTo method', function () {
        expect(lodashExt_1.default.limitTo(100, 50, 1000)).toBe(100);
        expect(lodashExt_1.default.limitTo(100, 200, 1000)).toBe(200);
        expect(lodashExt_1.default.limitTo(100, 50, 90)).toBe(90);
        expect(lodashExt_1.default.limitTo(null, 10, 100)).toBe(10);
    });
    xdescribe('bindDomEventToScope', function () {
        beforeEach(angular.mock.module('ng'));
        var scope;
        var el;
        var fakeAction;
        beforeEach(inject(function ($rootScope) {
            scope = $rootScope.$new();
            el = $('<button></button>');
            fakeAction = jasmine.createSpy('action');
            lodashExt_1.default.bindDomEventToScope(scope, el, 'click', function () {
                fakeAction();
            });
        }));
        it('should call handler on event', function () {
            el.triggerHandler('click');
            expect(fakeAction).toHaveBeenCalled();
        });
        it('should not call handler after scope destroy', function () {
            scope.$destroy();
            el.triggerHandler('click');
            expect(fakeAction).not.toHaveBeenCalled();
        });
    });
    it('getCharFromKeypress method', function () {
        // IE
        expect(lodashExt_1.default.getCharFromKeypress({ which: null, keyCode: 70 })).toBe('F');
        expect(lodashExt_1.default.getCharFromKeypress({ which: null, keyCode: 10 })).toBe(null);
        // browsers
        expect(lodashExt_1.default.getCharFromKeypress({ which: 70, charCode: 70 })).toBe('F');
        expect(lodashExt_1.default.getCharFromKeypress({ which: 10, charCode: 10 })).toBe(null);
        expect(lodashExt_1.default.getCharFromKeypress({ which: 70, charCode: 0 })).toBe(null);
    });
    it('omitPrivateFields method', function () {
        expect(lodashExt_1.default.omitPrivateFields({ x: 1, $y: 3 })).toEqual({ x: 1 });
        expect(lodashExt_1.default.omitPrivateFields({ x: 1, y: { a: 3, $z: 3 } })).toEqual({ x: 1, y: { a: 3 } });
        expect(lodashExt_1.default.omitPrivateFields({ x: 1, _y: 3 })).toEqual({ x: 1 });
        expect(lodashExt_1.default.omitPrivateFields({ x: 1, y: { a: 3, _z: 3 } })).toEqual({ x: 1, y: { a: 3 } });
        expect(lodashExt_1.default.omitPrivateFields([{ x: 3, Zy: 22 }], ['Z'])).toEqual([{ x: 3 }]);
        expect(lodashExt_1.default.omitPrivateFields([])).toEqual([]);
        expect(lodashExt_1.default.omitPrivateFields([{ x: 3, $y: 22 }])).toEqual([{ x: 3 }]);
        expect(lodashExt_1.default.omitPrivateFields('sfsfsdf')).toEqual('sfsfsdf');
        expect(lodashExt_1.default.omitPrivateFields(null)).toEqual(null);
        var date = new Date();
        expect(lodashExt_1.default.omitPrivateFields(date)).toEqual(date);
        expect(lodashExt_1.default.omitPrivateFields({ x: date })).toEqual({ x: date });
        expect(lodashExt_1.default.omitPrivateFields([date, 12])).toEqual([date, 12]);
    });
    it('_.words should support cyrillic', function () {
        expect(lodashExt_1.default.words('приветМир')).toEqual(['привет', 'Мир']);
    });
});
