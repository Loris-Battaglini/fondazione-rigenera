import { renderizzaCard } from "./cards.js";

let listaServizi = [];

// Su telefono le card si mostrano a blocchi di 3.
const CARD_PER_BLOCCO = 3;
let cardVisibiliMobile = CARD_PER_BLOCCO;

// Rendo confrontabili testo e filtri anche quando cambia maiuscole o spazi.
function normalizza(valore) {
  return String(valore ?? "")
    .trim()
    .toLocaleLowerCase("it");
}

// Applico i filtri attivi e ridisegno i risultati del catalogo.
function aggiornaPagina() {
  const testoCercato = normalizza(
    document.getElementById("filtro-testo")?.value,
  );
  const tagSelezionato = normalizza(
    document.getElementById("filtro-tag")?.value || "tutti",
  );
  const zonaSelezionata = normalizza(
    document.getElementById("filtro-zona")?.value || "tutti",
  );
  const azioneSelezionata = normalizza(
    document.querySelector(".pill-btn.attivo")?.dataset.azione || "tutti",
  );

  const serviziFiltrati = listaServizi.filter((servizio) => {
    const matchTesto = [
      servizio.nome,
      servizio.descrizione,
      servizio.categoria,
      servizio.citta,
      servizio.zona,
      servizio.indirizzo,
    ].some((valore) => normalizza(valore).includes(testoCercato));

    const matchTag =
      tagSelezionato === "tutti" || normalizza(servizio.categoria) === tagSelezionato;

    const indirizzo = normalizza(
      [servizio.citta, servizio.zona, servizio.indirizzo]
        .filter(Boolean)
        .join(" "),
    );
    const matchZona =
      zonaSelezionata === "tutti" || indirizzo.includes(zonaSelezionata);

    const matchAzione =
      azioneSelezionata === "tutti" ||
      normalizza(servizio.azione) === azioneSelezionata;

    return matchTesto && matchTag && matchZona && matchAzione;
  });

  // Aggiorna contatore
  const contatore =
    document.getElementById("contatore-servizi") ||
    document.querySelector(
      "#catalogo .d-flex.justify-content-between.align-items-center.mb-4 > span",
    );
  if (contatore) {
    contatore.textContent = `${serviziFiltrati.length} servizi trovati`;
  }

  // Inietta card
  const contenitore = document.getElementById("container-servizi");
  if (contenitore) {
    if (serviziFiltrati.length === 0) {
      contenitore.innerHTML = `<div class="catalogo-vuoto text-center py-4 text-muted" role="listitem">Nessun servizio trovato con i filtri selezionati.</div>`;
    } else {
      renderizzaCard(contenitore, serviziFiltrati, true);
    }
    aggiornaFreccieCatalogo();
    aggiornaVediDiPiu();
  }
}

// Aggiorno i risultati quando l'utente cambia uno dei filtri:
// su telefono la lista riparte dalle prime 3 card.
function aggiornaFiltri() {
  cardVisibiliMobile = CARD_PER_BLOCCO;
  aggiornaPagina();
}

// Su telefono nascondo le card oltre quelle da mostrare e decido quali pulsanti servono.
// La classe "catalogo-slide-nascosta" ha effetto solo su telefono (vedi _catalogo.scss).
function aggiornaVediDiPiu() {
  const card = document.querySelectorAll("#container-servizi .catalogo-slide");
  const vediDiPiu = document.getElementById("catalogo-vedi-di-piu");
  const chiudi = document.getElementById("catalogo-chiudi");

  card.forEach((elemento, indice) => {
    elemento.classList.toggle(
      "catalogo-slide-nascosta",
      indice >= cardVisibiliMobile,
    );
  });

  if (vediDiPiu) vediDiPiu.hidden = cardVisibiliMobile >= card.length;
  if (chiudi) chiudi.hidden = cardVisibiliMobile <= CARD_PER_BLOCCO;
}

// Collego "Vedi di più" (altre 3 card) e "Chiudi" (si torna alle prime 3).
function inizializzaVediDiPiu() {
  document
    .getElementById("catalogo-vedi-di-piu")
    ?.addEventListener("click", () => {
      cardVisibiliMobile += CARD_PER_BLOCCO;
      aggiornaVediDiPiu();
    });

  document.getElementById("catalogo-chiudi")?.addEventListener("click", () => {
    cardVisibiliMobile = CARD_PER_BLOCCO;
    aggiornaVediDiPiu();

    // Il pulsante "Chiudi" sparisce: riporto in alto la lista e il focus,
    // così chi usa la tastiera non perde il punto in cui si trova.
    const viewport = document.getElementById("catalogo-viewport");
    viewport?.focus({ preventScroll: true });
    viewport?.scrollIntoView({ block: "start" });
  });
}

// Mostro o disattivo le frecce in base allo spazio ancora da scorrere.
function aggiornaFreccieCatalogo() {
  const viewport = document.getElementById("catalogo-viewport");
  const precedente = document.getElementById("catalogo-precedente");
  const successivo = document.getElementById("catalogo-successivo");
  if (!viewport || !precedente || !successivo) return;

  const massimoScorrimento = viewport.scrollWidth - viewport.clientWidth;
  const haScorrimento = massimoScorrimento > 1;
  // "invisible" di Bootstrap nasconde le frecce ma lascia il loro spazio,
  // così il contenitore delle card non si allarga quando le frecce non servono.
  precedente.classList.toggle("invisible", !haScorrimento);
  successivo.classList.toggle("invisible", !haScorrimento);
  precedente.disabled = !haScorrimento || viewport.scrollLeft <= 1;
  successivo.disabled =
    !haScorrimento || viewport.scrollLeft >= massimoScorrimento - 1;
}

// Collego frecce, scorrimento touch e ridimensionamento del carosello.
function inizializzaCarosello() {
  const viewport = document.getElementById("catalogo-viewport");
  if (!viewport) return;

  const scorri = (direzione) => {
    const traccia = document.getElementById("container-servizi");
    const spazio = Number.parseFloat(getComputedStyle(traccia).columnGap) || 0;
    viewport.scrollTo({
      left: viewport.scrollLeft + direzione * (viewport.clientWidth + spazio),
      behavior: "instant",
    });
    aggiornaFreccieCatalogo();
  };

  document
    .getElementById("catalogo-precedente")
    ?.addEventListener("click", () => scorri(-1));
  document
    .getElementById("catalogo-successivo")
    ?.addEventListener("click", () => scorri(1));
  viewport.addEventListener("scroll", aggiornaFreccieCatalogo, {
    passive: true,
  });
  window.addEventListener("resize", aggiornaFreccieCatalogo);
  aggiornaFreccieCatalogo();
}

// Collego i controlli del catalogo e restituisco l'aggiornamento dei risultati.
export function inizializzaFiltri(servizi) {
  listaServizi = servizi;
  inizializzaCarosello();
  inizializzaVediDiPiu();
  document
    .getElementById("filtro-testo")
    ?.addEventListener("input", aggiornaFiltri);
  document
    .getElementById("filtro-tag")
    ?.addEventListener("change", aggiornaFiltri);
  document
    .getElementById("filtro-zona")
    ?.addEventListener("change", aggiornaFiltri);

  document.querySelectorAll(".pill-btn").forEach((bottone) => {
    bottone.addEventListener("click", (evento) => {
      document
        .querySelectorAll(".pill-btn")
        .forEach((btn) => btn.classList.remove("attivo"));
      evento.currentTarget.classList.add("attivo");
      aggiornaFiltri();
    });
  });

  const resetFiltri = document.getElementById("reset-filtri");
  resetFiltri?.addEventListener("click", (evento) => {
    evento.preventDefault();

    if (document.getElementById("filtro-testo"))
      document.getElementById("filtro-testo").value = "";
    if (document.getElementById("filtro-tag"))
      document.getElementById("filtro-tag").value = "tutti";
    if (document.getElementById("filtro-zona"))
      document.getElementById("filtro-zona").value = "tutti";

    document
      .querySelectorAll(".pill-btn")
      .forEach((btn) => btn.classList.remove("attivo"));
    document
      .querySelector('.pill-btn[data-azione="tutti"]')
      ?.classList.add("attivo");

    aggiornaFiltri();
  });

  aggiornaPagina();
  return aggiornaPagina;
}
