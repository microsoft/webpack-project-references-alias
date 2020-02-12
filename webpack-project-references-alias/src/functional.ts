type FluentGenerator<T> = {
  toArray: () => T[];
  takeUntilStable: () => FluentGenerator<T>;
  first: (predicate: (value: T) => boolean) => T | undefined;
};

function convertToFluent<T>(
  gen: Generator<T, void, unknown>
): FluentGenerator<T> {
  return {
    toArray: () => Array.from(gen),
    takeUntilStable: () => convertToFluent(takeUntilStable(gen)),
    first: (predicate: (value: T) => boolean) => first(predicate, gen)
  };
}

export function memoize<T>(func: (input: string) => T): (input: string) => T {
  const cache: { [key: string]: T } = {};
  return (input: string) => {
    const cacheHit = cache[input];
    if (cacheHit) {
      return cacheHit;
    }
    const result = func(input);
    cache[input] = result;
    return result;
  };
}

function first<T>(
  predicate: (v: T) => boolean,
  gen: Generator<T, void, unknown>
): T | undefined {
  const next = gen.next();
  if (next.done === true) {
    return undefined;
  }
  if (predicate(next.value)) {
    return next.value;
  }
  return first(predicate, gen);
}

export function keepApplying<T>(
  initialValue: T,
  modifier: (v: T) => T
): FluentGenerator<T> {
  function* helper<T>(
    initialValue: T,
    modifier: (v: T) => T
  ): Generator<T, void, unknown> {
    yield initialValue;
    yield* helper(modifier(initialValue), modifier);
  }
  return convertToFluent(helper(initialValue, modifier));
}

function* takeUntilStable<T>(
  gen: Generator<T, void, unknown>
): Generator<T, void, unknown> {
  function* helper<T>(gen: Generator<T, void, unknown>, previousValue: T) {
    yield previousValue;
    const next = gen.next();
    if (!next.done && next.value !== previousValue) {
      yield* helper(gen, next.value);
    }
  }
  const next = gen.next();
  if (!next.done) {
    yield* helper(gen, next.value);
  }
}

export function flatten<T>(array: T[][]): T[] {
  return array.reduce((prev: T[], cur: T[]) => [...prev, ...cur], []);
}

export function flattenObject<T extends { [key: string]: any }>(array: T[]): T {
  return array.reduce((prev: T, cur: T) => ({ ...prev, ...cur }));
}

export function dedupe<T>(array: T[]): T[] {
  return array.filter(
    (value: T, index: number, array: T[]) => index === array.indexOf(value)
  );
}
