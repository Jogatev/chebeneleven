import React, { useState, useRef } from 'react';
import { UploadIcon, Loader2, FileIcon, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onFileUploadError: (error: string) => void;
  isUploading?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function FileUpload({
  onFileUpload,
  onFileUploadError,
  isUploading = false,
  accept = "application/pdf,.pdf,.doc,.docx,application/vnd.ms-word,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  maxSize = 5, // 5MB default
  className,
  value,
  onChange
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = [
      'pdf', 'doc', 'docx',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type) && !validTypes.includes(file.name.split('.').pop()?.toLowerCase() || '')) {
      onFileUploadError(`Invalid file type. Please upload ${accept} files.`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onFileUploadError(`File size exceeds ${maxSize}MB limit.`);
      return;
    }

    setFileName(file.name);
    onFileUpload(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-md p-4 sm:p-6 text-center cursor-pointer transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        capture={isMobile ? "environment" : undefined}
        className="hidden"
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-2 sm:py-4">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Uploading resume...</p>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center justify-center py-2 sm:py-4">
          <FileIcon className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 mb-2" />
          <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">{fileName}</p>
          <p className="text-xs text-muted-foreground mt-1">{isMobile ? "Tap to replace" : "Click or drag to replace"}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-2 sm:py-4">
          {isMobile ? (
            <>
              <div className="flex space-x-4 mb-2">
                <FileIcon className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                <Camera className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Tap to upload resume</p>
              <p className="text-xs text-muted-foreground mt-1">You can take a photo or select a file</p>
            </>
          ) : (
            <>
              <UploadIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drag & drop your resume here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            </>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {accept.split(',').join(', ')} files up to {maxSize}MB
          </p>
        </div>
      )}
    </div>
  );
}