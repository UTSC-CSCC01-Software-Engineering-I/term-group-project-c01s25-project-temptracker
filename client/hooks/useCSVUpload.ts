import { useState } from "react";
import { toast } from "sonner";
import { validateCSV, TemperatureData } from "@/lib/csvValidation";

export type UploadStatus = "idle" | "success" | "error";

export function useCSVUpload() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [validatedData, setValidatedData] = useState<TemperatureData[]>([]);

  const handleFileValidation = async (file: File) => {
    setIsUploading(true);
    setUploadedFile(file);

    try {
      const validationResult = await validateCSV(file);
      if (!validationResult.success) {
        // Display first error with toast and the rest in console
        toast.error(
          validationResult.errors?.[0]?.message || "Validation failed"
        );

        validationResult.errors?.slice(1).forEach((error) => {
          console.error("Validation error:", error);
        });

        setUploadStatus("error");
        return;
      }

      setUploadStatus("success");
      setValidatedData(validationResult.data || []);
      toast.success(`Successfully validated ${file.name}!`);
      console.log("CSV data:", validationResult.data);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process file");
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setUploadStatus("idle");
    setValidatedData([]);
    // Clear the input value so the same file can be selected again
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleFileValidation(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await handleFileValidation(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return {
    // State
    isDragOver,
    isUploading,
    uploadedFile,
    uploadStatus,
    validatedData,

    // Actions
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
  };
}
