const { requireAdmin } = require("../middleware/reqAdmin");
const supabase = require("../models/supabaseClient");

jest.mock("../models/supabaseClient", () => ({
  from: jest.fn(),
}));

describe("requireAdmin middleware", () => {
  let mockReq, mockRes, mockNext, mockFrom;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: null,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    mockFrom = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    supabase.from.mockReturnValue(mockFrom);
  });

  it("returns 401 if user is not authenticated", async () => {
    await requireAdmin(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "User not authenticated" });
    expect(mockNext).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("returns 403 if user is not an admin", async () => {
    mockReq.user = { id: "user-123" };
    mockFrom.single.mockResolvedValue({ data: { role: "user" }, error: null });

    await requireAdmin(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Admin access required" });
    expect(mockNext).not.toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith("user_profiles");
    expect(mockFrom.select).toHaveBeenCalledWith("role");
    expect(mockFrom.eq).toHaveBeenCalledWith("id", "user-123");
  });

  it("returns 403 if profile fetch fails", async () => {
    mockReq.user = { id: "user-123" };
    mockFrom.single.mockResolvedValue({ data: null, error: new Error("Database error") });

    await requireAdmin(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Admin access required" });
    expect(mockNext).not.toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith("user_profiles");
    expect(mockFrom.select).toHaveBeenCalledWith("role");
    expect(mockFrom.eq).toHaveBeenCalledWith("id", "user-123");
  });

  it("calls next() if user is an admin", async () => {
    mockReq.user = { id: "user-123" };
    mockFrom.single.mockResolvedValue({ data: { role: "admin" }, error: null });

    await requireAdmin(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith("user_profiles");
    expect(mockFrom.select).toHaveBeenCalledWith("role");
    expect(mockFrom.eq).toHaveBeenCalledWith("id", "user-123");
  });
});