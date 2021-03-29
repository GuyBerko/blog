const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const posts = {};
const eventBus = 'http://event-bus-srv:4005';

app.use(cors());
app.use(bodyParser.json());

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/posts/create', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;
  posts[id] = { id, title };

  await axios.post(`${eventBus}/events`, {
    type: 'PostCreated',
    data: posts[id]
  });

  res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  console.log('Recived Event', req.body.type);

  res.send({});
});

app.listen(4000, () => {
  console.log('Listening on 4000');
  console.log('on version latest');
});