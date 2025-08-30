// ------- Дані сторінок/фото (усі альбоми) -------
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

    // ------- ЛІЧИЛЬНИК УНІКАЛЬНИХ ВІДВІДУВАЧІВ -------
    // Використовуємо власний namespace/name, + обережна робота з localStorage.
    const COUNTER_NAMESPACE = 'class-site';   // ← можна змінити на свій
    const COUNTER_NAME = 'visitors';          // ← можна змінити на свій
    const VISITED_KEY = 'class_visited_v1';

    function normalizeCount(data) {
      if (!data) return null;
      if (typeof data.count === 'number') return data.count;
      if (typeof data.value === 'number') return data.value;
      if (typeof data.data === 'number') return data.data;
      if (typeof data === 'number') return data;
      // інколи API повертає рядок-число
      const n = Number(data.count ?? data.value ?? data.data ?? data);
      return Number.isFinite(n) ? n : null;
    }

    function safeGetLocal(key) { try { return localStorage.getItem(key); } catch { return null; } }
    function safeSetLocal(key, val) { try { localStorage.setItem(key, val); } catch {} }

    async function updateUniqueCounter() {
      const out = document.getElementById('uniqueCount');
      const base = `https://api.counterapi.dev/v1/${encodeURIComponent(COUNTER_NAMESPACE)}/${encodeURIComponent(COUNTER_NAME)}`;
      const visited = safeGetLocal(VISITED_KEY) === '1';
      let shown = false;

      try {
        // 1) Завжди показуємо поточне значення (fallback, якщо /up не спрацює)
        const resGet = await fetch(base, { cache: 'no-store', mode: 'cors' });
        const dataGet = await resGet.json();
        let cnt = normalizeCount(dataGet);

        // 2) Якщо користувач ще не позначений як унікальний — інкрементуємо
        if (!visited) {
          try {
            const resUp = await fetch(`${base}/up`, { cache: 'no-store', mode: 'cors' });
            const dataUp = await resUp.json();
            const upCnt = normalizeCount(dataUp);
            if (Number.isFinite(upCnt)) {
              cnt = upCnt;
              safeSetLocal(VISITED_KEY, '1');   // позначаємо після успішного /up
            }
          } catch {}
        }

        if (Number.isFinite(cnt)) {
          out.textContent = cnt;
          shown = true;
        }
      } catch (e) {
        // ігноруємо, спробуємо показати "0" нижче
      }

      if (!shown) out.textContent = '0';
    }

    document.addEventListener('DOMContentLoaded', () => {
      // Стартова сторінка
      renderPage(PAGES[0].id);
      // Оновити лічильник
      updateUniqueCounter();
    });