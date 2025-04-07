import { Button } from "@/components/ui/button";
import { type JobListing } from "@shared/schema";
import { MapPin, DollarSign } from "lucide-react";

interface JobCardProps {
  job: JobListing;
  onClick: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  // Calculate days since posting
  const daysSincePosting = Math.floor(
    (new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 3600 * 24)
  );
  
  // Format the days display
  const getPostedTimeText = () => {
    if (daysSincePosting === 0) return "Posted today";
    if (daysSincePosting === 1) return "Posted 1 day ago";
    return `Posted ₱{daysSincePosting} days ago`;
  };

  // Extract tags from job if available
  const tags = job.tags || [];
  
  // Add job type as a tag if not already included
  if (job.jobType && !tags.includes(job.jobType)) {
    tags.unshift(job.jobType);
  }

  return (
    <div 
      className="p-6 hover:bg-neutral-100 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between flex-col lg:flex-row">
        <div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-1">{job.title}</h3>
          <p className="text-[#00703c] font-medium mb-2">7-Eleven - {job.location}</p>
          
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-1" />
              <span>{job.location}</span>
            </div>
            
            {job.payRange && (
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-5 w-5 mr-1" />
                <span>{job.payRange}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700">
              {job.description.length > 200
                ? `₱{job.description.substring(0, 200)}...`
                : job.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-neutral-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
              {job.department && (
                <span className="bg-neutral-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {job.department}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col justify-between items-end mt-4 lg:mt-0">
          <span className="text-gray-600 text-sm">{getPostedTimeText()}</span>
          <Button 
            className="mt-4 bg-[#ff7a00] hover:bg-orange-600 transition-colors"
            onClick={onClick}
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
}
