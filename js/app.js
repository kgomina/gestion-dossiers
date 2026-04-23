import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Enregistrement groupé de tous les types en une seule soumission
window.enregistrerTout = async () => {
  const date = document.getElementById("date").value;

  if (!date) {
    alert("Veuillez choisir une date !");
    return;
  }

  // Récupérer tous les inputs de type
  const inputs = document.querySelectorAll(".type-input");

  // Construire la liste des entrées avec nombre > 0
  const entries = [];
  inputs.forEach((input) => {
    const nombre = parseInt(input.value) || 0;
    if (nombre > 0) {
      entries.push({
        type: input.dataset.type,
        nombre: nombre,
      });
    }
  });

  if (entries.length === 0) {
    alert("Veuillez renseigner au moins un nombre de dossiers supérieur à 0 !");
    return;
  }

  // Vérification du code secret avant soumission
  const code = prompt("🔐 Code d'autorisation requis :");

  if (code === null) {
    // L'utilisateur a annulé
    return;
  }

  if (code !== "270") {
    alert("Code incorrect ❌ Enregistrement annulé.");
    return;
  }

  try {
    // Enregistrer chaque type dans Firestore
    const promises = entries.map((entry) =>
      addDoc(collection(db, "dossiers"), {
        type: entry.type,
        date: date,
        nombre: entry.nombre,
        createdAt: serverTimestamp(),
      }),
    );

    await Promise.all(promises);

    // Afficher un récapitulatif
    const recap = document.getElementById("recap");
    let html = `<strong>✅ Enregistrement réussi pour le ${date} :</strong><ul style="margin-top:8px;padding-left:18px;">`;
    entries.forEach((e) => {
      html += `<li>${e.type} : <strong>${e.nombre}</strong> dossier(s)</li>`;
    });
    html += `</ul>`;
    recap.innerHTML = html;
    recap.classList.add("visible");

    // Réinitialiser les inputs
    inputs.forEach((input) => (input.value = "0"));
    document.getElementById("date").value = "";

    // Masquer le recap après 15 secondes
    setTimeout(() => recap.classList.remove("visible"), 15000);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
    alert("Erreur lors de l'enregistrement ❌");
  }
};
