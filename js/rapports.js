import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Types de dossiers (même que dans app.js)
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

const rapportsDiv = document.getElementById("rapports");

window.afficherRapports = async () => {
  const dateDebut = document.getElementById("dateDebut").value;
  const dateFin = document.getElementById("dateFin").value;

  if (!dateDebut || !dateFin) {
    alert("Veuillez renseigner les deux dates !");
    return;
  }

  rapportsDiv.innerHTML = "<h3>Chargement...</h3>";

  try {
    const snapshot = await getDocs(collection(db, "dossiers"));
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Filtrer par période
    const filtres = docs.filter(
      (d) => d.date >= dateDebut && d.date <= dateFin,
    );

    // Calculer total par type
    const totals = {};
    TYPES.forEach((t) => (totals[t] = 0));
    filtres.forEach((d) => (totals[d.type] += d.nombre));

    // Affichage
    let html =
      "<h3>Rapports</h3><table border='1' cellpadding='5'><tr><th>Type</th><th>Total</th><th>Action</th></tr>";
    TYPES.forEach((t) => {
      html += `<tr>
        <td>${t}</td>
        <td>${totals[t]}</td>
        <td><button onclick="supprimerType('${t}', '${dateDebut}', '${dateFin}')">Supprimer</button></td>
      </tr>`;
    });
    html += "</table>";

    rapportsDiv.innerHTML = html;
  } catch (error) {
    console.error(error);
    alert("Erreur lors de la récupération des dossiers ❌");
  }
};

// Suppression sécurisée
window.supprimerType = async (type, dateDebut, dateFin) => {
  const code = prompt("Code de suppression ?");
  if (code !== "270") {
    alert("Code incorrect ❌");
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "dossiers"));
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Filtrer par type et période
    const aSupprimer = docs.filter(
      (d) => d.type === type && d.date >= dateDebut && d.date <= dateFin,
    );

    // Supprimer chaque document
    for (const d of aSupprimer) {
      await deleteDoc(doc(db, "dossiers", d.id));
    }

    alert(`Suppression effectuée ✔ (${aSupprimer.length} document(s))`);
    afficherRapports(); // Recharger la table
  } catch (error) {
    console.error(error);
    alert("Erreur lors de la suppression ❌");
  }
};
