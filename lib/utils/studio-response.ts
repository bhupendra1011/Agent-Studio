/**
 * Normalizes Studio API responses: some routes return `{ code, data }`, mocks may return the payload directly.
 */
export function unwrapStudioData<T>(raw: unknown): T {
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    (raw as { code?: number }).code === 0
  ) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}
