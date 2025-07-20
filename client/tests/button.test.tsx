import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/shadcn/button";

describe("Button component", () => {
  test("renders with different variants and sizes", () => {
    // PREPARE: Render multiple Button variants and sizes
    render(
      <>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button size="lg">Large</Button>
        <Button size="sm">Small</Button>
      </>
    );

    // ACT: Query for all buttons by text
    const destructive = screen.queryByText("Destructive");
    const outline = screen.queryByText("Outline");
    const large = screen.queryByText("Large");
    const small = screen.queryByText("Small");

    // VERIFY: Check classNames that correspond to props
    expect(destructive && destructive.className).toMatch(/bg-destructive/);
    expect(outline && outline.className).toMatch(/border/);
    expect(large && large.className).toMatch(/h-10/);
    expect(small && small.className).toMatch(/h-8/);
  });

  test("applies custom className", () => {
    // PREPARE: Render Button with a custom class
    render(<Button className="custom-class">Styled</Button>);

    // ACT: Find the button
    const button = screen.queryByText("Styled");

    // VERIFY: Ensure custom class is applied
    expect(button && button.className).toMatch(/custom-class/);
  });

  test("is disabled when disabled prop is true", () => {
    // PREPARE: Render a disabled Button
    render(<Button disabled>Disabled</Button>);

    // ACT: Find the button
    const button = screen.queryByRole("button", { name: "Disabled" });

    // VERIFY: Button should have the 'disabled' attribute
    expect(button?.hasAttribute("disabled")).toBe(true);
  });

  test("fires onClick handler", () => {
    // PREPARE: Setup click handler and render button
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    // ACT: Click the button
    const button = screen.queryByText("Click");
    button && fireEvent.click(button);

    // VERIFY: Ensure the click handler was called
    expect(handleClick).toHaveBeenCalled();
  });

  test("renders as child element when asChild is true", () => {
    // PREPARE: Render a link wrapped in a Button with asChild
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    // ACT: Query for the rendered link
    const link = screen.queryByRole("link", { name: "Link Button" });

    // VERIFY: Check that href is passed through
    expect(link?.getAttribute("href")).toBe("/test");
  });
});
