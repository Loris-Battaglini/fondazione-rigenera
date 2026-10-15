import {
  salvaSegnalazione,
  salvaBozzaSegnalazione,
  leggiBozzaSegnalazione,
} from "../data/storage.js";

const CAMPI_NON_IN_BOZZA = ["email", "telefono"];
const SELETTORE_COLONNA = ".col-12, .col-md-3, .col-md-6";

export function inizializzaFormSegnalazione() {
  const form = document.querySelector("#segnalazione-form");
  if (!form) return;

  const successo = document.querySelector("#successo");
  const campi = form.querySelectorAll("input, select, textarea");
  const giornoButtons = form.querySelectorAll(".day-toggle");
  const getGiorniSelezionati = () =>
    Array.from(form.querySelectorAll(".day-toggle.active")).map(
      (button) => button.dataset.giorno,
    );
  const trovaFeedback = (campo) =>
    campo?.closest(SELETTORE_COLONNA)?.querySelector(".invalid-feedback") ?? null;

  const raccogliBozza = () => {
    const dati = {};
    Array.from(form.elements)
      .filter((elemento) => elemento.name && !CAMPI_NON_IN_BOZZA.includes(elemento.name))
      .forEach((elemento) => {
        dati[elemento.name] =
          elemento.type === "checkbox" ? elemento.checked : elemento.value;
      });
    dati.giorni = getGiorniSelezionati();
    return dati;
  };
  const salvaBozza = () => salvaBozzaSegnalazione(raccogliBozza());
  const mostraErrore = (campo, messaggio) => {
    if (!campo) return;
    campo.classList.add("is-invalid");
    campo.setAttribute("aria-invalid", "true");
    const feedback = trovaFeedback(campo);
    if (feedback) {
      feedback.textContent = messaggio;
      feedback.classList.add("visible");
      feedback.style.display = "block";
    }
  };
  const rimuoviErrore = (campo) => {
    if (!campo) return;
    campo.classList.remove("is-invalid");
    campo.setAttribute("aria-invalid", "false");
    const feedback = trovaFeedback(campo);
    if (feedback) {
      feedback.style.display = "none";
      feedback.classList.remove("visible");
    }
  };
  const validaCampo = (campo, tipo = "text") => {
    const valore = campo?.value?.trim?.() ?? "";
    if (tipo === "email") {
      if (!valore) return rimuoviErrore(campo), true;
      const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valore);
      if (!valido) mostraErrore(campo, "Email non valida");
      else rimuoviErrore(campo);
      return valido;
    }
    if (tipo === "telefono") {
      if (!valore) return rimuoviErrore(campo), true;
      const valido =
        /^\+?[0-9\s()\-]{7,}$/.test(valore) &&
        valore.replace(/\D/g, "").length >= 7;
      if (!valido) mostraErrore(campo, "Telefono non valido");
      else rimuoviErrore(campo);
      return valido;
    }
    const valido = Boolean(valore);
    if (!valido) mostraErrore(campo, "Campo vuoto");
    else rimuoviErrore(campo);
    return valido;
  };
  const validaGiorni = () => {
    const selettore = form.querySelector(".day-selector");
    const feedback = selettore?.parentElement?.querySelector(".invalid-feedback");
    const valido = getGiorniSelezionati().length > 0;
    selettore?.classList.toggle("invalid", !valido);
    if (feedback) {
      feedback.textContent = "Campo vuoto";
      feedback.classList.toggle("visible", !valido);
      feedback.style.display = valido ? "none" : "block";
    }
    return valido;
  };

  const campiObbligatori = [
    "nome", "azione", "categoria", "citta", "indirizzo", "zona", "descrizione",
  ].map((nome) => form.elements.namedItem(nome)).filter(Boolean);
  campiObbligatori.forEach((campo) => {
    campo.addEventListener("input", () => validaCampo(campo));
    campo.addEventListener("change", () => validaCampo(campo));
  });
  const emailField = form.querySelector("#email");
  const phoneField = form.querySelector("#telefono");
  emailField?.addEventListener("input", () => validaCampo(emailField, "email"));
  phoneField?.addEventListener("input", () => validaCampo(phoneField, "telefono"));

  const bozza = leggiBozzaSegnalazione();
  Object.entries(bozza).forEach(([chiave, valore]) => {
    if (chiave === "giorni" || CAMPI_NON_IN_BOZZA.includes(chiave)) return;
    const campo = form.elements.namedItem(chiave);
    if (!campo) return;
    if (campo.type === "checkbox") campo.checked = valore === true;
    else campo.value = valore;
  });
  const giorniInBozza = new Set(Array.isArray(bozza.giorni) ? bozza.giorni : []);
  giornoButtons.forEach((button) => {
    const attivo = giorniInBozza.has(button.dataset.giorno);
    button.classList.toggle("active", attivo);
    button.setAttribute("aria-pressed", String(attivo));
    button.addEventListener("click", () => {
      const selezionato = button.classList.toggle("active");
      button.setAttribute("aria-pressed", String(selezionato));
      validaGiorni();
      salvaBozza();
    });
  });
  campi.forEach((campo) => {
    campo.addEventListener("input", salvaBozza);
    campo.addEventListener("change", salvaBozza);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const validi = campiObbligatori.every((campo) => validaCampo(campo)) &&
      validaGiorni() &&
      (!emailField || validaCampo(emailField, "email")) &&
      (!phoneField || validaCampo(phoneField, "telefono"));
    if (!validi) {
      form.classList.add("was-validated");
      return;
    }

    const campo = (nome) => form.elements.namedItem(nome);
    const numeroTelefono = phoneField?.value.trim() ?? "";
    const apertura = campo("ora_apertura").value;
    const chiusura = campo("ora_chiusura").value;
    const via = campo("indirizzo").value.trim();
    const civico = campo("numero_civico")?.value.trim() ?? "";
    salvaSegnalazione({
      id: crypto.randomUUID ? crypto.randomUUID() : `segnalazione-${Date.now()}`,
      nome: campo("nome").value.trim(),
      azione: campo("azione").value,
      categoria: campo("categoria").value,
      citta: campo("citta").value.trim(),
      zona: campo("zona").value,
      indirizzo: [via, civico].filter(Boolean).join(" "),
      giorni: getGiorniSelezionati(),
      ora_apertura: apertura,
      ora_chiusura: chiusura,
      orari: apertura && chiusura ? `${apertura}–${chiusura}` : "",
      servizio_notturno: Boolean(campo("servizio_notturno")?.checked),
      descrizione: campo("descrizione").value.trim(),
      email: emailField?.value.trim() ?? "",
      telefono: numeroTelefono ? `${campo("prefisso_telefono").value} ${numeroTelefono}`.trim() : "",
      createdAt: new Date().toISOString(),
    });
    salvaBozzaSegnalazione({});
    form.reset();
    form.classList.remove("was-validated");
    giornoButtons.forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });
    form.querySelector(".day-selector")?.classList.remove("invalid");
    if (successo) {
      successo.classList.remove("d-none");
      successo.textContent = "Grazie! La tua segnalazione è stata salvata localmente.";
    }
  });
}