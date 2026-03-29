import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type ProfileRow = Database['public']['Tables']['user_profiles']['Row'];

type UserPickerProps = {
  value: string | null;
  onChange: (userId: string | null, displayName: string | null) => void;
  label?: string;
  placeholder?: string;
};

export function UserPicker({
  value,
  onChange,
  label = 'Buscar miembro',
  placeholder = 'Nombre o DNI…',
}: UserPickerProps) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<ProfileRow[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const loadSelected = useCallback(async () => {
    if (!value) {
      setSelectedLabel(null);
      return;
    }
    const { data } = await supabase.from('user_profiles').select('id, full_name, dni').eq('id', value).maybeSingle();
    if (data) setSelectedLabel(`${data.full_name} (${data.dni})`);
  }, [value]);

  useEffect(() => {
    loadSelected();
  }, [loadSelected]);

  useEffect(() => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      const safe = q.trim().replace(/%/g, '');
      const pat = `%${safe}%`;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, dni, current_level')
        .or(`full_name.ilike.${pat},dni.ilike.${pat}`)
        .limit(12);
      setLoading(false);
      if (!error && data) setResults(data);
      else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const pick = (p: ProfileRow) => {
    onChange(p.id, p.full_name);
    setSelectedLabel(`${p.full_name} (${p.dni})`);
    setQ('');
    setResults([]);
    setOpen(false);
  };

  const clear = () => {
    onChange(null, null);
    setSelectedLabel(null);
    setQ('');
    setResults([]);
  };

  return (
    <div className="relative space-y-1">
      <label className="block text-sm font-semibold text-neutral-800">{label}</label>
      {value && selectedLabel ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm bg-neutral-100 px-3 py-2 rounded-lg border border-neutral-200">{selectedLabel}</span>
          <button type="button" onClick={clear} className="text-sm text-primary-600 font-semibold hover:underline">
            Quitar
          </button>
        </div>
      ) : (
        <>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
            autoComplete="off"
          />
          {open && (results.length > 0 || loading) && (
            <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border border-neutral-200 rounded-lg shadow-lg text-sm">
              {loading && <li className="px-3 py-2 text-neutral-500">Buscando…</li>}
              {!loading &&
                results.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-primary-50"
                      onClick={() => pick(p)}
                    >
                      <span className="font-medium">{p.full_name}</span>
                      <span className="text-neutral-500 ml-2">
                        {p.dni} · {p.current_level}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
