"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
(0, index_1.runTests)(class {
    "assert should assert correctly"() {
        const isTrue = true;
        (0, index_1.assert)(isTrue, "isTrue should be true");
    }
    "assertEq should assert correctly"() {
        (0, index_1.assertEq)(10, 10);
        (0, index_1.assertEq)("10", "10");
        (0, index_1.assertEq)(true, true);
        (0, index_1.assertEq)(NaN, NaN);
        (0, index_1.assertEq)(0, 0);
        const sameSymbol = Symbol();
        (0, index_1.assertEq)(sameSymbol, sameSymbol);
    }
    "assertNeq should assert correctly"() {
        (0, index_1.assertNeq)(10, 12);
        (0, index_1.assertNeq)(10, "10");
        (0, index_1.assertNeq)(true, false);
        (0, index_1.assertNeq)(NaN, 1);
        (0, index_1.assertNeq)(+0, -0);
        (0, index_1.assertNeq)(Symbol(), Symbol());
    }
    "assertDeepEq should assert correctly"() {
        const shared = { something: 10 };
        const first = { inner: { shared } };
        const second = { inner: { shared } };
        (0, index_1.assertDeepEq)(first, second);
        // @ts-ignore
        first.inner.cycle = first;
        // @ts-ignore
        second.inner.cycle = second;
        (0, index_1.assertDeepEq)(first, second);
    }
    "assertDeepNeq should assert correctly"() {
        const shared = { something: 10 };
        const first = { inner: { shared, difference: 20 } };
        const second = { inner: { shared } };
        (0, index_1.assertDeepNeq)(first, second);
        // @ts-ignore
        shared.cycle = shared;
        (0, index_1.assertDeepNeq)(first, second);
    }
});
