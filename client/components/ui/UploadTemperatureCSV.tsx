"use client";

import { z } from "zod/v4";
import Papa from "papaparse";
import { Input } from "@/components/shadcn/input";
import { toast } from "sonner";
import { useState } from "react";
import { Upload, FileText, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const csvFileSchema = z
  .file()
  .mime("text/csv", {
    error: "Invalid file type. File must end with .csv extension.",
  })
  .max(MAX_FILE_SIZE, {
    error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
  });

const EXPECTED_CSV_HEADERS = [
  "temperature",
  "temperatureUnit",
  "date",
  "longitude",
  "latitude",
  "notes",
];
const csvHeaderSchema = z.array(z.string()).check((headers) => {
  const missing = EXPECTED_CSV_HEADERS.filter(
    (header) => !headers.value.includes(header)
  );

  const unexpected = headers.value.filter(
    (header) => !EXPECTED_CSV_HEADERS.includes(header)
  );

  if (missing.length > 0) {
    headers.issues.push({
      code: "custom",
      message: `Missing headers: ${missing.join(", ")}`,
      input: headers.value,
    });
  }

  if (unexpected.length > 0) {
    headers.issues.push({
      code: "custom",
      message: `Unexpected headers: ${unexpected.join(", ")}`,
      input: headers.value,
    });
  }
});

const rowsSchema = z
  .object({
    temperature: z.number("Temperature must be a number"),
    temperatureUnit: z.enum(["C", "F"]),
    date: z.iso.date("Date is required"),
    longitude: z
      .number("Longitude must be a number")
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    latitude: z
      .number("Latitude must be a number")
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.temperatureUnit === "C") {
        return data.temperature >= 0 && data.temperature <= 30;
      } else {
        return data.temperature >= 32 && data.temperature <= 86;
      }
    },
    {
      message: "Temperature must be between 0°C/32°F and 30°C/86°F",
      path: ["temperature"],
    }
  );

const csvRowsSchema = z.array(rowsSchema);

async function validateCSV(file: File) {
  // Validate file type and size
  const fileValidation = csvFileSchema.safeParse(file);
  if (!fileValidation.success) {
    return { success: false, errors: fileValidation.error.issues };
  }

  const csvText = await file.text();

  const { data, errors, meta } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Validate headers
  const headerValidation = csvHeaderSchema.safeParse(meta.fields);
  if (!headerValidation.success) {
    return { success: false, errors: headerValidation.error.issues };
  }

  // Validate rows
  const rowsValidation = csvRowsSchema.safeParse(data);
  if (!rowsValidation.success) {
    return { success: false, errors: rowsValidation.error.issues };
  }

  return { success: true, data: rowsValidation.data };
}

export default function UploadTemperatureCSVForm() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

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

  const clearFile = () => {
    setUploadedFile(null);
    setUploadStatus("idle");
    // Clear the input value so the same file can be selected again
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <form>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ease-in-out
          ${
            isDragOver
              ? "border-primary bg-primary/5 scale-105"
              : uploadStatus === "success"
              ? "border-green-500 bg-green-50"
              : uploadStatus === "error"
              ? "border-red-500 bg-red-50"
              : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
          }
          ${isUploading ? "pointer-events-none" : "cursor-pointer"}
        `}
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
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              {/* Loading spinner */}
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-gray-600">Processing file...</p>
            </div>
          ) : uploadedFile ? (
            <div className="flex flex-col items-center space-y-2">
              {uploadStatus === "success" ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : uploadStatus === "error" ? (
                <X className="h-8 w-8 text-red-500" />
              ) : (
                <FileText className="h-8 w-8 text-blue-500" />
              )}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {uploadedFile.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Drop your CSV file here or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">Max file size: 2MB</p>
              </div>
            </div>
          )}
        </div>

        {uploadStatus === "success" && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-md">
            <p className="text-sm text-green-700 font-medium">
              &#10003; File validated successfully!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Your temperature data is ready to be processed.
            </p>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 font-medium">
              &#10007; Validation failed
            </p>
            <p className="text-xs text-red-600 mt-1">
              Please check the file format and try again.
            </p>
          </div>
        )}
      </div>

      {/* CSV headers hint */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p className="font-medium">Required CSV headers:</p>
        <p className="font-mono bg-gray-100 p-2 rounded text-xs">
          temperature, temperatureUnit, date, longitude, latitude, notes
        </p>
      </div>
    </form>
  );
}
