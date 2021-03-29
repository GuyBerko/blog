const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const commentsByPostId = {};
const eventBusPath = 'http://event-bus-srv:4005';

app.use(cors());
app.use(bodyParser.json());

app.get('/posts/:id/comments', (req, res) => {
	const { id } = req.params;
	res.send(commentsByPostId[id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
	const commentId = randomBytes(4).toString('hex');
	const { id: postId } = req.params;
	const { content } = req.body;

	commentsByPostId[postId] = commentsByPostId[postId] || [];
	commentsByPostId[postId].push({ id: commentId, content, status: 'pending' });

	await axios.post(`${eventBusPath}/events`, {
		type: 'CommentCreated',
		data: {
			id: commentId,
			content,
			postId: req.params.id,
			status: 'pending'
		}
	});

	res.status(201).send(commentsByPostId[postId]);
});

app.post('/events', async (req, res) => {
	const { type, data } = req.body;
	switch (type) {
		case 'CommentModerated': {
			const { id, postId, status } = data;
			if (!commentsByPostId[postId]) {
				return res.status(400).send(`ERROR: comments with post id "${postId}" does not exists`);
			}

			const comment = commentsByPostId[postId].find(comment => comment.id === id);
			comment.status = status;

			await axios.post(`${eventBusPath}/events`, {
				type: 'CommentUpdated',
				data: {
					...comment,
					postId
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

app.listen(4001, () => {
	console.log('Listening on 4001');
});