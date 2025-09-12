import React, { useState, useEffect } from 'react';
import { Book, ChevronDown, ChevronRight } from 'lucide-react';
import { DndClass, DndSubclass, Player } from '../types/dnd';
import { classDataService } from '../services/classDataService';

interface ClassSelectionSectionProps {
  player: Player;
  onUpdate: (player: Player) => void;
  editing?: boolean;
}

export function ClassSelectionSection({ player, onUpdate, editing = false }: ClassSelectionSectionProps) {
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClassInfo, setSelectedClassInfo] = useState<DndClass | null>(null);
  const [selectedSubclassInfo, setSelectedSubclassInfo] = useState<DndSubclass | null>(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [showSubclassDetails, setShowSubclassDetails] = useState(false);

  useEffect(() => {
    loadAvailableClasses();
  }, []);

  useEffect(() => {
    if (player.class && typeof player.class === 'string') {
      loadClassInfo(player.class);
    }
  }, [player.class]);

  useEffect(() => {
    if (player.class && player.subclass && typeof player.class === 'string') {
      loadSubclassInfo(player.class, player.subclass);
    }
  }, [player.class, player.subclass]);

  const loadAvailableClasses = async () => {
    const classes = await classDataService.getAvailableClasses();
    setAvailableClasses(classes);
  };

  const loadClassInfo = async (className: string) => {
    const classInfo = await classDataService.getClassInfo(className);
    setSelectedClassInfo(classInfo);
  };

  const loadSubclassInfo = async (className: string, subclassName: string) => {
    const subclassInfo = await classDataService.getSubclassInfo(className, subclassName);
    setSelectedSubclassInfo(subclassInfo);
  };

  const handleClassChange = async (className: string) => {
    const updatedPlayer = {
      ...player,
      class: className,
      subclass: undefined // Reset subclass when class changes
    };
    onUpdate(updatedPlayer);
    await loadClassInfo(className);
  };

  const handleSubclassChange = async (subclassName: string) => {
    const updatedPlayer = {
      ...player,
      subclass: subclassName
    };
    onUpdate(updatedPlayer);
    if (typeof player.class === 'string') {
      await loadSubclassInfo(player.class, subclassName);
    }
  };

  const renderClassFeatures = (features: any[]) => {
    return features.map((feature, index) => (
      <div key={index} className="bg-gray-700 rounded-lg p-3 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Niveau {feature.level}
          </span>
          <h5 className="text-white font-medium">{feature.name}</h5>
        </div>
        <p className="text-gray-300 text-sm">{feature.description}</p>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Book className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Classe & Sous-classe</h3>
      </div>

      {/* Class Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Classe</label>
        {editing ? (
          <select
            value={typeof player.class === 'string' ? player.class : ''}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
          >
            <option value="">Sélectionner une classe</option>
            {availableClasses.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        ) : (
          <div className="bg-gray-700 rounded-md px-3 py-2 text-white">
            {typeof player.class === 'string' ? player.class : 'Aucune classe sélectionnée'}
          </div>
        )}
      </div>

      {/* Subclass Selection */}
      {selectedClassInfo && selectedClassInfo.subclasses && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Sous-classe</label>
          {editing ? (
            <select
              value={player.subclass || ''}
              onChange={(e) => handleSubclassChange(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            >
              <option value="">Sélectionner une sous-classe</option>
              {selectedClassInfo.subclasses.map((subclass) => (
                <option key={subclass.name} value={subclass.name}>
                  {subclass.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="bg-gray-700 rounded-md px-3 py-2 text-white">
              {player.subclass || 'Aucune sous-classe sélectionnée'}
            </div>
          )}
        </div>
      )}

      {/* Class Information Display */}
      {selectedClassInfo && (
        <div className="bg-gray-800 rounded-lg p-4">
          <button
            onClick={() => setShowClassDetails(!showClassDetails)}
            className="flex items-center gap-2 w-full text-left"
          >
            {showClassDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <h4 className="text-white font-medium">Informations sur {selectedClassInfo.name}</h4>
          </button>
          
          {showClassDetails && (
            <div className="mt-3 space-y-2">
              <p className="text-gray-300 text-sm">{selectedClassInfo.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Dé de vie: </span>
                  <span className="text-white">{selectedClassInfo.hit_die}</span>
                </div>
                <div>
                  <span className="text-gray-400">Caractéristique principale: </span>
                  <span className="text-white">{selectedClassInfo.primary_ability}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subclass Information Display */}
      {selectedSubclassInfo && (
        <div className="bg-gray-800 rounded-lg p-4">
          <button
            onClick={() => setShowSubclassDetails(!showSubclassDetails)}
            className="flex items-center gap-2 w-full text-left"
          >
            {showSubclassDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <h4 className="text-white font-medium">Capacités de {selectedSubclassInfo.name}</h4>
          </button>
          
          {showSubclassDetails && (
            <div className="mt-3 space-y-3">
              <p className="text-gray-300 text-sm">{selectedSubclassInfo.description}</p>
              {selectedSubclassInfo.features && selectedSubclassInfo.features.length > 0 && (
                <div>
                  <h5 className="text-white font-medium mb-2">Capacités de sous-classe</h5>
                  {renderClassFeatures(selectedSubclassInfo.features)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Storage Information */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Book className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 font-medium text-sm">Données des classes</span>
        </div>
        <p className="text-blue-200 text-xs">
          Les informations des classes et sous-classes sont stockées dans le répertoire <code className="bg-blue-800/50 px-1 rounded">Classes/</code> du dépôt.
        </p>
      </div>
    </div>
  );
}