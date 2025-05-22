import { useMemo } from 'react';
import subscribers from '/src/assets/pabx/subscribers.json';

/* devolve [{ ramal:'1234', andar:'14ANDAR', comment:'P4‑10' }] */
export default function useRamais() {
  return useMemo(
    () =>
      subscribers
        .map(s => ({
          ramal:   String(s.Directory_Number).trim(),
          andar:   String(s.Annu_First_Name).trim(),   // nome do PDF
          nome:  String(s.Annu_Name).trim(),    // nome do ramal
          comment: (s.UTF8_Comment3 || '').trim(),     // pop‑over alvo
        }))
        .filter(r => r.ramal && r.andar && r.comment),
    [],
  );
}
