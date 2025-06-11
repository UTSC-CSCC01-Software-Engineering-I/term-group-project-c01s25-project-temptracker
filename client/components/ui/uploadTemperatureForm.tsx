"use client";

import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
  .object({
    temperature: z.number(),
    temperatureUnit: z.enum(["C", "F"]),
    date: z.iso.date(),
    longitude: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    latitude: z
      .number()
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
  )
  .transform((data) => ({
    ...data,
    // Convert temperature to Celsius if it's in Fahrenheit
    temperature:
      data.temperatureUnit === "F"
        ? ((data.temperature - 32) * 5) / 9
        : data.temperature,
    temperatureUnit: "C", // Always store as Celsius
  }));

export default function UploadTemperatureForm() {}
