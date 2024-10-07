interface TestClass {
    new (): any;
}
type primitive = number | string | boolean | bigint | symbol;
export declare function assert(condition: boolean, message?: string): void;
export declare function assertEq(left: primitive, right: primitive, message?: string): void;
export declare function assertNeq(left: primitive, right: primitive, message?: string): void;
export declare function assertDeepEq(left: any, right: any, message?: string): void;
export declare function assertDeepNeq(left: any, right: any, message?: string): void;
export declare function runTests(...TestObjects: TestClass[]): Promise<void>;
export {};
