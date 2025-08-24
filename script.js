/* Хелпер для генерації списків фото 1..N */
    function genPhotos(folder, count) {
      return Array.from({ length: count }, (_, i) => `img/${folder}/${i+1}.jpg`);
    }

    /* Дані сторінок (повні кількості фото з твого повідомлення) */
    const PAGES = [
      { id: 'kindergarten', name: 'Дитячий садочок', photos: genPhotos('Дитячий садочок', 11) },
      { id: 'school-days', name: 'Шкільні будні', photos: genPhotos('Шкільні будні', 41) },
      { id: 'group-photos', name: 'Колективні фото', photos: genPhotos('Колективні фото', 11) },
      { id: 'excursions', name: 'Екскурсії', photos: genPhotos('Екскурсії', 22) },
      { id: 'meetings-1997-2007', name: 'Зустріч 1997-2007р', photos: genPhotos('Зустріч 1997-2007р', 32) },
      { id: 'meeting-2017', name: 'Зустріч 2017р', photos: genPhotos('Зустріч 2017р', 22) },
      { id: 'meeting-2022-2025', name: 'Зустріч 2022-2025р', photos: genPhotos('Зустріч 2022-2025р', 9) },
      { id: 'video', name: 'Відео', videoUrl: 'https://www.youtube.com/embed/9uBKizur3ZM' }
    ];

    const menu = document.getElementById('menu');
    const content = document.getElementById('content');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');

    let currentPageId = null;
    let currentIndex = 0;

    function renderMenu(activeId) {
      menu.innerHTML = '';
      PAGES.forEach(p => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = p.name;
        btn.className = (p.id === activeId) ? 'active' : '';
        btn.onclick = () => renderPage(p.id);
        menu.appendChild(btn);
      });
    }

    function renderPage(pageId) {
      currentPageId = pageId;
      renderMenu(pageId);

      const page = document.createElement('div');
      page.className = 'page active';

      const current = PAGES.find(p => p.id === pageId);

      if (current.photos) {
        const gallery = document.createElement('div');
        gallery.className = 'gallery';

        current.photos.forEach((src, index) => {
          const img = document.createElement('img');
          img.loading = 'lazy';
          img.decoding = 'async';
          img.alt = `${current.name} — фото ${index+1}`;
          img.src = src;
          img.onclick = () => openModal(index);
          gallery.appendChild(img);
        });

        page.appendChild(gallery);
      }

      if (current.videoUrl) {
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'video-container';
        videoWrapper.innerHTML =
          `<iframe src="${current.videoUrl}"
                   title="YouTube video"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                   allowfullscreen></iframe>`;
        page.appendChild(videoWrapper);
      }

      content.innerHTML = '';
      content.appendChild(page);
    }

    function openModal(index) {
      currentIndex = index;
      updateModalImage();
      modal.style.display = 'flex';
      document.addEventListener('keydown', onKeyNav); // навігація з клавіатури
    }

    function updateModalImage() {
      const photos = PAGES.find(p => p.id === currentPageId).photos;
      modalImg.src = photos[currentIndex];
    }

    function closeModal() {
      modal.style.display = 'none';
      modalImg.src = '';
      document.removeEventListener('keydown', onKeyNav);
    }

    function prevImage(event) {
      if (event) event.stopPropagation();
      const photos = PAGES.find(p => p.id === currentPageId).photos;
      currentIndex = (currentIndex - 1 + photos.length) % photos.length;
      updateModalImage();
    }

    function nextImage(event) {
      if (event) event.stopPropagation();
      const photos = PAGES.find(p => p.id === currentPageId).photos;
      currentIndex = (currentIndex + 1) % photos.length;
      updateModalImage();
    }

    function onKeyNav(e) {
      if (e.key === 'ArrowLeft') prevImage(e);
      else if (e.key === 'ArrowRight') nextImage(e);
      else if (e.key === 'Escape') closeModal();
    }

    // Стартова сторінка
    renderPage(PAGES[0].id);