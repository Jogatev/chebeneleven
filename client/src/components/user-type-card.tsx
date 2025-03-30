import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface UserTypeCardProps {
  title: string;
  description: string;
  buttonText: string;
  iconColor: string;
  icon: ReactNode;
  onClick: () => void;
}

export default function UserTypeCard({
  title,
  description,
  buttonText,
  iconColor,
  icon,
  onClick
}: UserTypeCardProps) {
  return (
    <div 
      className="bg-neutral-100 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <div className={`w-20 h-20 ${iconColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button 
        className={`${iconColor} hover:opacity-90 transition-colors`}
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </div>
  );
}
