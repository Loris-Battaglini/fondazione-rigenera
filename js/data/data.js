// Gestisce i dati dei servizi che arrivano dal file JSON.

const URL_DATI = 'mock/data.json';

// Carica tutti i servizi dal JSON e restituisce un array.
// È "async" perché leggere un file richiede tempo: le funzioni devono avere "await".

export async function caricaServizi() {
  const risposta = await fetch(URL_DATI);

  const dati = await risposta.json();

  // Se "items" manca o non è una lista, restituiamo una lista vuota
  return Array.isArray(dati.items) ? dati.items : [];
}

// Cerca un servizio nella lista a partire dal suo id
export function trovaServizio(servizi, id) {
  return servizi.find((servizio) => servizio.id === id);
}