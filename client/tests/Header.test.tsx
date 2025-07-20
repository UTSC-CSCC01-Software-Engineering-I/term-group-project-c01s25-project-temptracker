import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/ui/Header";

// ─── Mock Dependencies ─────────────────────────────────────────────
jest.mock("@/components/ui/ProfileDropdown", () => () => (
  <div data-testid="profile-dropdown" />
));

// ─── Tests ─────────────────────────────────────────────────────────
describe("Header", () => {

  it("renders the header title", () => {
    // ACT
    render(<Header />);

    // VERIFY
    expect(screen.getByText("GLOW - Temp Tracker")).toBeTruthy();
  });

  it("renders desktop nav links", () => {
    // ACT
    render(<Header />);

    // VERIFY
    expect(screen.getByRole("link", { name: /home/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /upload/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /community/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /about/i })).toBeTruthy();
  });

  it("renders ProfileDropdown component", () => {
    // ACT
    render(<Header />);

    // VERIFY
    expect(screen.getByTestId("profile-dropdown")).toBeTruthy();
  });

  it("toggles mobile menu on button click", () => {
    // ACT
    render(<Header />);
    const toggleButton = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    // ACT: Open mobile nav
    fireEvent.click(toggleButton);

    // VERIFY
    expect(
      screen.getByRole("navigation", { name: "Mobile Navigation" })
    ).toBeTruthy();
  });

  it("closes mobile menu when a mobile nav link is clicked", () => {
    // PREPARE
    render(<Header />);
    const toggleButton = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    // ACT: Open and then close by clicking a mobile nav link
    fireEvent.click(toggleButton);
    const allHomeLinks = screen.getAllByRole("link", { name: /home/i });
    const mobileHomeLink = allHomeLinks[1];
    fireEvent.click(mobileHomeLink);

    // VERIFY: mobile nav is removed from DOM
    expect(
      screen.queryByRole("navigation", { name: "Mobile Navigation" })
    ).toBeNull();
  });
});
