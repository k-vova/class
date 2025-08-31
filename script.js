 const PAGES = [
      {
        id: 'kindergarten',
        name: 'Дитячий садочок',
        photos: Array.from({ length: 11 }, (_, i) => `img/Дитячий садочок/${i + 1}.jpg`)
      },
      {
        id: 'school-days',
        name: 'Шкільні будні',
        photos: Array.from({ length: 41 }, (_, i) => `img/Шкільні будні/${i + 1}.jpg`)
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
      PAGES.forEach(p => {
        const btn = document.createElement('button'); 
        btn.type = 'button';                           
        btn.textContent = p.name;                      
        btn.setAttribute('aria-pressed', p.id === activeId ? 'true' : 'false'); 
        if (p.id === activeId) btn.setAttribute('aria-current', 'page');        
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

        current.photos.forEach((item, idx) => {
                    const fallbackCaption = `Фото ${idx + 1} — ${current.name}`;
                 const { src, caption } = normalizePhoto(item, fallbackCaption);
                    addImageToGallery({ src, caption }, gallery, idx, current.name);
        });

        page.appendChild(gallery); 
      }

          if (current.videoUrl) {
        const videoWrapper = document.createElement('div'); 
        videoWrapper.className = 'video-container';
        videoWrapper.innerHTML = `
          <iframe
            src="${current.videoUrl}"
            title="Відео однокласників"
            frameborder="0"
            allowfullscreen
            loading="lazy"           /* Ліниве завантаження для пришвидшення старту */
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        `;

                const openVideoBtn = document.createElement('button');
        openVideoBtn.type = 'button';
        openVideoBtn.style.marginTop = '12px';
        openVideoBtn.textContent = 'Переглянути відео в спливаючому вікні';
        openVideoBtn.setAttribute('aria-label', 'Переглянути відео в спливаючому вікні у збільшеному розмірі');
        openVideoBtn.onclick = () => openVideoModal(current.videoUrl, 'Спогади однокласників — відео');

        page.appendChild(videoWrapper);
        page.appendChild(openVideoBtn);
      }

           content.innerHTML = '';
      content.appendChild(page);

          closeModal();
    }

     function addImageToGallery(item, gallery, idx, category) {
      const img = document.createElement('img');          
      img.src = item.src;                                 
      img.alt = item.caption || `Фото ${idx + 1} з категорії "${category}"`; 
      img.loading = 'lazy';                                
      img.decoding = 'async';                              
      img.setAttribute('aria-label', `Відкрити фото ${idx + 1} з категорії ${category}`); 
      img.onclick = () => openImageModal(idx);             
      gallery.appendChild(img);                            
    }

    function openImageModal(index) {
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page?.photos) return;              
      isVideoMode = false;                    
      currentIndex = index;                   

      lastFocusedElement = document.activeElement; 
      document.body.style.overflow = 'hidden';     

      header.setAttribute('aria-hidden', 'true');
      content.setAttribute('aria-hidden', 'true');
      footer.setAttribute('aria-hidden', 'true');

      modalImg.style.display = '';
      modalVideo.style.display = 'none';
      document.getElementById('slideshowStatus').textContent = '▶️ Слайдшоу';

      modal.style.display = 'flex';   
      updateModalImage();             

      closeBtn.focus();
    }

 
    function openVideoModal(url, captionText = 'Відео') {
      isVideoMode = true;                        
      lastFocusedElement = document.activeElement; 
      document.body.style.overflow = 'hidden';     

      header.setAttribute('aria-hidden', 'true');
      content.setAttribute('aria-hidden', 'true');
      footer.setAttribute('aria-hidden', 'true');

      modalImg.style.display = 'none';           
      modalVideo.style.display = '';             
      modalVideo.src = url;                       
      modalCaption.textContent = captionText;     
      photoCounter.textContent = '';              

          stopSlideshow();

      modal.style.display = 'flex';
      closeBtn.focus();
    }

    function closeModal() {
      modal.style.display = 'none';               
      modalImg.src = '';                          
      modalVideo.src = '';                        
      stopSlideshow();                            
      document.body.style.overflow = '';          

      header.removeAttribute('aria-hidden');
      content.removeAttribute('aria-hidden');
      footer.removeAttribute('aria-hidden');

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
      isVideoMode = false;                        
    }

    function updateModalImage() {
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page?.photos) return; 

      const fallbackCaption = `Фото ${currentIndex + 1} — ${page.name}`;
      const { src, caption } = normalizePhoto(page.photos[currentIndex], fallbackCaption);

      modalImg.src = src;                            
      modalImg.alt = caption;                        
      modalCaption.textContent = caption;            
      photoCounter.textContent = `Фото ${currentIndex + 1} з ${page.photos.length}`; 
    }

    function prevImage(event) {
      if (event) event.stopPropagation();            
      if (isVideoMode) return;                       
      stopSlideshow();                               
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page?.photos) return;
      currentIndex = (currentIndex - 1 + page.photos.length) % page.photos.length; 
      updateModalImage();                            
    }

    function nextImage(event) {
      if (event) event.stopPropagation();
      if (isVideoMode) return;
      stopSlideshow();
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page?.photos) return;
      currentIndex = (currentIndex + 1) % page.photos.length;
      updateModalImage();
    }

    function toggleSlideshow() {
      if (isVideoMode) return; 
      if (slideshowInterval) {
        stopSlideshow();       
      } else {
        startSlideshow();      
      }
    }

    function startSlideshow() {
      document.getElementById('slideshowStatus').textContent = '⏸ Пауза'; 
      slideshowInterval = setInterval(() => {
        const page = PAGES.find(p => p.id === currentPageId);
        if (page?.photos) {
          currentIndex = (currentIndex + 1) % page.photos.length; 
          updateModalImage();                                      
        }
      }, slideshowSpeed);
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

    let touchStartX = 0;
    let touchEndX = 0;
    modal.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
    modal.addEventListener('touchend',   e => { touchEndX   = e.changedTouches[0].screenX; handleGesture(); });
    function handleGesture() {
      if (isVideoMode) return; 
      if (touchEndX < touchStartX - 50) nextImage(); 
      if (touchEndX > touchStartX + 50) prevImage(); 
    }

    document.addEventListener('keydown', (e) => {
      if (modal.style.display === 'flex') {
        if (!isVideoMode) {
          if (e.key === 'ArrowLeft') prevImage();
          if (e.key === 'ArrowRight') nextImage();
        }
        if (e.key === 'Escape') closeModal();

        if (e.key === 'Tab') {
          const focusable = modalContent.querySelectorAll(
            'button, [href], select, textarea, input, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              last.focus();
              e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      }
    });

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
      } catch (_) {
              }
      if (!shown) out.textContent = '—';
    }

    document.addEventListener('DOMContentLoaded', () => {
      renderPage(PAGES[0].id);  
      updateUniqueCounter();    

    });
