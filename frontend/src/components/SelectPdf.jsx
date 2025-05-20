import { PDFS } from '../constants';

export default function SelectPdf({ value, onChange }) {
  const sortFloors = (a, b) => {
    // Função auxiliar para converter nome do andar em valor numérico para ordenação
    const getFloorValue = (floor) => {
      if (floor.endsWith('S')) return -parseInt(floor[0]); // Subsolos serão negativos
      if (floor === 'T') return 0;
      return parseInt(floor);
    };

    return getFloorValue(a.nome) - getFloorValue(b.nome);
  };

  return (
    <div className='relative flex justify-center'>
      <select className=' w-[80%] border px-2 py-1 rounded border-black bg-white text-black' value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Selecione o andar…</option>
        {[...PDFS].sort(sortFloors).map(p => (
          <option key={p.url} value={p.url}>{p.nome}</option>
        ))}
      </select>
    </div>
  );
}
