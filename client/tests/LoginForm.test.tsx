// ─── Mock Definitions ────────────────────────────────────────────
const mockSignInWithOAuth = jest.fn();

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "@/components/ui/LoginForm";
import { toast } from "sonner";
import { loginUser } from "@/lib/supabase/api/login";

// Mock login API
jest.mock("@/lib/supabase/api/login", () => ({
  loginUser: jest.fn(),
}));

//Mock toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next/navigation router
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock Supabase OAuth client
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

// ─── Test Suite ──────────────────────────────────────────────────
describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form fields and buttons", () => {
    // ACT
    render(<LoginForm />);

    // VERIFY: input fields and buttons exist
    expect(screen.getByPlaceholderText("example@email.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("••••••••")).toBeTruthy();
    expect(screen.getByRole("button", { name: /login/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeTruthy();
  });

  test("validates empty fields", async () => {
    // ACT: submit with empty fields
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // VERIFY: required field errors show up
    expect(await screen.findByText("Email or Username is required")).toBeTruthy();
    expect(await screen.findByText("Password is required")).toBeTruthy();
  });

  test("logs in successfully", async () => {
    // PREPARE: mock resolved login
    (loginUser as jest.Mock).mockResolvedValueOnce({});

    render(<LoginForm />);
    
    // ACT: fill in inputs and submit
    fireEvent.input(screen.getByPlaceholderText("example@email.com"), {
      target: { value: "testuser" },
    });
    fireEvent.input(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // VERIFY: success path triggered
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("testuser", "password123");
      expect(toast.success).toHaveBeenCalledWith("Login successful!");
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("displays error from login API", async () => {
    // PREPARE: mock rejected login
    (loginUser as jest.Mock).mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<LoginForm />);
    
    // ACT: input incorrect data and submit
    fireEvent.input(screen.getByPlaceholderText("example@email.com"), {
      target: { value: "wrong" },
    });
    fireEvent.input(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // VERIFY: error toast triggered
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
      expect(screen.queryByText("Invalid credentials")).toBeTruthy();
    });
  });

  test("handles Google OAuth login", async () => {
    // PREPARE: mock successful Google OAuth
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

    render(<LoginForm />);
    
    // ACT: click Google login
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    // VERIFY: Google auth called with expected provider
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });
  });

  test("shows toast if Google OAuth login fails", async () => {
    // PREPARE: mock failed Google OAuth
    mockSignInWithOAuth.mockResolvedValueOnce({ error: { message: "OAuth failed" } });

    render(<LoginForm />);
    
    // ACT: click Google login
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    // VERIFY: error toast triggered
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("OAuth failed");
    });
  });
});
