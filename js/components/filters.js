import { renderizzaCard } from "./cards.js";

let listaServizi = [];

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
      servizio.tag,
      servizio.zona,
      servizio.indirizzo,
      servizio.via,
      servizio.civico,
    ].some((valore) => normalizza(valore).includes(testoCercato));

    const matchTag =
      tagSelezionato === "tutti" || normalizza(servizio.tag) === tagSelezionato;

    const indirizzo = normalizza(
      [servizio.zona, servizio.indirizzo, servizio.via, servizio.civico]
        .filter(Boolean)
        .join(" "),
    );
    const matchZona =
      zonaSelezionata === "tutti" || indirizzo.includes(zonaSelezionata);

    const matchAzione =
      azioneSelezionata === "tutti" ||
      normalizza(servizio.categoria) === azioneSelezionata;

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
  }
}

// Aggiorno i risultati quando l'utente cambia uno dei filtri.
function aggiornaFiltri() {
  aggiornaPagina();
}

// Mostro o disattivo le frecce in base allo spazio ancora da scorrere.
function aggiornaFreccieCatalogo() {
  const viewport = document.getElementById("catalogo-viewport");
  const precedente = document.getElementById("catalogo-precedente");
  const successivo = document.getElementById("catalogo-successivo");
  if (!viewport || !precedente || !successivo) return;

  const massimoScorrimento = viewport.scrollWidth - viewport.clientWidth;
  const haScorrimento = massimoScorrimento > 1;
  precedente.hidden = !haScorrimento;
  successivo.hidden = !haScorrimento;
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
