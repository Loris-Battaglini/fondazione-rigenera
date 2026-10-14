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

const CHIAVE_SEGNALAZIONI = "rigenera-segnalazioni";
const CHIAVE_BOZZA_SEGNALAZIONE = "rigenera-segnalazione-bozza";

export function salvaSegnalazione(segnalazione) {
  try {
    const testo = localStorage.getItem(CHIAVE_SEGNALAZIONI);
    const segnalazioni = testo ? JSON.parse(testo) : [];
    const lista = Array.isArray(segnalazioni) ? segnalazioni : [];
    lista.push(segnalazione);
    localStorage.setItem(CHIAVE_SEGNALAZIONI, JSON.stringify(lista));
  } catch (errore) {
    console.error("Impossibile salvare la segnalazione:", errore);
  }
}

export function salvaBozzaSegnalazione(bozza) {
  try {
    localStorage.setItem(CHIAVE_BOZZA_SEGNALAZIONE, JSON.stringify(bozza));
  } catch (errore) {
    console.error("Impossibile salvare la bozza della segnalazione:", errore);
  }
}

export function leggiBozzaSegnalazione() {
  try {
    const testo = localStorage.getItem(CHIAVE_BOZZA_SEGNALAZIONE);
    const bozza = testo ? JSON.parse(testo) : {};
    return bozza && typeof bozza === "object" && !Array.isArray(bozza) ? bozza : {};
  } catch (errore) {
    console.error("Impossibile leggere la bozza della segnalazione:", errore);
    return {};
  }
}
