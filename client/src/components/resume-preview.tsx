import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();

  const handlePreview = () => {
    setIsLoading(true);
    setShowPreview(true);
    setIsLoading(false);
  };

  const handleDownload = async () => {
    try {
      // Get the original PDF
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      
      // For direct PDF modification, we'd typically need a library like PDF.js or jspdf
      // For this implementation, we'll create a simple approach that works for browsers
      // by creating a new document with the header/footer and embedding the PDF
      
      // Create a new HTML document
      const downloadDateTime = format(new Date(), "PPP 'at' pp");
      const franchiseeName = user?.franchiseeName || "7-Eleven Franchise";
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${fileName}</title>
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            .header, .footer { 
              padding: 10px; 
              background: #f3f4f6; 
              text-align: center;
              font-size: 10px;
              color: #4b5563;
              border-bottom: 1px solid #e5e7eb;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .footer { 
              position: fixed;
              bottom: 0;
              width: 100%;
              border-top: 1px solid #e5e7eb;
              border-bottom: none;
            }
            .content { 
              padding: 15px 0;
              height: calc(100vh - 80px);
            }
            .pdf-container {
              width: 100%;
              height: 100%;
              border: none;
            }
            .logo {
              height: 30px;
            }
            .applicant-info {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <img class="logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/7-eleven_logo.svg/1200px-7-eleven_logo.svg.png" alt="7-Eleven Logo" />
            </div>
            <div class="applicant-info">
              ${applicantName}
            </div>
            <div>
              Downloaded by: ${franchiseeName}
            </div>
          </div>
          
          <div class="content">
            <iframe class="pdf-container" src="${URL.createObjectURL(blob)}"></iframe>
          </div>
          
          <div class="footer">
            <div>Downloaded on: ${downloadDateTime}</div>
            <div>This document is confidential and for internal use only.</div>
          </div>
          
          <script>
            // Print the document automatically
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `;
      
      // Create a Blob from the HTML content
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      
      // Create a URL for the Blob
      const htmlUrl = URL.createObjectURL(htmlBlob);
      
      // Open the HTML document in a new window
      const printWindow = window.open(htmlUrl, '_blank');
      
      // Clean up the URL object after the window is closed
      if (printWindow) {
        printWindow.onafterprint = function() {
          URL.revokeObjectURL(htmlUrl);
        };
      }
      
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
