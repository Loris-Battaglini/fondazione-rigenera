import { caricaServizi, caricaCategorie } from "./data/data.js";
import {
  aggiornaListaPreferiti,
  inizializzaGestionePreferiti,
} from "./components/favorites.js";
import {
  inizializzaHero,
  aggiornaConteggiAzioni,
  aggiornaTotaleServizi,
  aggiornaConteggiPreferiti,
} from "./components/counter.js";
import {
  inizializzaFiltri,
  collegaCardAzioniAiFiltri,
} from "./components/filters.js";
import { inizializzaFormSegnalazione } from "./components/report.js";

// Carico i dati una volta sola e li passo ai moduli che ne hanno bisogno.
function avviaApp() {
  // Categorie ammesse nel form di segnalazione.
  const categorie = caricaCategorie();
  inizializzaFormSegnalazione(categorie);
  let servizi;

  try {
    servizi = caricaServizi();
  } catch (errore) {
    console.error("Servizi non caricati", errore);
    // Messaggio visibile anche all'utente, non solo in console.
    const contenitore = document.getElementById("container-servizi");
    if (contenitore) {
      contenitore.innerHTML = `<div class="catalogo-vuoto text-center py-4 text-muted" role="listitem">Non è stato possibile caricare i servizi. Ricarica la pagina.</div>`;
    }
    return;
  }

  const aggiornaCatalogo = inizializzaFiltri(servizi);
  const aggiornaPreferiti = () => {
    aggiornaCatalogo();
    aggiornaListaPreferiti(servizi);
    aggiornaConteggiPreferiti(servizi);
  };

  aggiornaListaPreferiti(servizi);
  aggiornaConteggiPreferiti(servizi);
  inizializzaGestionePreferiti(aggiornaPreferiti);
  // Sincronizzo i preferiti modificati in altre schede.
  window.addEventListener("storage", (evento) => {
    if (evento.key === "rigenera-preferiti") aggiornaPreferiti();
  });
  inizializzaHero(servizi);
  aggiornaConteggiAzioni(servizi);
  aggiornaTotaleServizi(servizi);
  collegaCardAzioniAiFiltri();
}

avviaApp();
