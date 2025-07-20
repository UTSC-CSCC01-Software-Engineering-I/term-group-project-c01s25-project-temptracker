import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CommunityPage from "@/app/community/page";

// ─── Mocks ─────────────────────────────────────────────────────
beforeAll(() => {
  // Mock for URL.createObjectURL used for previewing uploaded images
  global.URL.createObjectURL = jest.fn((file) => `/mock-url-${(file as File).name}`);
});

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, ...rest } = props;
    return <img src={src} alt={alt} {...rest} />;
  },
}));

// ─── Tests ─────────────────────────────────────────────────────

test("uploads a new image and renders it", async () => {
  // PREPARE: Render component and set up test file
  const { container } = render(<CommunityPage />);
  const input = container.querySelector("input#upload") as HTMLInputElement;
  const file = new File(["hello"], "test.png", { type: "image/png" });

  // ACT: Simulate file upload
  fireEvent.change(input, { target: { files: [file] } });

  // VERIFY: Wait for and check if new image is rendered
  await waitFor(() => {
    const img = container.querySelector('img[alt="Photo 1"]') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain("/mock-url-test.png");
  });
});

test("does nothing if no files are uploaded", () => {
  // PREPARE: Render component
  const { container } = render(<CommunityPage />);
  const input = container.querySelector("input#upload") as HTMLInputElement;

  // ACT: Trigger input change with null files
  fireEvent.change(input, { target: { files: null } });

  // VERIFY: Should still only show the original sample images
  const imgs = container.querySelectorAll("img");
  expect(imgs.length).toBe(5); // 5 sample photos initially rendered
});
