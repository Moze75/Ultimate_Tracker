import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { loadAbilitySections } from '../services/classesContent';
import { loadFeatureChecks, upsertFeatureCheck } from '../services/featureChecks';

type AbilitySection = {
  level: number;
  title: string;
  content: string;
  origin: 'class' | 'subclass';
};

type PlayerLike = {
  id?: string | null;       // id du personnage (pour persister les cases côté Supabase)
  class?: string | null;
  subclass?: string | null;
  level?: number | null;
};

type Props = {
  player?: PlayerLike;
  playerClass?: string;       // si pas de player
  className?: string;         // rétrocompatibilité
  subclassName?: string | null;
  characterLevel?: number;
};

// Active des logs de debug dans la console si window.UT_DEBUG === true
const DEBUG = typeof window !== 'undefined' && (window as any).UT_DEBUG === true;

/* Alias FR/EN pour compenser les divergences de nommage du contenu */
const CLASS_ALIASES: Record<string, string[]> = {
  // normalisé -> candidats possibles dans les données
  'moine': ['Moine', 'Monk'],
  'ensorceleur': ['Ensorceleur', 'Sorcier', 'Sorcerer'],
  'barbare': ['Barbare', 'Barbarian'],
  'barde': ['Barde', 'Bard'],
  'clerc': ['Clerc', 'Cleric'],
  'druide': ['Druide', 'Druid'],
  'guerrier': ['Guerrier', 'Fighter'],
  'paladin': ['Paladin'],
  'rodeur': ['Rôdeur', 'Rodeur', 'Ranger'],
  'voleur': ['Voleur', 'Rogue'],
  'magicien': ['Magicien', 'Wizard'],
  // ajoute si besoin
};

const SUBCLASS_ALIASES: Record<string, string[]> = {
  // moine
  'voie de la paume': [
    'Voie de la Paume',
    'Voie de la Main Ouverte',
    'Way of the Open Hand',
    'Open Hand',
    'Way Of The Open Hand',
  ],
  'voie de la main ouverte': [
    'Voie de la Main Ouverte',
    'Voie de la Paume',
    'Way of the Open Hand',
    'Open Hand',
  ],
  // quelques alias génériques utiles
  'credo de la paume': ['Voie de la Paume', 'Voie de la Main Ouverte', 'Way of the Open Hand'],
};

/* Normalisation forte (lookup interne) */
function norm(s: string) {
  return (s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // sans accents
    .replace(/\s*\([^)]*\)\s*/g, ' ') // sans parenthèses
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* Pour affichage seulement (majuscule initiale) */
function sentenceCase(s: string) {
  const t = (s || '').toLocaleLowerCase('fr-FR').trim();
  if (!t) return t;
  const first = t.charAt(0).toLocaleUpperCase('fr-FR') + t.slice(1);
  return first.replace(/\b([A-Z]{2,})\b/g, '$1');
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function stripParentheses(s: string) {
  return (s || '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function stripDiacritics(s: string) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slug(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function ClassesTab({
  player,
  playerClass,
  className,
  subclassName,
  characterLevel,
}: Props) {
  const [sections, setSections] = useState<AbilitySection[]>([]);
  const [loading, setLoading] = useState(false);

  // État des cases cochées persistées
  const [checkedMap, setCheckedMap] = useState<Map<string, boolean>>(new Map());
  const [loadingChecks, setLoadingChecks] = useState(false);

  // RAW (pour la recherche)
  const rawClass = (player?.class ?? playerClass ?? className ?? '').trim();
  const rawSubclass = (player?.subclass ?? subclassName) ?? null;

  // DISPLAY (pour l’UI uniquement)
  const displayClass = rawClass ? sentenceCase(rawClass) : '';
  const displaySubclass = rawSubclass ? sentenceCase(rawSubclass) : null;

  const finalLevelRaw = player?.level ?? characterLevel ?? 1;
  const finalLevel = Math.max(1, Number(finalLevelRaw) || 1);
  const characterId = player?.id ?? null;

  // Chargement "smart" des sections avec variantes de normalisation + alias
  useEffect(() => {
    let mounted = true;

    if (!rawClass) {
      setSections([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await loadSectionsSmart({
          className: rawClass,
          subclassName: rawSubclass,
          level: finalLevel,
        });
        if (!mounted) return;
        setSections(res);
      } catch (e) {
        if (DEBUG) console.debug('[ClassesTab] loadSectionsSmart error:', e);
        if (!mounted) return;
        setSections([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [rawClass, rawSubclass, finalLevel]);

  // Charger l’état des cases cochées
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingChecks(true);
      try {
        const map = await loadFeatureChecks(characterId);
        if (!mounted) return;
        setCheckedMap(map);
      } catch (e) {
        if (DEBUG) console.debug('[ClassesTab] loadFeatureChecks error:', e);
        if (!mounted) return;
        setCheckedMap(new Map());
      } finally {
        if (mounted) setLoadingChecks(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [characterId]);

  // Toggle + persistance
  async function handleToggle(featureKey: string, checked: boolean) {
    // Optimistic UI
    setCheckedMap(prev => {
      const next = new Map(prev);
      next.set(featureKey, checked);
      return next;
    });
    // Persist
    try {
      await upsertFeatureCheck({
        characterId,
        className: displayClass,          // stocke version affichée
        subclassName: displaySubclass ?? null,
        featureKey,
        checked,
      });
    } catch (e) {
      if (DEBUG) console.debug('[ClassesTab] upsertFeatureCheck error:', e);
      // On peut rester optimiste
    }
  }

  const visible = useMemo(
    () =>
      sections
        .filter((s) => (typeof s.level === 'number' ? s.level <= finalLevel : true))
        .sort((a, b) => (a.level ?? 0) - (b.level ?? 0)),
    [sections, finalLevel]
  );

  const hasClass = !!displayClass;

  return (
    <div className="space-y-4">
      {/* En-tête minimal: <Classe> - <Sous-classe> */}
      <div className="bg-gradient-to-r from-violet-700/30 via-fuchsia-600/20 to-amber-600/20 border border-white/10 rounded-2xl px-4 py-3 ring-1 ring-black/5 shadow-md shadow-black/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">
            {hasClass ? displayClass : '—'}{displaySubclass ? ` - ${displaySubclass}` : ''}
          </span>
          <span className="text-xs text-white/70">Niveau {finalLevel}</span>
        </div>
      </div>

      {!hasClass ? (
        <div className="text-center text-white/70 py-10">
          Sélectionne une classe pour afficher les aptitudes.
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-400" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center text-white/70 py-10">
          Aucune aptitude trouvée pour “{displayClass}{displaySubclass ? ` - ${displaySubclass}` : ''}”.
          {DEBUG && <pre className="mt-3 text-xs text-white/60">Activez window.UT_DEBUG = true pour voir les tentatives de chargement dans la console.</pre>}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((s, i) => (
            <AbilityCard
              key={`${s.origin}-${s.level}-${i}`}
              section={s}
              defaultOpen={s.level === finalLevel}
              ctx={{
                characterId,
                className: displayClass,
                subclassName: displaySubclass,
                checkedMap,
                onToggle: handleToggle,
              }}
              disableContentWhileLoading={loadingChecks}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ———— Chargement "smart" des sections ————
   Essaie:
   - brut
   - sans parenthèses
   - sans accents
   - sentenceCase
   - alias FR/EN
   - fallback sans sous-classe
   Loggue les tentatives si UT_DEBUG = true.
*/
async function loadSectionsSmart(params: {
  className: string;
  subclassName: string | null;
  level: number;
}): Promise<AbilitySection[]> {
  const { className, subclassName, level } = params;

  const clsNorm = norm(className);
  const subNorm = subclassName ? norm(subclassName) : '';

  // Candidats de base
  const classCandidatesBase = uniq([
    className,
    stripDiacritics(className),
    stripParentheses(className),
    sentenceCase(className),
  ]).filter(Boolean) as string[];
  const subclassCandidatesBase = uniq([
    subclassName ?? '',
    stripParentheses(subclassName ?? ''),
    stripDiacritics(subclassName ?? ''),
    sentenceCase(subclassName ?? ''),
  ]).filter(Boolean) as string[];

  // Ajout des alias
  const classAlias = CLASS_ALIASES[clsNorm] ?? [];
  const subclassAlias = subNorm ? (SUBCLASS_ALIASES[subNorm] ?? []) : [];

  const classCandidates = uniq([...classCandidatesBase, ...classAlias]).filter(Boolean) as string[];
  const subclassCandidates = uniq([...subclassCandidatesBase, ...subclassAlias]).filter(Boolean) as string[];

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.debug('[ClassesTab] Tentatives de chargement', {
      input: { className, subclassName, level },
      normalized: { clsNorm, subNorm },
      classCandidates,
      subclassCandidates,
    });
  }

  // 1) Essayer toutes les combinaisons (classe x sous-classe)
  for (const c of classCandidates) {
    for (const sc of subclassCandidates) {
      try {
        if (DEBUG) console.debug('[ClassesTab] loadAbilitySections try', { className: c, subclassName: sc, level });
        const res = await loadAbilitySections({
          className: c,
          subclassName: sc,
          characterLevel: level,
        });
        const secs = (res?.sections ?? []) as AbilitySection[];
        if (Array.isArray(secs) && secs.length > 0) {
          if (DEBUG) console.debug('[ClassesTab] -> OK', { className: c, subclassName: sc, count: secs.length });
          return secs;
        }
      } catch (e) {
        if (DEBUG) console.debug('[ClassesTab] -> KO', { className: c, subclassName: sc, error: e });
      }
    }
  }

  // 2) Essayer avec la classe uniquement (sans sous-classe)
  for (const c of classCandidates) {
    try {
      if (DEBUG) console.debug('[ClassesTab] loadAbilitySections try (class only)', { className: c, level });
      const res = await loadAbilitySections({
        className: c,
        subclassName: null,
        characterLevel: level,
      });
      const secs = (res?.sections ?? []) as AbilitySection[];
      if (Array.isArray(secs) && secs.length > 0) {
        if (DEBUG) console.debug('[ClassesTab] -> OK (class only)', { className: c, count: secs.length });
        return secs;
      }
    } catch (e) {
      if (DEBUG) console.debug('[ClassesTab] -> KO (class only)', { className: c, error: e });
    }
  }

  // 3) Échec
  return [];
}

/* ———— Carte repliable, typo alignée, contenu bien visible ———— */

function AbilityCard({
  section,
  defaultOpen,
  ctx,
  disableContentWhileLoading,
}: {
  section: AbilitySection;
  defaultOpen?: boolean;
  ctx: MarkdownCtx;
  disableContentWhileLoading?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const contentId = `ability-${section.origin}-${section.level}-${slug(section.title)}`;

  return (
    <article
      className={[
        'rounded-xl border ring-1 ring-black/5 shadow-lg shadow-black/20',
        'border-amber-700/30',
        'bg-[radial-gradient(ellipse_at_top_left,rgba(120,53,15,.12),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(91,33,182,.10),transparent_45%)]',
      ].join(' ')}
    >
      {/* En-tête cliquable (toggle), sans étiquette texte */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3 p-4">
          <div className="pt-0.5 shrink-0">
            <LevelBadge level={section.level} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-base sm:text-lg truncate">
                {sentenceCase(section.title)}
              </h3>
              <OriginPill origin={section.origin} />
            </div>
          </div>

          <div className="ml-2 mt-0.5 text-white/80">
            {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {/* Contenu repliable — padding top léger, pas de marge négative */}
      <div
        id={contentId}
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ${open ? 'max-h-[200vh] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pt-1 pb-4">
          {disableContentWhileLoading ? (
            <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
          ) : (
            <div className="text-sm text-white/90 leading-relaxed space-y-2">
              <MarkdownLite
                text={section.content}
                ctx={{
                  ...ctx,
                  section: { level: section.level, origin: section.origin, title: section.title },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ———— Étiquettes ———— */

function LevelBadge({ level }: { level: number }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold',
        'bg-gradient-to-br from-violet-600/90 to-fuchsia-500/90 text-white',
        'ring-1 ring-inset ring-violet-300/30 shadow-sm shadow-black/20',
      ].join(' ')}
    >
      Niv. {level}
    </span>
  );
}

function OriginPill({ origin }: { origin: 'class' | 'subclass' }) {
  const isClass = origin === 'class';
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ring-1 ring-inset',
        isClass
          ? 'bg-violet-500/15 text-violet-200 ring-violet-400/25'
          : 'bg-amber-500/15 text-amber-200 ring-amber-400/25',
      ].join(' ')}
    >
      {isClass ? 'Classe' : 'Sous-classe'}
    </span>
  );
}

/* ———— Markdown léger avec support #### titres et ##### cases cochables ———— */

type MarkdownCtx = {
  characterId?: string | null;
  className: string;
  subclassName?: string | null;
  checkedMap?: Map<string, boolean>;
  onToggle?: (featureKey: string, checked: boolean) => void;
};

function MarkdownLite({ text, ctx }: { text: string; ctx: MarkdownCtx & { section: { level: number; origin: 'class' | 'subclass'; title: string } } }) {
  const nodes = useMemo(() => parseMarkdownLite(text, ctx), [text, ctx]);
  return <>{nodes}</>;
}

function parseMarkdownLite(
  md: string,
  ctx: MarkdownCtx & { section: { level: number; origin: 'class' | 'subclass'; title: string } }
): React.ReactNode[] {
  const lines = md.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const pushPara = (buff: string[]) => {
    const content = buff.join(' ').trim();
    if (!content) return;
    out.push(
      <p key={`p-${key++}`} className="text-sm">
        {formatInline(content)}
      </p>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      out.push(<div key={`sp-${key++}`} className="h-2" />);
      i++;
      continue;
    }

    // ##### -> case à cocher persistante
    const h5chk = line.match(/^\s*#####\s+(.*)$/);
    if (h5chk) {
      const rawLabel = h5chk[1];
      const label = sentenceCase(rawLabel);
      const featureKey = slug(`${ctx.section.level}-${ctx.section.origin}-${ctx.section.title}--${label}`);
      const checked = ctx.checkedMap?.get(featureKey) ?? false;
      const id = `chk-${key}`;

      out.push(
        <div key={`chk-${key++}`} className="flex items-start gap-2">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => ctx.onToggle?.(featureKey, e.currentTarget.checked)}
            className="mt-0.5 h-4 w-4 accent-violet-500 bg-black/40 border border-white/20 rounded"
          />
          <label htmlFor={id} className="text-sm text-white/90">
            {formatInline(label)}
          </label>
        </div>
      );
      i++;
      continue;
    }

    // #### -> petit titre, légèrement augmenté en casse (small-caps)
    const h4small = line.match(/^\s*####\s+(.*)$/);
    if (h4small) {
      out.push(
        <h5
          key={`h4s-${key++}`}
          className="text-white font-semibold text-[13px]"
          style={{ fontVariant: 'small-caps' }}
        >
          {formatInline(sentenceCase(h4small[1]))}
        </h5>
      );
      i++;
      continue;
    }

    // ### / ## / #
    const h3 = line.match(/^\s*###\s+(.*)$/);
    if (h3) {
      out.push(
        <h4 key={`h3-${key++}`} className="text-white font-semibold text-sm sm:text-base">
          {formatInline(sentenceCase(h3[1]))}
        </h4>
      );
      i++;
      continue;
    }
    const h2 = line.match(/^\s*##\s+(.*)$/);
    if (h2) {
      out.push(
        <h4 key={`h2-${key++}`} className="text-white font-semibold text-sm sm:text-base">
          {formatInline(sentenceCase(h2[1]))}
        </h4>
      );
      i++;
      continue;
    }
    const h1 = line.match(/^\s*#\s+(.*)$/);
    if (h1) {
      out.push(
        <h4 key={`h1-${key++}`} className="text-white font-semibold text-sm sm:text-base">
          {formatInline(sentenceCase(h1[1]))}
        </h4>
      );
      i++;
      continue;
    }

    // Table Markdown simple
    if (line.includes('|')) {
      const block: string[] = [];
      while (i < lines.length && lines[i].includes('|')) {
        block.push(lines[i]);
        i++;
      }
      const tableNode = renderTable(block, key);
      if (tableNode) {
        out.push(tableNode);
        key++;
        continue;
      }
      out.push(
        <p key={`pf-${key++}`} className="text-sm">
          {formatInline(block.join(' '))}
        </p>
      );
      continue;
    }

    // Liste à puces
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      out.push(
        <ul key={`ul-${key++}`} className="list-disc pl-5 space-y-1">
          {items.map((it, idx) => (
            <li key={`li-${idx}`} className="text-sm">
              {formatInline(it)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Liste ordonnée
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      out.push(
        <ol key={`ol-${key++}`} className="list-decimal pl-5 space-y-1">
          {items.map((it, idx) => (
            <li key={`oli-${idx}`} className="text-sm">
              {formatInline(it)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraphe (agrège jusqu’à ligne de rupture)
    const buff: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].includes('|') &&
      !/^\s*#{1,6}\s+/.test(lines[i])
    ) {
      buff.push(lines[i]);
      i++;
    }
    pushPara(buff);
  }

  return out;
}

function renderTable(block: string[], key: number): React.ReactNode | null {
  if (block.length < 2) return null;
  const rows = block.map(r =>
    r
      .split('|')
      .map(c => c.trim())
      .filter((_, idx, arr) => !(idx === 0 && arr[0] === '') && !(idx === arr.length - 1 && arr[arr.length - 1] === ''))
  );

  const hasSep = rows[1] && rows[1].every(cell => /^:?-{3,}:?$/.test(cell));
  const header = hasSep ? rows[0] : null;
  const body = hasSep ? rows.slice(2) : rows;

  return (
    <div key={`tbl-${key}`} className="overflow-x-auto">
      <table className="min-w-[360px] w-full text-sm border-separate border-spacing-y-1">
        {header && (
          <thead>
            <tr>
              {header.map((h, i) => (
                <th key={`th-${i}`} className="text-left text-white font-semibold px-2 py-1 bg-white/5 rounded">
                  {formatInline(sentenceCase(h))}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {body.map((cells, r) => (
            <tr key={`tr-${r}`}>
              {cells.map((c, ci) => (
                <td key={`td-${ci}`} className="px-2 py-1 text-white/90 bg-white/0">
                  {formatInline(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Inline: **gras**, *italique* ou _italique_
function formatInline(text: string): React.ReactNode[] {
  let parts: Array<string | React.ReactNode> = [text];

  // Gras **...**
  parts = splitAndMap(parts, /\*\*([^*]+)\*\*/g, (m, i) => <strong key={`b-${i}`} className="text-white">{m[1]}</strong>);

  // Italique *...*
  parts = splitAndMap(parts, /(^|[^*])\*([^*]+)\*(?!\*)/g, (m, i) => [m[1], <em key={`i-${i}`} className="italic">{m[2]}</em>]);

  // Italique _..._
  parts = splitAndMap(parts, /_([^_]+)_/g, (m, i) => <em key={`u-${i}`} className="italic">{m[1]}</em>);

  return parts.map((p, i) => (typeof p === 'string' ? <React.Fragment key={`t-${i}`}>{p}</React.Fragment> : p));
}

function splitAndMap(
  parts: Array<string | React.ReactNode>,
  regex: RegExp,
  toNode: (m: RegExpExecArray, idx: number) => React.ReactNode | React.ReactNode[]
): Array<string | React.ReactNode> {
  const out: Array<string | React.ReactNode> = [];

  for (const part of parts) {
    if (typeof part !== 'string') {
      out.push(part);
      continue;
    }
    let str = part;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    const r = new RegExp(regex.source, regex.flags);

    while ((m = r.exec(str)) !== null) {
      out.push(str.slice(lastIndex, m.index));
      const node = toNode(m, out.length);
      if (Array.isArray(node)) out.push(...node);
      else out.push(node);
      lastIndex = m.index + m[0].length;
    }
    out.push(str.slice(lastIndex));
  }
  return out;
}

export default ClassesTab;
export { ClassesTab };
