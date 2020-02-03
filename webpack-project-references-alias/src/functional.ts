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
