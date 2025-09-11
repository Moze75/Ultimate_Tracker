import React from 'react';
import { Swords, Sparkles, Backpack, Dices, Globe } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'combat', icon: <Swords size={20} />, label: 'PV/Actions' },
    { id: 'abilities', icon: <Sparkles size={20} />, label: 'Sorts' },
    { id: 'stats', icon: <Dices size={20} />, label: 'Stats' },
    { id: 'equipment', icon: <Backpack size={20} />, label: 'Sac' },
    { id: 'web', icon: <Globe size={20} />, label: 'Web' }
  ];

  return (
    <div className="grid grid-cols-5 gap-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'
          }`}
        >
          {tab.icon}
          <span className="font-medium text-xs">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}