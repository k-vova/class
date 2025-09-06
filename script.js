     const PAGES = [
      {
        id: 'kindergarten',
        name: 'Дитячий садочок',
        photos: Array.from({ length: 11 }, (_, i) => `img/Дитячий садочок/${i + 1}.jpg`)
      },
      {
        id: 'school-days',
        name: 'Шкільні будні',
        photos: Array.from({ length: 42 }, (_, i) => `img/Шкільні будні/${i + 1}.jpg`)
      },
      {
        id: 'group-photos',
        name: 'Колективні фото',
        photos: Array.from({ length: 11 }, (_, i) => `img/Колективні фото/${i + 1}.jpg`)
      },
      {
        id: 'excursions',
        name: 'Екскурсії',
        photos: Array.from({ length: 22 }, (_, i) => `img/Екскурсії/${i + 1}.jpg`)
      },
      {
        id: 'meet97-07',
        name: 'Зустріч 1997-2007р',
        photos: Array.from({ length: 32 }, (_, i) => `img/Зустріч 1997-2007р/${i + 1}.jpg`)
      },
      {
        id: 'meet2017',
        name: 'Зустріч 2017р',
        photos: Array.from({ length: 22 }, (_, i) => `img/Зустріч 2017р/${i + 1}.jpg`)
      },
      {
        id: 'meet2022-25',
        name: 'Зустріч 2022-2025р',
        photos: Array.from({ length: 12 }, (_, i) => `img/Зустріч 2022-2025р/${i + 1}.jpg`)
      },
      {
        id: 'video',
        name: 'Відео',
        videoUrl: 'https://www.youtube.com/embed/9uBKizur3ZM'
      }
    ];

    const menu = document.getElementById('menu');                 
    const content = document.getElementById('content');           
    const modal = document.getElementById('modal');               
    const modalContent = modal.querySelector('.modal-content');   
    const modalImg = document.getElementById('modalImg');         
    const modalVideo = document.getElementById('modalVideo');     
    const modalCaption = document.getElementById('modalCaption'); 
    const speedSelect = document.getElementById('slideshowSpeed');
    const photoCounter = document.getElementById('photoCounter'); 
    const closeBtn = document.getElementById('closeBtn');         
    const header = document.querySelector('header');              
    const footer = document.querySelector('footer');              

    let currentPageId = null;         
    let currentIndex = 0;               
    let slideshowInterval = null;       
    let slideshowSpeed = 3000;          
    let lastFocusedElement = null;      
    let isVideoMode = false;            

    function normalizePhoto(item, fallbackCaption) {
      if (typeof item === 'string') {
        return { src: item, caption: fallbackCaption };
      }
      return { src: item.src, caption: item.caption || fallbackCaption };
    }

    function renderMenu(activeId) {
      menu.innerHTML = ''; 
      PAGES.forEach(page => {
        const btn = document.createElement('button');
        btn.textContent = page.name;
        btn.setAttribute('aria-pressed', page.id === activeId ? 'true' : 'false');
        btn.setAttribute('aria-controls', `page-${page.id}`);
        btn.onclick = () => showPage(page.id);
        menu.appendChild(btn);
      });
    }

    function showPage(pageId) {
      currentPageId = pageId;
      renderMenu(pageId);
      content.innerHTML = ''; 
      const page = PAGES.find(p => p.id === pageId);
      if (!page) return;

      const pageDiv = document.createElement('div');
      pageDiv.className = 'page active';
      pageDiv.id = `page-${pageId}`;

      if (page.photos) {
        const gallery = document.createElement('div');
        gallery.className = 'gallery';
        page.photos.forEach((photo, index) => {
          const { src, caption } = normalizePhoto(photo, `Фото ${index + 1}`);
          const img = document.createElement('img');
          img.src = src;
          img.alt = caption;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.onclick = () => openModal(src, caption, index, page.photos);
          gallery.appendChild(img);
        });
        pageDiv.appendChild(gallery);
      } else if (page.videoUrl) {
        const videoDiv = document.createElement('div');
        videoDiv.className = 'video-container';
        const iframe = document.createElement('iframe');
        iframe.src = page.videoUrl;
        iframe.title = page.name;
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        videoDiv.appendChild(iframe);
        pageDiv.appendChild(videoDiv);
      }
      content.appendChild(pageDiv);
    }

    function openModal(src, caption, index, photos) {
      lastFocusedElement = document.activeElement; 
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page) return;
      if (page.videoUrl) {
        modalImg.style.display = 'none';
        modalVideo.style.display = 'block';
        modalVideo.src = page.videoUrl;
        modalCaption.textContent = '';
        photoCounter.textContent = '';
        isVideoMode = true;
      } else {
        modalImg.style.display = 'block';
        modalVideo.style.display = 'none';
        modalImg.src = src;
        modalImg.alt = caption;
        modalCaption.textContent = caption;
        currentIndex = index;
        photoCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
        isVideoMode = false;
      }
      modal.style.display = 'flex';
      closeBtn.focus();
      header.inert = true;
      footer.inert = true;
      content.inert = true;
      menu.inert = true;
    }

    function closeModal() {
      modal.style.display = 'none';
      stopSlideshow();
      modalImg.src = '';
      modalVideo.src = '';
      header.inert = false;
      footer.inert = false;
      content.inert = false;
      menu.inert = false;
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }

    function prevImage(event) {
      event.stopPropagation();
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page || !page.photos || isVideoMode) return;
      currentIndex = (currentIndex - 1 + page.photos.length) % page.photos.length;
      const { src, caption } = normalizePhoto(page.photos[currentIndex], `Фото ${currentIndex + 1}`);
      modalImg.src = src;
      modalImg.alt = caption;
      modalCaption.textContent = caption;
      photoCounter.textContent = `${currentIndex + 1} / ${page.photos.length}`;
    }

    function nextImage(event) {
      event.stopPropagation();
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page || !page.photos || isVideoMode) return;
      currentIndex = (currentIndex + 1) % page.photos.length;
      const { src, caption } = normalizePhoto(page.photos[currentIndex], `Фото ${currentIndex + 1}`);
      modalImg.src = src;
      modalImg.alt = caption;
      modalCaption.textContent = caption;
      photoCounter.textContent = `${currentIndex + 1} / ${page.photos.length}`;
    }

    function toggleSlideshow() {
      if (slideshowInterval) {
        stopSlideshow();
      } else {
        startSlideshow();
      }
    }

    function startSlideshow() {
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page || !page.photos || isVideoMode) return;
      document.getElementById('slideshowStatus').textContent = '⏸ Зупинити';
      slideshowInterval = setInterval(() => nextImage(new Event('slideshow')), slideshowSpeed);
    }

    function stopSlideshow() {
      document.getElementById('slideshowStatus').textContent = '▶️ Слайдшоу';
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

    document.addEventListener('keydown', e => {
      if (modal.style.display === 'flex') {
        if (e.key === 'Escape') {
          closeModal();
        } else if (e.key === 'ArrowLeft') {
          prevImage(e);
        } else if (e.key === 'ArrowRight') {
          nextImage(e);
        }
      }
    });

    function updateCounters() {
      const isFirstVisit = !localStorage.getItem('visitedBefore');
      if (isFirstVisit) {
        localStorage.setItem('visitedBefore', 'true');
        let unique = parseInt(localStorage.getItem('uniqueVisits') || '0', 10);
        unique++;
        localStorage.setItem('uniqueVisits', unique.toString());
      }
      let total = parseInt(localStorage.getItem('totalVisits') || '0', 10);
      total++;
      localStorage.setItem('totalVisits', total.toString());
      document.getElementById('totalCount').textContent = total;
      document.getElementById('uniqueCount').textContent = localStorage.getItem('uniqueVisits') || '0';
    }

    document.addEventListener('DOMContentLoaded', () => {
      showPage(PAGES[0].id);  
      updateCounters();
    });