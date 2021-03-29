const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const posts = {};
const eventBus = 'http://event-bus-srv:4005';

app.use(cors());
app.use(bodyParser.json());

const handleEvent = ({ type, data }) => {
  switch (type) {
    case 'PostCreated': {
      const { id, title } = data;
      posts[id] = { id, title, comments: [] };
      return { code: 201, message: id };
    }

    case 'CommentCreated': {
      const { id, content, postId, status } = data;
      if (!posts[postId]){
        return { code: 400, message: `ERROR: post with id "${postId}" does not exists` };
      }

      posts[postId].comments.push({ id, content, status });
      return { code: 201, message: id };
    }

    case 'CommentUpdated': {
      const { postId, id, status, content } = data;
      if (!posts[postId]){
        return { code: 400, message: `ERROR: post with id "${postId}" does not exists` };
      }

      const comment = posts[postId].comments.find(comment => comment.id === id);
      comment.status = status;
      comment.content = content;
      return { code: 204, message: id };
    }

    default: {
      return { code: 200, message: `unsupported event type "${type}"` };
    }
  }
  return null;
};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/events', (req, res) => {
  const result = handleEvent(req.body);

  if(result){
    res.status(result.code).send(result.message);
  }
  else{
    console.error('ERROR: cannot handleEvent');
  }
});

app.listen(4002, () => {
  console.log('Query service listening on 4002');

  axios.get(`${eventBus}/events`).then((result) => {
    result.data.forEach(event => {
      const result = handleEvent(event);
      if(result){
        console.log(`handleEvent: ${result.code} ${result.message}`);
      }
      else{
        console.error('ERROR: cannot handleEvent');
      }
    });
  }).catch(err => {
    console.error(`ERROR get events, ${err}`);
  });
});