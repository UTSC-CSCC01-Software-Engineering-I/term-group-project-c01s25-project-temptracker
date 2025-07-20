import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FileDisplay from "@/components/ui/FileDisplay";
import { UploadStatus } from "@/hooks/useCSVUpload";

describe("FileDisplay", () => {
  // PREPARE: mock file used in multiple tests
  const mockFile = new File(["dummy content"], "test.csv", {
    type: "text/csv",
  });

  // PREPARE: helper to render component with defaults
  const renderComponent = (
    props: {
      isUploading?: boolean;
      uploadedFile?: File | null;
      uploadStatus?: UploadStatus;
      onClearFile?: () => void;
    } = {}
  ) => {
    const {
      isUploading = false,
      uploadedFile = null,
      uploadStatus = "idle",
      onClearFile = jest.fn(),
    } = props;

    render(
      <FileDisplay
        isUploading={isUploading}
        uploadedFile={uploadedFile}
        uploadStatus={uploadStatus}
        onClearFile={onClearFile}
      />
    );

    return { onClearFile };
  };

  test("renders spinner and processing text when uploading", () => {
    // ACT: render in uploading state
    renderComponent({ isUploading: true });

    // VERIFY: check spinner and message
    expect(screen.queryByText(/Processing file/i)).toBeTruthy();
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  test("renders success icon and filename when upload successful", () => {
    // ACT: render with success upload
    renderComponent({ uploadedFile: mockFile, uploadStatus: "success" });

    // VERIFY: green icon, filename, and file size
    expect(document.querySelector(".text-green-500")).toBeTruthy();
    expect(screen.queryByText("test.csv")).toBeTruthy();
    expect(
      screen.queryByText((mockFile.size / 1024).toFixed(1) + " KB")
    ).toBeTruthy();
  });

  test("renders error icon when upload fails", () => {
    // ACT: render with error status
    renderComponent({ uploadedFile: mockFile, uploadStatus: "error" });

    // VERIFY: red error icon
    expect(document.querySelector(".text-red-500")).toBeTruthy();
  });

  test("renders neutral icon when upload is idle", () => {
    // ACT: render idle state with file
    renderComponent({ uploadedFile: mockFile, uploadStatus: "idle" });

    // VERIFY: blue info icon
    expect(document.querySelector(".text-blue-500")).toBeTruthy();
  });

  test("calls onClearFile when clear button is clicked", () => {
    // PREPARE: render with clear handler
    const { onClearFile } = renderComponent({
      uploadedFile: mockFile,
      uploadStatus: "success",
    });

    // ACT: click clear (X) button
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    // VERIFY: callback fired
    expect(onClearFile).toHaveBeenCalled();
  });

  test("renders upload prompt when no file is present", () => {
    // ACT: render with no file
    renderComponent();

    // VERIFY: drop zone text and neutral icon
    expect(screen.queryByText(/Drop your CSV file here/i)).toBeTruthy();
    expect(screen.queryByText(/Max file size/i)).toBeTruthy();
    expect(document.querySelector(".text-gray-400")).toBeTruthy();
  });
});
