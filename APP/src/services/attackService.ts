import { supabase } from '../lib/supabase';
import { Attack } from '../types/dnd';

export const attackService = {
  async getPlayerAttacks(playerId: string): Promise<Attack[]> {
    try {
      const { data, error } = await supabase
        .from('attacks')
        .select('*')
        .eq('player_id', playerId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching attacks:', error);
      return [];
    }
  },

  async createAttack(attack: Omit<Attack, 'id'>): Promise<Attack | null> {
    try {
      const { data, error } = await supabase
        .from('attacks')
        .insert(attack)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating attack:', error);
      return null;
    }
  },

  async updateAttack(attack: Attack): Promise<Attack | null> {
    try {
      const { data, error } = await supabase
        .from('attacks')
        .update(attack)
        .eq('id', attack.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating attack:', error);
      return null;
    }
  },

  async deleteAttack(attackId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('attacks')
        .delete()
        .eq('id', attackId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting attack:', error);
      return false;
    }
  }
};