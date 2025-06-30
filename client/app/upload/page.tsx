import UploadTemperatureForm from "@/components/ui/uploadTemperatureForm";
import UploadTemperatureCSVForm from "@/components/ui/UploadTemperatureCSV";

export default function UploadPage() {
  return (
    <div className="w-fit mx-auto">
      <div className="flex flex-col justify-center items-center flex-1 mb-6">
        <div className="w-full lg:w-[900px] flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="mb-4">Upload Temperature</h1>
            <p className="text-muted px-2">
              Contribute to our water temperature database by submitting your
              data below.
            </p>
          </div>
          <UploadTemperatureForm />
          <p className="text-center text-sm text-muted-foreground leading-snug">
            Please ensure your temperature readings are accurate and taken at
            surface level. Add any relevant observations in the notes section.
          </p>
        </div>
      </div>
      <div className="flex items-center px-8 sm:px-24">
        <div className="flex-1 h-[2px] bg-muted-foreground mr-3"></div>
        Or
        <div className="flex-1 h-[2px] bg-muted-foreground ml-3"></div>
      </div>
      <div>
        <div className="flex flex-col items-center mt-6">
          <p className="text-muted px-2 text-center">
            If you have a CSV file with temperature data, you can upload it
            here.
          </p>
          <UploadTemperatureCSVForm />
        </div>
      </div>
    </div>
  );
}
