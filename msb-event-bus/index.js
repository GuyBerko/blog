const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const events = [];

app.post('/events', (req, res) => {
    const event = req.body;
    // add event to events array
    events.push(event);

    axios.post('http://posts-srv:4000/events', event).catch(err => (console.error(`ERROR: failed to post event to posts-srv, ${err}`)));
    axios.post('http://comments-srv:4001/events', event).catch(err => (console.error(`ERROR: failed to post event to comments-srv, ${err}`)));
    axios.post('http://query-srv:4002/events', event).catch(err => (console.error(`ERROR: failed to post event to query-srv, ${err}`)));
    axios.post('http://moderation-srv:4003/events', event).catch(err => (console.error(`ERROR: failed to post event to moderation-srv, ${err}`)));

    res.send({ status: 'ok' });
});

app.get('/events', (req, res) => {
    res.send(events);
});

app.listen(4005, () => {
    console.log('Listening on 4005');
});