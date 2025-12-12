// Replace your script.js with this complete file.
// Handles: navigation, header upload + persistence, create post modal, preview, post saving,
// rendering posts, likes, delete, posts count, and basic tab wiring.

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const createBtn = document.getElementById('createBtn');
  const createModal = document.getElementById('createModal');
  const closeCreate = document.getElementById('closeCreate');
  const cancelPost = document.getElementById('cancelPost');
  const uploadInput = document.getElementById('uploadInput');
  const previewWrap = document.getElementById('previewWrap');
  const postBtn = document.getElementById('postBtn');
  const captionEl = document.getElementById('caption');
  const tabs = document.querySelectorAll('.tab');

  const headerUpload = document.getElementById('header-upload');
  const headerImage = document.getElementById('header-image');
  const headerVideo = document.getElementById('header-video');

  const postsList = document.getElementById('postsList');
  const postsCountEl = document.getElementById('postsCount');

  const homeBtn = document.getElementById('homeBtn');
  const exploreBtn = document.getElementById('exploreBtn');
  const profileBtn = document.getElementById('profileBtn');

  const pages = {
    home: document.getElementById('homePage'),
    explore: document.getElementById('explorePage'),
    profile: document.getElementById('profilePage')
  };

  // LocalStorage keys
  const HEADER_KEY = 'pw_header_v2';
  const POSTS_KEY = 'pw_posts_v2';

  // Helpers
  function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => rej(new Error('File read error'));
      fr.readAsDataURL(file);
    });
  }

  function saveHeader(obj) { localStorage.setItem(HEADER_KEY, JSON.stringify(obj)); }
  function loadHeader() { const r = localStorage.getItem(HEADER_KEY); return r ? JSON.parse(r) : null; }

  function savePosts(arr) { localStorage.setItem(POSTS_KEY, JSON.stringify(arr)); }
  function loadPosts() { const r = localStorage.getItem(POSTS_KEY); return r ? JSON.parse(r) : []; }

  // Nav
  function showPage(name) {
    Object.values(pages).forEach(p => p.classList.remove('active'));
    if (pages[name]) pages[name].classList.add('active');
  }
  homeBtn?.addEventListener('click', () => showPage('home'));
  exploreBtn?.addEventListener('click', () => showPage('explore'));
  profileBtn?.addEventListener('click', () => showPage('profile'));
  // default
  showPage('profile');

  // Restore header on load
  (function restoreHeader() {
    try {
      const header = loadHeader();
      if (!header) return;
      if (header.type === 'video') {
        headerVideo.src = header.data;
        headerVideo.style.display = 'block';
        headerImage.style.display = 'none';
      } else {
        headerImage.src = header.data;
        headerImage.style.display = 'block';
        headerVideo.style.display = 'none';
      }
    } catch (e) {
      console.error('restoreHeader error', e);
    }
  })();

  // Header upload
  headerUpload?.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      if (file.type.startsWith('video/')) {
        headerVideo.src = dataUrl;
        headerVideo.style.display = 'block';
        headerImage.style.display = 'none';
        saveHeader({ type: 'video', data: dataUrl });
      } else {
        headerImage.src = dataUrl;
        headerImage.style.display = 'block';
        headerVideo.style.display = 'none';
        saveHeader({ type: 'image', data: dataUrl });
      }
    } catch (err) {
      console.error(err);
      alert('Unable to read that file.');
    }
  });

  // Modal: open / close
  createBtn?.addEventListener('click', () => {
    createModal.style.display = 'flex';
    previewWrap.innerHTML = '';
    uploadInput.value = '';
    uploadInput.dataset.preview = '';
    uploadInput.dataset.mimetype = '';
    captionEl.value = '';
    tabs.forEach(t => t.classList.remove('active'));
    if (tabs[0]) tabs[0].classList.add('active');
  });
  closeCreate?.addEventListener('click', () => createModal.style.display = 'none');
  cancelPost?.addEventListener('click', () => createModal.style.display = 'none');

  // Tab UI (visual only in this prototype)
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // File preview (and store data URL on input.dataset)
  uploadInput?.addEventListener('change', async (e) => {
    previewWrap.innerHTML = '';
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // small-limit warning for demo purpose
    const MAX_BYTES = 14 * 1024 * 1024; // ~14MB to avoid massive localStorage issues
    if (file.size > MAX_BYTES) {
      alert('File too large for demo (max ~14MB). Trim or choose smaller file.');
      uploadInput.value = '';
      uploadInput.dataset.preview = '';
      uploadInput.dataset.mimetype = '';
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '8px';
        previewWrap.appendChild(img);
      } else if (file.type.startsWith('video/')) {
        const vid = document.createElement('video');
        vid.src = dataUrl;
        vid.controls = true;
        vid.style.maxWidth = '100%';
        vid.style.borderRadius = '8px';
        previewWrap.appendChild(vid);
      } else {
        previewWrap.textContent = 'Unsupported file type';
      }
      uploadInput.dataset.preview = dataUrl;
      uploadInput.dataset.mimetype = file.type;
    } catch (err) {
      console.error('preview error', err);
      previewWrap.textContent = 'Preview failed';
    }
  });

  // Posts rendering
  function renderPosts() {
    // clear
    postsList.innerHTML = '';
    const posts = loadPosts();
    // update count
    postsCountEl.textContent = posts.length;

    if (!posts.length) {
      // ensure the "No posts yet" message shows in outer posts-area if desired (index.html does that already)
      return;
    }

    posts.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.style.marginTop = '12px';
      card.style.background = '#fff';
      card.style.padding = '12px';
      card.style.borderRadius = '10px';
      card.style.boxShadow = '0 6px 18px rgba(0,0,0,0.03)';

      if (p.file) {
        if (p.type && p.type.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = p.file;
          img.style.maxWidth = '100%';
          img.style.borderRadius = '8px';
          card.appendChild(img);
        } else {
          const v = document.createElement('video');
          v.src = p.file;
          v.controls = true;
          v.style.maxWidth = '100%';
          v.style.borderRadius = '8px';
          card.appendChild(v);
        }
      }

      if (p.caption) {
        const paragraph = document.createElement('p');
        paragraph.textContent = p.caption;
        paragraph.style.marginTop = '8px';
        card.appendChild(paragraph);
      }

      // action row
      const actions = document.createElement('div');
      actions.style.marginTop = '8px';
      actions.style.display = 'flex';
      actions.style.gap = '8px';

      const likeBtn = document.createElement('button');
      likeBtn.textContent = p.likes ? `Like (${p.likes})` : 'Like';
      likeBtn.className = 'like-btn';
      likeBtn.addEventListener('click', () => {
        const posts = loadPosts();
        posts[idx].likes = (posts[idx].likes || 0) + 1;
        savePosts(posts);
        renderPosts();
      });

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.className = 'del-btn';
      delBtn.addEventListener('click', () => {
        if (!confirm('Delete this post?')) return;
        const posts = loadPosts();
        posts.splice(idx, 1);
        savePosts(posts);
        renderPosts();
      });

      actions.appendChild(likeBtn);
      actions.appendChild(delBtn);
      card.appendChild(actions);

      postsList.appendChild(card);
    });
  }

  // Create post
  postBtn?.addEventListener('click', () => {
    const previewData = uploadInput.dataset.preview || null;
    const mimetype = uploadInput.dataset.mimetype || null;
    const caption = captionEl.value?.trim() || '';

    if (!previewData && !caption) {
      alert('Add a file or write a caption to post.');
      return;
    }

    const posts = loadPosts();
    const postObj = {
      file: previewData,
      type: mimetype,
      caption,
      likes: 0,
      createdAt: Date.now()
    };

    // newest first
    posts.unshift(postObj);
    savePosts(posts);
    renderPosts();

    // reset modal
    createModal.style.display = 'none';
    uploadInput.value = '';
    uploadInput.dataset.preview = '';
    uploadInput.dataset.mimetype = '';
    previewWrap.innerHTML = '';
    captionEl.value = '';
  });

  // initialize render
  renderPosts();

  // small accessibility: close modal with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && createModal.style.display === 'flex') {
      createModal.style.display = 'none';
    }
  });

  // Defensive: ensure required DOM elements exist
  if (!createBtn || !createModal) {
    console.warn('Create modal elements missing — check index.html IDs.');
  }

});
