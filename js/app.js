import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Les 8 types de dossiers
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

// Remplir le select avec les types
const typeSelect = document.getElementById("type");
TYPES.forEach((t) => {
  const option = document.createElement("option");
  option.value = t;
  option.textContent = t;
  typeSelect.appendChild(option);
});

window.enregistrer = async () => {
  const type = typeSelect.value;
  const date = document.getElementById("date").value;
  const nombre = parseInt(document.getElementById("nombre").value);

  if (!date) {
    alert("Veuillez choisir une date !");
    return;
  }
  if (!nombre || nombre < 1) {
    alert("Veuillez renseigner un nombre valide !");
    return;
  }

  try {
    // On crée un enregistrement par type et date avec le nombre
    await addDoc(collection(db, "dossiers"), {
      type: type,
      date: date,
      nombre: nombre,
      createdAt: serverTimestamp(),
    });

    alert(`Dossier(s) enregistré(s) ✔ (${nombre} dossier(s))`);

    // Réinitialiser le formulaire
    document.getElementById("date").value = "";
    document.getElementById("nombre").value = "1";
    typeSelect.selectedIndex = 0;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
    alert("Erreur lors de l'enregistrement ❌");
  }
};
