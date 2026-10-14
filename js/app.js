import { caricaServizi } from "./data/data.js";
import {
  aggiornaListaPreferiti,
  inizializzaGestionePreferiti,
  inizializzaPreferitiPredefiniti,
} from "./components/favorites.js";
import {
  inizializzaHero,
  aggiornaConteggiAzioni,
  aggiornaTotaleServizi,
  aggiornaConteggiPreferiti,
  collegaCardAzioniAiFiltri,
} from "./components/counter.js";
import { inizializzaFiltri } from "./components/filters.js";

// Carico i dati una volta sola e li passo ai moduli che ne hanno bisogno.
async function avviaApp() {
  try {
    const servizi = await caricaServizi();
    inizializzaPreferitiPredefiniti(servizi);

    const aggiornaCatalogo = inizializzaFiltri(servizi);
    const aggiornaPreferiti = () => {
      aggiornaCatalogo();
      aggiornaListaPreferiti(servizi);
      aggiornaConteggiPreferiti(servizi);
    };

    aggiornaListaPreferiti(servizi);
    aggiornaConteggiPreferiti(servizi);
    inizializzaGestionePreferiti(aggiornaPreferiti);
    inizializzaHero(servizi);
    aggiornaConteggiAzioni(servizi);
    aggiornaTotaleServizi(servizi);
    collegaCardAzioniAiFiltri();
  } catch (errore) {
    console.error("Non sono riuscito a caricare i servizi:", errore);
  }
}

avviaApp();
