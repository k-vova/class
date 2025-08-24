const PAGES = [
      { id: 'kindergarten', name: 'Дитячий садочок', photos: Array.from({length: 11}, (_,i)=>`img/Дитячий садочок/${i+1}.jpg`) },
      { id: 'school-days', name: 'Шкільні будні', photos: Array.from({length: 41}, (_,i)=>`img/Шкільні будні/${i+1}.jpg`) },
      { id: 'group-photos', name: 'Колективні фото', photos: Array.from({length: 11}, (_,i)=>`img/Колективні фото/${i+1}.jpg`) },
      { id: 'excursions', name: 'Екскурсії', photos: Array.from({length: 30}, (_,i)=>`img/Екскурсії/${i+1}.jpg`) },
      { id: 'meet97-07', name: 'Зустріч 1997-2007р', photos: Array.from({length: 35}, (_,i)=>`img/Зустріч 1997-2007р/${i+1}.jpg`) },
      { id: 'meet2017', name: 'Зустріч 2017р', photos: Array.from({length: 22}, (_,i)=>`img/Зустріч 2017р/${i+1}.jpg`) },
      { id: 'meet2022-25', name: 'Зустріч 2022-2025р', photos: Array.from({length: 12}, (_,i)=>`img/Зустріч 2022-2025р/${i+1}.jpg`) },
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
    }

    function closeModal() {
      modal.style.display = 'none';
      modalImg.src = '';
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

    // Стартова сторінка

    renderPage(PAGES[0].id);

