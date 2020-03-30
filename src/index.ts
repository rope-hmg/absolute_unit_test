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

function areDeepEq(startLeft: any, startRight: any): boolean {
    const seenObjects = new WeakSet<object>();
    const toProcess = [[startLeft, startRight]];

    while (toProcess.length > 0) {
        const [left, right] = toProcess.pop()!;

        const bothAreTheSame = Object.is(left, right);

        if (!bothAreTheSame) {
            // If they're not both the same, then we need to check that they're both objects because two different
            // objects with identical properties don't compare as equal (They're references to different memory).
            const leftIsObejct = typeof left === "object" && left !== null;
            const rightIsObject = typeof right === "object" && right !== null;
            const bothAreObjects = leftIsObejct && rightIsObject;

            if (bothAreObjects) {
                // If they're both objects, then we need to check if we've seen them before.
                const seenLeft = seenObjects.has(left);
                const seenRight = seenObjects.has(right);

                if (seenLeft && seenRight) {
                    // If we've seen them before, then we've already queued up their properties.
                    continue;
                } else if (seenLeft || seenRight) {
                    // If we've seen one, but not the other then these objects are different.
                    return false;
                } else {
                    // If we haven't seen either of them before, then we should queue up their
                    // properties and mark them as seen.
                    for (const key of Object.keys(left)) {
                        const newLeft = left[key];
                        const newRight = right[key];
                        toProcess.push([newLeft, newRight]);
                    }

                    seenObjects.add(left);
                    seenObjects.add(right);
                }
            } else {
                // If they're not the same and they're not objects, then startLeft and startRight are different.
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
