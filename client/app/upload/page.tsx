import UploadTemperatureForm from "@/components/ui/uploadTemperatureForm";

export default function UploadPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center max-w-lg gap-2">
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
          Please ensure your temperature readings are accurate and taken at
          surface level. Add any relevant observations in the notes section.
        </p>
      </div>
    </div>
  );
}
