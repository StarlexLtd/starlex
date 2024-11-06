// Assertions as outlined in
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0#Assert
// -----------------------------------------------------

// Assert that a value is truthy
function ok(val: unknown, msg: string) {
    if (!!!val) {
        fail(val, true, msg, "==");
    }
}

// Assert that two values are equal
function equal(actual: unknown, expected: unknown, msg: string) {
    /* jshint eqeqeq: false */
    if (actual != expected) {
        fail(actual, expected, msg, "==");
    }
};

// Assert that two values are not equal
function notEqual(actual: unknown, expected: unknown, msg: string) {
    /* jshint eqeqeq: false */
    if (actual == expected) {
        fail(actual, expected, msg, "!=");
    }
};

// Assert that two values are equal with strict comparison
function strictEqual(actual: unknown, expected: unknown, msg: string) {
    if (actual !== expected) {
        fail(actual, expected, msg, "===");
    }
};

// Assert that two values are not equal with strict comparison
function notStrictEqual(actual: unknown, expected: unknown, msg: string) {
    if (actual === expected) {
        fail(actual, expected, msg, "!==");
    }
};

// Assert that two values are deeply equal
function deepEqual(actual: unknown, expected: unknown, msg: string) {
    if (!_isDeepEqual(actual, expected)) {
        fail(actual, expected, msg, "deepEqual");
    }
};

// Assert that two values are not deeply equal
function notDeepEqual(actual: unknown, expected: unknown, msg: string) {
    if (_isDeepEqual(actual, expected)) {
        fail(actual, expected, msg, "!deepEqual");
    }
};

// Assert that a function throws an error
function throws(fn: Function, expected: any, msg: string) {
    if (!_functionThrows(fn, expected)) {
        fail(fn, expected, msg, "throws");
    }
};

// Additional assertions
// ---------------------

// Assert that a value is falsy
function notOk(val: unknown, msg: string) {
    if (!!val) {
        fail(val, true, msg, "!=");
    }
};

// Assert that a function does not throw an error
function doesNotThrow(fn: Function, expected: any, msg: string) {
    if (_functionThrows(fn, expected)) {
        fail(fn, expected, msg, "!throws");
    }
};

// Assert that a value is a specific type
function isTypeOf(val: unknown, type: unknown, msg: string) {
    strictEqual(typeof val, type, msg);
};

// Assert that a value is not a specific type
function isNotTypeOf(val: unknown, type: unknown, msg: string) {
    notStrictEqual(typeof val, type, msg);
};

// Assert that a value is an instance of a constructor
function isInstanceOf(val: unknown, constructor: any, msg: string) {
    if (!(val instanceof constructor)) {
        fail(val, constructor, msg, "instanceof");
    }
};

// Assert that a value not an instance of a constructor
function isNotInstanceOf(val: unknown, constructor: any, msg: string) {
    if (val instanceof constructor) {
        fail(val, constructor, msg, "!instanceof");
    }
};

// Assert that a value is an array
function isArray(val: unknown, msg: string) {
    if (!_isArray(val)) {
        fail(typeof val, "array", msg, "===");
    }
};

// Assert that a value is not an array
function isNotArray(val: unknown, msg: string) {
    if (_isArray(val)) {
        fail(typeof val, "array", msg, "!==");
    }
};

// Assert that a value is a boolean
function isBoolean(val: unknown, msg: string) {
    isTypeOf(val, "boolean", msg);
};

// Assert that a value is not a boolean
function isNotBoolean(val: unknown, msg: string) {
    isNotTypeOf(val, "boolean", msg);
};

// Assert that a value is true
function isTrue(val: unknown, msg: string) {
    strictEqual(val, true, msg);
};

// Assert that a value is false
function isFalse(val: unknown, msg: string) {
    strictEqual(val, false, msg);
};

// Assert that a value is a function
function isFunction(val: unknown, msg: string) {
    isTypeOf(val, "function", msg);
};

// Assert that a value is not a function
function isNotFunction(val: unknown, msg: string) {
    isNotTypeOf(val, "function", msg);
};

// Assert that a value is null
function isNull(val: unknown, msg: string) {
    strictEqual(val, null, msg);
};

// Assert that a value is not null
function isNotNull(val: unknown, msg: string) {
    notStrictEqual(val, null, msg);
};

// Assert that a value is a number
function isNumber(val: unknown, msg: string) {
    isTypeOf(val, "number", msg);
};

// Assert that a value is not a number
function isNotNumber(val: unknown, msg: string) {
    isNotTypeOf(val, "number", msg);
};

// Assert that a value is an object
function isObject(val: unknown, msg: string) {
    isTypeOf(val, "object", msg);
};

// Assert that a value is not an object
function isNotObject(val: unknown, msg: string) {
    isNotTypeOf(val, "object", msg);
};

// Assert that a value is a string
function isString(val: unknown, msg: string) {
    isTypeOf(val, "string", msg);
};

// Assert that a value is not a string
function isNotString(val: unknown, msg: string) {
    isNotTypeOf(val, "string", msg);
};

// Assert that a value is undefined
function isUndefined(val: unknown, msg: string) {
    isTypeOf(val, "undefined", msg);
};

// Assert that a value is defined
function isDefined(val: unknown, msg: string) {
    isNotTypeOf(val, "undefined", msg);
};

// Assert that a value matches a regular expression
function match(actual: string, expected: RegExp, msg: string) {
    if (!expected.test(actual)) {
        fail(actual, expected, msg, "match");
    }
};

// Assert that a value does not match a regular expression
function notMatch(actual: string, expected: RegExp, msg: string) {
    if (expected.test(actual)) {
        fail(actual, expected, msg, "!match");
    }
};

// Assert that an object includes something
function includes(haystack: any, needle: any, msg: string) {
    if (!_includes(haystack, needle)) {
        fail(haystack, needle, msg, "include");
    }
};

// Assert that an object does not include something
function doesNotInclude(haystack: any, needle: any, msg: string) {
    if (_includes(haystack, needle)) {
        fail(haystack, needle, msg, "!include");
    }
};

// Assert that an object (Array, String, etc.) has the expected length
function lengthEquals(obj: ArrayLike<any>, expected: number, msg: string) {
    if (_isUndefinedOrNull(obj)) {
        return fail(void 0, expected, msg, "length");
    }
    if (obj.length !== expected) {
        fail(obj.length, expected, msg, "length");
    }
};

// Assert that a value is less than another value
function lessThan(actual: any, expected: any, msg: string) {
    if (actual >= expected) {
        fail(actual, expected, msg, "<");
    }
};

// Assert that a value is less than or equal to another value
function lessThanOrEqual(actual: any, expected: any, msg: string) {
    if (actual > expected) {
        fail(actual, expected, msg, "<=");
    }
};

// Assert that a value is greater than another value
function greaterThan(actual: any, expected: any, msg: string) {
    if (actual <= expected) {
        fail(actual, expected, msg, ">");
    }
};

// Assert that a value is greater than another value
function greaterThanOrEqual(actual: any, expected: any, msg: string) {
    if (actual < expected) {
        fail(actual, expected, msg, ">=");
    }
};

// Error handling
// --------------

// Assertion error class
class AssertionError extends Error {
    // private readonly name: string = "";
    private readonly actual?: unknown;
    private readonly expected?: unknown;
    private readonly operator?: string = "";
    // private readonly message?: string = "";

    constructor(opts?: {
        name?: string;
        actual?: unknown;
        expected?: unknown;
        operator?: string;
        message?: string;
        stackStartFunction?: Function;
    }) {
        super(opts?.message);
        opts = opts || {};
        this.name = "AssertionError";
        this.actual = opts.actual;
        this.expected = opts.expected;
        this.operator = opts.operator || "";
        // this.message = opts.message;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, opts.stackStartFunction || fail);
        }
    }

    public override toString() {
        if (this.message) {
            return this.name + ": " + this.message;
        } else {
            return this.name + ": " + this.actual + " " + this.operator + " " + this.expected;
        }
    }
}

// Fail a test
function fail(actual: unknown, expected: unknown, message: string, operator: string, stackStartFunction?: any) {
    throw new AssertionError({
        message: message,
        actual: actual,
        expected: expected,
        operator: operator,
        stackStartFunction: stackStartFunction,
    });
}

// Utilities
// ---------

// Utility for checking whether a value is undefined or null
function _isUndefinedOrNull(val: unknown) {
    return val === null || typeof val === "undefined";
}

// Utility for checking whether a value is an arguments object
function _isArgumentsObject(val: unknown) {
    return Object.prototype.toString.call(val) === "[object Arguments]";
}

// Utility for checking whether a value is plain object
function _isPlainObject(val: unknown) {
    return Object.prototype.toString.call(val) === "[object Object]";
}

// Utility for checking whether an object contains another object
function _includes(haystack: any, needle: any) {
    /* jshint maxdepth: 3*/
    var i;

    // Array#indexOf, but ie...
    if (_isArray(haystack)) {
        for (i = haystack.length - 1; i >= 0; i = i - 1) {
            if (haystack[i] === needle) {
                return true;
            }
        }
    }

    // String#indexOf
    if (typeof haystack === "string") {
        if (haystack.indexOf(needle) !== -1) {
            return true;
        }
    }

    // Object#hasOwnProperty
    if (_isPlainObject(haystack)) {
        if (haystack.hasOwnProperty(needle)) {
            return true;
        }
    }

    return false;
}

// Utility for checking whether a value is an array
var _isArray =
    Array.isArray ||
    function (val) {
        return Object.prototype.toString.call(val) === "[object Array]";
    };

// Utility for getting object keys
function _getObjectKeys(obj: any) {
    var key,
        keys = [];
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

// Utility for deep equality testing of objects
function _objectsEqual(obj1: any, obj2: any) {
    /* jshint eqeqeq: false */

    // Check for undefined or null
    if (_isUndefinedOrNull(obj1) || _isUndefinedOrNull(obj2)) {
        return false;
    }

    // Object prototypes must be the same
    if (obj1.prototype !== obj2.prototype) {
        return false;
    }

    // Handle argument objects
    if (_isArgumentsObject(obj1)) {
        if (!_isArgumentsObject(obj2)) {
            return false;
        }
        obj1 = Array.prototype.slice.call(obj1);
        obj2 = Array.prototype.slice.call(obj2);
    }

    // Check number of own properties
    var obj1Keys = _getObjectKeys(obj1);
    var obj2Keys = _getObjectKeys(obj2);
    if (obj1Keys.length !== obj2Keys.length) {
        return false;
    }

    obj1Keys.sort();
    obj2Keys.sort();

    // Cheap initial key test (see https://github.com/joyent/node/blob/master/lib/js)
    var key,
        i,
        len = obj1Keys.length;
    for (i = 0; i < len; i += 1) {
        if (obj1Keys[i] != obj2Keys[i]) {
            return false;
        }
    }

    // Expensive deep test
    for (i = 0; i < len; i += 1) {
        key = obj1Keys[i];
        if (!_isDeepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    // If it got this far...
    return true;
}

// Utility for deep equality testing
function _isDeepEqual(actual: any, expected: any) {
    /* jshint eqeqeq: false */
    if (actual === expected) {
        return true;
    }
    if (expected instanceof Date && actual instanceof Date) {
        return actual.getTime() === expected.getTime();
    }
    if (actual instanceof RegExp && expected instanceof RegExp) {
        return actual.source === expected.source && actual.global === expected.global && actual.multiline === expected.multiline && actual.lastIndex === expected.lastIndex && actual.ignoreCase === expected.ignoreCase;
    }
    if (typeof actual !== "object" && typeof expected !== "object") {
        return actual == expected;
    }
    return _objectsEqual(actual, expected);
}

// Utility for testing whether a function throws an error
function _functionThrows(fn: Function, expected: any) {
    // Try/catch
    var thrown = false;
    var thrownError;
    try {
        fn();
    } catch (err) {
        thrown = true;
        thrownError = err;
    }

    // Check error
    if (thrown && expected) {
        thrown = _errorMatches(thrownError, expected);
    }

    return thrown;
}

// Utility for checking whether an error matches a given constructor, regexp or string
function _errorMatches(actual: any, expected: any) {
    if (typeof expected === "string") {
        return actual.message === expected;
    }
    if (expected instanceof RegExp) {
        return expected.test(actual.message);
    }
    if (actual instanceof expected) {
        return true;
    }
    return false;
}

interface Assert {
    /**
     * Assert that a value is truthy.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is falsy.
     */
    ok(val: unknown, msg: string): void;

    /**
     * Assert that two values are equal (using ==).
     * @param actual The actual value.
     * @param expected The expected value.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the values are not equal.
     */
    equal(actual: unknown, expected: unknown, msg: string): void;

    /**
     * Assert that two values are not equal (using ==).
     * @param actual The actual value.
     * @param expected The expected value.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the values are equal.
     */
    notEqual(actual: unknown, expected: unknown, msg: string): void;

    /**
     * Assert that two values are strictly equal (using ===).
     * @param actual The actual value.
     * @param expected The expected value.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the values are not strictly equal.
     */
    strictEqual(actual: unknown, expected: unknown, msg: string): void;

    /**
     * Assert that two values are not strictly equal (using !==).
     * @param actual The actual value.
     * @param expected The expected value.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the values are strictly equal.
     */
    notStrictEqual(actual: unknown, expected: unknown, msg: string): void;

    /**
     * Assert that two values are deeply equal.
     * @param actual The actual value.
     * @param expected The expected value.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the values are not deeply equal.
     */
    deepEqual(actual: unknown, expected: unknown, msg: string): void;

    /**
     * Assert that two values are not deeply equal.
     * @param actual The actual value.
     * @param expected The expected value.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the values are deeply equal.
     */
    notDeepEqual(actual: unknown, expected: unknown, msg: string): void;

    /**
     * Assert that a function throws an error.
     * @param fn The function to execute.
     * @param expected The expected error or condition.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the function does not throw or throws an unexpected error.
     */
    throws(fn: Function, expected: any, msg: string): void;

    /**
     * Assert that a value is falsy.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is truthy.
     */
    notOk(val: unknown, msg: string): void;

    /**
     * Assert that a function does not throw an error.
     * @param fn The function to execute.
     * @param expected The expected result (optional).
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the function throws an error.
     */
    doesNotThrow(fn: Function, expected: any, msg: string): void;

    /**
     * Assert that a value is of a specific type.
     * @param val The value to check.
     * @param type The expected type (e.g., "string").
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not of the expected type.
     */
    isTypeOf(val: unknown, type: unknown, msg: string): void;

    /**
     * Assert that a value is not of a specific type.
     * @param val The value to check.
     * @param type The type to avoid (e.g., "string").
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is of the specified type.
     */
    isNotTypeOf(val: unknown, type: unknown, msg: string): void;

    /**
     * Assert that a value is an instance of a specific constructor.
     * @param val The value to check.
     * @param constructor The expected constructor.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not an instance of the constructor.
     */
    isInstanceOf(val: unknown, constructor: any, msg: string): void;

    /**
     * Assert that a value is not an instance of a specific constructor.
     * @param val The value to check.
     * @param constructor The constructor to avoid.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is an instance of the constructor.
     */
    isNotInstanceOf(val: unknown, constructor: any, msg: string): void;

    /**
     * Assert that a value is an array.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not an array.
     */
    isArray(val: unknown, msg: string): void;

    /**
     * Assert that a value is not an array.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is an array.
     */
    isNotArray(val: unknown, msg: string): void;

    /**
     * Assert that a value is a boolean.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not a boolean.
     */
    isBoolean(val: unknown, msg: string): void;

    /**
     * Assert that a value is not a boolean.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is a boolean.
     */
    isNotBoolean(val: unknown, msg: string): void;

    /**
     * Assert that a value is true.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not true.
     */
    isTrue(val: unknown, msg: string): void;

    /**
     * Assert that a value is false.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not false.
     */
    isFalse(val: unknown, msg: string): void;

    /**
     * Assert that a value is a function.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not a function.
     */
    isFunction(val: unknown, msg: string): void;

    /**
     * Assert that a value is not a function.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is a function.
     */
    isNotFunction(val: unknown, msg: string): void;

    /**
     * Assert that a value is null.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not null.
     */
    isNull(val: unknown, msg: string): void;

    /**
     * Assert that a value is not null.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is null.
     */
    isNotNull(val: unknown, msg: string): void;

    /**
     * Assert that a value is a number.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not a number.
     */
    isNumber(val: unknown, msg: string): void;

    /**
     * Assert that a value is not a number.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is a number.
     */
    isNotNumber(val: unknown, msg: string): void;

    /**
     * Assert that a value is an object.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not an object.
     */
    isObject(val: unknown, msg: string): void;

    /**
     * Assert that a value is not an object.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is an object.
     */
    isNotObject(val: unknown, msg: string): void;

    /**
     * Assert that a value is a string.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not a string.
     */
    isString(val: unknown, msg: string): void;

    /**
     * Assert that a value is not a string.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is a string.
     */
    isNotString(val: unknown, msg: string): void;

    /**
     * Assert that a value is undefined.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not undefined.
     */
    isUndefined(val: unknown, msg: string): void;

    /**
     * Assert that a value is defined.
     * @param val The value to check.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is undefined.
     */
    isDefined(val: unknown, msg: string): void;

    /**
     * Assert that a string matches a regular expression.
     * @param actual The string to test.
     * @param expected The regular expression to match.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the string does not match the regular expression.
     */
    match(actual: string, expected: RegExp, msg: string): void;

    /**
     * Assert that a string does not match a regular expression.
     * @param actual The string to test.
     * @param expected The regular expression to avoid.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the string matches the regular expression.
     */
    notMatch(actual: string, expected: RegExp, msg: string): void;

    /**
     * Assert that a collection includes a specific value.
     * @param haystack The collection to search.
     * @param needle The value to find.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is not found in the collection.
     */
    includes<T>(haystack: any, needle: any, msg: string): void;

    /**
     * Assert that a collection does not include a specific value.
     * @param haystack The collection to search.
     * @param needle The value to avoid.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the value is found in the collection.
     */
    doesNotInclude<T>(haystack: any, needle: any, msg: string): void;

    /**
     * Assert that the length of an object equals the expected value.
     * @param obj The object to test.
     * @param expected The expected length.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the object's length does not equal the expected value.
     */
    lengthEquals(obj: ArrayLike<any>, expected: number, msg: string): void;

    /**
     * Assert that a value is less than another.
     * @param actual The actual value.
     * @param expected The value to compare against.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the actual value is not less than the expected value.
     */
    lessThan(actual: any, expected: any, msg: string): void;

    /**
     * Assert that a value is less than or equal to another.
     * @param actual The actual value.
     * @param expected The value to compare against.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the actual value is greater than the expected value.
     */
    lessThanOrEqual(actual: any, expected: any, msg: string): void;

    /**
     * Assert that a value is greater than another.
     * @param actual The actual value.
     * @param expected The value to compare against.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the actual value is not greater than the expected value.
     */
    greaterThan(actual: any, expected: any, msg: string): void;

    /**
     * Assert that a value is greater than or equal to another.
     * @param actual The actual value.
     * @param expected The value to compare against.
     * @param msg The message to show if the assertion fails.
     * @throws {AssertionError} If the actual value is less than the expected value.
     */
    greaterThanOrEqual(actual: any, expected: any, msg: string): void;
}

export const assert: Assert = {
    ok,
    equal,
    notEqual,
    strictEqual,
    notStrictEqual,
    deepEqual,
    notDeepEqual,
    throws,
    notOk,
    doesNotThrow,
    isTypeOf,
    isNotTypeOf,
    isInstanceOf,
    isNotInstanceOf,
    isArray,
    isNotArray,
    isBoolean,
    isNotBoolean,
    isTrue,
    isFalse,
    isFunction,
    isNotFunction,
    isNull,
    isNotNull,
    isNumber,
    isNotNumber,
    isObject,
    isNotObject,
    isString,
    isNotString,
    isUndefined,
    isDefined,
    match,
    notMatch,
    includes,
    doesNotInclude,
    lengthEquals,
    lessThan,
    lessThanOrEqual,
    greaterThan,
    greaterThanOrEqual,
};
