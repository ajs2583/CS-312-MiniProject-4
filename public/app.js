const { useState, useEffect } = React;

function Signup() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, password, name })
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <button type="submit">Signup</button>
    </form>
  );
}

function Signin({ onSignin }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, password })
    });
    const data = await res.json();
    if (res.ok) {
      onSignin(userId);
    } else {
      alert(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signin</h2>
      <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Signin</button>
    </form>
  );
}

function PostForm({ currentUser, onPost }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author: currentUser, content })
    });
    const data = await res.json();
    onPost(data);
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Post</h2>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" />
      <button type="submit">Publish</button>
    </form>
  );
}

function Post({ post, currentUser, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const handleUpdate = async () => {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, author: currentUser })
    });
    if (res.ok) {
      const data = await res.json();
      onUpdate(data);
      setEditing(false);
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: currentUser })
    });
    const data = await res.json();
    if (res.ok) {
      onDelete(post.id);
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="post">
      {editing ? (
        <div>
          <input value={title} onChange={e => setTitle(e.target.value)} />
          <textarea value={content} onChange={e => setContent(e.target.value)} />
          <button onClick={handleUpdate}>Save</button>
        </div>
      ) : (
        <div>
          <h3>{post.title}</h3>
          <p><strong>By:</strong> {post.author} | {post.date}</p>
          <p>{post.content}</p>
          {currentUser === post.author && (
            <>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts').then(res => res.json()).then(setPosts);
  }, []);

  const addPost = (post) => setPosts([post, ...posts]);

  const updatePost = (updated) => {
    setPosts(posts.map(p => p.id === updated.id ? updated : p));
  };

  const deletePost = (id) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  if (!currentUser) {
    return (
      <div className="container">
        <Signup />
        <Signin onSignin={setCurrentUser} />
      </div>
    );
  }

  return (
    <div className="container">
      <h1>My Blog</h1>
      <PostForm currentUser={currentUser} onPost={addPost} />
      {posts.map(post => (
        <Post key={post.id} post={post} currentUser={currentUser} onUpdate={updatePost} onDelete={deletePost} />
      ))}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
