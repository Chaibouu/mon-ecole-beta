import * as route from "@/app/api/classrooms/route";
import { db } from "@/lib/db";
import * as tokens from "@/lib/tokens";

jest.mock("@/lib/db", () => ({
  db: { classroom: { findMany: jest.fn(), create: jest.fn() } },
}));
jest.spyOn(tokens, "getUserIdFromToken").mockResolvedValue("user-1");

const reqWith = (headers: Record<string, string>, body?: any) =>
  new Request("http://x", {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

describe("/api/classrooms", () => {
  it("GET nécessite x-school-id + ACL", async () => {
    const res = await route.GET(
      reqWith({ authorization: "Bearer t" } as any) as any
    );
    expect((res as any).status).toBe(401);
  });
});























