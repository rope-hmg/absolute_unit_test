import { runTests, assert, assertEq, assertNeq, assertDeepEq, assertDeepNeq } from "./index";

runTests(
    class {
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

            // @ts-ignore
            first.inner.cycle = first;
            // @ts-ignore
            second.inner.cycle = second;
            assertDeepEq(first, second);
        }

        "assertDeepNeq should assert correctly"() {
            const shared = { something: 10 };
            const first = { inner: { shared, difference: 20 } };
            const second = { inner: { shared } };

            assertDeepNeq(first, second);

            // @ts-ignore
            shared.cycle = shared;
            assertDeepNeq(first, second);
        }
    },
);
