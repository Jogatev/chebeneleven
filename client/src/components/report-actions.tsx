import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { JobListing, Application } from "@shared/schema";

interface Column {
  header: string;
  accessor: string | ((row: any) => string);
}

interface ReportActionsProps {
  reportTitle: string;
  reportData?: any[];
  columns?: Column[];
  jobs?: JobListing[];
  applications?: Application[];
  dashboardStats?: {
    activeJobListings: number;
    positionsFilled: number;
    totalApplications: number;
    acceptedApplicants: number;
  };
  DashboardCharts?: React.ComponentType<{
    jobs: JobListing[];
    applications: Application[];
  }>;
}

export default function ReportActions({
  reportTitle,
  reportData = [],
  columns = [],
  jobs = [],
  applications = [],
  dashboardStats,
  DashboardCharts
}: ReportActionsProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: reportTitle,
    onAfterPrint: () => console.log("Print completed"),
  });

  // Parse and prettify JSON data
  const prettifyJSON = (jsonString: string) => {
    try {
      // Check if the value is a JSON string
      if (typeof jsonString === 'string' && 
         (jsonString.startsWith('{') || jsonString.startsWith('['))) {
        const parsed = JSON.parse(jsonString);
        
        // Format different data types appropriately
        if (parsed.applicantName && parsed.jobTitle) {
          return `Applicant: ${parsed.applicantName}\nJob: ${parsed.jobTitle}\n${parsed.previousStatus ? `Previous Status: ${parsed.previousStatus}\n` : ''}New Status: ${parsed.newStatus}`;
        }
        
        // For other JSON objects, return formatted key-value pairs
        return Object.entries(parsed)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      }
      return jsonString;
    } catch (e) {
      return jsonString;
    }
  };

  // Function to get cell value based on accessor
  const getCellValue = (row: any, accessor: string | ((row: any) => string)) => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    
    return row[accessor] !== undefined ? row[accessor] : '';
  };

  // Format date if it's a valid date string
  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Handle PDF export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Format current date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    const fullDateTime = `${formattedDate} ${formattedTime}`;
    
    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, 14, 22);
    
    // Add date with time
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${fullDateTime}`, 14, 30);
    
    // Add 7-Eleven logo text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 130, 72); // 7-Eleven green
    doc.text("7-ELEVEN", 170, 15);
    doc.setTextColor(255, 130, 0); // 7-Eleven orange
    doc.text("PHILIPPINES", 170, 22);
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont('helvetica', 'normal');
    
    // Add a horizontal line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);
    
    // Add dashboard stats summary if provided
    if (dashboardStats) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Dashboard Summary", 14, 45);
      doc.setFont('helvetica', 'normal');
      
      // Use different colors for different stats boxes
      const statColors = [
        [100, 149, 237], // Blue
        [106, 90, 205], // Purple
        [255, 165, 0],  // Orange
        [46, 139, 87]   // Green
      ];
      
      autoTable(doc, {
        head: [["Metric", "Value"]],
        body: [
          ["Active Jobs", dashboardStats.activeJobListings.toString()],
          ["Filled Positions", dashboardStats.positionsFilled.toString()],
          ["Total Applications", dashboardStats.totalApplications.toString()],
          ["Accepted Applicants", dashboardStats.acceptedApplicants.toString()]
        ],
        startY: 50,
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [0, 130, 72], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        bodyStyles: { textColor: [50, 50, 50] }
      });
    }
    
    // Add report data if available
    if (reportData.length > 0 && columns.length > 0) {
      const startY = dashboardStats ? (doc.lastAutoTable?.finalY || 100) + 15 : 45;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Report Data", 14, startY);
      
      // Extract column headers
      const headers = columns.map(col => col.header);
      
      // Prepare table data with formatted values
      const tableData = reportData.map(row => {
        return columns.map(col => {
          const value = getCellValue(row, col.accessor);
          
          // Format date strings if the column is a timestamp or date
          if (col.header.toLowerCase().includes('date') || col.accessor === 'timestamp') {
            return formatDate(value);
          }
          
          // For details column, format JSON data
          if (col.header === 'Details' || col.accessor === 'details') {
            return prettifyJSON(value);
          }
          
          return value;
        });
      });
      
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: startY + 5,
        styles: { 
          fontSize: 9, 
          cellPadding: 4,
          overflow: 'linebreak',
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [0, 102, 51], 
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 35 }, // Action column
          1: { cellWidth: 20 }, // Entity Type column
          2: { cellWidth: 'auto' } // Details column (auto width)
        },
        alternateRowStyles: { fillColor: [245, 250, 245] },
        bodyStyles: { textColor: [50, 50, 50] },
        didDrawCell: (data) => {
          // Add proper cell padding for better text appearance
          if (data.column.index === 2 && data.cell.section === 'body') {
            // For the details column, apply additional formatting
            doc.setFontSize(8);
          }
        }
      });
    }
    
    // Add job listings with application counts
    if (jobs.length > 0) {
      // Calculate startY based on previous content
      const startY = doc.lastAutoTable?.finalY 
        ? (doc.lastAutoTable.finalY + 15) 
        : 100;
        
      // Check if we need a new page
      if (startY > 240) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Job Listings", 14, 20);
      } else {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Job Listings", 14, startY);
      }
      
      // Prepare job data with application count
      const jobData = jobs.map(job => {
        const jobApps = applications.filter(app => app.jobId === job.id);
        const interviewing = jobApps.filter(app => app.status === "under_review" || app.status === "interview").length;
        
        return [
          job.title,
          job.location,
          job.status,
          jobApps.length.toString(),
          interviewing.toString(),
          job.jobType,
          job.payRange || "Not specified"
        ];
      });
      
      autoTable(doc, {
        head: [["Job Title", "Location", "Status", "Applications", "Interviewing", "Type", "Pay Range"]],
        body: jobData,
        startY: (startY > 240) ? 25 : startY + 5,
        styles: { 
          fontSize: 9, 
          cellPadding: 4,
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [0, 102, 51], 
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [245, 250, 245] },
        bodyStyles: { textColor: [50, 50, 50] }
      });
    }
    
    // Add a detailed job-applications breakdown if we have both
    if (jobs.length > 0 && applications.length > 0) {
      // Add a new page for detailed breakdown
      doc.addPage();
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("Detailed Job Application Breakdown", 14, 20);
      doc.setFont('helvetica', 'normal');
      
      let currentY = 30;
      
      // Loop through each job and show its applications
      jobs.forEach(job => {
        const jobApps = applications.filter(app => app.jobId === job.id);
        
        // If we're too close to the bottom of the page, add a new page
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }
        
        // Job title and stats
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 130, 72); // 7-Eleven green
        doc.text(`${job.title} (${job.status})`, 14, currentY);
        doc.setTextColor(0, 0, 0); // Reset to black
        doc.setFont('helvetica', 'normal');
        
        doc.setFontSize(10);
        doc.text(`Location: ${job.location}`, 14, currentY + 7);
        doc.text(`Applications: ${jobApps.length}`, 14, currentY + 14);
        
        currentY += 25;
        
        // If the job has applications, list them
        if (jobApps.length > 0) {
          const appData = jobApps.map(app => [
            app.applicantName,
            app.status,
            new Date(app.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            app.email || "Not provided",
            app.phone || "Not provided"
          ]);
          
          autoTable(doc, {
            head: [["Applicant", "Status", "Applied Date", "Email", "Phone"]],
            body: appData,
            startY: currentY,
            styles: { fontSize: 9, cellPadding: 4, lineWidth: 0.1 },
            headStyles: { fillColor: [255, 122, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [255, 245, 235] },
            bodyStyles: { textColor: [50, 50, 50] }
          });
          
          currentY = doc.lastAutoTable?.finalY || currentY + 50;
        } else {
          doc.text("No applications for this position", 14, currentY);
          currentY += 15;
        }
        
        // Add a divider
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(14, currentY + 5, 196, currentY + 5);
        currentY += 15;
      });
    }
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(14, doc.internal.pageSize.height - 15, 196, doc.internal.pageSize.height - 15);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount} - 7-Eleven Franchisee Report`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
    
    // Save PDF with timestamp in filename
    const dateForFile = now.toISOString().split('T')[0];
    const timeForFile = now.toTimeString().split(' ')[0].replace(/:/g, '-').substring(0, 5);
    doc.save(`${reportTitle.replace(/\s+/g, '_')}_${dateForFile}_${timeForFile}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePrint}
        className="flex items-center gap-1"
      >
        <Printer className="h-4 w-4" />
        Print
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportPDF}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        Export PDF
      </Button>
      
      {/* This div will be used for printing but is hidden on screen */}
      <div className="hidden">
        <div ref={reportRef} className="p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <div className="font-bold">
                <span className="text-[#008c48]">7-ELEVEN</span>
                <span className="text-[#ff7a00] ml-1">PHILIPPINES</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold">{reportTitle}</h1>
            <p className="text-gray-500">
              Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          {/* Dashboard Stats */}
          {dashboardStats && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Dashboard Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-blue-800 font-medium text-sm mb-1">Active Job Listings</h3>
                  <p className="text-2xl font-bold text-blue-900">
                    {dashboardStats.activeJobListings}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <h3 className="text-purple-800 font-medium text-sm mb-1">Positions Filled</h3>
                  <p className="text-2xl font-bold text-purple-900">
                    {dashboardStats.positionsFilled}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <h3 className="text-orange-800 font-medium text-sm mb-1">Total Applications</h3>
                  <p className="text-2xl font-bold text-orange-900">
                    {dashboardStats.totalApplications}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-green-800 font-medium text-sm mb-1">Accepted Applicants</h3>
                  <p className="text-2xl font-bold text-green-900">
                    {dashboardStats.acceptedApplicants}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Report Data */}
          {reportData.length > 0 && columns.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-800 text-white">
                    {columns.map((column, idx) => (
                      <th key={idx} className="border p-2 text-left">{column.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      {columns.map((column, colIdx) => {
                        const value = getCellValue(row, column.accessor);
                        
                        // Format based on column type
                        let displayValue = value;
                        
                        // Format date columns
                        if (column.header.toLowerCase().includes('date') || 
                          column.accessor === 'timestamp') {
                          displayValue = formatDate(value);
                        }
                        
                        // Format JSON data in details column
                        if (column.header === 'Details' || column.accessor === 'details') {
                          const prettyValue = prettifyJSON(value);
                          
                          // Replace newlines with <br> for HTML display
                          if (typeof prettyValue === 'string' && prettyValue.includes('\n')) {
                            return (
                              <td key={colIdx} className="border p-2 whitespace-pre-wrap">
                                {prettyValue.split('\n').map((line, i) => (
                                  <div key={i}>{line}</div>
                                ))}
                              </td>
                            );
                          }
                          displayValue = prettyValue;
                        }
                        
                        return (
                          <td key={colIdx} className="border p-2">
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Dashboard Charts */}
          {DashboardCharts && jobs && applications && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Analytics Charts</h2>
              <DashboardCharts jobs={jobs} applications={applications} />
            </div>
          )}
          
          {/* Job Listings */}
          {jobs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Job Listings</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-800 text-white">
                    <th className="border p-2 text-left">Job Title</th>
                    <th className="border p-2 text-left">Location</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Applications</th>
                    <th className="border p-2 text-left">Interviewing</th>
                    <th className="border p-2 text-left">Job Type</th>
                    <th className="border p-2 text-left">Pay Range</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => {
                    const jobApps = applications.filter(app => app.jobId === job.id);
                    const interviewing = jobApps.filter(app => 
                      app.status === "under_review" || app.status === "interview"
                    ).length;
                    
                    return (
                      <tr key={job.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="border p-2">{job.title}</td>
                        <td className="border p-2">{job.location}</td>
                        <td className="border p-2">{job.status}</td>
                        <td className="border p-2">{jobApps.length}</td>
                        <td className="border p-2">{interviewing}</td>
                        <td className="border p-2">{job.jobType}</td>
                        <td className="border p-2">{job.payRange || "Not specified"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Detailed Job Applications Breakdown */}
          {jobs.length > 0 && applications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Detailed Job Application Breakdown</h2>
              {jobs.map(job => {
                const jobApps = applications.filter(app => app.jobId === job.id);
                return (
                  <div key={job.id} className="mb-8">
                    <h3 className="text-lg font-medium text-green-800">{job.title} ({job.status})</h3>
                    <p className="mb-1">Location: {job.location}</p>
                    <p className="mb-4">Applications: {jobApps.length}</p>
                    
                    {jobApps.length > 0 ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-orange-500 text-white">
                            <th className="border p-2 text-left">Applicant</th>
                            <th className="border p-2 text-left">Status</th>
                            <th className="border p-2 text-left">Applied Date</th>
                            <th className="border p-2 text-left">Email</th>
                            <th className="border p-2 text-left">Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobApps.map((app, idx) => (
                            <tr key={app.id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                              <td className="border p-2">{app.applicantName}</td>
                              <td className="border p-2">{app.status}</td>
                              <td className="border p-2">{new Date(app.createdAt).toLocaleDateString()}</td>
                              <td className="border p-2">{app.email || "Not provided"}</td>
                              <td className="border p-2">{app.phone || "Not provided"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="italic text-gray-500">No applications for this position</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}