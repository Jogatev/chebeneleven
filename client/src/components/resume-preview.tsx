import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, Download } from "lucide-react";

interface ResumePreviewProps {
  resumeUrl: string;
  fileName?: string;
  applicantName: string;
}

export default function ResumePreview({
  resumeUrl,
  fileName = "Resume",
  applicantName
}: ResumePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = () => {
    setIsLoading(true);
    setShowPreview(true);
    setIsLoading(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handlePreview}
          disabled={isLoading || !resumeUrl}
        >
          {isLoading ? (
            <span className="animate-spin mr-1">●</span>
          ) : (
            <Eye className="h-4 w-4 mr-1" />
          )}
          Preview
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleDownload}
          disabled={!resumeUrl}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <object
            data={resumeUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground mb-4">Preview not available for this file format</p>
              <Button onClick={handleDownload}>Download Resume</Button>
            </div>
          </object>
        </DialogContent>
      </Dialog>
    </>
  );
}