document.addEventListener('DOMContentLoaded', () => {
  let currentUser = null;
  let posts = [];
  const root = document.getElementById('root');

  const elem = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k.startsWith('on') && typeof v === 'function') {
        el.addEventListener(k.substring(2).toLowerCase(), v);
      } else {
        el[k] = v;
      }
    });
    children.forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return el;
  };

  const fetchPosts = () =>
    fetch('/api/posts').then(res => res.json()).then(data => { posts = data; renderApp(); });

  const signupForm = () => {
    let userId = '', password = '', name = '';
    const onSubmit = e => {
      e.preventDefault();
      fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password, name })
      }).then(res => res.json()).then(d => alert(d.message));
    };
    return elem('form', { onsubmit: onSubmit }, [
      elem('h2', { innerText: 'Signup' }),
      elem('input', { placeholder: 'User ID', required: true, onchange: e => userId = e.target.value }),
      elem('input', { type: 'password', placeholder: 'Password', required: true, onchange: e => password = e.target.value }),
      elem('input', { placeholder: 'Name', required: true, onchange: e => name = e.target.value }),
      elem('button', { type: 'submit', innerText: 'Signup' })
    ]);
  };

  const signinForm = () => {
    let userId = '', password = '';
    const onSubmit = e => {
      e.preventDefault();
      fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password })
      }).then(async res => {
        const data = await res.json();
        if (res.ok) { currentUser = userId; fetchPosts(); }
        else alert(data.message);
      });
    };
    return elem('form', { onsubmit: onSubmit }, [
      elem('h2', { innerText: 'Signin' }),
      elem('input', { placeholder: 'User ID', required: true, onchange: e => userId = e.target.value }),
      elem('input', { type: 'password', placeholder: 'Password', required: true, onchange: e => password = e.target.value }),
      elem('button', { type: 'submit', innerText: 'Signin' })
    ]);
  };

  const postForm = () => {
    let title = '', content = '';
    const onSubmit = e => {
      e.preventDefault();
      fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author: currentUser, content })
      }).then(res => res.json()).then(p => { posts.unshift(p); renderApp(); });
    };
    return elem('form', { onsubmit: onSubmit }, [
      elem('h2', { innerText: 'Create Post' }),
      elem('input', { placeholder: 'Title', required: true, onchange: e => title = e.target.value }),
      elem('textarea', { placeholder: 'Content', onchange: e => content = e.target.value }),
      elem('button', { type: 'submit', innerText: 'Publish' })
    ]);
  };

  const postElement = post => {
    let editing = false;
    let title = post.title;
    let content = post.content;

    const updateDisplay = () => {
      const container = elem('div', { className: 'post' });
      if (editing) {
        container.appendChild(elem('input', { value: title, onchange: e => title = e.target.value }));
        container.appendChild(elem('textarea', { value: content, onchange: e => content = e.target.value }));
        container.appendChild(elem('button', { innerText: 'Save', onclick: () => {
          fetch(`/api/posts/${post.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, author: currentUser })
          }).then(async res => {
            const data = await res.json();
            if (res.ok) {
              Object.assign(post, data);
              editing = false;
              renderApp();
            } else alert(data.message);
          });
        }}));
      } else {
        container.appendChild(elem('h3', { innerText: post.title }));
        container.appendChild(elem('p', { innerHTML: `<strong>By:</strong> ${post.author} | ${post.date}` }));
        container.appendChild(elem('p', { innerText: post.content }));
        if (currentUser === post.author) {
          container.appendChild(elem('button', { innerText: 'Edit', onclick: () => { editing = true; renderApp(); } }));
          container.appendChild(elem('button', { innerText: 'Delete', onclick: () => {
            fetch(`/api/posts/${post.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ author: currentUser })
            }).then(async res => {
              const data = await res.json();
              if (res.ok) { posts = posts.filter(p => p.id !== post.id); renderApp(); }
              else alert(data.message);
            });
          }}));
        }
      }
      return container;
    };
    return updateDisplay();
  };

  const renderApp = () => {
    root.innerHTML = '';
    const container = elem('div', { className: 'container' });
    if (!currentUser) {
      container.appendChild(signupForm());
      container.appendChild(signinForm());
    } else {
      container.appendChild(elem('h1', { innerText: 'My Blog' }));
      container.appendChild(postForm());
      posts.forEach(p => container.appendChild(postElement(p)));
    }
    root.appendChild(container);
  };

  renderApp();
});
