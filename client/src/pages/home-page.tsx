import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/header";
import UserTypeCard from "@/components/user-type-card";

export default function HomePage() {
  const [, setLocation] = useLocation();

  const handleApplicantSelect = () => {
    setLocation("/applicant");
  };

  const handleFranchiseeSelect = () => {
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton={false} />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 sm:p-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-6">
              Welcome to 7-Eleven Careers
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              Select how you'd like to proceed
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <UserTypeCard 
                title="I'm a Job Seeker"
                description="Browse and apply for positions at 7-Eleven franchises"
                buttonText="Find Jobs"
                iconColor="bg-[#00703c]" // 7-Eleven green
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                onClick={handleApplicantSelect}
              />
              
              <UserTypeCard
                title="I'm a Franchisee"
                description="Manage job postings and review applications"
                buttonText="Manage Jobs"
                iconColor="bg-[#ff7a00]" // 7-Eleven orange
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                onClick={handleFranchiseeSelect}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
