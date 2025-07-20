import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SetUsernamePage from "@/app/set-username/page";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Mock Setup ─────────────────────────────────────────────────────
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

// ─── Test Suite ─────────────────────────────────────────────────────
describe("SetUsernamePage", () => {
  const mockPush = jest.fn();
  const mockToast = toast;

  // Chainable mock for `.update().eq()`
  const mockUpdateChain = {
    eq: jest.fn().mockResolvedValue({ error: null }),
  };

  const mockFrom = jest.fn();

  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
    },
    from: mockFrom,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: "user123" } } },
      error: null,
    });

    mockFrom.mockImplementation((table) => {
      if (table === "user_profiles") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          update: jest.fn(() => mockUpdateChain),
        };
      }
      return {};
    });
  });

  

  test("shows error when username already exists", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({
        data: { id: "existing" },
        error: null,
      }),
      update: jest.fn(() => mockUpdateChain),
    }));

    render(<SetUsernamePage />);
    const input = await screen.findByLabelText("Username");
    const button = screen.getByRole("button", { name: /set username/i });

    fireEvent.change(input, { target: { value: "takenuser" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Username is already taken");
    });
  });

  test("shows error if username check fails", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({
        data: null,
        error: new Error("Check failed"),
      }),
      update: jest.fn(() => mockUpdateChain),
    }));

    render(<SetUsernamePage />);
    const input = await screen.findByLabelText("Username");
    const button = screen.getByRole("button", { name: /set username/i });

    fireEvent.change(input, { target: { value: "badcheck" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Failed to check username");
    });
  });

  test("shows error if update to user_profiles fails", async () => {
    mockUpdateChain.eq.mockResolvedValueOnce({ error: new Error("update failed") });

    render(<SetUsernamePage />);
    const input = await screen.findByLabelText("Username");
    const button = screen.getByRole("button", { name: /set username/i });

    fireEvent.change(input, { target: { value: "badupdate" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Failed to set username");
    });
  });

  test("shows warning if auth metadata update fails", async () => {
    mockSupabase.auth.updateUser.mockResolvedValueOnce({ error: new Error("meta fail") });

    render(<SetUsernamePage />);
    const input = await screen.findByLabelText("Username");
    const button = screen.getByRole("button", { name: /set username/i });

    fireEvent.change(input, { target: { value: "almostgood" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast.warning).toHaveBeenCalledWith("Username set, but failed to update auth metadata");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("updates username and redirects on success", async () => {
    render(<SetUsernamePage />);
    const input = await screen.findByLabelText("Username");
    const button = screen.getByRole("button", { name: /set username/i });

    fireEvent.change(input, { target: { value: "newuser" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockUpdateChain.eq).toHaveBeenCalledWith("id", "user123");
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        data: { username: "newuser" },
      });
      expect(mockToast.success).toHaveBeenCalledWith("Username set!");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("redirects to login when session not found", async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    render(<SetUsernamePage />);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Session not found");
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
