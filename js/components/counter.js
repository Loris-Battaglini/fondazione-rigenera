import {
  ascoltaPreferitiAggiornati,
  leggiPreferiti,
} from "../data/storage.js";

const statisticheHero = {
  servizi: document.querySelector('[data-hero-stat="servizi"]'),
  preferiti: document.querySelector('[data-hero-stat="preferiti"]'),
  categorie: document.querySelector('[data-hero-stat="categorie"]'),
};

// Scrive un numero dentro un elemento della pagina, solo se l'elemento esiste.
// La usiamo sia per la Hero sia per le card della sezione categoria.
export function scriviNumero(elemento, numero) {
  if (elemento) {
    elemento.textContent = String(numero);
  }
}

// Conta quanti servizi appartengono a una certa azione (es. "riparazione", "scambio", "donazione", "riciclo").
export function contaServiziPerCategoria(servizi, categoria) {
  let conteggio = 0;

  for (let i = 0; i < servizi.length; i++) {
    if (servizi[i].azione === categoria) {
      conteggio = conteggio + 1;
    }
  }

  return conteggio;
}

// Conta quanti preferiti salvati corrispondono a servizi presenti nel catalogo.
// La usiamo sia per la Hero sia per l'accordion dei preferiti nel Catalogo.
export function contaPreferiti(servizi) {
  const idPreferiti = leggiPreferiti();
  let conteggio = 0;

  for (let i = 0; i < servizi.length; i++) {
    if (idPreferiti.includes(servizi[i].id)) {
      conteggio = conteggio + 1;
    }
  }

  return conteggio;
}

// Scrive il numero dei preferiti in tutti gli elementi
// che hanno l'attributo data-conteggio-preferiti (es. il badge dell'accordion nel Catalogo).
export function aggiornaConteggiPreferiti(servizi) {
  const elementiConteggio = document.querySelectorAll(
    "[data-conteggio-preferiti]",
  );
  const numeroPreferiti = contaPreferiti(servizi);

  for (let i = 0; i < elementiConteggio.length; i++) {
    scriviNumero(elementiConteggio[i], numeroPreferiti);
  }
}

// Ricalcola i numeri della Hero usando i dati già caricati dall'app.
export function aggiornaStatisticheHero(servizi) {
  const numeroPreferiti = contaPreferiti(servizi);
  const categorie = new Set(
    servizi.map((servizio) => servizio.azione).filter(Boolean),
  );

  scriviNumero(statisticheHero.servizi, servizi.length);
  scriviNumero(statisticheHero.preferiti, numeroPreferiti);
  scriviNumero(statisticheHero.categorie, categorie.size);
}

// Aggiorna i numeri dentro le card della sezione categoria.
// Ogni card ha uno span con l'attributo data-conteggio="nome-categoria":
// legge il nome della categoria dall'attributo e ci scrive il numero di servizi.
export function aggiornaConteggiAzioni(servizi) {
  const elementiConteggio = document.querySelectorAll("[data-conteggio]");

  for (let i = 0; i < elementiConteggio.length; i++) {
    const elemento = elementiConteggio[i];
    const categoria = elemento.getAttribute("data-conteggio");
    const numeroServizi = contaServiziPerCategoria(servizi, categoria);

    scriviNumero(elemento, numeroServizi);
  }
}

// Al click di una card della sezione categoria attiva il filtro corrispondente nel Catalogo.
// Legge la categoria dallo span data-conteggio della card (lo stesso usato per i numeri)
// e clicca il bottone del Catalogo con lo stesso data-azione, così il filtro
// viene applicato dal codice già esistente in filters.js.
export function collegaCardAzioniAiFiltri() {
  const cardAzioni = document.querySelectorAll(".tile-azione");

  for (let i = 0; i < cardAzioni.length; i++) {
    const card = cardAzioni[i];

    card.addEventListener("click", function () {
      const elementoConteggio = card.querySelector("[data-conteggio]");
      if (!elementoConteggio) {
        return;
      }

      // Prima azzera la ricerca e gli altri filtri usando il link "Azzera filtri"
      // già presente nel Catalogo, così resta attivo solo il filtro della card.
      const linkAzzeraFiltri = document.getElementById("reset-filtri");
      if (linkAzzeraFiltri) {
        linkAzzeraFiltri.click();
      }

      const categoria = elementoConteggio.getAttribute("data-conteggio");
      const bottoneFiltro = document.querySelector(
        '.pill-btn[data-azione="' + categoria + '"]',
      );

      if (bottoneFiltro) {
        bottoneFiltro.click();
      }
    });
  }
}

// Scrive il numero totale dei servizi in tutti gli elementi
// che hanno l'attributo data-totale-servizi (es. il sottotitolo del Catalogo).
export function aggiornaTotaleServizi(servizi) {
  const elementiTotale = document.querySelectorAll("[data-totale-servizi]");

  for (let i = 0; i < elementiTotale.length; i++) {
    scriviNumero(elementiTotale[i], servizi.length);
  }
}

// Collego i contatori agli aggiornamenti dei preferiti.
export function inizializzaHero(servizi) {
  if (!Object.values(statisticheHero).some(Boolean)) return;

  ascoltaPreferitiAggiornati(() => aggiornaStatisticheHero(servizi));

  aggiornaStatisticheHero(servizi);
}
