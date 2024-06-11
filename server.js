const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 5500; 

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const sequelize = new Sequelize('dad_jokes', 'root', 'password', {  // Updated database name
    host: 'localhost',
    dialect: 'mysql'
});

// Model definition
const Favourite = sequelize.define('favourite', {  // Ensure table name matches
    joke_id: {
        type: DataTypes.STRING,
        unique: true
    },
    joke_text: {
        type: DataTypes.TEXT
    }
});

// Sync database
sequelize.sync();

// Routes
app.get('/search', async (req, res) => {
    const searchTerm = req.query.term || '';
    try {
        const response = await axios.get('https://icanhazdadjoke.com/search', {
            params: { term: searchTerm },
            headers: { Accept: 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching jokes:', error);
        res.status(500).send('Error fetching jokes');
    }
});

app.post('/favourites', async (req, res) => {
    const { joke_id, joke_text } = req.body;
    try {
        const [favourite, created] = await Favourite.findOrCreate({
            where: { joke_id },
            defaults: { joke_text }
        });
        res.json(favourite);
    } catch (error) {
        console.error('Error saving favourite joke:', error);
        res.status(500).send('Error saving favourite joke');
    }
});

app.get('/favourites', async (req, res) => {
    try {
        const favourites = await Favourite.findAll();
        res.json(favourites);
    } catch (error) {
        console.error('Error fetching favourite jokes:', error);
        res.status(500).send('Error fetching favourite jokes');
    }
});

// Serve static files
app.use(express.static('public'));

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
