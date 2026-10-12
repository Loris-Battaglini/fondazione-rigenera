// Salva nel browser (localStorage) i dati dell'utente, come i servizi preferiti.
// I dati restano anche chiudendo la pagina, ma solo sul browser e dispositivo dell'utente.

// Restituisce la lista degli id dei servizi preferiti
export function leggiPreferiti() {
  try {
    const testo = localStorage.getItem("rigenera-preferiti");
    const lista = testo ? JSON.parse(testo) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

// Scrive la lista nel localStorage (uso interno: non è esportata)
export function salvaPreferiti(lista) {
  try {
    localStorage.setItem("rigenera-preferiti", JSON.stringify(lista));
  } catch {
    // Se non si può salvare, il sito continua a funzionare senza memoria
  }
}

export function notificaPreferitiAggiornati() {
  window.dispatchEvent(new Event("rigenera:preferiti-aggiornati"));
}

export function isPreferito(id) {
  return leggiPreferiti().includes(id);
}

// Aggiunge il servizio se non c'è, lo toglie se c'è già.
export function togglePreferito(id) {
  const lista = leggiPreferiti();

  if (lista.includes(id)) {
    salvaPreferiti(lista.filter((idSalvato) => idSalvato !== id));
    notificaPreferitiAggiornati();
    return false;
  }

  lista.push(id);
  salvaPreferiti(lista);
  notificaPreferitiAggiornati();
  return true;
}
