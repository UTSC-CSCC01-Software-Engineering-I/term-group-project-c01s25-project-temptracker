import { z } from "zod/v4";
import Papa from "papaparse";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const csvFileSchema = z.file().mime("text/csv").max(MAX_FILE_SIZE);

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
    (header) => !headers.includes(header)
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
    date: z.date("Date is required"),
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
  const csvText = await file.text();

  const { data, errors, meta } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const headerValidation = csvHeaderSchema.safeParse(meta.fields);
  if (!headerValidation.success)
    return { success: false, errors: headerValidation.error.issues };

  const rowsValidation = csvRowsSchema.safeParse(data);
  if (!rowsValidation.success)
    return { success: false, errors: rowsValidation.error.issues };

  return { success: true, data: rowsValidation.data };
}

export default function UploadTemperatureCSVForm() {
  return <div>form</div>;
}

/*
        <FormLabel>Upload CSV</FormLabel>
        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="file"
                  placeholder="Longitude"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? "" : parseFloat(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

*/
