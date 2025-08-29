import * as route from "@/app/api/schools/route";
import { db } from "@/lib/db";
import * as tokens from "@/lib/tokens";
import { mockAuth } from "./helpers";

jest.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: jest.fn() },
    school: { findMany: jest.fn(), create: jest.fn() },
  },
}));
jest.spyOn(tokens, "getUserIdFromToken").mockResolvedValue("user-1");

describe("/api/schools", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("refuse GET si non SUPER_ADMIN", async () => {
    (db.user.findUnique as any).mockResolvedValue({ role: "ADMIN" });
    const res = await route.GET(mockAuth());
    const body = await (res as any).json();
    expect((res as any).status).toBe(403);
    expect(body.error).toBeDefined();
  });

  it("liste les écoles si SUPER_ADMIN", async () => {
    (db.user.findUnique as any).mockResolvedValue({ role: "SUPER_ADMIN" });
    (db.school.findMany as any).mockResolvedValue([{ id: "s1", name: "A" }]);
    const res = await route.GET(mockAuth());
    const body = await (res as any).json();
    expect((res as any).status).toBe(200);
    expect(body.schools.length).toBe(1);
  });

  it("valide POST via Zod", async () => {
    (db.user.findUnique as any).mockResolvedValue({ role: "SUPER_ADMIN" });
    const badReq = new Request("http://x", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const resBad = await route.POST(badReq);
    expect((resBad as any).status).toBe(400);

    (db.school.create as any).mockResolvedValue({
      id: "s1",
      code: "ALP",
      name: "Alpha",
    });
    const goodReq = new Request("http://x", {
      method: "POST",
      body: JSON.stringify({ code: "ALP", name: "Alpha" }),
    });
    const res = await route.POST(goodReq);
    const body = await (res as any).json();
    expect((res as any).status).toBe(201);
    expect(body.school.code).toBe("ALP");
  });
});
