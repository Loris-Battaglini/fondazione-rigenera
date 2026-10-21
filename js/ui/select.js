// Aggiunge un'opzione per ogni valore. "predefinito" è selezionato all'avvio e dopo un reset del form.
export function aggiungiOpzioni(select, valori, predefinito) {
  if (!select) return;

  valori.forEach((valore) => {
    const selezionata = valore === predefinito;
    select.add(new Option(valore, valore, selezionata, selezionata));
  });
}
