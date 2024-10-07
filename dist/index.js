"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = exports.assertDeepNeq = exports.assertDeepEq = exports.assertNeq = exports.assertEq = exports.assert = void 0;
const deep_cmp_1 = require("deep-cmp");
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
exports.assert = assert;
function assertEq(left, right) {
    if (!Object.is(left, right)) {
        throw new Error(`expected ${left.toString()} to equal ${right.toString()}`);
    }
}
exports.assertEq = assertEq;
function assertNeq(left, right) {
    if (Object.is(left, right)) {
        throw new Error(`expected ${left.toString()} not to equal ${right.toString()}`);
    }
}
exports.assertNeq = assertNeq;
function assertDeepEq(left, right) {
    if (!deep_cmp_1.equals(left, right)) {
        throw new Error(`expected ${left.toString()} to equal ${right.toString()}`);
    }
}
exports.assertDeepEq = assertDeepEq;
function assertDeepNeq(left, right) {
    if (deep_cmp_1.equals(left, right)) {
        throw new Error(`expected ${left.toString()} to equal ${right.toString()}`);
    }
}
exports.assertDeepNeq = assertDeepNeq;
async function applyTest(report, test, methodName) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let success;
            let error;
            const method = test[methodName];
            try {
                Reflect.apply(method, test, []);
                report.passed += 1;
                success = true;
            }
            catch (e) {
                report.failed += 1;
                error = e;
                success = false;
            }
            const reportMessage = success ? "Passed" : "Failed";
            console.log(`${methodName}... ${reportMessage}`);
            if (error) {
                console.log("\n", error.stack, "\n");
            }
            resolve();
        });
    });
}
async function runTests(...TestObjects) {
    const report = {
        passed: 0,
        failed: 0,
    };
    const tests = [];
    for (const TestObject of TestObjects) {
        const test = Reflect.construct(TestObject, []);
        const prototype = Reflect.getPrototypeOf(test);
        const methods = Reflect.ownKeys(prototype);
        for (const method of methods) {
            if (typeof method !== "string")
                continue;
            if (typeof test[method] !== "function")
                continue;
            if (method === "constructor")
                continue;
            tests.push(applyTest(report, test, method));
        }
    }
    await Promise.all(tests);
    const { passed, failed } = report;
    console.log(`Passed ${passed}, Failed ${failed}\n`);
}
exports.runTests = runTests;
