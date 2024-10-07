"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
index_1.runTests(class {
    "assert should assert correctly"() {
        const isTrue = true;
        index_1.assert(isTrue, "isTrue should be true");
    }
    "assertEq should assert correctly"() {
        index_1.assertEq(10, 10);
        index_1.assertEq("10", "10");
        index_1.assertEq(true, true);
        index_1.assertEq(NaN, NaN);
        index_1.assertEq(0, 0);
        const sameSymbol = Symbol();
        index_1.assertEq(sameSymbol, sameSymbol);
    }
    "assertNeq should assert correctly"() {
        index_1.assertNeq(10, 12);
        index_1.assertNeq(10, "10");
        index_1.assertNeq(true, false);
        index_1.assertNeq(NaN, 1);
        index_1.assertNeq(+0, -0);
        index_1.assertNeq(Symbol(), Symbol());
    }
    "assertDeepEq should assert correctly"() {
        const shared = { something: 10 };
        const first = { inner: { shared } };
        const second = { inner: { shared } };
        index_1.assertDeepEq(first, second);
        // @ts-ignore
        first.inner.cycle = first;
        // @ts-ignore
        second.inner.cycle = second;
        index_1.assertDeepEq(first, second);
    }
    "assertDeepNeq should assert correctly"() {
        const shared = { something: 10 };
        const first = { inner: { shared, difference: 20 } };
        const second = { inner: { shared } };
        index_1.assertDeepNeq(first, second);
        // @ts-ignore
        shared.cycle = shared;
        index_1.assertDeepNeq(first, second);
    }
});
