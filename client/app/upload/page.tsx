import UploadTemperatureForm from "@/components/ui/UploadSingleTempForm";
import UploadTemperatureCSVForm from "@/components/ui/UploadTempCSV";

export default function UploadPage() {
  return (
    <div className="w-fit mx-auto flex-col space-y-4">
      <div className="flex flex-col justify-center items-center flex-1">
        <div className="w-full lg:w-[900px] flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="mb-4">Upload Temperature</h1>
            <p className="text-muted px-2">
              Contribute to our water temperature database by submitting your
              data below.
            </p>
          </div>
          <UploadTemperatureForm />
        </div>
      </div>

      <UploadTemperatureCSVForm />

      <p className="text-center text-sm text-muted-foreground leading-snug">
        Please ensure your temperature readings are accurate and taken at
        surface level. Add any relevant observations in the notes section.
      </p>
    </div>
  );
}
