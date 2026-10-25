import { caricaServizi, caricaCategorie } from "./data/data.js";
import {
  aggiornaListaPreferiti,
  inizializzaGestionePreferiti,
} from "./components/favorites.js";
import {
  ascoltaPreferitiAggiornati,
  inizializzaAscoltoPreferitiEsterni,
} from "./data/storage.js";
import {
  inizializzaHero,
  aggiornaConteggiAzioni,
  aggiornaTotaleServizi,
  aggiornaConteggiPreferiti,
  collegaCardAzioniAiFiltri,
} from "./components/counter.js";
import { inizializzaFiltri } from "./components/filters.js";
import { inizializzaFormSegnalazione } from "./components/report.js";

// Carico i dati una volta sola e li passo ai moduli che ne hanno bisogno.
function avviaApp() {
  // Categorie condivise tra form e filtro.
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

  const aggiornaCatalogo = inizializzaFiltri(servizi, categorie);
  const aggiornaPreferiti = () => {
    aggiornaCatalogo();
    aggiornaConteggiPreferiti(servizi);
  };

  aggiornaListaPreferiti(servizi);
  aggiornaConteggiPreferiti(servizi);
  inizializzaAscoltoPreferitiEsterni();
  ascoltaPreferitiAggiornati(aggiornaPreferiti);
  inizializzaGestionePreferiti(servizi);
  inizializzaHero(servizi);
  aggiornaConteggiAzioni(servizi);
  aggiornaTotaleServizi(servizi);
  collegaCardAzioniAiFiltri();
}

avviaApp();
