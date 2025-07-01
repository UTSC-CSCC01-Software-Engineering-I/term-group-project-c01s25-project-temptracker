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
import { Shield } from "lucide-react";
import { useUser } from "@/app/context";

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

  const { profile } = useUser();
  console.log(profile);

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

  if (!profile || profile.role !== "admin") {
    return <></>;
  } else {
    return (
      <>
        <div className="flex items-center px-8 sm:px-24">
          <div className="flex-1 h-[2px] bg-muted-foreground mr-3"></div>
          Or
          <div className="flex-1 h-[2px] bg-muted-foreground ml-3"></div>
        </div>
        <div className="max-w-xl md:max-w-3xl mx-auto bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-amber-600" />
            <span className="bg-amber-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              ADMIN ONLY
            </span>
          </div>
          <p className="text-amber-800 px-2 text-center mb-4 font-medium">
            Bulk CSV Upload
          </p>
          <p className="text-amber-700 text-sm text-center mb-4">
            Upload multiple temperature readings from a CSV file. This feature
            is restricted to authorized administrators.
          </p>
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
              {form.formState.isSubmitting
                ? "Submitting..."
                : "Submit CSV File"}
            </Button>
          </form>
        </div>
      </>
    );
  }
}
