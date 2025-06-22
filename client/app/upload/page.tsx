import UploadTemperatureForm from "@/components/ui/uploadTemperatureForm";

export default function UploadPage() {
  return (
    <div className="flex flex-col justify-center items-center flex-1 mb-6 px-4 lg:px-12 lg:py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <div className="text-center">
          <h1 className="mb-4">Upload Temperature</h1>
          <p className="text-muted mb-6 px-2">
            Contribute to our water temperature database by submitting your
            measurements below.
          </p>
        </div>

        <UploadTemperatureForm />

        <p className="text-center text-sm text-muted-foreground leading-snug px-4">
          Please ensure your temperature readings are accurate and taken at
          surface level. Add any relevant observations in the notes section.
        </p>
      </div>
    </div>
  );
}
