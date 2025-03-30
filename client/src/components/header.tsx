import { Link } from "wouter";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backText?: string;
  showLogout?: boolean;
  onLogout?: () => void;
  franchiseeName?: string;
  franchiseeId?: string;
}

export default function Header({
  title = "Careers",
  showBackButton = false,
  onBackClick,
  backText = "Back",
  showLogout = false,
  onLogout,
  franchiseeName,
  franchiseeId,
}: HeaderProps) {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/7-eleven_logo.svg/1200px-7-eleven_logo.svg.png" 
                alt="7-Eleven Logo" 
                className="h-10" 
              />
              <span className="ml-3 text-2xl font-bold text-neutral-800">{title}</span>
            </a>
          </Link>
        </div>
        
        {showBackButton && (
          <button 
            onClick={onBackClick}
            className="text-neutral-800 hover:text-[#00703c] transition-colors"
          >
            <span className="hidden md:inline mr-2">{backText}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 inline" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        )}
        
        {showLogout && (
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              {franchiseeName && <p className="text-sm text-gray-600">{franchiseeName}</p>}
              {franchiseeId && <p className="text-sm font-medium text-neutral-800">ID: {franchiseeId}</p>}
            </div>
            <button 
              onClick={onLogout}
              className="text-[#ee2722] hover:text-red-600 transition-colors flex items-center"
            >
              <span className="hidden md:inline mr-2">Sign Out</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
