import { equals } from "deep-cmp";

interface ReportCount {
    passed: number;
    failed: number;
}

interface TestClass {
    new (): any;
}

type primitive = number | string | boolean | bigint | symbol;

export function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

export function assertEq(left: primitive, right: primitive): void {
    if (!Object.is(left, right)) {
        throw new Error(`expected ${left.toString()} to equal ${right.toString()}`);
    }
}

export function assertNeq(left: primitive, right: primitive): void {
    if (Object.is(left, right)) {
        throw new Error(`expected ${left.toString()} not to equal ${right.toString()}`);
    }
}

export function assertDeepEq(left: any, right: any): void {
    if (!equals(left, right)) {
        throw new Error(`expected ${left.toString()} to equal ${right.toString()}`);
    }
}

export function assertDeepNeq(left: any, right: any): void {
    if (equals(left, right)) {
        throw new Error(`expected ${left.toString()} to equal ${right.toString()}`);
    }
}

async function applyTest(report: ReportCount, test: TestClass, methodName: string): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            let success: boolean;
            let error: Error | undefined;
            const method = (test as any)[methodName];

            try {
                Reflect.apply(method, test, []);
                report.passed += 1;
                success = true;
            } catch (e) {
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
