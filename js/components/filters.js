import { isPreferito, togglePreferito } from "../data/storage.js";

let listaServizi = [];

function normalizza(valore) {
  return String(valore ?? "")
    .trim()
    .toLocaleLowerCase("it");
}

// 1. CARICA DATI
async function avviaFiltri() {
  try {
    const risposta = await fetch("mock/data.json");
    listaServizi = await risposta.json();
    inizializzaPreferitiPredefiniti();
    aggiornaPagina();
  } catch (errore) {
    console.error("non abbiamo trovato i dati:", errore);
  }
}

// 2. TEMPLATE CARD
function creaCardHTML(servizio, nelCatalogo = false) {
  const preferito = isPreferito(servizio.id);
  const classeColonna = nelCatalogo ? "catalogo-slide" : "col-md-4";
  const etichettaPreferito = preferito
    ? `Rimuovi ${servizio.nome} dai preferiti`
    : `Aggiungi ${servizio.nome} ai preferiti`;

  return `
    <div class="${classeColonna}" ${nelCatalogo ? 'role="listitem"' : ""}>
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
        <div class="card-header bg-azione-${servizio.categoria} text-white p-3 d-flex justify-content-between align-items-center border-0">
          <span class="fw-medium text-capitalize">${servizio.categoria}</span>
          <button class="btn btn-link text-white p-0 text-decoration-none" type="button" data-preferito="${servizio.id}" aria-pressed="${preferito}" aria-label="${etichettaPreferito}">
            <i class="bi bi-heart${preferito ? "-fill" : ""}" aria-hidden="true"></i>
          </button>
        </div>
        <div class="card-body p-4 bg-white d-flex flex-column justify-content-between">
          <div>
            <h3 class="h5 fw-bold mb-2">${servizio.nome}</h3>
            <span class="badge bg-light text-dark border mb-3">${servizio.tag}</span>
            <p class="text-muted small mb-2"><i class="bi bi-geo-alt me-1"></i> ${servizio.via} ${servizio.civico}</p>
            <p class="text-muted small mb-3"><i class="bi bi-clock me-1"></i> ${servizio.orari}</p>
            <p class="small text-secondary mb-0">${servizio.descrizione}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function inizializzaPreferitiPredefiniti() {
  try {
    if (localStorage.getItem("rigenera-preferiti") !== null) return;

    listaServizi
      .filter((servizio) => servizio.preferito)
      .forEach((servizio) => togglePreferito(servizio.id));
  } catch {
    // Se localStorage non è disponibile, i preferiti restano non persistenti.
  }
}

// 3. APPLICAZIONE FILTRI
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
      contenitore.innerHTML = serviziFiltrati
        .map((servizio) => creaCardHTML(servizio, true))
        .join("");
    }
    aggiornaFreccieCatalogo();
  }

  aggiornaPreferiti();
}

function aggiornaPreferiti() {
  const contenitore = document.getElementById("lista-preferiti");
  if (!contenitore) return;

  const serviziPreferiti = listaServizi.filter((servizio) =>
    isPreferito(servizio.id),
  );
  const contatore = document.getElementById("contatore-preferiti");

  if (contatore) {
    const numeroServizi = serviziPreferiti.length;
    contatore.textContent = `${numeroServizi} ${numeroServizi === 1 ? "servizio salvato" : "servizi salvati"} su questo dispositivo.`;
  }

  contenitore.innerHTML = serviziPreferiti.length
    ? serviziPreferiti.map(creaCardHTML).join("")
    : '<div class="col-12 text-body-secondary">Non hai ancora salvato servizi.</div>';
}

function aggiornaFiltri() {
  aggiornaPagina();
}

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

// 4. EVENT LISTENERS
function inizializzaFiltri() {
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

  document.addEventListener("click", (evento) => {
    const pulsante = evento.target.closest(
      "#container-servizi [data-preferito], #lista-preferiti [data-preferito]",
    );
    if (!pulsante) return;

    togglePreferito(pulsante.dataset.preferito);
    aggiornaPagina();
  });

  avviaFiltri();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inizializzaFiltri, {
    once: true,
  });
} else {
  inizializzaFiltri();
}
