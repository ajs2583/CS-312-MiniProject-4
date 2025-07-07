# Blog Application (Mini Project 4)

This project provides a small blogging platform built with **Express** and a minimal **React** frontend served from the `public` folder. Posts and users are stored in memory for simplicity.

## Running the application

```bash
npm install
npm start
```

The server starts at [http://localhost:3000](http://localhost:3000) and serves the React interface.

## Available API Endpoints

- `POST /api/signup` – create a new user
- `POST /api/signin` – authenticate a user
- `GET /api/posts` – list all posts
- `POST /api/posts` – create a new post
- `PUT /api/posts/:id` – edit a post
- `DELETE /api/posts/:id` – delete a post

All post modifications require the `author` field in the request body to match the creator of the post.
