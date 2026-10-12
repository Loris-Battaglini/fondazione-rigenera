import { creaCardHTML } from "./cards.js";
import { isPreferito, togglePreferito } from "../data/storage.js";

// Al primo avvio salvo i preferiti suggeriti nel catalogo.
export function inizializzaPreferitiPredefiniti(servizi) {
  try {
    if (localStorage.getItem("rigenera-preferiti") !== null) return;

    servizi
      .filter((servizio) => servizio.preferito)
      .forEach((servizio) => togglePreferito(servizio.id));
  } catch {
    // Se il browser blocca localStorage, il resto del sito continua a funzionare.
  }
}

// Aggiorno la lista e il contatore dei preferiti salvati.
export function aggiornaListaPreferiti(servizi) {
  const contenitore = document.getElementById("lista-preferiti");
  if (!contenitore) return;

  const preferiti = servizi.filter((servizio) => isPreferito(servizio.id));
  const contatore = document.getElementById("contatore-preferiti");

  if (contatore) {
    const quanti = preferiti.length;
    contatore.textContent = `${quanti} ${quanti === 1 ? "servizio salvato" : "servizi salvati"} su questo dispositivo.`;
  }

  contenitore.innerHTML = preferiti.length
    ? preferiti.map((servizio) => creaCardHTML(servizio)).join("")
    : '<div class="col-12 text-body-secondary">Non hai ancora salvato servizi.</div>';
}

// Intercetto i cuori in catalogo e nella lista, poi avviso chi deve ridisegnare la pagina.
export function inizializzaGestionePreferiti(dopoModifica) {
  document.addEventListener("click", (evento) => {
    const pulsante = evento.target.closest(
      "#container-servizi [data-preferito], #lista-preferiti [data-preferito]",
    );
    if (!pulsante) return;

    togglePreferito(pulsante.dataset.preferito);
    dopoModifica();
  });
}
