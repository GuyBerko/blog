const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const eventBusPath = 'http://event-bus-srv:4005';

app.use(bodyParser.json());

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  switch (type) {
    case 'CommentCreated': {
      const status = data.content.includes('orange') ? 'rejected' : 'approved';

      axios.post(`${eventBusPath}/events`, {
        type: 'CommentModerated',
        data: {
          ...data,
          status
        }
      });
      break;
    }

    default: {
      break;
    }
  }

  res.send({});
});

app.listen(4003, () => {
  console.log('Listening on 4003');
});