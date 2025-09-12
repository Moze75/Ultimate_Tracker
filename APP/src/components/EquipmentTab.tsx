import React from 'react';
import { Player } from '../types/dnd';

interface EquipmentTabProps {
  player: Player;
  onUpdate: (player: Player) => void;
}

export function EquipmentTab({ player, onUpdate }: EquipmentTabProps) {
  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Équipement</h2>
      <p className="text-gray-300">Interface d'équipement en cours de développement...</p>
    </div>
  );
}