import {
  salvaSegnalazione,
  salvaBozzaSegnalazione,
  leggiBozzaSegnalazione,
} from "../data/storage.js";
import { aggiungiOpzioni } from "../ui/select.js";
import {
  campoObbligatorioValido,
  emailValida,
  telefonoValido,
  giorniValidi,
  orariValidi,
} from "../utils/validation.js";

const CAMPI_NON_IN_BOZZA = ["email", "telefono"];
const SELETTORE_COLONNA = ".col-12, .col-md-3, .col-md-6";
// Proposta se l'utente non sa cosa scegliere: la rivede chi approva la segnalazione.
const CATEGORIA_PREDEFINITA = "Altro";

export function inizializzaFormSegnalazione(categorie) {
  const form = document.querySelector("#segnalazione-form");
  if (!form) return;

  // Opzioni della categoria dall'elenco condiviso (prima di ripristinare la bozza).
  aggiungiOpzioni(
    form.elements.namedItem("categoria"),
    categorie,
    CATEGORIA_PREDEFINITA,
  );

  const successo = document.querySelector("#successo");
  const campi = form.querySelectorAll("input, select, textarea");
  const giornoButtons = form.querySelectorAll(".day-toggle");
  const getGiorniSelezionati = () =>
    Array.from(form.querySelectorAll(".day-toggle.active")).map(
      (button) => button.dataset.giorno,
    );
  const trovaFeedback = (campo) =>
    campo?.closest(SELETTORE_COLONNA)?.querySelector(".invalid-feedback") ??
    null;

  const raccogliBozza = () => {
    const dati = {};
    Array.from(form.elements)
      .filter(
        (elemento) =>
          elemento.name && !CAMPI_NON_IN_BOZZA.includes(elemento.name),
      )
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
      const valido = emailValida(valore);
      campo.setCustomValidity(valido ? "" : "Email non valida");
      if (!valido) mostraErrore(campo, "Email non valida");
      else rimuoviErrore(campo);
      return valido;
    }

    if (tipo === "telefono") {
      const valido = telefonoValido(valore);
      if (!valido) mostraErrore(campo, "Telefono non valido");
      else rimuoviErrore(campo);
      return valido;
    }

    const valido = campoObbligatorioValido(valore);
    if (!valido) mostraErrore(campo, "Campo vuoto");
    else rimuoviErrore(campo);
    return valido;
  };

  const validaGiorni = () => {
    const selettore = form.querySelector(".day-selector");
    const feedback =
      selettore?.parentElement?.querySelector(".invalid-feedback");
    const valido = giorniValidi(getGiorniSelezionati());

    selettore?.classList.toggle("invalid", !valido);
    if (feedback) {
      feedback.textContent = "Campo vuoto";
      feedback.classList.toggle("visible", !valido);
      feedback.style.display = valido ? "none" : "block";
    }
    return valido;
  };

  // Chiusura dopo l'apertura, salvo servizio notturno.
  const validaOrari = () => {
    const apertura = form.elements.namedItem("ora_apertura");
    const chiusura = form.elements.namedItem("ora_chiusura");
    const notturno = form.elements.namedItem("servizio_notturno");

    if (!apertura || !chiusura) return true;

    const valido = orariValidi(
      apertura.value,
      chiusura.value,
      notturno?.checked,
    );
    if (!valido) mostraErrore(chiusura, "La chiusura è prima dell'apertura");
    else rimuoviErrore(chiusura);
    return valido;
  };
  const campiObbligatori = [
    "nome",
    "azione",
    "categoria",
    "citta",
    "indirizzo",
    "zona",
    "descrizione",
  ]
    .map((nome) => form.elements.namedItem(nome))
    .filter(Boolean);
  campiObbligatori.forEach((campo) => {
    campo.addEventListener("input", () => validaCampo(campo));
    campo.addEventListener("change", () => validaCampo(campo));
  });
  const emailField = form.querySelector("#email");
  const phoneField = form.querySelector("#telefono");
  emailField?.addEventListener("input", () => validaCampo(emailField, "email"));
  phoneField?.addEventListener("input", () =>
    validaCampo(phoneField, "telefono"),
  );
  // Ricontrollo gli orari quando cambiano.
  ["ora_apertura", "ora_chiusura", "servizio_notturno"].forEach((nome) =>
    form.elements.namedItem(nome)?.addEventListener("change", validaOrari),
  );

  const bozza = leggiBozzaSegnalazione();
  Object.entries(bozza).forEach(([chiave, valore]) => {
    if (chiave === "giorni" || CAMPI_NON_IN_BOZZA.includes(chiave)) return;
    const campo = form.elements.namedItem(chiave);
    if (!campo) return;
    if (campo.type === "checkbox") campo.checked = valore === true;
    else campo.value = valore;
  });
  const giorniInBozza = new Set(
    Array.isArray(bozza.giorni) ? bozza.giorni : [],
  );
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
    successo?.classList.add("d-none");
    // Valido tutti i campi, senza fermarmi al primo errore.
    const risultati = [
      ...campiObbligatori.map((campo) => validaCampo(campo)),
      validaGiorni(),
      validaOrari(),
      !emailField || validaCampo(emailField, "email"),
      !phoneField || validaCampo(phoneField, "telefono"),
    ];
    if (!risultati.every(Boolean)) {
      form.classList.add("was-validated");
      return;
    }

    const campo = (nome) => form.elements.namedItem(nome);
    const apertura = campo("ora_apertura").value;
    const chiusura = campo("ora_chiusura").value;
    const via = campo("indirizzo").value.trim();
    const civico = campo("numero_civico")?.value.trim() ?? "";
    // Email e telefono non salvati in locale: da inviare al server quando ci sarà.
    const salvata = salvaSegnalazione({
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : `segnalazione-${Date.now()}`,
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
      createdAt: new Date().toISOString(),
    });
    // Se il salvataggio fallisce non svuoto il form.
    if (!salvata) {
      mostraEsito(
        "Non è stato possibile salvare la segnalazione. Riprova.",
        false,
      );
      return;
    }
    salvaBozzaSegnalazione({});
    form.reset();
    form.classList.remove("was-validated");
    giornoButtons.forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });
    form.querySelector(".day-selector")?.classList.remove("invalid");
    mostraEsito(
      "Grazie! La tua segnalazione è stata salvata localmente.",
      true,
    );
  });
}
