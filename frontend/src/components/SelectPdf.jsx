import { PDFS } from '../constants';

export default function SelectPdf({ value, onChange }) {
  return (
    <div className='relative flex justify-center'>
      <select className=' w-[80%] border px-2 py-1 rounded border-black bg-white text-black' value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Selecione o andar…</option>
        {PDFS.map(p => (
          <option key={p.url} value={p.url}>{p.nome}</option>
        ))}
      </select>
    </div>
  );
}
