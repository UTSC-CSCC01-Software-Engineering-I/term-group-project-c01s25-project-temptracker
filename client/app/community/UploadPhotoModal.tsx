"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Textarea } from "@/components/shadcn/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormValues = {
  file: File | null;
  location: string;
  title: string;
  caption: string;
};

type UploadPhotoModalProps = {
  onUpload: (data: {
    file: File;
    location: string;
    title: string;
    caption: string;
  }) => Promise<void>;
};

const LOCATIONS = [
  "Lake Ontario",
  "Lake Erie",
  "Lake Michigan",
  "Lake Superior",
  "Lake Huron",
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function UploadPhotoModal({ onUpload }: UploadPhotoModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      file: null,
      location: "",
      title: "",
      caption: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!data.file) {
      toast.error("Photo is required");
      return;
    }
    if (data.file.size > MAX_SIZE) {
      toast.error("File size must be 5MB or less.");
      return;
    }
    if (!data.location) {
      toast.error("Location is required");
      return;
    }
    if (!data.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    try {
      await onUpload({
        file: data.file,
        location: data.location,
        title: data.title,
        caption: data.caption,
      });
      form.reset();
      setOpen(false);
    } catch (e) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="default" size="lg" onClick={() => setOpen(true)}>
        Upload Photo
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px]"
            onClick={() => !loading && setOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg rounded-lg border bg-white px-6 py-6 shadow-md mx-4 mt-12">
            {/* Header */}
            <div className="flex justify-center items-center mb-4 relative">
              <h2 className="text-lg font-semibold text-center w-full">
                Upload a Photo
              </h2>
              <button
                onClick={() => !loading && setOpen(false)}
                className="absolute right-0 top-0 text-gray-500 hover:text-black text-3xl"
                aria-label="Close modal"
                disabled={loading}
              >
                ×
              </button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* File */}
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Photo <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file && file.size > MAX_SIZE) {
                              toast.error("File size must be 5MB or less.");
                              field.onChange(null);
                              e.target.value = "";
                              return;
                            }
                            field.onChange(file);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a title"
                          {...field}
                          value={field.value || ""}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Location <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue=""
                          disabled={loading}
                        >
                          <SelectTrigger className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm">
                            <SelectValue placeholder="Select Location" />
                          </SelectTrigger>
                          <SelectContent>
                            {LOCATIONS.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Caption */}
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caption (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a caption"
                          {...field}
                          value={field.value || ""}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <div className="w-full">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Uploading..." : "Submit"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}
