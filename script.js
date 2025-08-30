// ------- Дані сторінок/фото -------
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

  let currentPageId = null;
  let currentIndex = 0;
  let slideshowInterval = null;

  function renderMenu(activeId) {
    menu.innerHTML = '';
    PAGES.forEach(p => {
      const btn = document.createElement('button');
      btn.textContent = p.name;
      if (p.id === activeId) btn.classList.add('active');
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
      videoWrapper.innerHTML = `<iframe src="${current.videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
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
  }

  function closeModal() {
    modal.style.display = 'none';
    modalImg.src = '';
    stopSlideshow();
  }

  function prevImage(event) {
    if (event) event.stopPropagation();
    const page = PAGES.find(p => p.id === currentPageId);
    if (!page.photos) return;
    currentIndex = (currentIndex - 1 + page.photos.length) % page.photos.length;
    updateModalImage();
  }

  function nextImage(event) {
    if (event) event.stopPropagation();
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
      nextImage();
    }, 3000);
  }

  function stopSlideshow() {
    document.getElementById("slideshowStatus").textContent = "▶️ Слайдшоу";
    clearInterval(slideshowInterval);
    slideshowInterval = null;
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

  // Стартова сторінка
  renderPage(PAGES[0].id);

  // ------- ЛІЧИЛЬНИК ВІДВІДУВАЧІВ -------
  // Використовуємо CounterAPI V1 (публічні ендпоїнти) + localStorage для унікальності з цього браузера.
  // namespace/name відповідають вашому ключу "k-vova/class".
  const COUNTER_NAMESPACE = 'k-vova';
  const COUNTER_NAME = 'class';
  const VISITED_KEY = 'kvova_class_visited_v1';

  async function updateUniqueCounter() {
    const out = document.getElementById('uniqueCount');
    const base = `https://api.counterapi.dev/v1/${encodeURIComponent(COUNTER_NAMESPACE)}/${encodeURIComponent(COUNTER_NAME)}`;
    try {
      let data;
      if (!localStorage.getItem(VISITED_KEY)) {
        // Інкрементуємо лише один раз на браузер
        const res = await fetch(`${base}/up`, { cache: 'no-store' });
        data = await res.json();
        localStorage.setItem(VISITED_KEY, '1');
      } else {
        // Просто читаємо поточне значення
        const res = await fetch(`${base}`, { cache: 'no-store' });
        data = await res.json();
      }
      const value = (data && (data.count ?? data.value ?? data?.data ?? null));
      out.textContent = (typeof value === 'number') ? value : '—';
    } catch (e) {
      out.textContent = 'недоступно';
    }
  }

  document.addEventListener('DOMContentLoaded', updateUniqueCounter);