export declare function flatten<T>(array: T[][]): T[];
export declare function flattenObject<T extends {
    [key: string]: any;
}>(array: T[]): T;
export declare function dedupe<T>(array: T[]): T[];
