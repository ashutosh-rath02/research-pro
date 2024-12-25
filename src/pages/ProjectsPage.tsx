import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Folder, Calendar, Eye, Trash2 } from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import { useStore } from "../store/useStore";

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading, error, fetchProjects, deleteProject } =
    useProjectStore();
  const { loadFromProject, resetWorkspace } = useStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleOpenProject = async (projectId: string) => {
    try {
      await loadFromProject(projectId);
      navigate("/");
    } catch (error) {
      console.error("Failed to load project:", error);
      alert("Failed to load project. Please try again.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      try {
        await deleteProject(projectId);
        resetWorkspace();
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-sm text-gray-600">
          {projects.length}/3 Projects Used
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpenProject(project.id)}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                      title="Open project"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1" title="PDF files">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{project.note_count}</span>
                  </div>
                </div>

                {project.total_size && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            (project.total_size / (10 * 1024 * 1024)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatFileSize(project.total_size)} / 10 MB
                    </span>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 text-sm text-gray-500 rounded-b-lg">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg">
              <Folder className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No projects yet
              </h3>
              <p className="mt-2 text-gray-500">
                Start by creating a project in the workspace.
                <br />
                You can create up to 3 projects, each limited to 10MB.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
