import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CollapsiblePanelProps {
  children: React.ReactNode;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`relative transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-1/2'}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute left-0 top-1/2 -translate-x-1/2 transform bg-white p-2 rounded-full shadow-lg z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
      <div className={`h-full overflow-hidden ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    </div>
  );
};