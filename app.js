// Chargement des variables d'environnement
require('dotenv').config();

// Import des modules nécessaires
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Connexion à la base de données
require('./models/connection');

// Import des routes
var usersRouter = require('./routes/users');
var tweetsRouter = require('./routes/tweets');

var app = express();

// Configuration du CORS pour permettre les requêtes depuis le frontend
const cors = require('cors');
app.use(cors({
  origin: "http://localhost:3000",
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration des routes
app.use('/users', usersRouter);
app.use('/tweets', tweetsRouter);

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});