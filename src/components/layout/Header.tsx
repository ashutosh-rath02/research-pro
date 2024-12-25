import React from "react";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  onSignOut: () => void;
  projectName?: string;
  onBackToProjects?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSignOut,
  projectName,
  onBackToProjects,
}) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {projectName && onBackToProjects && (
            <button
              onClick={onBackToProjects}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4" />
              Projects
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {projectName || "PDF Notes & Mind Map"}
          </h1>
        </div>
        <button
          onClick={onSignOut}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Sign out
        </button>
      </div>
    </header>
  );
};
