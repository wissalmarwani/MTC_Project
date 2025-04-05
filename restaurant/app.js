// Import express module
const express = require("express");

// Import body-parser module
const bodyParser = require("body-parser");

// Creates express app
const app = express();

// Configuration de l'application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const plats = [
  { id: 1, nom: "Pizza Margherita", prix: 10 },
  { id: 2, nom: "Burger Maison", prix: 8 },
  { id: 3, nom: "Pâtes Carbonara", prix: 12 },
];



// Get All Plats
app.get("/plats", (req, res) => {
  res.json(plats);
});

// Get Plat By ID
app.get("/plats/:id", (req, res) => {
  const platId = parseInt(req.params.id);
  const foundPlat = plats.find(obj => obj.id === platId);

  if (foundPlat) {
    res.json(foundPlat);
  } else {
    res.json({ error: "Plat not found" });
  }
});

// Search Plat By “nom” OR By “prix”

app.get("/plats/nom/:nom/prix/:prix", (req, res) => {
  const { nom, prix } = req.params;  
  let result = plats;

  // par nom
  if (nom) {
    result = result.filter(plat => plat.nom.toLowerCase().includes(nom.toLowerCase()));
  }

  // par prix
  if (prix) {
    result = result.filter(plat => plat.prix == prix);
  }

  // Si aucun plat n'est trouvé
  if (result.length === 0) {
    return res.status(404).json({ error: "Plat not found" });
  }

  res.json(result);  
});


// Delete all plats
app.delete("/plats", (req, res) => {
  plats.length = 0;
  res.json({ message: "Tous les plats ont été supprimés" });
});

// Delete plat by ID
app.delete("/plats/:id", (req, res) => {
  const platId = parseInt(req.params.id);
  const position = plats.findIndex(obj => obj.id === platId);

  if (position === -1) {
    res.status(404).json({ message: "Plat not found" });
  } else {
    plats.splice(position, 1);
    res.json({ message: "Plat Deleted with success" });
  }
});

// Edit plat price
app.put("/plats/:id", (req, res) => {
  const platId = parseInt(req.params.id);
  const plat = plats.find(p => p.id === platId);

  if (!plat) {
    return res.json({ message: "Plat not found" });
  }

  plat.prix = req.body.prix;
  res.json({ message: "Updated with success", plat });
});

// Add new plat
app.post("/plats", (req, res) => {
  const id = plats.length + 1;
  const newPlat = { id, ...req.body };
  plats.push(newPlat);
  res.json(newPlat);
});


const users = [
  { id: 1, nom: "Ali", tel: 24600900 },
  { id: 2, nom: "Mohamed", tel: 23129129 },
  { id: 3, nom: "Karim", tel: 25123123 }
];

// Get all users
app.get("/users", (req, res) => {
  res.json(users);
});
// Search user by telephone number
app.get("/users/search/:tel", (req, res) => {
  const tel = parseInt(req.params.tel);  
  if (isNaN(tel)) {
    return res.json({ message: "Invalid telephone number" });
  }

  const foundUser = users.find(user => user.tel === tel);

  if (!foundUser) {
    return res.json({ message: "User not found" });
  }

  res.json(foundUser);
});


// Delete user name
app.delete("/users/:nom", (req, res) => {
  const userName = req.params.nom.toLowerCase();
  const index = users.findIndex(user => user.nom.toLowerCase() === userName);

  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users.splice(index, 1);
  res.json({ message: "User deleted " });
});

// Add new user
app.post("/users", (req, res) => {
  const { nom, tel } = req.body;

  if (!nom || !tel) {
    return res.json({ message: "Name and telephone number are updated" });
  }

  if (users.some(user => user.tel === tel)) {
    return res.json({ message: "User with this telephone number already exists" });
  }

  const id = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
  const newUser = { id, nom, tel };

  users.push(newUser);
  res.json(newUser);
});


const orders = [
  { id: 1, userId: 2, platId: 1 },
  { id: 2, userId: 3, platId: 3 },
  { id: 3, userId: 1, platId: 1 }
]; 

app.get("/orders", (req, res) => {
  res.json(orders.map(order => {
    const utilisateur = users.find(u => u.id === order.userId) ?? null;
    const plat = plats.find(p => p.id === order.platId) ?? null;

    return {
      ...order,
      utilisateur,
      plat
    };
  }));
});



app.get("/orders/:id", (req, res) => {
  const orderId = parseInt(req.params.id);
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const utilisateur = users.find(u => u.id === order.userId) ?? null;
  const plat = plats.find(p => p.id === order.platId) ?? null;

  res.json({ ...order, utilisateur, plat });
});

app.get("/orders/total/:platId", (req, res) => {
  const platId = parseInt(req.params.platId);
  if (isNaN(platId)) return res.status(400).json({ message: "Invalid platId" });

  const total = orders
    .filter(order => order.platId === platId)
    .reduce((sum, order) => sum + (plats.find(p => p.id === order.platId)?.prix || 0), 0);

  res.json({ platId, total });
});


// Export the app to be used in other files (server.js)
module.exports = app;
