const { verifySelfAccess } = require("../middleware/verifySelf");
const supabase = require("../models/supabaseClient");

jest.mock("../models/supabaseClient", () => ({
  auth: {
    getUser: jest.fn(),
  },
}));

describe("verifySelfAccess middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      headers: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("returns 401 if no authorization header is provided", async () => {
    await verifySelfAccess(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing Authorization header" });
    expect(mockNext).not.toHaveBeenCalled();
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("returns 401 if no token is provided in the header", async () => {
    mockReq.headers.authorization = "Bearer ";

    await verifySelfAccess(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing token" });
    expect(mockNext).not.toHaveBeenCalled();
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("returns 401 if the token is invalid", async () => {
    mockReq.headers.authorization = "Bearer invalid-token";
    supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error("Invalid token") });

    await verifySelfAccess(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(mockNext).not.toHaveBeenCalled();
    expect(supabase.auth.getUser).toHaveBeenCalledWith("invalid-token");
  });

  it("returns 403 if authenticated user ID does not match requested user ID", async () => {
    mockReq.headers.authorization = "Bearer valid-token";
    mockReq.params.id = "user-456";
    const mockUser = { id: "user-123", email: "test@example.com" };
    supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    await verifySelfAccess(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Access denied" });
    expect(mockNext).not.toHaveBeenCalled();
    expect(supabase.auth.getUser).toHaveBeenCalledWith("valid-token");
    expect(mockReq.user).toBeUndefined();
  });

  it("sets req.user and calls next() if token is valid and user IDs match", async () => {
    mockReq.headers.authorization = "Bearer valid-token";
    mockReq.params.id = "user-123";
    const mockUser = { id: "user-123", email: "test@example.com" };
    supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    await verifySelfAccess(mockReq, mockRes, mockNext);

    expect(mockReq.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
    expect(supabase.auth.getUser).toHaveBeenCalledWith("valid-token");
  });
});