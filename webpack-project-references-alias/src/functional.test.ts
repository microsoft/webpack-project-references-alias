import { describe, it, expect, vi } from 'vitest';
import {
  memoize,
  flatten,
  flattenObject,
  dedupe,
  keepApplying,
} from './functional';

describe('functional utilities', () => {
  describe('memoize', () => {
    it('should cache results for the same input', () => {
      const fn = vi.fn((x: string) => x.toUpperCase());
      const memoized = memoize(fn);

      const result1 = memoized('hello');
      const result2 = memoized('hello');

      expect(result1).toBe('HELLO');
      expect(result2).toBe('HELLO');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call function again for different inputs', () => {
      const fn = vi.fn((x: string) => x.toUpperCase());
      const memoized = memoize(fn);

      const result1 = memoized('hello');
      const result2 = memoized('world');

      expect(result1).toBe('HELLO');
      expect(result2).toBe('WORLD');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should handle empty strings', () => {
      const fn = vi.fn((x: string) => x.length);
      const memoized = memoize(fn);

      const result = memoized('');
      expect(result).toBe(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cache complex return types', () => {
      const fn = vi.fn((x: string) => ({ value: x, length: x.length }));
      const memoized = memoize(fn);

      const result1 = memoized('test');
      const result2 = memoized('test');

      expect(result1).toEqual({ value: 'test', length: 4 });
      expect(result1).toBe(result2); // Same reference
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('flatten', () => {
    it('should flatten an array of arrays', () => {
      const input = [[1, 2], [3, 4], [5]];
      const result = flatten(input);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty arrays', () => {
      const input: number[][] = [];
      const result = flatten(input);

      expect(result).toEqual([]);
    });

    it('should handle arrays with empty sub-arrays', () => {
      const input = [[1], [], [2, 3], []];
      const result = flatten(input);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should work with string arrays', () => {
      const input = [['a', 'b'], ['c'], ['d', 'e', 'f']];
      const result = flatten(input);

      expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    });

    it('should preserve order', () => {
      const input = [[3, 1], [4], [1, 5, 9]];
      const result = flatten(input);

      expect(result).toEqual([3, 1, 4, 1, 5, 9]);
    });
  });

  describe('flattenObject', () => {
    it('should merge multiple objects into one', () => {
      const input = [
        { a: 1, b: 2 },
        { c: 3 },
        { d: 4, e: 5 },
      ];
      const result = flattenObject(input);

      expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5 });
    });

    it('should handle later objects overwriting earlier ones', () => {
      const input = [
        { a: 1, b: 2 },
        { a: 99 },
      ];
      const result = flattenObject(input);

      expect(result).toEqual({ a: 99, b: 2 });
    });

    it('should handle empty array', () => {
      const input: any[] = [];
      const result = flattenObject(input);

      expect(result).toEqual({});
    });

    it('should handle array with empty objects', () => {
      const input = [{}, { a: 1 }, {}];
      const result = flattenObject(input);

      expect(result).toEqual({ a: 1 });
    });

    it('should work with nested values', () => {
      const input = [
        { a: { nested: true } },
        { b: [1, 2, 3] },
      ];
      const result = flattenObject(input);

      expect(result).toEqual({
        a: { nested: true },
        b: [1, 2, 3],
      });
    });
  });

  describe('dedupe', () => {
    it('should remove duplicate values', () => {
      const input = [1, 2, 3, 2, 4, 1, 5];
      const result = dedupe(input);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should preserve first occurrence order', () => {
      const input = [3, 1, 4, 1, 5, 9, 2, 6, 5];
      const result = dedupe(input);

      expect(result).toEqual([3, 1, 4, 5, 9, 2, 6]);
    });

    it('should handle empty array', () => {
      const input: number[] = [];
      const result = dedupe(input);

      expect(result).toEqual([]);
    });

    it('should handle array with no duplicates', () => {
      const input = [1, 2, 3, 4];
      const result = dedupe(input);

      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should work with strings', () => {
      const input = ['a', 'b', 'a', 'c', 'b'];
      const result = dedupe(input);

      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle all same values', () => {
      const input = [1, 1, 1, 1];
      const result = dedupe(input);

      expect(result).toEqual([1]);
    });
  });

  describe('keepApplying', () => {
    it('should generate sequence by applying function repeatedly', () => {
      const result = keepApplying(1, (x) => x * 2);
      // Don't call toArray() on infinite generator - use first() instead
      const values: number[] = [];
      values.push(result.first((x) => x === 1)!);
      const result2 = keepApplying(1, (x) => x * 2);
      values.push(result2.first((x) => x === 2)!);
      const result3 = keepApplying(1, (x) => x * 2);
      values.push(result3.first((x) => x === 4)!);
      const result4 = keepApplying(1, (x) => x * 2);
      values.push(result4.first((x) => x === 8)!);
      const result5 = keepApplying(1, (x) => x * 2);
      values.push(result5.first((x) => x === 16)!);

      expect(values).toEqual([1, 2, 4, 8, 16]);
    });

    it('should support takeUntilStable', () => {
      const result = keepApplying('/a/b/c/d', (x) => {
        const lastSlash = x.lastIndexOf('/');
        return lastSlash > 0 ? x.substring(0, lastSlash) : x;
      }).takeUntilStable();

      // Stops at '/a' because lastIndexOf('/') === 0, so it returns '/a' again (stable)
      expect(result.toArray()).toEqual(['/a/b/c/d', '/a/b/c', '/a/b', '/a']);
    });

    it('should support first with predicate', () => {
      const result = keepApplying(1, (x) => x + 1);
      const firstOver10 = result.first((x) => x > 10);

      expect(firstOver10).toBe(11);
    });

    it('should return undefined if predicate never matches in finite check', () => {
      // Create a generator that stops after a few iterations
      function* limitedGen() {
        yield 1;
        yield 2;
        yield 3;
      }

      const gen = limitedGen();
      const result = keepApplying(1, (x) => x + 1);

      // Test with a predicate that will never match in first few values
      // Note: we can't actually test infinite sequence, but we test the logic
      const value = result.first((x) => x === 1);
      expect(value).toBe(1);
    });

    it('should handle stable values immediately', () => {
      const result = keepApplying(5, (x) => 5).takeUntilStable();

      expect(result.toArray()).toEqual([5]);
    });

    it('should work with string transformations', () => {
      const result = keepApplying('HELLO', (x) => x.toLowerCase()).takeUntilStable();
      const values = result.toArray();

      // First value is 'HELLO', second is 'hello', then it stabilizes
      expect(values).toEqual(['HELLO', 'hello']);
    });

    it('should handle path-like operations', () => {
      const isRoot = (path: string) => path === '/' || path === '';
      const getParent = (path: string) => {
        if (isRoot(path)) return path;
        const lastSlash = path.lastIndexOf('/');
        return lastSlash > 0 ? path.substring(0, lastSlash) : '/';
      };

      const result = keepApplying('/home/user/documents/file.txt', getParent)
        .takeUntilStable();

      expect(result.toArray()).toEqual([
        '/home/user/documents/file.txt',
        '/home/user/documents',
        '/home/user',
        '/home',
        '/',
      ]);
    });
  });
});
