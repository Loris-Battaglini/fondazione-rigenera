// Gestisce i dati dei servizi che arrivano dal file JSON.

const URL_DATI = "mock/data.json";

// Carica tutti i servizi dal JSON e restituisce un array.
// È "async" perché leggere un file richiede tempo: le funzioni devono avere "await".

export async function caricaServizi() {
  const risposta = await fetch(URL_DATI);
  if (!risposta.ok)
    throw new Error(`Caricamento servizi fallito: ${risposta.status}`);
  const dati = await risposta.json();

  if (Array.isArray(dati)) return dati;
  return Array.isArray(dati.items) ? dati.items : [];
}

// Cerca un servizio nella lista a partire dal suo id
export function trovaServizio(servizi, id) {
  return servizi.find((servizio) => servizio.id === id);
}
