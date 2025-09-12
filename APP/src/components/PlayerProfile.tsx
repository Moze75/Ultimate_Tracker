1| import React, { useState, useEffect } from 'react';
2| import {
3|   Settings,
4|   Moon,
5|   Star,
6|   Dice1 as DiceD20,
7|   X,
8|   Save,
9|   TrendingUp,
10|   Brain,
11|   Shield,
12|   Plus,
13|   Minus,
14| } from 'lucide-react';
15| import { DndClass, Player, PlayerStats, PlayerBackground } from '../types/dnd';
16| import { supabase } from '../lib/supabase';
17| import toast from 'react-hot-toast';
18| import { Avatar } from './Avatar';
19| import { CONDITIONS } from './ConditionsSection';
20| import { SessionsModal } from './SessionsModal';
21| import { LevelUpModal } from './LevelUpModal';
22| 
23| // Helpers D&D
24| const getModifier = (score: number): number => Math.floor((score - 10) / 2);
25| 
26| const getProficiencyBonusForLevel = (level: number): number => {
27|   if (level >= 17) return 6;
28|   if (level >= 13) return 5;
29|   if (level >= 9) return 4;
30|   if (level >= 5) return 3;
31|   return 2;
32| };
33| 
34| const DND_CLASSES: DndClass[] = [
35|   '',
36|   'Barbare',
37|   'Barde',
38|   'Clerc',
39|   'Druide',
40|   'Ensorceleur',
41|   'Guerrier',
42|   'Magicien',
43|   'Moine',
44|   'Paladin',
45|   'Rôdeur',
46|   'Roublard',
47|   'Sorcier'
48| ];
49| 
50| const DND_RACES = [
51|   '',
52|   'Humain',
53|   'Elfe',
54|   'Nain',
55|   'Halfelin',
56|   'Gnome',
57|   'Demi-Elfe',
58|   'Demi-Orc',
59|   'Tieffelin',
60|   'Drakéide',
61|   'Autre'
62| ];
63| 
64| const DND_BACKGROUNDS: PlayerBackground[] = [
65|   '',
66|   'Acolyte',
67|   'Artisan de guilde',
68|   'Artiste',
69|   'Charlatan',
70|   'Criminel',
71|   'Ermite',
72|   'Héros du peuple',
73|   'Marin',
74|   'Noble',
75|   'Sage',
76|   'Sauvageon',
77|   'Soldat',
78|   'Autre'
79| ];
80| 
81| const DND_ALIGNMENTS = [
82|   '',
83|   'Loyal Bon',
84|   'Neutre Bon',
85|   'Chaotique Bon',
86|   'Loyal Neutre',
87|   'Neutre',
88|   'Chaotique Neutre',
89|   'Loyal Mauvais',
90|   'Neutre Mauvais',
91|   'Chaotique Mauvais'
92| ];
93| 
94| const DND_LANGUAGES = [
95|   'Commun',
96|   'Elfique',
97|   'Nain',
98|   'Géant',
99|   'Gnome',
100|   'Gobelin',
101|   'Halfelin',
102|   'Orc',
103|   'Abyssal',
104|   'Céleste',
105|   'Commun des profondeurs',
106|   'Draconique',
107|   'Infernal',
108|   'Primordial',
109|   'Sylvestre',
110|   'Autre'
111| ];
112| 
113| const getDexModFromPlayer = (player: Player): number => {
114|   const dex = player.abilities?.find(a => a.name === 'Dextérité');
115|   if (!dex) return 0;
116|   if (typeof dex.modifier === 'number') return dex.modifier;
117|   if (typeof dex.score === 'number') return getModifier(dex.score);
118|   return 0;
119| };
120| 
121| interface PlayerProfileProps {
122|   player: Player;
123|   onUpdate: (player: Player) => void;
124| }
125| 
126| export function PlayerProfile({ player, onUpdate }: PlayerProfileProps) {
127|   const [editing, setEditing] = useState(false);
128|   const [showSessions, setShowSessions] = useState(false);
129|   const [showLevelUp, setShowLevelUp] = useState(false);
130| 
131|   // Tooltips pour les 4 infos (CA/VIT/INIT/MAÎT)
132|   const [activeTooltip, setActiveTooltip] = useState<'ac' | 'speed' | 'initiative' | 'proficiency' | null>(null);
133| 
134|   // Etats d'identité / profil
135|   const [adventurerName, setAdventurerName] = useState(player.adventurer_name || '');
136|   const [avatarUrl, setAvatarUrl] = useState(player.avatar_url || '');
137|   const [selectedClass, setSelectedClass] = useState<DndClass | undefined>(player.class || undefined);
138|   const [selectedSubclass, setSelectedSubclass] = useState(player.subclass || '');
139|   const [selectedRace, setSelectedRace] = useState(player.race || '');
140|   const [availableSubclasses, setAvailableSubclasses] = useState<string[]>([]);
141|   const [selectedBackground, setSelectedBackground] = useState<PlayerBackground | undefined>(player.background || undefined);
142|   const [selectedAlignment, setSelectedAlignment] = useState(player.alignment || '');
143|   const [selectedLanguages, setSelectedLanguages] = useState<string[]>(player.languages || []);
144|   const [age, setAge] = useState(player.age || '');
145|   const [gender, setGender] = useState(player.gender || '');
146|   const [characterHistory, setCharacterHistory] = useState(player.character_history || '');
147|   const [level, setLevel] = useState(player.level);
148|   const [hitDice, setHitDice] = useState(player.hit_dice || { total: player.level, used: 0 });
149|   const [maxHp, setMaxHp] = useState(player.max_hp);
150|   const [currentHp, setCurrentHp] = useState(player.current_hp);
151|   const [tempHp, setTempHp] = useState(player.temporary_hp);
152| 
153|   // Stats affichées (lecture). On les resynchronise avec player.
154|   const [stats, setStats] = useState<PlayerStats>(player.stats || {
155|     armor_class: 10,
156|     initiative: 0,
157|     speed: 30,
158|     proficiency_bonus: 2,
159|     inspirations: player.stats?.inspirations || 0
160|   });
161| 
162|   // Champs d'édition dédiés pour les 4 inputs afin d'autoriser le "vide"
163|   const [acField, setAcField] = useState<string>('');
164|   const [initField, setInitField] = useState<string>('');
165|   const [speedField, setSpeedField] = useState<string>('');
166|   const [profField, setProfField] = useState<string>('');
167| 
168|   // Mettre à jour les états locaux quand le player change
169|   useEffect(() => {
170|     setLevel(player.level);
171|     setMaxHp(player.max_hp);
172|     setCurrentHp(player.current_hp);
173|     setTempHp(player.temporary_hp);
174|     setHitDice(player.hit_dice || { total: player.level, used: 0 });
175| 
176|     setAdventurerName(player.adventurer_name || '');
177|     setSelectedClass(player.class || undefined);
178|     setSelectedSubclass(player.subclass || '');
179|     setSelectedRace(player.race || '');
180|     setSelectedBackground(player.background || undefined);
181|     setSelectedAlignment(player.alignment || '');
182|     setSelectedLanguages(player.languages || []);
183|     setAge(player.age || '');
184|     setGender(player.gender || '');
185|     setCharacterHistory(player.character_history || '');
186| 
187|     setStats(player.stats || {
188|       armor_class: 10,
189|       initiative: 0,
190|       speed: 30,
191|       proficiency_bonus: 2,
192|       inspirations: player.stats?.inspirations || 0
193|     });
194|   }, [player]);
195| 
196|   // Charger et harmoniser les sous-classes disponibles quand la classe change
197|   useEffect(() => {
198|     const debug = typeof window !== 'undefined' && (window as any).UT_DEBUG_PROFILE === true;
199| 
200|     const loadSubclasses = async () => {
201|       if (!selectedClass) {
202|         setAvailableSubclasses([]);
203|         if (selectedSubclass) setSelectedSubclass('');
204|         if (debug) console.log('[UT_DEBUG_PROFILE] PlayerProfile: no class selected; clearing subclass and list');
205|         return;
206|       }
207|       try {
208|         const { data, error } = await supabase.rpc('get_subclasses_by_class', {
209|           p_class: selectedClass
210|         });
211|         if (error) throw error;
212|         const list: string[] = Array.isArray(data) ? data : [];
213|         setAvailableSubclasses(list);
214| 
215|         // Harmonisation stricte: la sous-classe sélectionnée doit exister telle quelle dans la liste.
216|         if (selectedSubclass && !list.includes(selectedSubclass)) {
217|           setSelectedSubclass('');
218|         }
219| 
220|         if (debug) {
221|           console.log('[UT_DEBUG_PROFILE] PlayerProfile: subclasses loaded', {
222|             selectedClass,
223|             availableSubclasses: list,
224|             selectedSubclass: (selectedSubclass && list.includes(selectedSubclass)) ? selectedSubclass : ''
225|           });
226|         }
227|       } catch (error) {
228|         console.error('Erreur lors du chargement des sous-classes:', error);
229|         setAvailableSubclasses([]);
230|         setSelectedSubclass('');
231|         if (debug) console.log('[UT_DEBUG_PROFILE] PlayerProfile: error loading subclasses -> cleared selection');
232|       }
233|     };
234|     loadSubclasses();
235|   }, [selectedClass]);
236| 
237|   // Pré-remplir les champs d'édition quand on ouvre le modal
238|   useEffect(() => {
239|     if (!editing) return;
240| 
241|     const dexMod = getDexModFromPlayer(player);
242|     const profAuto = getProficiencyBonusForLevel(level);
243| 
244|     // On ne calcule que si vide/0 côté player.stats
245|     const acInitial = (player.stats?.armor_class ?? 0) || 0;
246|     const initInitial = player.stats?.initiative;
247|     const speedInitial = (player.stats?.speed ?? 0) || 0;
248|     const profInitial = (player.stats?.proficiency_bonus ?? 0) || 0;
249| 
250|     setAcField(acInitial > 0 ? String(acInitial) : String(10 + dexMod));
251|     setInitField(initInitial !== undefined && initInitial !== null ? String(initInitial) : String(dexMod));
252|     setSpeedField(speedInitial > 0 ? String(speedInitial) : String(9));
253|     setProfField(profInitial > 0 ? String(profInitial) : String(profAuto));
254|   }, [editing, player, level]);
255| 
256|   const handleShortRest = async () => {
257|     if (!player.hit_dice || player.hit_dice.total - player.hit_dice.used <= 0) {
258|       toast.error('Aucun dé de vie disponible');
259|       return;
260|     }
261|     try {
262|       const hitDieSize = (() => {
263|         switch (player.class) {
264|           case 'Barbare': return 12;
265|           case 'Guerrier':
266|           case 'Paladin':
267|           case 'Rôdeur': return 10;
268|           case 'Barde':
269|           case 'Clerc':
270|           case 'Druide':
271|           case 'Moine':
272|           case 'Roublard':
273|           case 'Sorcier': return 8;
274|           case 'Magicien':
275|           case 'Ensorceleur': return 6;
276|           default: return 8;
277|         }
278|       })();
279| 
280|       const roll = Math.floor(Math.random() * hitDieSize) + 1;
281|       const constitutionMod = player.abilities?.find(a => a.name === 'Constitution')?.modifier || 0;
282|       const healing = Math.max(1, roll + constitutionMod);
283| 
284|       const { error } = await supabase
285|         .from('players')
286|         .update({
287|           current_hp: Math.min(player.max_hp, player.current_hp + healing),
288|           hit_dice: {
289|             ...player.hit_dice,
290|             used: player.hit_dice.used + 1
291|           }
292|         })
293|         .eq('id', player.id);
294| 
295|       if (error) throw error;
296| 
297|       onUpdate({
298|         ...player,
299|         current_hp: Math.min(player.max_hp, player.current_hp + healing),
300|         hit_dice: {
301|           ...player.hit_dice,
302|           used: player.hit_dice.used + 1
303|         }
304|       });
305| 
306|       toast.success(`Repos court : +${healing} PV`);
307|     } catch (error) {
308|       console.error('Erreur lors du repos court:', error);
309|       toast.error('Erreur lors du repos');
310|     }
311|   };
312| 
313|   const handleLongRest = async () => {
314|     try {
315|       const { error } = await supabase
316|         .from('players')
317|         .update({
318|           current_hp: player.max_hp,
319|           temporary_hp: 0,
320|           hit_dice: {
321|             total: player.level,
322|             used: Math.max(0, player.hit_dice?.used - Math.floor(player.level / 2) || 0)
323|           },
324|           class_resources: {
325|             ...player.class_resources,
326|             used_rage: 0,
327|             used_bardic_inspiration: 0,
328|             used_channel_divinity: 0,
329|             used_wild_shape: 0,
330|             used_sorcery_points: 0,
331|             used_action_surge: 0,
332|             used_arcane_recovery: false,
333|             used_ki_points: 0,
334|             used_lay_on_hands: 0,
335|             used_favored_foe: 0
336|           },
337|           spell_slots: {
338|             ...player.spell_slots,
339|             used1: 0, used2: 0, used3: 0, used4: 0,
340|             used5: 0, used6: 0, used7: 0, used8: 0, used9: 0
341|           }
342|         })
343|         .eq('id', player.id);
344| 
345|       if (error) throw error;
346| 
347|       onUpdate({
348|         ...player,
349|         current_hp: player.max_hp,
350|         temporary_hp: 0,
351|         hit_dice: {
352|           total: player.level,
353|           used: Math.max(0, player.hit_dice?.used - Math.floor(player.level / 2) || 0)
354|         },
355|         class_resources: {
356|           ...player.class_resources,
357|           used_rage: 0,
358|           used_bardic_inspiration: 0,
359|           used_channel_divinity: 0,
360|           used_wild_shape: 0,
361|           used_sorcery_points: 0,
362|           used_action_surge: 0,
363|           used_arcane_recovery: false,
364|           used_ki_points: 0,
365|           used_lay_on_hands: 0,
366|           used_favored_foe: 0
367|         },
368|         spell_slots: {
369|           ...player.spell_slots,
370|           used1: 0, used2: 0, used3: 0, used4: 0,
371|           used5: 0, used6: 0, used7: 0, used8: 0, used9: 0
372|         }
373|       });
374| 
375|       toast.success('Repos long effectué');
376|     } catch (error) {
377|       console.error('Erreur lors du repos long:', error);
378|       toast.error('Erreur lors du repos');
379|     }
380|   };
381| 
382|   const handleSave = async () => {
383|     try {
384|       // Calculs auto si valeurs vides
385|       const dexMod = getDexModFromPlayer(player);
386|       const profAuto = getProficiencyBonusForLevel(level);
387| 
388|       const acVal = parseInt(acField, 10);
389|       const initVal = parseInt(initField, 10);
390|       const speedVal = parseInt(speedField, 10);
391|       const profVal = parseInt(profField, 10);
392| 
393|       const finalizedStats: PlayerStats = {
394|         ...player.stats, // préserve inspirations et autres champs
395|         armor_class: Number.isFinite(acVal) && acVal > 0 ? acVal : 10 + dexMod,
396|         initiative: Number.isFinite(initVal) ? initVal : dexMod,
397|         speed: Number.isFinite(speedVal) && speedVal > 0 ? speedVal : 9,
398|         proficiency_bonus: Number.isFinite(profVal) && profVal > 0 ? profVal : profAuto,
399|       };
400| 
401|       const updateData = {
402|         adventurer_name: adventurerName.trim() || null,
403|         race: selectedRace || null,
404|         class: selectedClass || null,
405|         subclass: selectedSubclass || null,
406|         background: selectedBackground || null,
407|         alignment: selectedAlignment || null,
408|         languages: selectedLanguages,
409|         max_hp: maxHp,
410|         current_hp: currentHp,
411|         temporary_hp: tempHp,
412|         age: age.trim() || null,
413|         gender: gender.trim() || null,
414|         character_history: characterHistory.trim() || null,
415|         level: level,
416|         hit_dice: {
417|           total: level,
418|           used: Math.min(hitDice.used, level)
419|         },
420|         stats: finalizedStats
421|       };
422| 
423|       const { data, error } = await supabase
424|         .from('players')
425|         .update(updateData)
426|         .eq('id', player.id)
427|         .select();
428| 
429|       if (error) throw error;
430| 
431|       onUpdate({
432|         ...player,
433|         ...updateData
434|       });
435| 
436|       setEditing(false);
437|       toast.success('Profil mis à jour');
438|     } catch (error) {
439|       console.error('Erreur lors de la mise à jour du profil:', error);
440|       toast.error('Erreur lors de la mise à jour');
441|     }
442|   };
443| 
444|   // Affichage (lecture)
445|   if (!editing) {
446|     return (
447|       <div className="stat-card">
448|         <div className="stat-header flex items-start justify-between">
449|           <div className="flex flex-col gap-4 w-full">
450|             {/* États actifs uniquement */}
451|             {player.active_conditions && player.active_conditions.length > 0 && (
452|               <div className="flex gap-1 flex-wrap">
453|                 {player.active_conditions
454|                   .map(conditionId => CONDITIONS.find(c => c.id === conditionId))
455|                   .filter(Boolean)
456|                   .map(condition => (
457|                     <div
458|                       key={condition!.id}
459|                       className="inline-block px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 text-sm font-medium"
460|                     >
461|                       {condition!.name}
462|                     </div>
463|                   ))}
464|               </div>
465|             )}
466| 
467|             {/* Layout horizontal: grille 2 colonnes (Avatar fluide + colonne boutons fixe) */}
468|             <div
469|               className="grid items-start gap-3 sm:gap-4"
470|               style={{ gridTemplateColumns: 'minmax(0,1fr) 8rem' }} // 8rem = 128px
471|             >
472|               {/* Avatar responsive (remplit la colonne gauche) */}
473|               <div className="relative w-full min-w-0 aspect-[7/10] sm:aspect-[2/3] rounded-lg overflow-hidden bg-gray-800/50 flex items-center justify-center">
474|                 {/* Bouton paramètres en overlay en haut à droite */}
475|                 <button
476|                   onClick={() => setEditing(true)}
477|                   className="absolute top-2 right-2 w-9 h-9 rounded-full bg-gray-900/40 backdrop-blur-sm text-white hover:bg-gray-800/50 hover:text-white flex items-center justify-center z-10 tra...