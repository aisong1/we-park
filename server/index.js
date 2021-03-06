const express = require('express');
const path = require('path');
const parser = require('body-parser');
const parking = require('../database/index');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(parser.json());

app.use(express.static(path.resolve(__dirname, '..', 'public')));

app.get('/api/parking', (req, res) => {
  const query = "SELECT * FROM least_likely";

  parking.any(query)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log('Failed to retrieve parking status: ', err);
      res.end();
    });
});

app.get('/api/parking/users', (req, res) => {
  const { email, password } = req.query;
  const query = "SELECT firstName FROM users WHERE email=$1 AND password=crypt($2, password);";
  const params = [email, password];

  parking.any(query, params)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log('Failed to retrieve user information: ', err);
      res.end();
    });
});

app.post('/api/parking/users', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const query = `INSERT INTO users (firstName, lastName, email, password) VALUES (
    $1,
    $2,
    $3,
    crypt($4, gen_salt('md5'))
  );`;
  const params = [firstName, lastName, email, password];

  parking.any(query, params)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log('Failed to create new user: ', err);
      res.end();
    });
});

app.get('/api/parking/favorites', (req, res) => {
  const { email } = req.query;
  const query = `SELECT f.user_id, l.meter_code, l.blockface_name, l.side_of_street, l.latitude, l.longitude FROM users AS u, favorites AS f, least_likely AS l
                 WHERE u.id=f.user_id
                 AND f.meter_code=l.meter_code
                 AND u.email=$1;`;
  const params = [email];

  parking.any(query, params)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(`Failed to retrieve ${email}'s favorites: `, err);
      res.end();
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
