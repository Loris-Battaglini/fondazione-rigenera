import { caricaServizi } from "./data/data.js";
import { leggiPreferiti } from "./data/storage.js";

const statisticheHero = {
  servizi: document.querySelector('[data-hero-stat="servizi"]'),
  preferiti: document.querySelector('[data-hero-stat="preferiti"]'),
  categorie: document.querySelector('[data-hero-stat="categorie"]'),
};

let servizi = [];

function aggiornaStatisticheHero() {
  const idServizi = new Set(servizi.map((servizio) => servizio.id));
  const numeroPreferiti = leggiPreferiti().filter((id) =>
    idServizi.has(id),
  ).length;
  const categorie = new Set(
    servizi.map((servizio) => servizio.categoria).filter(Boolean),
  );

  if (statisticheHero.servizi) {
    statisticheHero.servizi.textContent = String(servizi.length);
  }
  if (statisticheHero.preferiti) {
    statisticheHero.preferiti.textContent = String(numeroPreferiti);
  }
  if (statisticheHero.categorie) {
    statisticheHero.categorie.textContent = String(categorie.size);
  }
}

async function inizializzaHero() {
  if (!Object.values(statisticheHero).some(Boolean)) return;

  window.addEventListener(
    "rigenera:preferiti-aggiornati",
    aggiornaStatisticheHero,
  );
  window.addEventListener("storage", (evento) => {
    if (evento.key === "rigenera-preferiti") aggiornaStatisticheHero();
  });

  try {
    servizi = await caricaServizi();
    aggiornaStatisticheHero();
  } catch (errore) {
    console.error("Impossibile aggiornare le statistiche della Hero:", errore);
  }
}

inizializzaHero();
