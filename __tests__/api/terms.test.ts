import * as route from "@/app/api/terms/route";
import { db } from "@/lib/db";
import * as tokens from "@/lib/tokens";
import { mockAuth } from "./helpers";

jest.mock("@/lib/db", () => ({
  db: {
    term: { findMany: jest.fn(), create: jest.fn() },
    academicYear: { findFirst: jest.fn() },
  },
}));
jest.spyOn(tokens, "getUserIdFromToken").mockResolvedValue("user-1");

describe("/api/terms", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("GET liste les périodes pour une année", async () => {
    (db.term.findMany as any).mockResolvedValue([{ id: "t1", name: "T1" }]);
    const res = await route.GET(mockAuth());
    const body = await (res as any).json();
    expect((res as any).status).toBe(200);
    expect(body.terms.length).toBe(1);
  });

  it("POST crée une période après validation", async () => {
    (db.academicYear.findFirst as any).mockResolvedValue({ id: "ay1" });
    (db.term.create as any).mockResolvedValue({
      id: "t1",
      name: "Trimestre 1",
    });
    const goodReq = new Request("http://x", {
      method: "POST",
      headers: { authorization: "Bearer t", "x-school-id": "s1" },
      body: JSON.stringify({
        academicYearId: "ay1",
        name: "Trimestre 1",
        order: 1,
        startDate: "2024-09-01",
        endDate: "2024-12-01",
      }),
    });
    const res = await route.POST(goodReq);
    const body = await (res as any).json();
    expect((res as any).status).toBe(201);
    expect(body.term.id).toBe("t1");
  });
});

























