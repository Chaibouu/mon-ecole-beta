import * as route from "@/app/api/academic-years/route";
import { db } from "@/lib/db";
import * as tokens from "@/lib/tokens";
import { mockAuth } from "./helpers";

jest.mock("@/lib/db", () => ({
  db: {
    academicYear: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));
jest.spyOn(tokens, "getUserIdFromToken").mockResolvedValue("user-1");

describe("/api/academic-years", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("POST valide Zod et crée l'année", async () => {
    (db.academicYear.updateMany as any).mockResolvedValue({ count: 0 });
    (db.academicYear.create as any).mockResolvedValue({
      id: "ay1",
      name: "2024-2025",
    });
    const goodReq = new Request("http://x", {
      method: "POST",
      headers: { authorization: "Bearer t", "x-school-id": "s1" },
      body: JSON.stringify({
        name: "2024-2025",
        startDate: "2024-09-01",
        endDate: "2025-06-30",
        isActive: true,
      }),
    });
    const res = await route.POST(goodReq);
    const body = await (res as any).json();
    expect((res as any).status).toBe(201);
    expect(body.academicYear.id).toBe("ay1");
  });
});










