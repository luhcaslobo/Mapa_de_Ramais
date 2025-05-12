import { useMemo } from 'react';
import subscribers from '/src/assets/pabx/subscribers.json';

export default function useSubscribers(andar) {
  return useMemo(() => {
    if (!andar) return {};
    const map = {};
    subscribers
      .filter(s => String(s.Annu_First_Name) === andar)
      .forEach(s => {
        const c = (s.UTF8_Comment3 || '').trim();
        if (!c) return;
        (map[c] ||= []).push(s.Directory_Number);
      });
    return map;
  }, [andar]);
}
