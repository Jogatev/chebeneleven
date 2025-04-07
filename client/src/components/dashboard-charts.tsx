import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { JobListing, Application } from "@shared/schema";

interface DashboardChartsProps {
  jobs: JobListing[];
  applications: Application[];
}

// Status colors
const STATUS_COLORS = {
  active: "#22c55e", // green-500
  filled: "#3b82f6", // blue-500
  closed: "#6b7280", // gray-500
  submitted: "#f59e0b", // amber-500
  under_review: "#8b5cf6", // violet-500
  interviewed: "#0ea5e9", // sky-500
  accepted: "#10b981", // emerald-500
  rejected: "#ef4444" // red-500
};

export default function DashboardCharts({ jobs, applications }: DashboardChartsProps) {
  // Format data for job status chart
  const jobStatusData = useMemo(() => {
    const statusCounts = {
      active: 0,
      filled: 0,
      closed: 0
    };
    
    jobs.forEach(job => {
      if (statusCounts.hasOwnProperty(job.status)) {
        statusCounts[job.status as keyof typeof statusCounts]++;
      }
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));
  }, [jobs]);

  // Format data for application status chart
  const applicationStatusData = useMemo(() => {
    const statusCounts = {
      submitted: 0,
      under_review: 0,
      interviewed: 0,
      accepted: 0,
      rejected: 0
    };
    
    applications.forEach(app => {
      if (statusCounts.hasOwnProperty(app.status)) {
        statusCounts[app.status as keyof typeof statusCounts]++;
      }
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      count
    }));
  }, [applications]);

  // Format data for applications over time
  const applicationsOverTimeData = useMemo(() => {
    if (!applications.length) return [];
    
    // Create a map of dates to application counts
    const dateMap = new Map();
    
    // Get date ranges (up to 14 days)
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    // Initialize all dates in range
    for (let d = new Date(twoWeeksAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }
    
    // Add application counts
    applications.forEach(app => {
      const dateStr = new Date(app.submittedAt).toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        dateMap.set(dateStr, dateMap.get(dateStr) + 1);
      }
    });
    
    // Convert map to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ 
        date, 
        applications: count,
        // Format date for display
        displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [applications]);

  // Format data for applications per job
  const applicationsPerJobData = useMemo(() => {
    if (!jobs.length || !applications.length) return [];
    
    const jobApplicationCounts = new Map();
    jobs.forEach(job => {
      jobApplicationCounts.set(job.id, {
        jobTitle: job.title,
        applications: 0
      });
    });
    
    applications.forEach(app => {
      if (jobApplicationCounts.has(app.jobId)) {
        const current = jobApplicationCounts.get(app.jobId);
        current.applications += 1;
        jobApplicationCounts.set(app.jobId, current);
      }
    });
    
    return Array.from(jobApplicationCounts.values())
      .filter(item => item.applications > 0)
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5); // Top 5 jobs by applications
  }, [jobs, applications]);

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

  // If no data, show placeholder
  if (jobs.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data available to display charts.</p>
        <p className="text-sm text-gray-400 mt-2">Create job listings to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-md font-semibold mb-4">Job Listings by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ status, count, percent }) => 
                    `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.status.toLowerCase() as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-md font-semibold mb-4">Applications by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={applicationStatusData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Applications" fill="#8884d8">
                  {applicationStatusData.map((entry, index) => {
                    const status = entry.status.toLowerCase().replace(' ', '_');
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[status as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-md font-semibold mb-4">Applications Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={applicationsOverTimeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12 }}
                  interval={Math.ceil(applicationsOverTimeData.length / 7) - 1}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#ff7a00" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications per Job */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-md font-semibold mb-4">Top Jobs by Applications</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={applicationsPerJobData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis 
                  type="category" 
                  dataKey="jobTitle" 
                  tick={{ fontSize: 12 }}
                  width={150}
                />
                <Tooltip />
                <Bar dataKey="applications" name="Applications" fill="#ff7a00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}