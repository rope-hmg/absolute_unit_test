"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = assert;
exports.assertEq = assertEq;
exports.assertNeq = assertNeq;
exports.assertDeepEq = assertDeepEq;
exports.assertDeepNeq = assertDeepNeq;
exports.runTests = runTests;
const deep_cmp_1 = require("deep-cmp");
function assert(condition, message) {
    if (!condition) {
        throw new Error(message ?? "Assertion failed!");
    }
}
function assertEq(left, right, message) {
    if (!Object.is(left, right)) {
        throw build_error(left, right, false, message);
    }
}
function assertNeq(left, right, message) {
    if (Object.is(left, right)) {
        throw build_error(left, right, true, message);
    }
}
function assertDeepEq(left, right, message) {
    if (!(0, deep_cmp_1.equals)(left, right)) {
        throw build_error(left, right, false, message);
        ;
    }
}
function assertDeepNeq(left, right, message) {
    if ((0, deep_cmp_1.equals)(left, right)) {
        throw build_error(left, right, true, message);
        ;
    }
}
function build_error(left, right, not, user_message) {
    const left_side = `Expected ${left.toString()}`;
    const right_side = `to equal ${right.toString()}`;
    return new Error(`${left_side}${not ? "not" : ""}${right_side}.${user_message ?? ""}`);
}
async function applyTest(report, test, methodName) {
    return new Promise((resolve) => {
        setTimeout(async () => {
            let status;
            let error;
            const method = test[methodName];
            try {
                await Reflect.apply(method, test, []);
                report.passed += 1;
                status = "Passed";
            }
            catch (e) {
                report.failed += 1;
                error = e;
                status = "Failed";
            }
            console.log(`${methodName}... ${status}`);
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
