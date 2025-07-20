import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/ui/Header";

jest.mock("@/components/ui/ProfileDropdown", () => () => (
  <div data-testid="profile-dropdown" />
));

describe("Header", () => {
  it("renders the header title", () => {
    render(<Header />);
    expect(screen.getByText("GLOW - Temp Tracker")).toBeTruthy();
  });

  it("renders desktop nav links", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /home/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /upload/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /community/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /about/i })).toBeTruthy();
  });

  it("renders ProfileDropdown component", () => {
    render(<Header />);
    expect(screen.getByTestId("profile-dropdown")).toBeTruthy();
  });

  it("toggles mobile menu on button click", () => {
    render(<Header />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    fireEvent.click(toggleButton);

    expect(
      screen.getByRole("navigation", { name: "Mobile Navigation" })
    ).toBeTruthy();
  });

  it("closes mobile menu when a mobile nav link is clicked", () => {
    render(<Header />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });
    fireEvent.click(toggleButton);

    // Select the second instance of the "Home" link (the mobile one)
    const allHomeLinks = screen.getAllByRole("link", { name: /home/i });
    const mobileHomeLink = allHomeLinks[1]; // mobile nav link
    fireEvent.click(mobileHomeLink);

    expect(
      screen.queryByRole("navigation", { name: "Mobile Navigation" })
    ).toBeNull();
  });
});
