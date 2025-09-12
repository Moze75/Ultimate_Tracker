import React from 'react';

interface DiceRollerProps {
  dice?: string;
  label?: string;
  modifier?: number;
  onRoll?: (result: number) => void;
}

export function DiceRoller({ dice = '1d20', label, modifier = 0, onRoll }: DiceRollerProps) {
  const rollDice = () => {
    // Simple dice rolling implementation
    const [count, sides] = dice.split('d').map(Number);
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    const result = total + modifier;
    if (onRoll) onRoll(result);
    return result;
  };

  return (
    <button
      onClick={rollDice}
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      🎲 {label || dice}{modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
    </button>
  );
}