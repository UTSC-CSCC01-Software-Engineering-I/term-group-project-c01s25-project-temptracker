// tests/components/ui/Button.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/shadcn/button";

describe("Button component", () => {

  test("renders with different variants and sizes", () => {
    render(
      <>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button size="lg">Large</Button>
        <Button size="sm">Small</Button>
      </>
    );

    const destructive = screen.queryByText("Destructive");
    const outline = screen.queryByText("Outline");
    const large = screen.queryByText("Large");
    const small = screen.queryByText("Small");

    expect(destructive && destructive.className).toMatch(/bg-destructive/);
    expect(outline && outline.className).toMatch(/border/);
    expect(large && large.className).toMatch(/h-10/);
    expect(small && small.className).toMatch(/h-8/);
  });

  test("applies custom className", () => {
    render(<Button className="custom-class">Styled</Button>);
    const button = screen.queryByText("Styled");
    expect(button && button.className).toMatch(/custom-class/);
  });

  test("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.queryByRole("button", { name: "Disabled" });
    expect(button?.hasAttribute("disabled")).toBe(true);
  });

  test("fires onClick handler", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    const button = screen.queryByText("Click");
    button && fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  test("renders as child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.queryByRole("link", { name: "Link Button" });
    expect(link?.getAttribute("href")).toBe("/test");
  });
});
