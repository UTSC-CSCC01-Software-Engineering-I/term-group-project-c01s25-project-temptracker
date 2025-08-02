import { useState, useRef } from "react";
import { Camera, UserRound } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import Image from "next/image";

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  onFileChange?: (file: File | null) => void;
  selectedFile?: File | null | undefined;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  onFileChange,
  selectedFile,
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "image/jpeg") {
      alert("Please select a JPEG image file");
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent component
    if (onFileChange) {
      onFileChange(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileChange) {
      onFileChange(null);
    }
  };

  // Show preview if new file selected, otherwise show current image unless removal is pending
  const displayImage =
    previewUrl || (selectedFile === null ? null : currentImageUrl);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        {/* Profile Picture Display */}
        <div className="relative">
          {displayImage ? (
            <Image
              src={displayImage}
              alt="Profile"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-muted-foreground/50 shadow-sm">
              <UserRound className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Camera Icon Overlay */}
          <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer transition-all shadow-lg hover:bg-primary/85 duration-300">
            <Camera className="w-4 h-4" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Upload Instructions */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Click the camera icon to select a new profile picture
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max file size: 2MB • Supported: JPG
          </p>
          {displayImage && (
            <Button
              variant="link"
              onClick={handleRemove}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Remove profile picture
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
