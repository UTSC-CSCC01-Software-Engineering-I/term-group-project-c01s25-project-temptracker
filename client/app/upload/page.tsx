import UploadTemperatureForm from "@/components/ui/uploadTemperatureForm";

export default function UploadPage() {
  return (
    <div className="w-full px-4 py-6 lg:px-12 lg:py-12">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-2">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-card-blue mb-6 lg:mb-12">
            Upload Temperature
          </h1>
          <p className="text-card text-base leading-snug p-3">
            Contribute to our water temperature database by submitting your
            measurements. Upload your data manually, or use quick upload to
            automatically select the current date and location (IPR).
          </p>
        </div>

        <UploadTemperatureForm />

        <div className="text-center text-sm text-muted-foreground leading-snug px-4">
          <p>
            Please ensure your temperature readings are accurate and taken at
            surface level. Add any relevant observations in the notes section.
          </p>
        </div>
      </div>
    </div>
  );
}
