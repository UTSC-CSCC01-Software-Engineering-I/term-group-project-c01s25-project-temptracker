"use client";

import { z } from "zod/v4";
import Papa from "papaparse";
import { Input } from "@/components/shadcn/input";
import { toast } from "sonner";

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
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationResult = await validateCSV(file);
    if (!validationResult.success) {
      // Display first error with toast and the rest in console
      toast.error(validationResult.errors[0].message);

      validationResult.errors?.slice(1).forEach((error) => {
        console.error("Validation error:", error);
      });

      return;
    }

    console.log("CSV data:", validationResult.data);
  };

  return (
    <>
      <Input type="file" placeholder="Longitude" onChange={handleFileChange} />
    </>
  );
}
