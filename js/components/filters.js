async function prendiDatiJson() {
  try {
    // Punta al file dentro la cartella mock
    const response = await fetch("mock/data.json");
    const data = await response.json();

    // Stampa l'ID del primo elemento in Console
    console.log("Dati caricati con successo:", data[3].id);
  } catch (error) {
    console.error("non abbiamo trovato i dati:", error);
  }
}

prendiDatiJson();
