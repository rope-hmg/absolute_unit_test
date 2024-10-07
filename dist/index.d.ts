interface TestClass {
    new (): any;
}
declare type primitive = number | string | boolean | bigint | symbol;
export declare function assert(condition: boolean, message: string): void;
export declare function assertEq(left: primitive, right: primitive): void;
export declare function assertNeq(left: primitive, right: primitive): void;
export declare function assertDeepEq(left: any, right: any): void;
export declare function assertDeepNeq(left: any, right: any): void;
export declare function runTests(...TestObjects: TestClass[]): Promise<void>;
export {};
