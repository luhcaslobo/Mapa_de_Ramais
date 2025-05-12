/* SearchRamal.jsx */
import { useState } from 'react';

export default function SearchRamal({ data, onSelect, inactive }) {
  const [q,  setQ]  = useState('');
  const [open, setOpen] = useState(false);

  const list = q
    ? data.filter(r => r.ramal.includes(q)).slice(0, 20)
    : [];

  return (
    <div className="relative flex justify-center">
      <input
        className="w-[80%] border px-2 py-1 rounded placeholder-black bg-white"
        placeholder="Pesquisar ramal…"
        value={q}
        onFocus={() => setOpen(true)}
        onBlur={()  => setTimeout(() => setOpen(false), 150)} // fecha depois do click
        onChange={e => { setQ(e.target.value); setOpen(true); }}
      />

      {open && list.length > 0 && (
        <ul className="absolute z-20 w-full max-h-48 overflow-auto rounded border bg-white shadow text-sm">
          {list.map(r => (
            <li
              key={r.ramal}
              className="cursor-pointer px-2 py-1 hover:bg-gray-100 flex items-center gap-1 "
              onClick={() => { onSelect(r); setQ(''); setOpen(false); }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: inactive?.has(r.ramal) ? '#dc2626' : '#16a34a' }}
              />
              {r.ramal} — {r.andar}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
