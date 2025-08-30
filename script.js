  const PAGES = [
    { id: 'kindergarten', name: 'Дитячий садочок', photos: Array.from({length: 11}, (_,i)=>`img/Дитячий садочок/${i+1}.jpg`) },
    { id: 'school-days', name: 'Шкільні будні', photos: Array.from({length: 41}, (_,i)=>`img/Шкільні будні/${i+1}.jpg`) },
    { id: 'group-photos', name: 'Колективні фото', photos: Array.from({length: 11}, (_,i)=>`img/Колективні фото/${i+1}.jpg`) },
    { id: 'excursions', name: 'Екскурсії', photos: Array.from({length: 22}, (_,i)=>`img/Екскурсії/${i+1}.jpg`) },
    { id: 'meet97-07', name: 'Зустріч 1997-2007р', photos: Array.from({length: 32}, (_,i)=>`img/Зустріч 1997-2007р/${i+1}.jpg`) },
    { id: 'meet2017', name: 'Зустріч 2017р', photos: Array.from({length: 22}, (_,i)=>`img/Зустріч 2017р/${i+1}.jpg`) },
    { id: 'meet2022-25', name: 'Зустріч 2022-2025р', photos: Array.from({length: 9},  (_,i)=>`img/Зустріч 2022-2025р/${i+1}.jpg`) },
    { id: 'video', name: 'Відео', videoUrl: 'https://www.youtube.com/embed/9uBKizur3ZM' }
  ];

  const menu = document.getElementById('menu');
  const content = document.getElementById('content');
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const speedSelect = document.getElementById('slideshowSpeed');
  const photoCounter = document.getElementById('photoCounter');

  let currentPageId = null;
  let currentIndex = 0;
  let slideshowInterval = null;
  let slideshowSpeed = 3000;

  function renderMenu(activeId) {
    menu.innerHTML = '';
    PAGES.forEach(p => {
      const btn = document.createElement('button');
      btn.textContent = p.name;
      btn.setAttribute("aria-pressed", p.id === activeId ? "true" : "false");
      btn.onclick = () => renderPage(p.id);
      menu.appendChild(btn);
    });
  }

  function renderPage(pageId) {
    renderMenu(pageId);
    currentPageId = pageId;
    const page = document.createElement('div');
    page.className = 'page active';
    const current = PAGES.find(p => p.id === pageId);

    if (current.photos) {
      const gallery = document.createElement('div');
      gallery.className = 'gallery';
      current.photos.forEach((src, idx) => addImageToGallery(src, gallery, idx, current.name));
      page.appendChild(gallery);
    }

    if (current.videoUrl) {
      const videoWrapper = document.createElement('div');
      videoWrapper.className = 'video-container';
      videoWrapper.innerHTML = `<iframe src="${current.videoUrl}" frameborder="0" allowfullscreen></iframe>`;
      page.appendChild(videoWrapper);
    }

    content.innerHTML = '';
    content.appendChild(page);
  }

  function addImageToGallery(src, gallery, idx, category) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Фото ${idx + 1} з категорії "${category}"`;
    img.loading = "lazy";
    img.onclick = () => openModal(idx);
    gallery.appendChild(img);
  }

  function openModal(index) {
    const page = PAGES.find(p => p.id === currentPageId);
    if (!page.photos) return;
    currentIndex = index;
    modal.style.display = 'flex';
    updateModalImage();
  }

  function updateModalImage() {
    const page = PAGES.find(p => p.id === currentPageId);
    if (!page.photos) return;
    modalImg.src = page.photos[currentIndex];
    photoCounter.textContent = `Фото ${currentIndex + 1} з ${page.photos.length}`;
  }

  function closeModal() {
    modal.style.display = 'none';
    modalImg.src = '';
    stopSlideshow();
  }

  function prevImage(event) {
    if (event) event.stopPropagation();
    stopSlideshow();
    const page = PAGES.find(p => p.id === currentPageId);
    if (!page.photos) return;
    currentIndex = (currentIndex - 1 + page.photos.length) % page.photos.length;
    updateModalImage();
  }

  function nextImage(event) {
    if (event) event.stopPropagation();
    stopSlideshow();
    const page = PAGES.find(p => p.id === currentPageId);
    if (!page.photos) return;
    currentIndex = (currentIndex + 1) % page.photos.length;
    updateModalImage();
  }

  function toggleSlideshow() {
    if (slideshowInterval) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  }

  function startSlideshow() {
    document.getElementById("slideshowStatus").textContent = "⏸ Пауза";
    slideshowInterval = setInterval(() => {
      const page = PAGES.find(p => p.id === currentPageId);
      if (page?.photos) {
        currentIndex = (currentIndex + 1) % page.photos.length;
        updateModalImage();
      }
    }, slideshowSpeed);
  }

  function stopSlideshow() {
    document.getElementById("slideshowStatus").textContent = "▶️ Слайдшоу";
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }

  function changeSlideshowSpeed() {
    slideshowSpeed = parseInt(speedSelect.value, 10);
    if (slideshowInterval) {
      stopSlideshow();
      startSlideshow();
    }
  }

  // Swipe для мобільної модалки
  let touchStartX = 0;
  let touchEndX = 0;
  modal.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].screenX; });
  modal.addEventListener("touchend",   e => { touchEndX   = e.changedTouches[0].screenX; handleGesture(); });
  function handleGesture() {
    if (touchEndX < touchStartX - 50) nextImage();
    if (touchEndX > touchStartX + 50) prevImage();
  }

  // Клавіатурна навігація
  document.addEventListener("keydown", (e) => {
    if (modal.style.display === 'flex') {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeModal();
    }
  });

  // ------- ЛІЧИЛЬНИК -------
  const VISITED_KEY = 'class_visited_v2';
  const COUNTER_KEY = 'k-vova-class_visitors1987';
  const API = 'https://countapi.mileshilliard.com/api/v1';

  function safeGetLocal(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function safeSetLocal(key, val) { try { localStorage.setItem(key, val); } catch {} }

  async function updateUniqueCounter() {
    const out = document.getElementById('uniqueCount');
    const visited = safeGetLocal(VISITED_KEY) === '1';
    let shown = false;

    try {
      const resGet = await fetch(`${API}/get/${encodeURIComponent(COUNTER_KEY)}`, { cache: 'no-store', mode: 'cors' });
      if (resGet.ok) {
        const dataGet = await resGet.json();
        const n = Number(dataGet?.value);
        if (Number.isFinite(n)) { out.textContent = n; shown = true; }
      }

      if (!visited) {
        const resHit = await fetch(`${API}/hit/${encodeURIComponent(COUNTER_KEY)}`, { cache: 'no-store', mode: 'cors' });
        if (resHit.ok) {
          const dataHit = await resHit.json();
          const n2 = Number(dataHit?.value);
          if (Number.isFinite(n2)) { out.textContent = n2; shown = true; }
          safeSetLocal(VISITED_KEY, '1');
        }
      }
    } catch (_) {}

    if (!shown) out.textContent = '0';
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderPage(PAGES[0].id);
    updateUniqueCounter();
  });