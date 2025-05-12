/*  src/hooks/useMonitoramento.js  */
import { useEffect, useState } from 'react';

/* Lê /pabx/monitoramento.json a cada 60s */
export default function useMonitoramento() {
  const [lista, setLista] = useState([]);

  useEffect(() => {
    let timer;

    async function load() {
      try {
        const url = `/pabx/monitoramento.json?ts=${Date.now()}`;   // servido pelo FastAPI
        const data = await fetch(url).then(r => {
          if (!r.ok) throw new Error(`HTTP${r.status}`);
          return r.json();
        });
        setLista(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('monitoramento.json', err);
        setLista([]);                       // evita exibir cache antigo
      }
    }

    load();                                 // primeira leitura
    timer = setInterval(load, 60_000);      // 60s

    return () => clearInterval(timer);      // limpa no unmount
  }, []);

  return lista;
}
