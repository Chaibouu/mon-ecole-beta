import * as route from "@/app/api/student-grades/route";
import * as tokens from "@/lib/tokens";

jest.mock("@/lib/acl", () => ({
  requireSchoolRole: jest.fn().mockResolvedValue(true),
}));
jest.mock("@/lib/db", () => ({
  db: { studentGrade: { findMany: jest.fn(), create: jest.fn() } },
}));

import { db } from "@/lib/db";
import { requireSchoolRole } from "@/lib/acl";

jest.spyOn(tokens, "getUserIdFromToken").mockResolvedValue("user-1");

const req = (method: string, headers?: Record<string, string>, body?: any) =>
  new Request("http://x", {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  });

describe("/api/student-grades", () => {
  beforeEach(() => jest.resetAllMocks());

  it("GET 200", async () => {
    (db.studentGrade.findMany as any).mockResolvedValue([{ id: "g1" }]);
    const res = await route.GET(
      req("GET", { authorization: "Bearer t", "x-school-id": "s1" })
    );
    expect((res as any).status).toBe(200);
  });

  it("POST 400 invalide", async () => {
    const res = await route.POST(
      req("POST", { authorization: "Bearer t", "x-school-id": "s1" }, {})
    );
    expect((res as any).status).toBe(400);
  });

  it("POST 201 valide", async () => {
    (db.studentGrade.create as any).mockResolvedValue({ id: "g1" });
    const body = { assessmentId: "a1", studentId: "s1", score: 12 };
    const res = await route.POST(
      req("POST", { authorization: "Bearer t", "x-school-id": "s1" }, body)
    );
    expect((res as any).status).toBe(201);
  });

  it("403 si ACL refuse", async () => {
    (requireSchoolRole as any).mockResolvedValueOnce(false);
    const res = await route.GET(
      req("GET", { authorization: "Bearer t", "x-school-id": "s1" })
    );
    expect((res as any).status).toBe(403);
  });
});























