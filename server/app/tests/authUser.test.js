const { authenticateUser } = require("../middleware/authUser");
const supabase = require("../models/supabaseClient");

jest.mock("../models/supabaseClient", () => ({
  auth: {
    getUser: jest.fn(),
  },
}));

describe("authenticateUser middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("returns 401 if no authorization header is provided", async () => {
    await authenticateUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "No authorization header" });
    expect(mockNext).not.toHaveBeenCalled();
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("returns 401 if no token is provided in the header", async () => {
    mockReq.headers.authorization = "Bearer ";

    await authenticateUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "No token provided" });
    expect(mockNext).not.toHaveBeenCalled();
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("returns 401 if the token is invalid", async () => {
    mockReq.headers.authorization = "Bearer invalid-token";
    supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error("Invalid token") });

    await authenticateUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(mockNext).not.toHaveBeenCalled();
    expect(supabase.auth.getUser).toHaveBeenCalledWith("invalid-token");
  });

  it("sets req.user and calls next() if the token is valid", async () => {
    mockReq.headers.authorization = "Bearer valid-token";
    const mockUser = { id: "user-123", email: "test@example.com" };
    supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    await authenticateUser(mockReq, mockRes, mockNext);

    expect(mockReq.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
    expect(supabase.auth.getUser).toHaveBeenCalledWith("valid-token");
  });
});