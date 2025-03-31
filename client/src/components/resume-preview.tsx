import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, Eye, Download, AlertTriangle } from "lucide-react";

interface ResumePreviewProps {
  resumeUrl: string;
  fileName?: string;
}

export default function ResumePreview({
  resumeUrl,
  fileName = "Resume",
}: ResumePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = () => {
    setIsLoading(true);
    
    // Check if it's a PDF before attempting to preview
    if (resumeUrl.toLowerCase().endsWith('.pdf')) {
      setShowPreview(true);
    } else {
      setShowError(true);
    }
    
    setIsLoading(false);
  };

  const handleDownload = () => {
    // Create an anchor to download the file
    const anchor = document.createElement('a');
    anchor.href = resumeUrl;
    anchor.download = fileName || 'resume.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
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

      {/* PDF Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 mt-4 relative border rounded">
            <iframe
              src={`${resumeUrl}#toolbar=0&view=FitH`}
              className="w-full h-full"
              title="Resume Preview"
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setShowPreview(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Alert */}
      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cannot Preview File
            </AlertDialogTitle>
            <AlertDialogDescription>
              This file type cannot be previewed. Please download the file to view its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDownload}>
              Download Instead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}