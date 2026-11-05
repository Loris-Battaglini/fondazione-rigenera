import { renderizzaCard } from "./cards.js";
import { isPreferito, togglePreferito } from "../data/storage.js";
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

  if (preferiti.length) {
    renderizzaCard(contenitore, preferiti);
  } else {
    contenitore.innerHTML =
      '<div class="col-12 text-body-secondary">Non hai ancora salvato servizi.</div>';
  }
}

// Intercetta i cuori in catalogo e nella lista
// L'aggiornamento della pagina lo fa app.js quando arriva l'evento dei preferiti
export function inizializzaGestionePreferiti() {
  document.addEventListener("click", (evento) => {
    const pulsante = evento.target.closest(
      "#container-servizi [data-preferito], #lista-preferiti [data-preferito]",
    );
    if (!pulsante) return;
    const id = pulsante.dataset.preferito;
    const elenco = pulsante.closest("#lista-preferiti, #container-servizi");

    togglePreferito(id);

    // Focus sullo stesso cuore se c'è ancora, altrimenti sul primo della lista, 
    // se la lista è vuota sul pulsante accordion
    const stesso = elenco.querySelector(`[data-preferito="${CSS.escape(id)}"]`);
    const primo = elenco.querySelector("[data-preferito]");
    const accordion = document.getElementById("collapse-preferiti");
    if (stesso) {
      stesso.focus();
    } else if (primo) {
      primo.focus();
    } else if (accordion) {
      accordion.focus();
    }
  });
}
