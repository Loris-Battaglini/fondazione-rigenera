// Verifica se un campo testo obbligatorio non è vuoto
export const campoObbligatorioValido = (valore) => {
  return valore !== null && valore !== undefined && valore.trim() !== "";
};

// Verifica il formato dell'email (se compilata)
export const emailValida = (valore) => {
  if (!valore || valore.trim() === "") return true; // Se vuoto è valido (se non obbligatorio)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(valore.trim());
};

// Verifica che il telefono contenga almeno 7 cifre (se compilato)
export const telefonoValido = (valore) => {
  if (!valore || valore.trim() === "") return true;

  const telefono = valore.trim();
  const formatoValido = /^[0-9\s()\-]{7,}$/.test(telefono);
  const numeroCifre = telefono.replace(/\D/g, "").length;

  return formatoValido && numeroCifre >= 7;
};

// Verifica che sia stato selezionato almeno un giorno
export const giorniValidi = (giorni) => {
  return Array.isArray(giorni) && giorni.length > 0;
};

// Verifica la coerenza degli orari (orario chiusura successivo ad apertura o servizio notturno)
export const orariValidi = (apertura, chiusura, servizioNotturno) => {
  if (!apertura || !chiusura) return true;
  if (servizioNotturno) return true;
  return chiusura > apertura;
};
