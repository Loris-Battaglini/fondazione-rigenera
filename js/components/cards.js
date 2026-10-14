import { isPreferito } from "../data/storage.js";

// Preparo il markup della card e mostro subito se è già tra i preferiti.
export function creaCardHTML(servizio, nelCatalogo = false) {
  const preferito = isPreferito(servizio.id);
  const orari = [servizio.ora_apertura, servizio.ora_chiusura]
    .filter(Boolean)
    .join("–");
  const classeColonna = nelCatalogo ? "catalogo-slide" : "col-md-4";
  const etichettaPreferito = preferito
    ? `Rimuovi ${servizio.nome} dai preferiti`
    : `Aggiungi ${servizio.nome} ai preferiti`;

  return `
    <div class="${classeColonna}" ${nelCatalogo ? 'role="listitem"' : ""}>
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
        <div class="card-header bg-azione-${servizio.azione} text-white p-3 d-flex justify-content-between align-items-center border-0">
          <span class="fw-medium text-capitalize">${servizio.azione}</span>
          <button class="btn btn-link text-white p-0 text-decoration-none" type="button" data-preferito="${servizio.id}" aria-pressed="${preferito}" aria-label="${etichettaPreferito}">
            <i class="bi bi-heart${preferito ? "-fill" : ""}" aria-hidden="true"></i>
          </button>
        </div>
        <div class="card-body p-4 bg-white d-flex flex-column justify-content-between">
          <div>
            <h3 class="h5 fw-bold mb-2">${servizio.nome}</h3>
            <span class="badge bg-light text-dark border mb-3">${servizio.categoria}</span>
            <p class="text-muted small mb-2"><i class="bi bi-geo-alt me-1"></i> ${servizio.indirizzo}</p>
            <p class="text-muted small mb-3"><i class="bi bi-clock me-1"></i> ${servizio.giorni.join("–")} ${orari}</p>
            <p class="small text-secondary mb-0">${servizio.descrizione}</p>
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
