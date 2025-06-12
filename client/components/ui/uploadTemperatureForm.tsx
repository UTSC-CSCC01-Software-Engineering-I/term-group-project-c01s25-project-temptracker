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
import { submitTemperature } from "@/lib/supabase/services/submit-temperatures";

const formSchema = z
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

export default function UploadTemperatureForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      temperature: "",
      temperatureUnit: "C",
      longitude: "",
      latitude: "",
      date: new Date(), // Default to today
      notes: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await submitTemperature({
        temperature: data.temperature,
        temperatureUnit: data.temperatureUnit,
        latitude: data.latitude,
        longitude: data.longitude,
        date: data.date,
        notes: data.notes,
      });

      toast.success("Temperature reading submitted successfully!");
      form.reset(); // Reset form after successful submission
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit temperature reading"
      );
    }

    //reset the form after submission
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-xl md:mx-auto p-6 rounded-lg bg-card shadow-md"
      >
        <div className="space-y-2">
          {/* Temperature Input Group */}
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
                      {...field}
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

          {/* Location Group */}
          <FormLabel className="text-base font-semibold">Location</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal text-sm">
                    Longitude
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      step="0.000001"
                      placeholder="43.7847"
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
                <FormItem>
                  <FormLabel className="font-normal text-sm">
                    Latitude
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      step="0.000001"
                      placeholder="79.1859"
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
          </div>

          {/* Date Input */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Reading</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"}>
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
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
                <FormDescription>
                  Optional: Defaults to today's date if not specified
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes Input */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Notes</FormLabel>
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

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              Submitting...
              {/* Add a loading spinner if you have one */}
            </>
          ) : (
            "Submit Temperature Reading"
          )}{" "}
        </Button>
      </form>
    </Form>
  );
}
