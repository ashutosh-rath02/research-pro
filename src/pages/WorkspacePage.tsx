/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFViewer } from "../components/PDFViewer";
import { NotesPanel } from "../components/NotesPanel";
import { MindMap } from "../components/MindMap";
import { CollapsiblePanel } from "../components/layout/CollapsiblePanel";
import { TabNavigation } from "../components/layout/TabNavigation";
import { Save } from "lucide-react";
import { useStore } from "../store/useStore";
import { useProjectStore } from "../store/useProjectStore";

export const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"notes" | "mindmap">("notes");
  const { pdfFile, notes, nodes, edges, saveToProject } = useStore();
  const { createProject } = useProjectStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleSave = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF first");
      return;
    }

    setShowSaveDialog(true);
    setProjectName(pdfFile.name.replace(".pdf", ""));
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    setIsSaving(true);
    try {
      const projectId = await createProject(projectName, projectDescription);
      await saveToProject(projectId);
      setShowSaveDialog(false);
      navigate("/projects");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div>
        {pdfFile && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save as Project"}
            </button>
          </div>
        )}

        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          <PDFViewer />
          <CollapsiblePanel>
            <div className="h-full bg-white rounded-lg shadow-sm">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="h-[calc(100%-3rem)]">
                {activeTab === "notes" ? <NotesPanel /> : <MindMap />}
              </div>
            </div>
          </CollapsiblePanel>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Save Project
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label
                  htmlFor="projectDescription"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description (optional)
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter project description"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
