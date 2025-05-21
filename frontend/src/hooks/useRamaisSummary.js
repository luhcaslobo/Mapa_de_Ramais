import { useMemo } from 'react';
import useRamais from './useRamais';
import useMonitoramento from './useMonitoramento';

export default function useRamaisSummary() {
  const ramais = useRamais();
  const mon = useMonitoramento();
  
  return useMemo(() => {
    const inactive = new Set(mon.map(x => x["dir nb"]));
    
    const validFloors = [
      '4S', '3S', '2S', '1S', 'T',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12', '13', '14', '15', '16', '17', '18', '19',
      '20', '21', '22', '23'
    ];
    
    const normalizeFloor = (floor) => {
      const normalized = floor.toString().toUpperCase().trim();
      return validFloors.includes(normalized) ? normalized : null;
    };

    const summary = ramais.reduce((acc, r) => {
      const validFloor = normalizeFloor(r.andar);
      if (!validFloor) return acc;
      
      acc[validFloor] = acc[validFloor] || { 
        ativos: 0, 
        inativos: 0,
        total: 0
      };
      
      if (inactive.has(r.ramal)) {
        acc[validFloor].inativos++;
      } else {
        acc[validFloor].ativos++; 
      }
      acc[validFloor].total++;
      
      return acc;
    }, {});

    return summary;
  }, [ramais, mon]);
}
