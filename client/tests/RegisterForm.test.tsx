import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import RegisterForm from "@/components/ui/RegisterForm";
import { registerUser } from "@/lib/supabase/api/register";
import { toast } from "sonner";

// ✅ Mocks
jest.mock("@/lib/supabase/api/register", () => ({
  registerUser: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// ✅ Shared router mocks
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/username/i)).toBeTruthy();
    expect(screen.getByLabelText(/^email/i)).toBeTruthy();
    expect(screen.getByLabelText(/^password/i)).toBeTruthy();
    expect(screen.getByLabelText(/confirm password/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /create account/i })).toBeTruthy();
  });

  it("toggles password visibility", async () => {
    render(<RegisterForm />);
    const passwordInput = screen.getByLabelText(/^password/i);
    const toggleButtons = screen.getAllByRole("button");

    const visibilityToggle = toggleButtons.find(btn => {
      const svg = btn.querySelector("svg");
      const classAttr = svg?.getAttribute("class") || "";
      return classAttr.includes("lucide-eye-off") || classAttr.includes("lucide-eye");
    });

    expect(passwordInput).toHaveAttribute("type", "password");

    if (visibilityToggle) {
      fireEvent.click(visibilityToggle);
      expect(passwordInput).toHaveAttribute("type", "text");
    } else {
      throw new Error("Password visibility toggle button not found.");
    }
  });

  it("shows validation error if passwords don't match", async () => {
    render(<RegisterForm />);
    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: "user" },
    });
    fireEvent.input(screen.getByLabelText(/^email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/^password/i), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeTruthy();
    });
  });

  it("calls registerUser and redirects on successful submit", async () => {
    (registerUser as jest.Mock).mockResolvedValueOnce(undefined);

    render(<RegisterForm />);
    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: "newuser" },
    });
    fireEvent.input(screen.getByLabelText(/^email/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/^password/i), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        username: "newuser",
        email: "new@example.com",
        password: "password123",
      });
      expect(toast.success).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("displays error toast and sets form error on API failure", async () => {
    (registerUser as jest.Mock).mockRejectedValueOnce(
      new Error("Username already exists")
    );

    render(<RegisterForm />);
    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: "existinguser" },
    });
    fireEvent.input(screen.getByLabelText(/^email/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/^password/i), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Username already exists");
      const errorEl = screen.getByText("Username already exists");
      expect(errorEl.textContent).toBe("Username already exists");
    });
  });
});
