import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Types de dossiers
const TYPES = [
  "Facturation Fonciers",
  "Traitement Fonciers",
  "Facturation Marchés",
  "Traitement Marchés",
  "Facturation Successions",
  "Traitement Successions",
  "Facturation Autres Actes",
  "Traitement Autres Actes",
];

let donneesFiltrees = []; // pour l'export Excel

window.afficherStats = async () => {
  const dateDebut = document.getElementById("dateDebutStat").value;
  const dateFin = document.getElementById("dateFinStat").value;

  if (!dateDebut || !dateFin) {
    alert("Veuillez renseigner les deux dates !");
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "dossiers"));
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Filtrer par période
    donneesFiltrees = docs.filter(
      (d) => d.date >= dateDebut && d.date <= dateFin,
    );

    // Calculer total par type
    const totals = {};
    TYPES.forEach((t) => (totals[t] = 0));
    donneesFiltrees.forEach((d) => (totals[d.type] += d.nombre));

    // Données pour graphiques
    const valeurs = TYPES.map((t) => totals[t]);

    // Histogramme
    const ctx = document.getElementById("histogramme").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: TYPES,
        datasets: [
          {
            label: "Nombre de dossiers",
            data: valeurs,
            backgroundColor: "#4f46e5",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });

    // Camembert
    const ctx2 = document.getElementById("camembert").getContext("2d");
    new Chart(ctx2, {
      type: "pie",
      data: {
        labels: TYPES,
        datasets: [
          {
            data: valeurs,
            backgroundColor: [
              "#4f46e5",
              "#6b7280",
              "#f59e0b",
              "#10b981",
              "#ef4444",
              "#6366f1",
              "#8b5cf6",
              "#f43f5e",
            ],
          },
        ],
      },
      options: { responsive: true },
    });
  } catch (error) {
    console.error(error);
    alert("Erreur lors de la récupération des dossiers ❌");
  }
};

// Export Excel
window.exportExcel = () => {
  if (donneesFiltrees.length === 0) {
    alert("Aucune donnée à exporter !");
    return;
  }

  // Transformer les données pour Excel
  const excelData = donneesFiltrees.map((d) => ({
    Type: d.type,
    Date: d.date,
    Nombre: d.nombre,
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Statistiques");
  XLSX.writeFile(wb, "statistiques.xlsx");
};
