// Gestisce i dati statici dei servizi.

import { servizi, categorie } from "../../mock/services.js";

export function caricaServizi() {
  return servizi;
}

// Elenco delle categorie ammesse.
export function caricaCategorie() {
  return categorie;
}
