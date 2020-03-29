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

function areDeepEq(left: any, right: any): boolean {
    const seenObjects = new WeakSet<object>();
    const toProcess = [[left, right]];

    while (toProcess.length > 0) {
        const [left, right] = toProcess.pop()!;

        const leftIsObejct = typeof left === "object" && left !== null;
        const rightIsObject = typeof right === "object" && right !== null;
        const bothAreObjects = leftIsObejct && rightIsObject;
        const bothAreTheSame = Object.is(left, right);

        if (!bothAreTheSame) {
            if (bothAreObjects) {
                const seenLeft = seenObjects.has(left);
                const seenRight = seenObjects.has(right);

                // If we've seen them before, then we've already queued up their properties.
                if (seenLeft && seenRight) {
                    continue;
                }

                for (const key of Object.keys(left)) {
                    const newLeft = left[key];
                    const newRight = right[key];
                    toProcess.push([newLeft, newRight]);
                }

                seenObjects.add(left);
                seenObjects.add(right);
            } else {
                return false;
            }
        }
    }

    return true;
}

export function assertDeepEq(left: any, right: any): void {
    if (!areDeepEq(left, right)) {
        throw new Error(`expected ${left.toString()} to equal ${right.toString()}`);
    }
}

export function assertDeepNeq(left: any, right: any): void {
    if (areDeepEq(left, right)) {
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
        const prototype = Reflect.getPrototypeOf(test);
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
