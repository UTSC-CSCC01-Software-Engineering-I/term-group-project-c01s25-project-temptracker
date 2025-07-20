import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CommunityPage from "@/app/community/page";

// ─── Mocks ─────────────────────────────────────────────────────
beforeAll(() => {
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
  const { container } = render(<CommunityPage />);
  const input = container.querySelector("input#upload") as HTMLInputElement;
  const file = new File(["hello"], "test.png", { type: "image/png" });

  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    const img = container.querySelector('img[alt="Photo 1"]') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain("/mock-url-test.png");
  });
});

test("does nothing if no files are uploaded", () => {
  const { container } = render(<CommunityPage />);
  const input = container.querySelector("input#upload") as HTMLInputElement;

  fireEvent.change(input, { target: { files: null } });

  const imgs = container.querySelectorAll("img");
  expect(imgs.length).toBe(5); // 5 sample photos
});
