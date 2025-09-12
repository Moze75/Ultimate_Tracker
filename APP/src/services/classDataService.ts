import { DndClass, DndSubclass } from '../types/dnd';

// Service to read class and subclass data from the Classes directory
export const classDataService = {
  // Get list of available classes
  async getAvailableClasses(): Promise<string[]> {
    try {
      // This would read from the Classes directory structure
      // For now, we'll return the known classes based on the directory structure
      return ['Ensorceleur', 'Moine'];
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  },

  // Get class information
  async getClassInfo(className: string): Promise<DndClass | null> {
    try {
      // This would read the class markdown file
      // For now, we'll return basic class info
      const classMap: Record<string, DndClass> = {
        'Ensorceleur': {
          name: 'Ensorceleur',
          description: 'Lanceur de sorts utilisant la magie innée',
          hit_die: 'd6',
          primary_ability: 'Charisme',
          subclasses: await this.getClassSubclasses('Ensorceleur')
        },
        'Moine': {
          name: 'Moine',
          description: 'Combattant martial utilisant le credo',
          hit_die: 'd8',
          primary_ability: 'Dextérité et Sagesse',
          subclasses: await this.getClassSubclasses('Moine')
        }
      };

      return classMap[className] || null;
    } catch (error) {
      console.error('Error fetching class info:', error);
      return null;
    }
  },

  // Get subclasses for a specific class
  async getClassSubclasses(className: string): Promise<DndSubclass[]> {
    try {
      // This would read from the Classes/{className}/Subclasses directory
      // For now, we'll return the known subclasses
      const subclassMap: Record<string, DndSubclass[]> = {
        'Ensorceleur': [
          {
            name: 'Sorcellerie draconique',
            description: 'Magie héritée des dragons',
            class_name: 'Ensorceleur',
            features: [
              {
                name: 'Résistance draconique',
                level: 3,
                description: 'La magie qui vous habite se manifeste sous la forme de traits propres à votre don draconique.'
              },
              {
                name: 'Sorts draconiques',
                level: 3,
                description: 'Vous obtenez des sorts spécifiques aux dragons.'
              },
              {
                name: 'Affinité élémentaire',
                level: 6,
                description: 'Vous choisissez un type de dégâts élémentaires.'
              },
              {
                name: 'Ailes draconiques',
                level: 14,
                description: 'Vous pouvez faire apparaître des ailes draconiques.'
              },
              {
                name: 'Compagnon draconique',
                level: 18,
                description: 'Vous pouvez invoquer un dragon.'
              }
            ]
          }
        ],
        'Moine': [
          {
            name: 'Crédo de la paume',
            description: 'Maîtrise des techniques du combat à mains nues',
            class_name: 'Moine',
            features: [
              {
                name: 'Technique de la Paume',
                level: 3,
                description: 'Effets spéciaux avec Déluge de coups.'
              },
              {
                name: 'Plénitude physique',
                level: 6,
                description: 'Capacité de se soigner.'
              },
              {
                name: 'Foulée preste',
                level: 11,
                description: 'Utiliser Porté par le vent avec d\'autres actions bonus.'
              },
              {
                name: 'Paume vibratoire',
                level: 17,
                description: 'Attaque vibratoire potentiellement mortelle.'
              }
            ]
          }
        ]
      };

      return subclassMap[className] || [];
    } catch (error) {
      console.error('Error fetching subclasses:', error);
      return [];
    }
  },

  // Get subclass information
  async getSubclassInfo(className: string, subclassName: string): Promise<DndSubclass | null> {
    try {
      const subclasses = await this.getClassSubclasses(className);
      return subclasses.find(sc => sc.name === subclassName) || null;
    } catch (error) {
      console.error('Error fetching subclass info:', error);
      return null;
    }
  },

  // Parse markdown content (future implementation)
  parseMarkdownClassData(markdownContent: string): DndClass | null {
    // This would parse the markdown files in the Classes directory
    // Implementation would extract class features, spells, etc. from markdown
    return null;
  },

  // Parse markdown subclass content (future implementation)  
  parseMarkdownSubclassData(markdownContent: string): DndSubclass | null {
    // This would parse the subclass markdown files
    // Implementation would extract subclass features from markdown
    return null;
  }
};