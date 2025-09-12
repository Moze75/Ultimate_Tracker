import React from 'react';

interface WebResourcesTabProps {
  player?: any;
  onUpdate?: (player: any) => void;
}

export function WebResourcesTab({ player, onUpdate }: WebResourcesTabProps) {
  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Ressources Web</h2>
      <p className="text-gray-300">Liens vers des ressources D&D utiles en cours de développement...</p>
    </div>
  );
}