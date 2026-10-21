import { isPreferito } from "../data/storage.js";

// Escape dei caratteri speciali HTML (protezione XSS).
function escapeHTML(valore) {
  return String(valore ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Preparo il markup della card e mostro subito se è già tra i preferiti.
export function creaCardHTML(servizio, nelCatalogo = false) {
  const preferito = isPreferito(servizio.id);
  // Valori già sottoposti a escape.
  const id = escapeHTML(servizio.id);
  const nome = escapeHTML(servizio.nome);
  const azione = escapeHTML(servizio.azione);
  const giorni = escapeHTML((servizio.giorni ?? []).join("–"));
  const orari = escapeHTML(
    [servizio.ora_apertura, servizio.ora_chiusura].filter(Boolean).join("–"),
  );
  const classeColonna = nelCatalogo ? "catalogo-slide" : "col-md-4";
  const etichettaPreferito = preferito
    ? `Rimuovi ${nome} dai preferiti`
    : `Aggiungi ${nome} ai preferiti`;

  // Template con i soli valori sottoposti a escape.
  return `
    <div class="${classeColonna}" ${nelCatalogo ? 'role="listitem"' : ""}>
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
        <div class="card-header bg-azione-${azione} text-white p-3 d-flex justify-content-between align-items-center border-0">
          <span class="fw-medium text-capitalize">${azione}</span>
          <button class="btn btn-link text-white p-0 text-decoration-none" type="button" data-preferito="${id}" aria-pressed="${preferito}" aria-label="${etichettaPreferito}">
            <i class="bi bi-heart${preferito ? "-fill" : ""}" aria-hidden="true"></i>
          </button>
        </div>
        <div class="card-body p-4 bg-white d-flex flex-column justify-content-between">
          <div>
            <h3 class="h5 fw-bold mb-2">${nome}</h3>
            <span class="badge bg-light text-dark border mb-3">${escapeHTML(servizio.categoria)}</span>
            <p class="text-muted small mb-2"><i class="bi bi-geo-alt me-1"></i> ${escapeHTML(servizio.indirizzo)}</p>
            <p class="text-muted small mb-3"><i class="bi bi-clock me-1"></i> ${giorni} ${orari}</p>
            <p class="small text-secondary mb-0">${escapeHTML(servizio.descrizione)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Creo le card richieste e le inserisco nel contenitore giusto.
export function renderizzaCard(contenitore, servizi, nelCatalogo = false) {
  if (!contenitore) return;

  contenitore.innerHTML = servizi
    .map((servizio) => creaCardHTML(servizio, nelCatalogo))
    .join("");
}
