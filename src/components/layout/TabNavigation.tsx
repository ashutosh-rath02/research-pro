import React from 'react';
import { StickyNote, Network } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'notes' | 'mindmap';
  onTabChange: (tab: 'notes' | 'mindmap') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="border-b">
      <nav className="flex">
        <button
          onClick={() => onTabChange('notes')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 ${
            activeTab === 'notes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          <StickyNote className="w-4 h-4" />
          Notes
        </button>
        <button
          onClick={() => onTabChange('mindmap')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 ${
            activeTab === 'mindmap'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          <Network className="w-4 h-4" />
          Mind Map
        </button>
      </nav>
    </div>
  );
};