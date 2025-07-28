"use client";

import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { Calendar } from "@/components/shadcn/calendar";
import { toast } from "sonner";
import { submitTemperature } from "@/lib/services/submitTemperatures";

const formSchema = z
  .object({
    temperature: z.number("Temperature must be a number"),
    temperatureUnit: z.enum(["C", "F"]),
    date: z.date("Date is required"),
    time: z
      .string()
      .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
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

export default function UploadTemperatureForm() {
  // default time in "HH:mm"
  const now = new Date();
  const defaultTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      temperature: -1,
      temperatureUnit: "C",
      longitude: undefined,
      latitude: undefined,
      date: new Date(),
      time: defaultTime,
      notes: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await submitTemperature(data);
      toast.success("Temperature reading submitted successfully!");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit temperature reading"
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Temperature */}
        <div className="space-y-0.5">
          <FormLabel className="text-base font-semibold">
            Temperature Reading
          </FormLabel>
          <div className="flex space-x-3">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter temperature"
                      className="text-lg"
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
            <FormField
              control={form.control}
              name="temperatureUnit"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="C">&deg;C</SelectItem>
                      <SelectItem value="F">&deg;F</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Location */}
        <FormLabel className="text-base font-semibold">Location</FormLabel>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder="Longitude"
                      value={field.value ?? ""}
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
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder="Latitude"
                      value={field.value ?? ""}
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
            <Button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) {
                  alert("Geolocation is not supported by your browser.");
                  return;
                }

                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    form.setValue("latitude", lat);
                    form.setValue("longitude", lng);
                    toast.success("Location set from device.");
                  },
                  (error) => {
                    console.error("Geolocation error:", error);
                    toast.error("Unable to retrieve your location.");
                  }
                );
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Use My Location
            </Button>
          </div>
        {/* Date and Time */}
        <div className="space-y-0.5">
          <FormLabel className="text-base font-semibold">
            Date and Time of Reading
          </FormLabel>

          <div className="flex flex-wrap gap-3">
            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="min-w-[160px] flex-1">
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left"
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => {
                const [hour, minute] = (field.value || "00:00").split(":");
                const updateTime = (newHour: string, newMinute: string) => {
                  field.onChange(`${newHour || hour}:${newMinute || minute}`);
                };

                return (
                  <FormItem className="w-auto">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Select
                          value={hour}
                          onValueChange={(h) => updateTime(h, minute)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="HH" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const h = i.toString().padStart(2, "0");
                              return (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground font-medium">
                          :
                        </span>
                        <Select
                          value={minute}
                          onValueChange={(m) => updateTime(hour, m)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 60 }, (_, i) => {
                              const m = i.toString().padStart(2, "0");
                              return (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <FormDescription>
            Uses current date and time if not specified
          </FormDescription>
        </div>

        {/* Notes */}
        <div className="space-y-0.5">
          <FormLabel className="text-base font-semibold">Notes</FormLabel>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none"
                    placeholder="Add any additional observations..."
                  />
                </FormControl>
                <FormDescription>
                  Optional: Add any relevant observations about the measurement
                  conditions
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : "Submit Temperature Reading"}
        </Button>
      </form>
    </Form>
  );
}
