"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/shadcn/input";
import { useCSVUpload } from "@/hooks/useCSVUpload";
import FileDisplay from "@/components/ui/FileDisplay";
import StatusMessage from "@/components/ui/StatusMessage";
import { EXPECTED_CSV_HEADERS } from "@/lib/csvValidation";
import { TemperatureData } from "@/lib/csvValidation";
import { submitTemperatures } from "@/lib/supabase/services/submit-temperatures";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";

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

  const form = useForm<[TemperatureData]>();

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
        " border-gray-300 hover:border-primary/50 hover:bg-input/30";
    }

    if (isUploading) {
      baseClasses += " pointer-events-none";
    } else {
      baseClasses += " cursor-pointer";
    }

    return baseClasses;
  };

  const onSubmit = async () => {
    try {
      await submitTemperatures(validatedData);
      console.log("Submitting data:", validatedData);
      toast.success("Temperature reading submitted successfully!");
      clearFile(); // Reset the CSV upload after successful submission
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit temperature reading"
      );
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
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

        <FileDisplay
          isUploading={isUploading}
          uploadedFile={uploadedFile}
          uploadStatus={uploadStatus}
          onClearFile={clearFile}
        />

        <StatusMessage uploadStatus={uploadStatus} />
      </div>
      <div className="mt-4 text-xs space-y-1">
        <p className="font-medium">Required CSV headers:</p>
        <p className="font-mono bg-gray-100 dark:bg-input/30 p-2 rounded text-xs">
          {EXPECTED_CSV_HEADERS.join(", ")}
        </p>
      </div>
      <Button
        type="submit"
        size="submit"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Submitting..." : "Submit CSV File"}
      </Button>
    </form>
  );
}
