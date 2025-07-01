import { Upload, FileText, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { UploadStatus } from "@/hooks/useCSVUpload";

interface FileDisplayProps {
  isUploading: boolean;
  uploadedFile: File | null;
  uploadStatus: UploadStatus;
  onClearFile: () => void;
}

export default function FileDisplay({
  isUploading,
  uploadedFile,
  uploadStatus,
  onClearFile,
}: FileDisplayProps) {
  if (isUploading) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-gray-600">Processing file...</p>
      </div>
    );
  }

  if (uploadedFile) {
    return (
      <div className="flex flex-col items-center space-y-2">
        {uploadStatus === "success" ? (
          <CheckCircle className="h-8 w-8 text-green-500" />
        ) : uploadStatus === "error" ? (
          <X className="h-8 w-8 text-red-500" />
        ) : (
          <FileText className="h-8 w-8 text-blue-500" />
        )}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {uploadedFile.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClearFile();
            }}
            className="h-6 w-6 p-0 dark:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          {(uploadedFile.size / 1024).toFixed(1)} KB
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Upload className="h-8 w-8 text-gray-400" />
      <div className="text-center">
        <p className="text-sm font-medium">
          Drop your CSV file here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">Max file size: 2MB</p>
      </div>
    </div>
  );
}
