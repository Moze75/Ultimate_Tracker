import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const CONDITIONS = [
  { name: 'Aveuglé', description: 'Vous ne pouvez pas voir et ratez automatiquement tous les jets qui nécessitent la vue.' },
  { name: 'Charmé', description: 'Vous ne pouvez pas attaquer le charmeur ni le cibler avec des capacités hostiles.' },
  { name: 'Assourdi', description: 'Vous ne pouvez pas entendre et ratez automatiquement tous les jets qui nécessitent l\'ouïe.' },
  { name: 'Effrayé', description: 'Vous avez le désavantage aux jets de caractéristique et d\'attaque.' },
  { name: 'Empoigné', description: 'Votre vitesse devient 0 et ne peut pas bénéficier de bonus.' },
  { name: 'Neutralisé', description: 'Vous ne pouvez pas entreprendre d\'actions ni de réactions.' },
  { name: 'Empoisonné', description: 'Vous avez le désavantage aux jets d\'attaque et de caractéristique.' },
  { name: 'À terre', description: 'Vous ne pouvez vous déplacer qu\'en rampant.' },
  { name: 'Entravé', description: 'Votre vitesse devient 0 et vous avez le désavantage aux jets de Dextérité.' },
  { name: 'Étourdi', description: 'Vous êtes neutralisé et ne pouvez vous déplacer.' },
  { name: 'Inconscient', description: 'Vous êtes neutralisé et à terre, et ne percevez pas votre environnement.' }
];

interface ConditionsSectionProps {
  conditions?: string[];
  onConditionsChange?: (conditions: string[]) => void;
}

export function ConditionsSection({ conditions = [], onConditionsChange }: ConditionsSectionProps) {
  const [showAddCondition, setShowAddCondition] = useState(false);

  const addCondition = (conditionName: string) => {
    if (!conditions.includes(conditionName)) {
      const newConditions = [...conditions, conditionName];
      onConditionsChange?.(newConditions);
    }
    setShowAddCondition(false);
  };

  const removeCondition = (conditionName: string) => {
    const newConditions = conditions.filter(c => c !== conditionName);
    onConditionsChange?.(newConditions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">États</h3>
        <button
          onClick={() => setShowAddCondition(!showAddCondition)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {conditions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {conditions.map((condition) => (
            <div
              key={condition}
              className="bg-red-900/30 border border-red-500/50 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm font-medium">{condition}</span>
              <button
                onClick={() => removeCondition(condition)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddCondition && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Ajouter un état</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CONDITIONS.filter(c => !conditions.includes(c.name)).map((condition) => (
              <button
                key={condition.name}
                onClick={() => addCondition(condition.name)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-md text-sm transition-colors text-left"
                title={condition.description}
              >
                {condition.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}