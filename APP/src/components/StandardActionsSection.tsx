import React from 'react';
import { Sword, Shield, Eye, Users } from 'lucide-react';
import { DiceRoller } from './DiceRoller';

interface StandardActionsSectionProps {
  player?: any;
  onUpdate?: (player: any) => void;
}

export function StandardActionsSection({ player, onUpdate }: StandardActionsSectionProps) {
  const standardActions = [
    {
      name: 'Attaque',
      icon: <Sword className="w-4 h-4" />,
      description: 'Effectuer une attaque au corps à corps ou à distance',
      dice: '1d20'
    },
    {
      name: 'Défense',
      icon: <Shield className="w-4 h-4" />,
      description: 'Se concentrer sur la défense pour augmenter la CA',
      dice: null
    },
    {
      name: 'Perception',
      icon: <Eye className="w-4 h-4" />,
      description: 'Chercher des indices ou détecter des créatures cachées',
      dice: '1d20'
    },
    {
      name: 'Aide',
      icon: <Users className="w-4 h-4" />,
      description: 'Aider un allié dans sa prochaine action',
      dice: null
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Actions Standard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {standardActions.map((action) => (
          <div
            key={action.name}
            className="bg-gray-700 rounded-lg p-4 border border-gray-600"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-blue-400">
                {action.icon}
              </div>
              <h4 className="text-white font-medium">{action.name}</h4>
              {action.dice && (
                <DiceRoller 
                  dice={action.dice} 
                  label={action.name}
                />
              )}
            </div>
            <p className="text-gray-300 text-sm">{action.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}