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

// Intercetto i cuori in catalogo e nella lista, poi avviso chi deve ridisegnare la pagina.
export function inizializzaGestionePreferiti(dopoModifica) {
  document.addEventListener("click", (evento) => {
    const pulsante = evento.target.closest(
      "#container-servizi [data-preferito], #lista-preferiti [data-preferito]",
    );
    if (!pulsante) return;

    const id = pulsante.dataset.preferito;
    togglePreferito(id);
    dopoModifica();

    // Ripristino il focus sul cuore ridisegnato.
    const selettore = `[data-preferito="${CSS.escape(id)}"]`;
    const elenco = pulsante.closest("#lista-preferiti")
      ? "#lista-preferiti"
      : "#container-servizi";
    (
      document.querySelector(`${elenco} ${selettore}`) ??
      document.querySelector(`#container-servizi ${selettore}`)
    )?.focus();
  });
}
