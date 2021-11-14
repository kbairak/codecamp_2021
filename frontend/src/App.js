import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const superuser_uuid = 'ebf6c7cd-152a-45a9-9857-3909481d8d3e';

function App() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function _fetchPosts() {
      try {
        const response = await fetch(`/_api/posts/?author_uuid=${getUuid()}`);
        if (! response.ok) {
          throw new Error();
        }
        const body = await response.json();
        setPosts(body.data);
      } catch (e) {
        setError('Something went wrong while fetching posts')
      }
    }
    _fetchPosts();
  }, []);

  if (error) {
    return error;
  }

  function onCreate(post) {
    const newPosts = [post];
    for (const oldPost of posts) {
      if (oldPost.author_uuid === getUuid()) {
        oldPost.author = post.author;
      }
      newPosts.push(oldPost);
    }
    setPosts(newPosts);
  }

  function onDelete(postId) {
    async function _onDelete() {
      try {
        const response = await fetch(
          `/_api/posts/${postId}/?author_uuid=${getUuid()}`,
          { method: 'DELETE' },
        );
        if (response.ok) {
          setError(null);
          const newPosts = [];
          for (const post of posts) {
            if (post.id !== postId) {
              newPosts.push(post);
            }
          }
          setPosts(newPosts);
        } else {
          throw new Error();
        }
      } catch (e) {
        setError('Something went wrong while deleting the post')
      }
    }
    _onDelete();
  }

  function sendVote(postId, vote) {
    async function _vote() {
      try {
        const response = await fetch(`/_api/posts/${postId}/${vote ? 'vote' : 'unvote'}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { author_uuid: getUuid() } }),
        });
        if (! response.ok) {
          throw new Error();
        }
        setError(null);
        const newPosts = [];
        for (const post of posts) {
          if (post.id === postId) {
            if (vote) {
              post.votes += 1;
              post.voted_by_you = true;
            } else {
              post.votes -= 1;
              post.voted_by_you = false;
            }
          }
          newPosts.push(post);
        }
        setPosts(newPosts);
      } catch (e) {
        setError('Something went wrong while voting');
      }
    }
    _vote();
  }

  function onVote(postId) {
    sendVote(postId, true);
  }

  function onUnvote(postId) {
    sendVote(postId, false);
  }

  return (
    <div className="container">
      <ul className="list-group">
        <Form onCreate={onCreate} />
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onDelete={onDelete}
            onVote={onVote}
            onUnvote={onUnvote} />
        ))}
      </ul>
    </div>
  );
}

function Form({ onCreate }) {
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState(null);

  function onSubmit(event) {
    event.preventDefault();
    const payload = { data: { message, author, author_uuid: getUuid() } };
    async function _onSubmit() {
      try {
        const response = await fetch('/_api/posts/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (! response.ok) {
          throw new Error();
        }
        const body = await response.json();
        onCreate(body.data);
        setError(null);
        setMessage('');
      } catch (e) {
        setError('Something went wrong while saving post')
      }
    }
    _onSubmit();
  }

  return (
    <li className="list-group-item px-5">
      <form onSubmit={onSubmit}>
        {error && <div className="mb-3">{error}</div>}
        <div className="mb-3">
          <label htmlFor="inputMessage" className="form-label">Message</label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-control"
            id="inputMessage" />
        </div>
        <div className="mb-3">
          <label htmlFor="inputAuthor" className="form-label">Author</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="form-control"
            id="inputAuthor" />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </li>
  );
}

function Post({ post, onDelete, onVote, onUnvote }) {
  return (
    <li className="list-group-item">
      <div className="d-flex w-100 justify-content-between">
        <p className="mb-1">{post.message}</p>
        <small>{post.votes} votes</small>
      </div>
      <small className="mb-1">by {post.author || 'anonymous'}</small>
      {(post.author_uuid === getUuid() || getUuid() === superuser_uuid) &&
        <button
            onClick={() => onDelete(post.id)}
            className="btn btn-link btn-sm text-danger">
          Delete
        </button>}
      {post.voted_by_you ?
        <button
          onClick={() => onUnvote(post.id)}
          className="btn btn-link btn-sm">
          Unvote
        </button> :
        <button
          onClick={() => onVote(post.id)}
          className="btn btn-link btn-sm">
          Vote
        </button>}
    </li>
  );
}

function getUuid() {
  if (! window.localStorage.codecamp_uuid) {
    window.localStorage.codecamp_uuid = uuidv4();
  }
  return window.localStorage.codecamp_uuid;
}

export default App;
