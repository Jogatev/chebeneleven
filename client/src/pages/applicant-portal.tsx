import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/utils";
import { getFullApiPath } from "@/lib/utils";
import { API_ENDPOINTS } from "@shared/api-endpoints";
import { JobListing } from "@shared/schema";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MapPin, Calendar, DollarSign, Briefcase, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ApplicantPortal() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "a-z" | "z-a">("newest");

  const {
    data: jobs,
    isLoading,
    error
  } = useQuery<JobListing[]>({
    queryKey: [getFullApiPath(API_ENDPOINTS.JOBS.LIST)],
  });

  const filteredJobs = jobs ? jobs.filter(job => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = locationFilter === "" || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesJobType = jobTypeFilter === "" || 
      job.jobType.toLowerCase() === jobTypeFilter.toLowerCase();

    return matchesSearch && matchesLocation && matchesJobType;
  }) : [];

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "a-z":
        return a.title.localeCompare(b.title);
      case "z-a":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  const uniqueLocations = jobs ? [...new Set(jobs.map(job => job.location))].sort() : [];
  const uniqueJobTypes = jobs ? [...new Set(jobs.map(job => job.jobType))].sort() : [];

  const handleJobClick = (jobId: number) => {
    setLocation(`/application-form?jobId=${jobId}`);
  };

  const handleBackToHome = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showBackButton={true} onBackClick={handleBackToHome} />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading job listings...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showBackButton={true} onBackClick={handleBackToHome} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Jobs</h2>
            <p className="text-gray-600 mb-4">There was an error loading the job listings.</p>
            <Button onClick={handleBackToHome}>Back to Home</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton={true} onBackClick={handleBackToHome} />
      
      <main className="flex-grow p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Available Positions</h1>
            <p className="text-gray-600">Browse and apply for positions at 7-Eleven franchises</p>
          </div>

          <div className="mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Job Types</SelectItem>
                  {uniqueJobTypes.map((jobType) => (
                    <SelectItem key={jobType} value={jobType}>
                      {jobType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(value: "newest" | "oldest" | "a-z" | "z-a") => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="a-z">A-Z</SelectItem>
                  <SelectItem value="z-a">Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {sortedJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No jobs found</h3>
              <p className="text-gray-500">
                {searchQuery || locationFilter || jobTypeFilter 
                  ? "Try adjusting your search criteria"
                  : "No job listings are currently available"
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleJobClick(job.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {job.jobType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {job.description}
                    </p>
                    
                    <div className="space-y-2">
                      {job.department && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Briefcase className="h-4 w-4 mr-2" />
                          <span>{job.department}</span>
                        </div>
                      )}
                      
                      {job.payRange && (
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>{job.payRange}</span>
                        </div>
                      )}
                      
                      {job.closingDate && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Closes {new Date(job.closingDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button className="w-full mt-4">
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
