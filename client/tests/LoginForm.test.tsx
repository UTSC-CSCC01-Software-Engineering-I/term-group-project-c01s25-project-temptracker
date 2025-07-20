// Move this up to avoid ReferenceError from hoisting
const mockSignInWithOAuth = jest.fn();

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "@/components/ui/LoginForm";
import { toast } from "sonner";
import { loginUser } from "@/lib/supabase/api/login";

// ✅ Mock API and toast
jest.mock("@/lib/supabase/api/login", () => ({
  loginUser: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// ✅ Mock router
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// ✅ Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields and buttons", () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText("example@email.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("••••••••")).toBeTruthy();
    expect(screen.getByRole("button", { name: /login/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeTruthy();
  });

  it("validates empty fields", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Email or Username is required")).toBeTruthy();
    expect(await screen.findByText("Password is required")).toBeTruthy();
  });

  it("logs in successfully", async () => {
    (loginUser as jest.Mock).mockResolvedValueOnce({});

    render(<LoginForm />);
    fireEvent.input(screen.getByPlaceholderText("example@email.com"), {
      target: { value: "testuser" },
    });
    fireEvent.input(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("testuser", "password123");
      expect(toast.success).toHaveBeenCalledWith("Login successful!");
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("displays error from login API", async () => {
    (loginUser as jest.Mock).mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<LoginForm />);
    fireEvent.input(screen.getByPlaceholderText("example@email.com"), {
      target: { value: "wrong" },
    });
    fireEvent.input(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
      const error = screen.queryByText("Invalid credentials");
      expect(error).toBeTruthy();
    });
  });

  it("handles Google OAuth login", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });
  });

  it("shows toast if Google OAuth login fails", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: { message: "OAuth failed" } });

    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("OAuth failed");
    });
  });
});
