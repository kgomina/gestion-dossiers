import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

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

// Labels courts pour les graphiques (évite le chevauchement)
const LABELS_COURTS = [
  "Fact. Fonciers",
  "Trait. Fonciers",
  "Fact. Marchés",
  "Trait. Marchés",
  "Fact. Successions",
  "Trait. Successions",
  "Fact. Autres",
  "Trait. Autres",
];

const COLORS = [
  "#4f46e5",
  "#6366f1",
  "#f59e0b",
  "#fbbf24",
  "#10b981",
  "#34d399",
  "#ef4444",
  "#f43f5e",
];

let donneesFiltrees = [];

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
      (d) => d.date >= dateDebut && d.date <= dateFin
    );

    // Calculer total par type
    const totals = {};
    TYPES.forEach((t) => (totals[t] = 0));
    donneesFiltrees.forEach((d) => {
      if (totals[d.type] !== undefined) totals[d.type] += d.nombre;
    });

    const valeurs = TYPES.map((t) => totals[t]);
    const totalGeneral = valeurs.reduce((a, b) => a + b, 0);

    if (totalGeneral === 0) {
      alert("Aucune donnée trouvée pour cette période.");
      return;
    }

    // --- HISTOGRAMME ---
    const ctx = document.getElementById("histogramme").getContext("2d");
    if (window.histChart) window.histChart.destroy();

    window.histChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: LABELS_COURTS,
        datasets: [
          {
            label: "Nombre de dossiers",
            data: valeurs,
            backgroundColor: COLORS,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} dossier(s)`,
            },
          },
          // Plugin datalabels chargé via CDN global
          datalabels: {
            anchor: "end",
            align: "end",
            color: "#1f2937",
            font: { weight: "bold", size: 13 },
            formatter: (value) => (value > 0 ? value : ""),
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
          x: {
            ticks: {
              font: { size: 11 },
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });

    // --- CAMEMBERT ---
    const ctx2 = document.getElementById("camembert").getContext("2d");
    if (window.pieChart) window.pieChart.destroy();

    // Filtrer les types avec valeur > 0 pour un camembert lisible
    const labelsActifs = [];
    const valeursActives = [];
    const couleursActives = [];

    TYPES.forEach((t, i) => {
      if (totals[t] > 0) {
        labelsActifs.push(LABELS_COURTS[i]);
        valeursActives.push(totals[t]);
        couleursActives.push(COLORS[i]);
      }
    });

    window.pieChart = new Chart(ctx2, {
      type: "pie",
      data: {
        labels: labelsActifs,
        datasets: [
          {
            data: valeursActives,
            backgroundColor: couleursActives,
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { size: 12 },
              padding: 14,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = ((ctx.parsed / totalGeneral) * 100).toFixed(1);
                return ` ${ctx.parsed} dossier(s) — ${pct}%`;
              },
            },
          },
          datalabels: {
            color: "#fff",
            font: { weight: "bold", size: 13 },
            formatter: (value) => {
              const pct = ((value / totalGeneral) * 100).toFixed(1);
              return `${pct}%`;
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });

  } catch (error) {
    console.error(error);
    alert("Erreur lors de la récupération des dossiers ❌");
  }
};

// Export Excel
window.exportExcel = () => {
  if (donneesFiltrees.length === 0) {
    alert("Aucune donnée à exporter ! Veuillez d'abord afficher les statistiques.");
    return;
  }

  // Données détaillées
  const excelData = donneesFiltrees.map((d) => ({
    Type: d.type,
    Date: d.date,
    Nombre: d.nombre,
  }));

  // Feuille de détail
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Feuille récapitulatif par type
  const totals = {};
  TYPES.forEach((t) => (totals[t] = 0));
  donneesFiltrees.forEach((d) => {
    if (totals[d.type] !== undefined) totals[d.type] += d.nombre;
  });

  const recapData = TYPES.map((t) => ({ Type: t, Total: totals[t] }));
  recapData.push({ Type: "TOTAL GÉNÉRAL", Total: Object.values(totals).reduce((a, b) => a + b, 0) });

  const ws2 = XLSX.utils.json_to_sheet(recapData);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws2, "Récapitulatif");
  XLSX.utils.book_append_sheet(wb, ws, "Détail");

  XLSX.writeFile(wb, "statistiques_dossiers.xlsx");
};
