import React, { useState } from 'react';
import { BookOpen, Sparkles, Plus, Minus, Settings, Flame, Music, Cross, Leaf, Wand2, Swords, Footprints, HandHeart, Target, Skull, Trash2, Save, X, Brain, Book } from 'lucide-react';
import { Player, SpellSlots, ClassResources, DndClass } from '../types/dnd';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { SpellbookModal } from './SpellbookModal';
import { KnownSpellsSection } from './KnownSpellsSection';
import { SpellSlotSelectionModal } from './SpellSlotSelectionModal';

interface AbilitiesTabProps {
  player: Player;
  onUpdate: (player: Player) => void;
}

interface ResourceBlockProps {
  icon: React.ReactNode;
  label: string;
  total: number;
  used: number;
  onUse: () => void;
  onRestore: () => void;
  onUpdateTotal: (newTotal: number) => void;
  onUpdateUsed?: (value: number) => void;
  useNumericInput?: boolean;
  color?: string;
  onDelete?: () => void;
}

interface ResourceEditModalProps {
  label: string;
  total: number;
  onSave: (newTotal: number) => void;
  onCancel: () => void;
}

const ResourceEditModal = ({ label, total, onSave, onCancel }: ResourceEditModalProps) => {
  const [value, setValue] = useState<string>(total.toString());

  const handleSave = () => {
    const newValue = parseInt(value) || 0;
    if (newValue >= 0) {
      onSave(newValue);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input-dark w-full px-3 py-2 rounded-md"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="btn-primary flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <Save size={16} />
          Sauvegarder
        </button>
        <button
          onClick={onCancel}
          className="btn-secondary px-4 py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <X size={16} />
          Annuler
        </button>
      </div>
    </div>
  );
};

const ResourceBlock = ({ icon, label, total, used, onUse, onRestore, onUpdateTotal, onUpdateUsed, useNumericInput = false, color = 'purple', onDelete }: ResourceBlockProps) => {
  const remaining = Math.max(0, total - used);
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState<string>('');

  const colorClasses = {
    red: 'text-red-500 hover:bg-red-900/30',
    purple: 'text-purple-500 hover:bg-purple-900/30',
    yellow: 'text-yellow-500 hover:bg-yellow-900/30',
    green: 'text-green-500 hover:bg-green-900/30',
    blue: 'text-blue-500 hover:bg-blue-900/30'
  };

  return (
    <div className="resource-block bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`${colorClasses[color as keyof typeof colorClasses]}`}>{icon}</div>
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-md min-w-[64px] text-center">
            {remaining}/{total}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:bg-blue-900/30 rounded-full transition-colors"
            title="Modifier"
          >
            <Settings size={16} />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-900/30 rounded-full transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      {useNumericInput ? (
        <div className="flex-1 flex items-center gap-1">
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-dark flex-1 px-3 py-1 rounded-md text-center"
            placeholder="0"
          />
          <button
            onClick={() => {
              const value = parseInt(amount) || 0;
              if (value > 0) {
                onUpdateUsed?.(used + value);
                setAmount('');
              }
            }}
            className="p-1 text-red-500 hover:bg-red-900/30 rounded-md transition-colors"
            title="Dépenser"
          >
            <Minus size={18} />
          </button>
          <button
            onClick={() => {
              const value = parseInt(amount) || 0;
              if (value > 0) {
                onUpdateUsed?.(Math.max(0, used - value));
                setAmount('');
              }
            }}
            className="p-1 text-green-500 hover:bg-green-900/30 rounded-md transition-colors"
            title="Récupérer"
          >
            <Plus size={18} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onUse}
            disabled={remaining <= 0}
            className={`flex-1 h-8 flex items-center justify-center rounded-md transition-colors ${
              remaining > 0
                ? colorClasses[color as keyof typeof colorClasses]
                : 'text-gray-600 bg-gray-800/50 cursor-not-allowed'
            }`}
          >
            <Minus size={16} className="mx-auto" />
          </button>
          <button
            onClick={onRestore}
            disabled={used <= 0}
            className={`flex-1 h-8 flex items-center justify-center rounded-md transition-colors ${
              used > 0
                ? colorClasses[color as keyof typeof colorClasses]
                : 'text-gray-600 bg-gray-800/50 cursor-not-allowed'
            }`}
          >
            <Plus size={16} className="mx-auto" />
          </button>
        </div>
      )}
      {isEditing && (
        <div className="mt-4 border-t border-gray-700/50 pt-4">
          <ResourceEditModal
            label={`Nombre total de ${label.toLowerCase()}`}
            total={total}
            onSave={async (newTotal) => {
              onRestore(); // Reset used count
              await onUpdateTotal(newTotal);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}
    </div>
  );
};

const getSpellSlotsByLevel = (playerClass: DndClass | null | undefined, level: number): SpellSlots => {
  const slots: SpellSlots = {};
  
  // Les moines n'ont pas d'emplacements de sorts
  if (playerClass === 'Moine') {
    return slots;
  }
  
  // Niveaux de sorts disponibles par niveau de personnage
  if (level >= 1) {
    slots.level1 = level >= 1 ? (level === 1 ? 2 : 3) : 0;
    slots.used1 = 0;
  }
  if (level >= 3) {
    slots.level2 = level >= 3 ? (level === 3 ? 2 : 3) : 0;
    slots.used2 = 0;
  }
  if (level >= 5) {
    slots.level3 = level >= 5 ? (level === 5 ? 2 : 3) : 0;
    slots.used3 = 0;
  }
  if (level >= 7) {
    slots.level4 = level >= 7 ? (level === 7 ? 1 : 3) : 0;
    slots.used4 = 0;
  }
  if (level >= 9) {
    slots.level5 = level >= 9 ? (level === 9 ? 1 : 2) : 0;
    slots.used5 = 0;
  }
  if (level >= 11) {
    slots.level6 = level >= 11 ? 1 : 0;
    slots.used6 = 0;
  }
  if (level >= 13) {
    slots.level7 = level >= 13 ? 1 : 0;
    slots.used7 = 0;
  }
  if (level >= 15) {
    slots.level8 = level >= 15 ? 1 : 0;
    slots.used8 = 0;
  }
  if (level >= 17) {
    slots.level9 = level >= 17 ? 1 : 0;
    slots.used9 = 0;
  }

  return slots;
};

const getDefaultClassResources = (playerClass: DndClass, level: number): ClassResources => {
  const resources: ClassResources = {};

  switch (playerClass) {
    case 'Barbare':
      resources.rage = Math.floor((level + 3) / 4) + 2;
      resources.used_rage = 0;
      break;
    case 'Barde':
      resources.bardic_inspiration = Math.max(1, Math.floor((level + 5) / 6));
      resources.used_bardic_inspiration = 0;
      break;
    case 'Clerc':
      resources.channel_divinity = level >= 6 ? 2 : 1;
      resources.used_channel_divinity = 0;
      break;
    case 'Druide':
      resources.wild_shape = 2;
      resources.used_wild_shape = 0;
      break;
    case 'Ensorceleur':
      resources.sorcery_points = level;
      resources.used_sorcery_points = 0;
      break;
    case 'Guerrier':
      resources.action_surge = level >= 17 ? 2 : 1;
      resources.used_action_surge = 0;
      break;
    case 'Magicien':
      resources.arcane_recovery = true;
      resources.used_arcane_recovery = false;
      break;
    case 'Moine':
      resources.ki_points = level;
      resources.used_ki_points = 0;
      break;
    case 'Paladin':
      resources.lay_on_hands = level * 5;
      resources.used_lay_on_hands = 0;
      break;
    case 'Rôdeur':
      resources.favored_foe = Math.floor((level + 3) / 4);
      resources.used_favored_foe = 0;
      break;
    case 'Roublard':
      resources.sneak_attack = `${Math.ceil(level / 2)}d6`;
      break;
  }

  return resources;
};


export function AbilitiesTab({ player, onUpdate }: AbilitiesTabProps) {
  const [editing, setEditing] = useState(false);
  const [previousClass, setPreviousClass] = useState(player.class);
  const [previousLevel, setPreviousLevel] = useState(player.level);
  const [showSpellbook, setShowSpellbook] = useState(false);
  const [showSpellSlotModal, setShowSpellSlotModal] = useState(false);
  const [spellSlotModalData, setSpellSlotModalData] = useState<{
    type: 'attack' | 'damage';
    attackName: string;
    diceFormula: string;
    modifier: number;
  } | null>(null);

  React.useEffect(() => {
    if (player.class !== previousClass || player.level !== previousLevel) {
      setPreviousClass(player.class);
      setPreviousLevel(player.level);
      initializeResources();
    }
  }, [player.class, player.level]);

  const handleSpellSlotChange = async (level: number, used: boolean) => {
    if (!player.spell_slots) return;
    
    const usedKey = `used${level}` as keyof SpellSlots;
    const levelKey = `level${level}` as keyof SpellSlots;
    const currentUsed = player.spell_slots[usedKey] || 0;
    const maxSlots = player.spell_slots[levelKey] || 0;
    
    if (used && currentUsed >= maxSlots) return;
    if (!used && currentUsed <= 0) return;
    
    // Crée un élément pour l'animation
    const button = document.activeElement as HTMLButtonElement;
    if (button) {
      const animationElement = document.createElement('div');
      animationElement.style.position = 'absolute';
      animationElement.style.top = '50%';
      animationElement.style.left = '50%';
      animationElement.style.width = '200px';
      animationElement.style.height = '200px';
      animationElement.style.transform = 'translate(-50%, -50%)';
      animationElement.style.animation = used ? 
        'magical-explosion 0.6s ease-out forwards' :
        'magical-particles 0.6s ease-out forwards';
      button.appendChild(animationElement);
      
      // Nettoie l'élément après l'animation
      setTimeout(() => {
        animationElement.remove();
      }, 600);
    }
    
    const newSpellSlots = {
      ...player.spell_slots,
      [usedKey]: used ? currentUsed + 1 : currentUsed - 1
    };
    
    try {
      const { error } = await supabase
        .from('players')
        .update({ spell_slots: newSpellSlots })
        .eq('id', player.id);
      
      if (error) throw error;
      
      onUpdate({
        ...player,
        spell_slots: newSpellSlots
      });
      
      toast.success(
        used ? 
        `✨ Emplacement de sort utilisé` :
        `🔮 Emplacement de sort récupéré`
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour des emplacements de sorts:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const renderSpellSlots = () => {
    const spellSlots = player.spell_slots || {};

    // Vérifie si le joueur a des emplacements de sorts
    const hasSpellSlots = Object.keys(spellSlots).some(key => {
      if (key.startsWith('level') && !key.startsWith('used')) {
        return (spellSlots[key as keyof SpellSlots] || 0) > 0;
      }
      return false;
    });

    // Si aucun emplacement de sort n'est disponible, ne pas afficher la section
    if (!hasSpellSlots) {
      return null;
    }

    // Determine the maximum spell level based on player level
    const getMaxSpellLevel = (level: number) => {
      if (level >= 17) return 9;
      if (level >= 15) return 8;
      if (level >= 13) return 7;
      if (level >= 11) return 6;
      if (level >= 9) return 5;
      if (level >= 7) return 4;
      if (level >= 5) return 3;
      if (level >= 3) return 2;
      if (level >= 1) return 1;
      return 0;
    };

    // Only show spell slots up to the player's maximum level when not editing
    const maxLevel = editing ? 9 : getMaxSpellLevel(player.level);

    const slots = Array.from({ length: maxLevel }, (_, i) => {
      const level = i + 1;
      const levelKey = `level${level}` as keyof SpellSlots;
      const usedKey = `used${level}` as keyof SpellSlots;
      const maxSlots = spellSlots[levelKey] || 0;
      const usedSlots = spellSlots[usedKey] || 0;

      return (
        <div key={level} className="spell-slot">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-300">
              Niveau {level}
            </span>
            <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-md min-w-[64px] text-center">
              {maxSlots - usedSlots}/{maxSlots}
            </div>
          </div>
          {maxSlots > 0 && (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  const button = e.currentTarget;
                  const rect = button.getBoundingClientRect();
                  
                  // Crée l'élément d'animation
                  const animationContainer = document.createElement('div');
                  animationContainer.style.position = 'fixed';
                  animationContainer.style.left = `${rect.left}px`;
                  animationContainer.style.top = `${rect.top}px`;
                  animationContainer.style.width = `${rect.width}px`;
                  animationContainer.style.height = `${rect.height}px`;
                  animationContainer.style.pointerEvents = 'none';
                  animationContainer.style.zIndex = '9999';
                  
                  const animationElement = document.createElement('div');
                  animationElement.style.position = 'absolute';
                  animationElement.style.left = '50%';
                  animationElement.style.top = '50%';
                  animationElement.style.width = '200px';
                  animationElement.style.height = '200px';
                  animationElement.style.animation = 'magical-explosion 0.6s ease-out forwards';
                  
                  animationContainer.appendChild(animationElement);
                  document.body.appendChild(animationContainer);
                  
                  // Nettoie après l'animation
                  setTimeout(() => {
                    animationContainer.remove();
                  }, 600);
                  
                  handleSpellSlotChange(level, true);
                }}
                disabled={usedSlots >= maxSlots}
                className={`flex-1 p-2 rounded-md transition-colors ${
                  usedSlots < maxSlots
                    ? 'text-purple-500 hover:bg-purple-900/30'
                    : 'text-gray-600 bg-gray-800/50 cursor-not-allowed'
                }`}
              >
                <Minus size={16} className="mx-auto" />
              </button>
              <button
                onClick={(e) => {
                  const button = e.currentTarget;
                  const rect = button.getBoundingClientRect();
                  
                  // Crée l'élément d'animation
                  const animationContainer = document.createElement('div');
                  animationContainer.style.position = 'fixed';
                  animationContainer.style.left = `${rect.left}px`;
                  animationContainer.style.top = `${rect.top}px`;
                  animationContainer.style.width = `${rect.width}px`;
                  animationContainer.style.height = `${rect.height}px`;
                  animationContainer.style.pointerEvents = 'none';
                  animationContainer.style.zIndex = '9999';
                  
                  const animationElement = document.createElement('div');
                  animationElement.style.position = 'absolute';
                  animationElement.style.left = '50%';
                  animationElement.style.top = '50%';
                  animationElement.style.width = '200px';
                  animationElement.style.height = '200px';
                  animationElement.style.animation = 'magical-particles 0.6s ease-out forwards';
                  
                  animationContainer.appendChild(animationElement);
                  document.body.appendChild(animationContainer);
                  
                  // Nettoie après l'animation
                  setTimeout(() => {
                    animationContainer.remove();
                  }, 600);
                  
                  handleSpellSlotChange(level, false);
                }}
                disabled={usedSlots <= 0}
                className={`flex-1 p-2 rounded-md transition-colors ${
                  usedSlots > 0
                    ? 'text-purple-500 hover:bg-purple-900/30'
                    : 'text-gray-600 bg-gray-800/50 cursor-not-allowed'
                }`}
              >
                <Plus size={16} className="mx-auto" />
              </button>
            </div>
          )}
        </div>
      )
    });

    return (
      <div className="stats-card">
        <div className="stat-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-100">
              Emplacements de sorts
            </h3>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-2 text-gray-400 hover:bg-gray-700/50 rounded-lg transition-colors flex items-center justify-center"
            >
              <Settings size={20} />
            </button>
          )}
        </div>
        <div className="p-4 space-y-4">
          {editing && (
            <div className="border-b border-gray-700/50 pb-4 mb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 9 }, (_, i) => i + 1).map(level => {
                  const levelKey = `level${level}` as keyof SpellSlots;
                  const maxSlots = spellSlots[levelKey] || 0;
                  const usedKey = `used${level}` as keyof SpellSlots;

                  return (
                    <div key={level} className="space-y-2">
                      <label className="block text-sm font-medium text-purple-300">
                        Niveau {level}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={maxSlots}
                        onChange={async (e) => {
                          const newValue = Math.max(0, parseInt(e.target.value) || 0);
                          const newSpellSlots = {
                            ...spellSlots,
                            [levelKey]: newValue,
                            [usedKey]: Math.min(spellSlots[usedKey] || 0, newValue)
                          };
                          try {
                            const { error } = await supabase
                              .from('players')
                              .update({ spell_slots: newSpellSlots })
                              .eq('id', player.id);

                            if (error) throw error;

                            onUpdate({
                              ...player,
                              spell_slots: newSpellSlots
                            });
                          } catch (error) {
                            console.error('Erreur lors de la mise à jour:', error);
                            toast.error('Erreur lors de la mise à jour');
                          }
                        }}
                        className="input-dark w-full px-3 py-2 rounded-md text-center"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setEditing(false)}
                  className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <X size={16} />
                  Fermer
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {slots}
          </div>
        </div>
      </div>
    );
  };

  const updateClassResource = async (
    resource: keyof ClassResources,
    value: number | boolean
  ) => {
    if (!player.class_resources) return;

    const newResources = { ...player.class_resources, [resource]: value };
    
    try {
      const { error } = await supabase
        .from('players')
        .update({ class_resources: newResources })
        .eq('id', player.id);

      if (error) throw error;

      onUpdate({
        ...player,
        class_resources: newResources
      });

      // Affiche une notification en fonction du type de ressource
      if (typeof value === 'boolean') {
        toast.success(`Récupération arcanique ${value ? 'utilisée' : 'disponible'}`);
      } else {
        const resourceNames: Record<string, string> = {
          rage: 'Rage',
          bardic_inspiration: 'Inspiration bardique',
          channel_divinity: 'Conduit divin',
          wild_shape: 'Forme sauvage',
          sorcery_points: 'Points de sorcellerie',
          action_surge: 'Sursaut d\'action',
          ki_points: 'Points de ki',
          lay_on_hands: 'Imposition des mains',
          favored_foe: 'Ennemi juré'
        };

        const resourceName = resourceNames[resource.replace('used_', '')] || resource;
        const isUsed = resource.startsWith('used_');
        const action = isUsed ? (value > (player.class_resources?.[resource] || 0) ? 'utilisé' : 'récupéré') : 'mis à jour';

        if (isUsed) {
          const diff = Math.abs(value - (player.class_resources?.[resource] || 0));
          toast.success(`${diff} ${resourceName} ${action}`);
        } else {
          toast.success(`${resourceName} mis à jour`);
        }
      }

    } catch (error) {
      console.error('Erreur lors de la mise à jour des ressources:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const initializeResources = async () => {
    if (!player.class) return;

    try {
      const defaultSpellSlots = getSpellSlotsByLevel(player.class, player.level);
      const defaultClassResources = getDefaultClassResources(player.class, player.level);

      const { error } = await supabase
        .from('players')
        .update({
          spell_slots: defaultSpellSlots,
          class_resources: defaultClassResources
        })
        .eq('id', player.id);

      if (error) throw error;

      onUpdate({
        ...player,
        spell_slots: defaultSpellSlots,
        class_resources: defaultClassResources
      });

      toast.success('Ressources initialisées');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des ressources:', error);
      toast.error('Erreur lors de l\'initialisation');
    }
  };

  const renderClassResources = () => {
    if (!player.class_resources || !player.class) return null;

    const classResources = player.class_resources;
    const resources = [];

    switch (player.class) {
      case 'Barbare':
        if (typeof classResources.rage === 'number') {
          resources.push(
            <ResourceBlock
              key="rage"
              icon={<Flame size={20} />}
              label="Rage"
              total={classResources.rage}
              used={classResources.used_rage || 0}
              onUse={() => updateClassResource('used_rage', (classResources.used_rage || 0) + 1)}
              onUpdateTotal={(newTotal) => updateClassResource('rage', newTotal)}
              onRestore={() => updateClassResource('used_rage', Math.max(0, (classResources.used_rage || 0) - 1))}
              color="red"
            />
          );
        }
        break;

      case 'Barde':
        if (typeof player.class_resources.bardic_inspiration === 'number') {
          resources.push(
            <ResourceBlock
              key="bardic_inspiration"
              icon={<Music size={20} />}
              label="Inspiration bardique"
              total={player.class_resources.bardic_inspiration}
              used={player.class_resources.used_bardic_inspiration || 0}
              onUse={() => updateClassResource('used_bardic_inspiration', (player.class_resources?.used_bardic_inspiration || 0) + 1)}
              onUpdateTotal={(newTotal) => updateClassResource('bardic_inspiration', newTotal)}
              onRestore={() => updateClassResource('used_bardic_inspiration', Math.max(0, (player.class_resources?.used_bardic_inspiration || 0) - 1))}
              color="purple"
            />
          );
        }
        break;

      case 'Clerc':
        if (typeof player.class_resources.channel_divinity === 'number') {
          resources.push(
            <ResourceBlock
              key="channel_divinity"
              icon={<Cross size={20} />}
              label="Conduit divin"
              total={player.class_resources.channel_divinity}
              used={player.class_resources.used_channel_divinity || 0}
              onUse={() => updateClassResource('used_channel_divinity', (player.class_resources?.used_channel_divinity || 0) + 1)}
              onUpdateTotal={(newTotal) => updateClassResource('channel_divinity', newTotal)}
              onRestore={() => updateClassResource('used_channel_divinity', Math.max(0, (player.class_resources?.used_channel_divinity || 0) - 1))}
              color="yellow"
            />
          );
        }
        break;

      case 'Druide':
        if (typeof player.class_resources.wild_shape === 'number') {
          resources.push(
            <ResourceBlock
              key="wild_shape"
              icon={<Leaf size={20} />}
              label="Forme sauvage"
              total={player.class_resources.wild_shape}
              used={player.class_resources.used_wild_shape || 0}
              onUse={() => updateClassResource('used_wild_shape', (player.class_resources?.used_wild_shape || 0) + 1)}
              onUpdateTotal={(newTotal) => updateClassResource('wild_shape', newTotal)}
              onRestore={() => updateClassResource('used_wild_shape', Math.max(0, (player.class_resources?.used_wild_shape || 0) - 1))}
              color="green"
            />
          );
        }
        break;

      case 'Ensorceleur':
        if (typeof player.class_resources.sorcery_points === 'number') {
          resources.push(
            <ResourceBlock
              key="sorcery_points"
              icon={<Wand2 size={20} />}
              label="Points de sorcellerie"
              total={player.class_resources.sorcery_points}
              used={player.class_resources.used_sorcery_points || 0}
              onUse={() => updateClassResource('used_sorcery_points', (player.class_resources?.used_sorcery_points || 0) + 1)}
              onUpdateTotal={(newTotal) => updateClassResource('sorcery_points', newTotal)}
              onRestore={() => updateClassResource('used_sorcery_points', Math.max(0, (player.class_resources?.used_sorcery_points || 0) - 1))}
              color="purple"
            />
          );
        }
        break;

      case 'Guerrier':
        if (typeof player.class_resources.action_surge === 'number') {
          resources.push(
            <ResourceBlock
              key="action_surge"
              icon={<Swords size={20} />}
              label="Sursaut d'action"
              total={player.class_resources.action_surge}
              used={player.class_resources.used_action_surge || 0}
              onUse={() => updateClassResource('used_action_surge', (player.class_resources?.used_action_surge || 0) + 1)}
              onUpdateTotal={(newTotal) => updateClassResource('action_surge', newTotal)}
              onRestore={() => updateClassResource('used_action_surge', Math.max(0, (player.class_resources?.used_action_surge || 0) - 1))}
              color="red"
            />
          );
        }
        break;

      case 'Magicien':
        if (player.class_resources.arcane_recovery !== undefined) {
          resources.push(
            <div key="arcane_recovery" className="resource-block bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen size={20} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-300">Récupération arcanique</span>
                </div>
                <button
                  onClick={() => updateClassResource('used_arcane_recovery', !player.class_resources?.used_arcane_recovery)}
                  className={`h-8 px-3 flex items-center justify-center rounded-md transition-colors ${
                    player.class_resources?.used_arcane_recovery
                      ? 'bg-gray-800/50 text-gray-500'
                      : 'text-blue-500 hover:bg-blue-900/30'
                  }`}
                >
                  {player.class_resources?.used_arcane_recovery ? 'Utilisé' : 'Disponible'}
                </button>
              </div>
            </div>
          );
        }
        break;

      case 'Moine':
        if (typeof player.class_resources.ki_points === 'number') {
          resources.push(
            <ResourceBlock
              key="ki_points"
              icon={<Footprints size={20} />}
              label="Points de ki"
              total={player.class_resources.ki_points}
              used={player.class_resources.used_ki_points || 0}
              onUse={() => updateClassResource('used_ki_points', (player.class_resources?.used_ki_points || 0) + 1)}
              onUpdateTotal={(newTotal) => updateClassResource('ki_points', newTotal)}
              onRestore={() => updateClassResource('used_ki_points', Math.max(0, (player.class_resources?.used_ki_points || 0) - 1))}
              color="blue"
            />
          );
        }
        break;

      case 'Paladin':
        if (typeof player.class_resources.lay_on_hands === 'number') {
          resources.push(
            <ResourceBlock
              key="lay_on_hands"
              icon={<HandHeart size={20} />}
              label="Imposition des mains"
              total={player.class_resources.lay_on_hands}
              used={player.class_resources.used_lay_on_hands || 0}
              onUpdateTotal={(newTotal) => updateClassResource('lay_on_hands', newTotal)}
              onUpdateUsed={(value) => updateClassResource('used_lay_on_hands', value)}
              color="yellow"
              useNumericInput={true}
            />
          );
        }
        break;

      case 'Rôdeur':
        if (typeof player.class_resources.favored_foe === 'number') {
          resources.push(
            <ResourceBlock
              key="favored_foe"
              icon={<Target size={20} />}
              label="Ennemi juré"
              total={player.class_resources.favored_foe}
              used={player.class_resources.used_favored_foe || 0}
              onUse={() => updateClassResource('used_favored_foe', (player.class_resources?.used_favored_foe || 0) + 1)}
              onUpdateTotal={(newTotal) => updateClassResource('favored_foe', newTotal)}
              onRestore={() => updateClassResource('used_favored_foe', Math.max(0, (player.class_resources?.used_favored_foe || 0) - 1))}
              color="green"
            />
          );
        }
        break;

      case 'Roublard':
        if (player.class_resources.sneak_attack) {
          resources.push(
            <div key="sneak_attack" className="resource-block bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skull size={20} className="text-red-500" />
                  <span className="text-sm font-medium text-gray-300">Attaque sournoise</span>
                </div>
                <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-md">
                  {player.class_resources.sneak_attack}
                </div>
              </div>
            </div>
          );
        }
        break;
    }

    return (
      <div className="stats-card">
        <div className="stat-header flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-100">
            Ressources de classe
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {resources}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Section Sorts connus */}
      <KnownSpellsSection
        player={player}
        onUpdate={onUpdate}
      />

      {/* Section Emplacements de sorts */}
      {renderSpellSlots()}

      {/* Section Grimoire */}
      <div className="stats-card">
        <div className="stat-header flex items-center gap-3">
          <Book className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-100">
            Grimoire
          </h3>
        </div>
        <div className="p-4">
          <button
            onClick={() => setShowSpellbook(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 flex items-center justify-center gap-2"
          >
            <Book size={20} />
            Ouvrir le grimoire
          </button>
        </div>
      </div>

      {renderClassResources()}
      
      {/* Modal du grimoire */}
      {showSpellbook && (
        <SpellbookModal
          isOpen={showSpellbook}
          onClose={() => setShowSpellbook(false)}
          playerClass={player.class}
        />
      )}
      
      {/* Modal de sélection d'emplacement de sort */}
      {showSpellSlotModal && spellSlotModalData && (
        <SpellSlotSelectionModal
          isOpen={showSpellSlotModal}
          onClose={() => {
            setShowSpellSlotModal(false);
            setSpellSlotModalData(null);
          }}
          onConfirm={(level) => {
            handleSpellSlotChange(level, true);
            setShowSpellSlotModal(false);
            setSpellSlotModalData(null);
          }}
          player={player}
          attackName={spellSlotModalData.attackName}
          suggestedLevel={1}
        />
      )}
    </div>
  );
}