export function staticify<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}
