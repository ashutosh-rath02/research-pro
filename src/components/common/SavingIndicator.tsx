import React from "react";
import { Loader2 } from "lucide-react";

interface SavingIndicatorProps {
  saving: boolean;
}

export const SavingIndicator: React.FC<SavingIndicatorProps> = ({ saving }) => {
  if (!saving) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm text-gray-600">Saving project...</span>
    </div>
  );
};
