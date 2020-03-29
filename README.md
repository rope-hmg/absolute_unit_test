# Absolute Unit Test

A minimal unit testing library

## Example

```javascript
import { runTests, assert, assertEq, assertNeq, assertDeepEq, assertDeepNeq } from "absolute_unit_test";

class AbsoluteUnitTests {
    "assert should assert correctly"() {
        const isTrue = true;
        assert(isTrue, "isTrue should be true");
    }

    "assertEq should assert correctly"() {
        assertEq(10, 10);
        assertEq("10", "10");
        assertEq(true, true);
        assertEq(NaN, NaN);
        assertEq(0, 0);
        const sameSymbol = Symbol();
        assertEq(sameSymbol, sameSymbol);
    }

    "assertNeq should assert correctly"() {
        assertNeq(10, 12);
        assertNeq(10, "10");
        assertNeq(true, false);
        assertNeq(NaN, 1);
        assertNeq(+0, -0);
        assertNeq(Symbol(), Symbol());
    }

    "assertDeepEq should assert correctly"() {
        const shared = { something: 10 };
        const first = { inner: { shared } };
        const second = { inner: { shared } };
        assertDeepEq(first, second);

        first.inner.cycle = first;
        second.inner.cycle = second;
        assertDeepEq(first, second);
    }

    "assertDeepNeq should assert correctly"() {
        const shared = { something: 10 };
        const first = { inner: { shared, difference: 20 } };
        const second = { inner: { shared } };
        assertDeepNeq(first, second);

        shared.cycle = shared;
        assertDeepNeq(first, second);
    }
}

runTests(AbsoluteUnitTests);
```

## Motivation

I was sick of huge bloated libraries for unit testing. Why do I need 3 or 4 different libraries just
to test some code. To get started with almost all other unit testing frameworks you have to install
the framework, a runner, an assertion library and probably some helpers/plugin libraries. I wanted
something minimal and unassuming.

You will lose a bit of portability, I have only written this library to work in modern node and
browser environments. It makes uses of `Object.is`, `Promise`, `WeakSet`, `for .. of` and `Reflect`.

## Tests

1. Define a class
2. Add some methods
3. `runTests(TestClass1, TestClass2, ...)`
4. Profit

How to organise multiple test classes is left as an exercise for the reader.

## Assertions

Anything that throws an exception can be used as an assert.

## Before/After

Nothing built-in, if you want to run some code before a test, just call a function.

## Equality

The default assertions use `Object.is` for equality testing, this is exactly the same as using `===`
except that `Object.is(NaN, NaN)` is true and `Object.is(+0, -0)` is false.

The deep equality assertions do not use a recursive algorithm. They maintain an internal stack, they
only process cycles once and they they skip shared references since they are always the same.
