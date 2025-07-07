const express = require("express");
const app = express();
const PORT = 3000;

// Parse JSON bodies for API endpoints
app.use(express.json());

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

let posts = [];
let users = [];

// Simple sign up - store user in memory
app.post('/api/signup', (req, res) => {
    const { user_id, password, name } = req.body;
    if (users.find(u => u.user_id === user_id)) {
        return res.status(400).json({ message: 'User exists' });
    }
    users.push({ user_id, password, name });
    res.json({ message: 'Signup success' });
});

// Simple sign in - verify credentials
app.post('/api/signin', (req, res) => {
    const { user_id, password } = req.body;
    const user = users.find(u => u.user_id === user_id && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Signin success' });
});

// ----- Blog post API endpoints -----
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

app.post('/api/posts', (req, res) => {
    const { title, author, content } = req.body;
    const newPost = {
        id: Date.now().toString(),
        title,
        author,
        content,
        date: new Date().toLocaleString()
    };
    posts.unshift(newPost);
    res.json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
    const { title, author, content } = req.body;
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.author !== author) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    post.title = title;
    post.content = content;
    res.json(post);
});

app.delete('/api/posts/:id', (req, res) => {
    const { author } = req.body;
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.author !== author) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    posts = posts.filter(p => p.id !== req.params.id);
    res.json({ message: 'Deleted' });
});

// Serve the React frontend
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
