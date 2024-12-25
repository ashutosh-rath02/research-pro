import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { User, FolderKanban } from "lucide-react";
import { supabase } from "../../lib/supabase";

export const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900">
              PDF Notes & Mind Map
            </h1>
            <nav className="flex gap-4">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  location.pathname === "/"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <User className="w-4 h-4" />
                Workspace
              </Link>
              <Link
                to="/projects"
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  location.pathname === "/projects"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                Projects
              </Link>
            </nav>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
