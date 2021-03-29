import React from 'react';

const CommentList = ({ comments }) => {
  const getColor = (status) => {
    switch (status) {
      case 'pending': {
        return 'yellow';
      }

      case 'approved': {
        return 'green';
      }

      case 'rejected': {
        return 'red';
      }

      default: {
        return 'blue';
      }
    }
  }

  return (
    <ul>
      {
        comments.map(comment => (<li key={ comment.id } style={ { color: getColor(comment.status) } }>{ comment.content }</li>))
      }
    </ul>
  );
};

export default CommentList;