import React from "react";

interface HeaderProps {
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSignOut }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          PDF Notes & Mind Map
        </h1>
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
