const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

let posts = [];
let users = [];

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function serveStatic(res, filePath, type) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

// Simple sign up - store user in memory
async function handleSignup(req, res) {
  const { user_id, password, name } = await parseBody(req);
  if (users.find(u => u.user_id === user_id)) {
    return sendJSON(res, 400, { message: 'User exists' });
  }
  users.push({ user_id, password, name });
  sendJSON(res, 200, { message: 'Signup success' });
}

// Simple sign in - verify credentials
async function handleSignin(req, res) {
  const { user_id, password } = await parseBody(req);
  const user = users.find(u => u.user_id === user_id && u.password === password);
  if (!user) {
    return sendJSON(res, 401, { message: 'Invalid credentials' });
  }
  sendJSON(res, 200, { message: 'Signin success' });
}

// ----- Blog post API endpoints -----
function getPosts(req, res) {
  sendJSON(res, 200, posts);
}

async function createPost(req, res) {
  const { title, author, content } = await parseBody(req);
  const newPost = {
    id: Date.now().toString(),
    title,
    author,
    content,
    date: new Date().toLocaleString()
  };
  posts.unshift(newPost);
  sendJSON(res, 200, newPost);
}

async function updatePost(req, res, id) {
  const { title, author, content } = await parseBody(req);
  const post = posts.find(p => p.id === id);
  if (!post) return sendJSON(res, 404, { message: 'Not found' });
  if (post.author !== author) {
    return sendJSON(res, 403, { message: 'Forbidden' });
  }
  post.title = title;
  post.content = content;
  sendJSON(res, 200, post);
}

async function deletePost(req, res, id) {
  const { author } = await parseBody(req);
  const post = posts.find(p => p.id === id);
  if (!post) return sendJSON(res, 404, { message: 'Not found' });
  if (post.author !== author) {
    return sendJSON(res, 403, { message: 'Forbidden' });
  }
  posts = posts.filter(p => p.id !== id);
  sendJSON(res, 200, { message: 'Deleted' });
}

// Serve the React frontend
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === 'GET' && pathname === '/') {
    return serveStatic(res, path.join(__dirname, 'public', 'index.html'), 'text/html');
  }

  if (req.method === 'GET' && pathname === '/styles.css') {
    return serveStatic(res, path.join(__dirname, 'public', 'styles.css'), 'text/css');
  }

  if (req.method === 'GET' && pathname === '/app.js') {
    return serveStatic(res, path.join(__dirname, 'public', 'app.js'), 'application/javascript');
  }

  if (req.method === 'POST' && pathname === '/api/signup') return handleSignup(req, res);
  if (req.method === 'POST' && pathname === '/api/signin') return handleSignin(req, res);
  if (req.method === 'GET' && pathname === '/api/posts') return getPosts(req, res);
  if (req.method === 'POST' && pathname === '/api/posts') return createPost(req, res);

  if (pathname.startsWith('/api/posts/') && req.method === 'PUT') {
    const id = pathname.split('/')[3];
    return updatePost(req, res, id);
  }

  if (pathname.startsWith('/api/posts/') && req.method === 'DELETE') {
    const id = pathname.split('/')[3];
    return deletePost(req, res, id);
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
