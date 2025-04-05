// Importation des modules nécessaires
const express = require("express");
const bodyParser = require("body-parser");

// Création de l'application Express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Données simulées (Plats, Utilisateurs, Commandes)
const plats = [
  { id: 1, nom: "Pizza Margherita", prix: 10 },
  { id: 2, nom: "Burger Maison", prix: 8 },
  { id: 3, nom: "Pâtes Carbonara", prix: 12 }
];

const users = [
  { id: 1, nom: "Ali", tel: 24600900 },
  { id: 2, nom: "Mohamed", tel: 23129129 },
  { id: 3, nom: "Karim", tel: 25123123 }];

const orders = [
  { id: 1, userId: 2, platId: 1 },
  { id: 2, userId: 3, platId: 3 },
  { id: 3, userId: 1, platId: 1 }
];

// ✅ Fonction de validation des champs
function validateInput(fields, req, res) {
  for (const field of fields) {
    if (!req.body[field] || req.body[field].toString().trim() === "") {
      return res.status(400).json({ message: `Le champ '${field}' est requis.` });
    }
  }
}

// ===================== 🥗 ROUTES DES PLATS =====================

// 📌 Récupérer tous les plats
app.get("/plats", (req, res) => {
  res.json(plats);
});

// 📌 Récupérer un plat par ID
app.get("/plats/:id", (req, res) => {
  const plat = plats.find(p => p.id === parseInt(req.params.id));
  plat ? res.json(plat) : res.status(404).json({ message: "Plat non trouvé" });
});

// 📌 Ajouter un nouveau plat
app.post("/plats", (req, res) => {
  validateInput(["nom", "prix"], req, res);

  const prix = parseFloat(req.body.prix);
  if (isNaN(prix) || prix <= 0) return res.status(400).json({ message: "Le prix doit être un nombre positif." });

  const newPlat = { id: plats.length + 1, nom: req.body.nom, prix };
  plats.push(newPlat);
  res.status(201).json(newPlat);
});

// 📌 Modifier le prix d'un plat
app.put("/plats/:id", (req, res) => {
  const plat = plats.find(p => p.id === parseInt(req.params.id));
  if (!plat) return res.status(404).json({ message: "Plat non trouvé" });

  const prix = parseFloat(req.body.prix);
  if (isNaN(prix) || prix <= 0) return res.status(400).json({ message: "Le prix doit être un nombre positif." });

  plat.prix = prix;
  res.json({ message: "Prix mis à jour avec succès", plat });
});

// 📌 Supprimer un plat
app.delete("/plats/:id", (req, res) => {
  const index = plats.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Plat non trouvé" });

  plats.splice(index, 1);
  res.json({ message: "Plat supprimé avec succès" });
});

// ===================== 👤 ROUTES DES UTILISATEURS =====================

// 📌 Récupérer tous les utilisateurs
app.get("/users", (req, res) => {
  res.json(users);
});

// 📌 Rechercher un utilisateur par téléphone
app.get("/users/search", (req, res) => {
  const tel = parseInt(req.query.tel);
  if (isNaN(tel)) return res.status(400).json({ message: "Numéro de téléphone invalide." });

  const user = users.find(u => u.tel === tel);
  user ? res.json(user) : res.status(404).json({ message: "Utilisateur non trouvé" });
});

// 📌 Ajouter un nouvel utilisateur
app.post("/users", (req, res) => {
  validateInput(["nom", "tel"], req, res);

  const tel = parseInt(req.body.tel);
  if (isNaN(tel) || tel.toString().length !== 8) {
    return res.status(400).json({ message: "Le numéro de téléphone doit contenir exactement 8 chiffres." });
  }

  if (users.some(user => user.tel === tel)) {
    return res.status(409).json({ message: "Un utilisateur avec ce numéro existe déjà." });
  }

  const newUser = { id: users.length + 1, nom: req.body.nom, tel };
  users.push(newUser);
  res.status(201).json(newUser);
});

// 📌 Supprimer un utilisateur par nom
app.delete("/users/:nom", (req, res) => {
  const index = users.findIndex(u => u.nom.toLowerCase() === req.params.nom.toLowerCase());
  if (index === -1) return res.status(404).json({ message: "Utilisateur non trouvé" });

  users.splice(index, 1);
  res.json({ message: "Utilisateur supprimé avec succès" });
});

// ===================== 🛒 ROUTES DES COMMANDES =====================

// 📌 Récupérer toutes les commandes
app.get("/orders", (req, res) => {
  res.json(orders.map(order => ({
    ...order,
    utilisateur: users.find(u => u.id === order.userId) ?? null,
    plat: plats.find(p => p.id === order.platId) ?? null
  })));
});

// 📌 Récupérer une commande par ID
app.get("/orders/:id", (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: "Commande non trouvée" });

  res.json({
    ...order,
    utilisateur: users.find(u => u.id === order.userId) ?? null,
    plat: plats.find(p => p.id === order.platId) ?? null
  });
});

// 📌 Ajouter une nouvelle commande
app.post("/orders", (req, res) => {
  validateInput(["userId", "platId"], req, res);

  const userId = parseInt(req.body.userId);
  const platId = parseInt(req.body.platId);

  if (!users.find(user => user.id === userId)) return res.status(404).json({ message: "Utilisateur non trouvé." });
  if (!plats.find(plat => plat.id === platId)) return res.status(404).json({ message: "Plat non trouvé." });

  const newOrder = { id: orders.length + 1, userId, platId };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// 📌 Calculer la somme des prix des commandes d’un plat spécifique
app.get("/orders/total/:platId", (req, res) => {
  const platId = parseInt(req.params.platId);
  if (isNaN(platId)) return res.status(400).json({ message: "ID du plat invalide" });

  const total = orders
    .filter(order => order.platId === platId)
    .reduce((sum, order) => sum + (plats.find(p => p.id === order.platId)?.prix || 0), 0);

  res.json({ platId, total });
});

// 📌 Lancement du serveur
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));

module.exports = app;
