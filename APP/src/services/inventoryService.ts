import { supabase } from '../lib/supabase';
import { InventoryItem } from '../types/dnd';

export const inventoryService = {
  async getPlayerInventory(playerId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('player_id', playerId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  },

  async createItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      return null;
    }
  },

  async updateItem(item: InventoryItem): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update(item)
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      return null;
    }
  },

  async deleteItem(itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  }
};