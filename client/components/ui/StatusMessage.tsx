import { UploadStatus } from "@/hooks/useCSVUpload";

interface StatusMessageProps {
  uploadStatus: UploadStatus;
}

export default function StatusMessage({ uploadStatus }: StatusMessageProps) {
  if (uploadStatus === "success") {
    return (
      <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-md">
        <p className="text-sm text-green-700 font-medium">
          &#10003; File validated successfully!
        </p>
        <p className="text-xs text-green-600 mt-1">
          Your temperature data is ready to be processed.
        </p>
      </div>
    );
  }

  if (uploadStatus === "error") {
    return (
      <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-md">
        <p className="text-sm text-red-700 font-medium">
          &#10007; Validation failed
        </p>
        <p className="text-xs text-red-600 mt-1">
          Please check the console for details on the errors.
        </p>
      </div>
    );
  }

  return null;
}
