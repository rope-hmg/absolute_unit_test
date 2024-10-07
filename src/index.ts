import { equals } from "deep-cmp";

interface ReportCount {
    passed: number;
    failed: number;
}

interface TestClass {
    new (): any;
}

type primitive = number | string | boolean | bigint | symbol;

export function assert(condition: boolean, message?: string): void {
    if (!condition) {
        throw new Error(message ?? "Assertion failed!");
    }
}

export function assertEq(left: primitive, right: primitive, message?: string): void {
    if (!Object.is(left, right)) {
        throw build_error(left, right, false, message);
    }
}

export function assertNeq(left: primitive, right: primitive, message?: string): void {
    if (Object.is(left, right)) {
        throw build_error(left, right, true, message);
    }
}

export function assertDeepEq(left: any, right: any, message?: string): void {
    if (!equals(left, right)) {
        throw build_error(left, right, false, message);;
    }
}

export function assertDeepNeq(left: any, right: any, message?: string): void {
    if (equals(left, right)) {
        throw build_error(left, right, true, message);;
    }
}

function build_error(left: any, right: any, not: boolean, user_message?: string): Error {
    const  left_side = `Expected ${left.toString()}`;
    const right_side = `to equal ${right.toString()}`;

    return new Error(`${left_side}${not ? "not" : ""}${right_side}.${user_message ?? ""}`);
}

async function applyTest(report: ReportCount, test: TestClass, methodName: string): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(async () => {
            let status: string;
            let error:  Error | undefined;

            const method = (test as any)[methodName];

            try {
                await Reflect.apply(method, test, []);
                report.passed += 1;
                status = "Passed";
            } catch (e) {
                report.failed += 1;
                error  = e as Error;
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

export async function runTests(...TestObjects: TestClass[]): Promise<void> {
    const report: ReportCount = {
        passed: 0,
        failed: 0,
    };

    const tests: Promise<void>[] = [];

    for (const TestObject of TestObjects) {
        const test = Reflect.construct(TestObject, []);
        const prototype = Reflect.getPrototypeOf(test)!;
        const methods = Reflect.ownKeys(prototype);

        for (const method of methods) {
            if (typeof method !== "string") continue;
            if (typeof test[method] !== "function") continue;
            if (method === "constructor") continue;

            tests.push(applyTest(report, test, method));
        }
    }

    await Promise.all(tests);

    const { passed, failed } = report;
    console.log(`Passed ${passed}, Failed ${failed}\n`);
}
