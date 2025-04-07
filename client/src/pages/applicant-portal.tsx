import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { Checkbox } from "@/components/ui/checkbox";
import JobCard from "@/components/job-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { type JobListing } from "@shared/schema";

export default function ApplicantPortal() {
  const [, setLocation] = useLocation();
  const [keyword, setKeyword] = useState("");
  const [location, setLocationFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  // Fetch job listings
  const { data: jobs, isLoading, error } = useQuery<JobListing[]>({
    queryKey: ["/api/jobs"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would make an API call with filters
    // For this demo, we'll just log the search params
    console.log("Searching for:", { keyword, location });
  };

  // Handle job card click to navigate to application form
  const handleJobSelect = (jobId: number) => {
    setLocation(`/apply/${jobId}`);
  };

  // Handle back button click
  const handleBackToSelection = () => {
    setLocation("/");
  };

  // Filter and sort jobs
  const filteredJobs = jobs 
  ? jobs.filter(job => {
      const matchesKeyword = !keyword || keyword === "all" || 
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(keyword.toLowerCase());
      
      const matchesLocation = !location || 
        job.location.toLowerCase().includes(location.toLowerCase());
      
      return matchesKeyword && matchesLocation;
    })
  : [];

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOrder === "relevance") {
      // Simple relevance sorting (just an example)
      return a.title.localeCompare(b.title);
    } else { // "a-z"
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        showBackButton={true} 
        onBackClick={handleBackToSelection} 
        backText="Back to Selection"
      />

      <main className="flex-grow p-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Banner with Search */}
          <div className="bg-[#00703c] text-white rounded-lg p-6 md:p-10 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Career at 7-Eleven</h1>
            <p className="text-lg mb-6">Discover opportunities with 7-Eleven franchisees in your area</p>
            
            {/* Search and Filter Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-lg p-4 text-neutral-800">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <Select value={keyword} onValueChange={setKeyword}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        {jobs?.map(job => (
                          <SelectItem key={job.id} value={job.title}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <Input
                      placeholder="City or province in Philippines"
                      value={location}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        placeholder="Min salary"
                        value={minSalary}
                        onChange={(e) => setMinSalary(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Max salary"
                        value={maxSalary}
                        onChange={(e) => setMaxSalary(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#00703c] hover:bg-green-700 transition-colors"
                  >
                    Search Jobs
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Job Listings Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-neutral-800">Available Positions</h2>
                <div className="flex space-x-2">
                  <Select
                    value={sortOrder}
                    onValueChange={(value) => setSortOrder(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Sort by: Newest</SelectItem>
                      <SelectItem value="relevance">Sort by: Relevance</SelectItem>
                      <SelectItem value="a-z">Sort by: A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                // Loading skeletons
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-6">
                    <div className="flex justify-between">
                      <div className="w-3/4">
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-40 mb-4" />
                        <Skeleton className="h-20 w-full mb-3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Skeleton className="h-4 w-24 mb-4" />
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-red-500">Error loading jobs. Please try again later.</p>
                </div>
              ) : sortedJobs.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No job listings found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                sortedJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onClick={() => handleJobSelect(job.id)} 
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {jobs && jobs.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    Showing 1-{Math.min(sortedJobs.length, jobs.length)} of {jobs.length} jobs
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      disabled={true} // First page in this demo
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={sortedJobs.length >= jobs.length} // Last page in this demo
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
