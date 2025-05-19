const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index'); 
});

router.post('/search', async (req, res) => {
  const { destination, date } = req.body;
  const apiKey = process.env.API_KEY;

  const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${encodeURIComponent(destination)}`;

  try {
    const weatherRes = await fetch(url);
    const weather = await weatherRes.json();

    if (weather.success === false) {
      return res.send(`<h2>Error: ${weather.error.info}</h2><a href="/">Go back</a>`);
    }

    res.render('results', {
      trip: { destination, date },
      weather
    });
  } catch (err) {
    console.error('Weatherstack API error:', err);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/save', async (req, res) => {
  const db = req.app.locals.db;
  const { destination, date, description, temperature } = req.body;

  try {
    await db.collection(process.env.MONGO_COLLECTION).insertOne({
      destination,
      date,
      description,
      temperature
    });

    res.redirect('/saved');
  } catch (err) {
    console.error('MongoDB save error:', err);
    res.status(500).send('Failed to save trip');
  }
});

router.get('/saved', async (req, res) => {
  const db = req.app.locals.db;

  try {
    const trips = await db.collection(process.env.MONGO_COLLECTION).find().toArray();
    res.render('saved', { trips });
  } catch (err) {
    console.error('MongoDB read error:', err);
    res.status(500).send('Failed to retrieve trips');
  }
});

module.exports = router;
