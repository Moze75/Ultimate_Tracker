import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SpellSlotSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSlot: (level: number) => void;
  availableSlots: { level: number; used: number; total: number }[];
}

export function SpellSlotSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectSlot, 
  availableSlots 
}: SpellSlotSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            Choisir un emplacement de sort
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {availableSlots.map((slot) => (
            <button
              key={slot.level}
              onClick={() => {
                onSelectSlot(slot.level);
                onClose();
              }}
              disabled={slot.used >= slot.total}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white p-3 rounded-md text-left transition-colors"
            >
              <div className="flex justify-between items-center">
                <span>Niveau {slot.level}</span>
                <span>{slot.total - slot.used}/{slot.total} disponibles</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex-1 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}