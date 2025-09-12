export function mockAuth(headers: Record<string, string> = {}) {
  return {
    headers: new Headers({
      authorization: "Bearer test-token",
      "x-school-id": "school-1",
      ...headers,
    }),
  } as unknown as Request;
}























