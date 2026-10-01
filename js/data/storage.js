// Salva nel browser (localStorage) i dati dell'utente, come i servizi preferiti.
// I dati restano anche chiudendo la pagina, ma solo sul browser e dispositivo dell'utente.

const CHIAVE_PREFERITI = 'rigenera-preferiti';

// Restituisce la lista degli id dei servizi preferiti, es. ["ciclofficina-popolare"]
export function leggiPreferiti() {
  try {
    const testo = localStorage.getItem(CHIAVE_PREFERITI);
    const lista = testo ? JSON.parse(testo) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    // localStorage bloccato (es. navigazione privata) o dato rovinato
    return [];
  }
}

// Scrive la lista nel localStorage (uso interno: non è esportata)
function salvaPreferiti(lista) {
  try {
    localStorage.setItem(CHIAVE_PREFERITI, JSON.stringify(lista));
  } catch {
    // Se non si può salvare, il sito continua a funzionare senza memoria
  }
}

// true se il servizio è tra i preferiti
export function isPreferito(id) {
  return leggiPreferiti().includes(id);
}

// Aggiunge il servizio se non c'è, lo toglie se c'è già.
// Restituisce true se ora è un preferito, false se è stato tolto.
export function togglePreferito(id) {
  const lista = leggiPreferiti();

  if (lista.includes(id)) {
    salvaPreferiti(lista.filter((idSalvato) => idSalvato !== id));
    return false;
  }

  lista.push(id);
  salvaPreferiti(lista);
  return true;
}