"use client";

import { Input } from "@/components/shadcn/input";
import { useCSVUpload } from "@/hooks/useCSVUpload";
import FileDisplay from "@/components/ui/FileDisplay";
import StatusMessage from "@/components/ui/StatusMessage";
import { EXPECTED_CSV_HEADERS } from "@/lib/csvValidation";

export default function UploadTemperatureCSVForm() {
  const {
    isDragOver,
    isUploading,
    uploadedFile,
    uploadStatus,
    validatedData,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
  } = useCSVUpload();

  const getUploadAreaClassName = () => {
    let baseClasses =
      "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ease-in-out";

    if (isDragOver) {
      baseClasses += " border-primary bg-primary/5 scale-105";
    } else if (uploadStatus === "success") {
      baseClasses += " border-green-500 bg-green-50";
    } else if (uploadStatus === "error") {
      baseClasses += " border-red-500 bg-red-50";
    } else {
      baseClasses +=
        " border-gray-300 hover:border-primary/50 hover:bg-gray-50";
    }

    if (isUploading) {
      baseClasses += " pointer-events-none";
    } else {
      baseClasses += " cursor-pointer";
    }

    return baseClasses;
  };

  return (
    <form>
      <div
        className={getUploadAreaClassName()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <Input
          id="file-input"
          type="file"
          accept=".csv"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <div className="flex flex-col items-center space-y-4">
          <FileDisplay
            isUploading={isUploading}
            uploadedFile={uploadedFile}
            uploadStatus={uploadStatus}
            onClearFile={clearFile}
          />
        </div>

        <StatusMessage uploadStatus={uploadStatus} />
      </div>
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p className="font-medium">Required CSV headers:</p>
        <p className="font-mono bg-gray-100 p-2 rounded text-xs">
          {EXPECTED_CSV_HEADERS.join(", ")}
        </p>
      </div>
    </form>
  );
}
