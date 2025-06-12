import UploadTemperatureForm from "@/components/ui/uploadTemperatureForm";

export default function UploadPage() {
  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-10">
      <div className="w-full max-w-lg space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Upload Temperature Reading
          </h1>
          <p className="text-muted-foreground">
            Contribute to our water temperature database by submitting your
            measurements. Your data helps monitor and track temperature patterns
            across GTA beaches.
          </p>
        </div>

        <UploadTemperatureForm />

        <div className="p-4 text-center text-sm text-muted-foreground">
          <p>
            Please ensure your temperature readings are accurate and taken at surface level. Add any relevant observations in the notes section.
          </p>
        </div>
      </div>
    </div>
  );
}
