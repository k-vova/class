// =====================
    // ДАНІ СТОРІНОК ГАЛЕРЕЇ
    // =====================
    const PAGES = [
      { id:'kindergarten', name:'Дитячий садочок', photos: Array.from({length:11},(_,i)=>`img/Дитячий садочок/${i+1}.jpg`) },
      { id:'school-days', name:'Шкільні будні', photos: Array.from({length:42},(_,i)=>`img/Шкільні будні/${i+1}.jpg`) },
      { id:'group-photos', name:'Колективні фото', photos: Array.from({length:11},(_,i)=>`img/Колективні фото/${i+1}.jpg`) },
      { id:'excursions', name:'Екскурсії', photos: Array.from({length:22},(_,i)=>`img/Екскурсії/${i+1}.jpg`) },
      { id:'meet97-07', name:'Зустріч 1997-2007р', photos: Array.from({length:32},(_,i)=>`img/Зустріч 1997-2007р/${i+1}.jpg`) },
      { id:'meet2017', name:'Зустріч 2017р', photos: Array.from({length:22},(_,i)=>`img/Зустріч 2017р/${i+1}.jpg`) },
      { id:'meet2022-25', name:'Зустріч 2022-2025р', photos: Array.from({length:12},(_,i)=>`img/Зустріч 2022-2025р/${i+1}.jpg`) },
      { id:'video', name:'Відео', videoUrl:'https://www.youtube.com/embed/9uBKizur3ZM' }
    ];

    // ЕЛЕМЕНТИ І СТАН
    const menu = document.getElementById('menu');
    const content = document.getElementById('content');
    const modal = document.getElementById('modal');
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

    function normalizePhoto(item, fallbackCaption) { return (typeof item === 'string') ? {src:item, caption:fallbackCaption} : { src:item.src, caption:item.caption||fallbackCaption }; }

    function renderMenu(activeId){
      menu.innerHTML = '';
      PAGES.forEach(page=>{
        const btn = document.createElement('button');
        btn.textContent = page.name;
        btn.setAttribute('aria-pressed', page.id===activeId ? 'true':'false');
        btn.setAttribute('aria-controls', `page-${page.id}`);
        btn.onclick = () => showPage(page.id);
        menu.appendChild(btn);
      });
    }

    function showPage(pageId){
      currentPageId = pageId;
      renderMenu(pageId);
      content.innerHTML = '';
      const page = PAGES.find(p=>p.id===pageId);
      if(!page) return;

      const pageDiv = document.createElement('div');
      pageDiv.className = 'page active';
      pageDiv.id = `page-${pageId}`;

      if (page.photos){
        const gallery = document.createElement('div');
        gallery.className = 'gallery';
        page.photos.forEach((photo, index)=>{
          const {src, caption} = normalizePhoto(photo, `Фото ${index+1}`);
          const img = document.createElement('img');
          img.src = src; img.alt = caption; img.loading='lazy'; img.decoding='async';
          img.onclick = () => openModal(src, caption, index, page.photos);
          gallery.appendChild(img);
        });
        pageDiv.appendChild(gallery);
      } else if (page.videoUrl){
        const videoDiv = document.createElement('div');
        videoDiv.className = 'video-container';
        const iframe = document.createElement('iframe');
        iframe.src = page.videoUrl; iframe.title = page.name; iframe.allowFullscreen = true; iframe.loading='lazy';
        iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
        videoDiv.appendChild(iframe);
        pageDiv.appendChild(videoDiv);
      }
      content.appendChild(pageDiv);
      // Запам'ятовуємо останню відкриту сторінку
      localStorage.setItem('lastPageId', pageId);
    }

    function openModal(src, caption, index, photos){
      lastFocusedElement = document.activeElement;
      const page = PAGES.find(p=>p.id===currentPageId);
      if(!page) return;
      if(page.videoUrl){
        modalImg.style.display='none';
        modalVideo.style.display='block';
        modalVideo.src = page.videoUrl;
        modalCaption.textContent=''; photoCounter.textContent='';
        isVideoMode = true;
      } else {
        modalImg.style.display='block'; modalVideo.style.display='none';
        modalImg.src = src; modalImg.alt = caption; modalCaption.textContent = caption;
        currentIndex = index; photoCounter.textContent = `${currentIndex+1} / ${photos.length}`; isVideoMode=false;
      }
      modal.style.display='flex'; closeBtn.focus();
      header.inert = footer.inert = content.inert = menu.inert = true;
      trapFocusInModal();
    }

    function closeModal(){
      modal.style.display='none'; stopSlideshow(); modalImg.src=''; modalVideo.src='';
      header.inert = footer.inert = content.inert = menu.inert = false;
      if(lastFocusedElement) lastFocusedElement.focus();
      releaseFocusTrap();
    }

    function prevImage(event){
      event.stopPropagation();
      const page = PAGES.find(p=>p.id===currentPageId);
      if(!page || !page.photos || isVideoMode) return;
      currentIndex = (currentIndex - 1 + page.photos.length) % page.photos.length;
      const {src, caption} = normalizePhoto(page.photos[currentIndex], `Фото ${currentIndex+1}`);
      modalImg.src = src; modalImg.alt = caption; modalCaption.textContent = caption;
      photoCounter.textContent = `${currentIndex+1} / ${page.photos.length}`;
    }

    function nextImage(event){
      event.stopPropagation();
      const page = PAGES.find(p=>p.id===currentPageId);
      if(!page || !page.photos || isVideoMode) return;
      currentIndex = (currentIndex + 1) % page.photos.length;
      const {src, caption} = normalizePhoto(page.photos[currentIndex], `Фото ${currentIndex+1}`);
      modalImg.src = src; modalImg.alt = caption; modalCaption.textContent = caption;
      photoCounter.textContent = `${currentIndex+1} / ${page.photos.length}`;
    }

    function toggleSlideshow(){ if (slideshowInterval) { stopSlideshow(); } else { startSlideshow(); } }
    function startSlideshow(){
      const page = PAGES.find(p=>p.id===currentPageId);
      if(!page || !page.photos || isVideoMode) return;
      document.getElementById('slideshowStatus').textContent = '⏸ Зупинити';
      slideshowInterval = setInterval(()=> nextImage(new Event('slideshow')), slideshowSpeed);
    }
    function stopSlideshow(){ document.getElementById('slideshowStatus').textContent = '▶️ Слайдшоу'; clearInterval(slideshowInterval); slideshowInterval = null; }
    function changeSlideshowSpeed(){ slideshowSpeed = parseInt(speedSelect.value,10); if(slideshowInterval){ stopSlideshow(); startSlideshow(); } }

    document.addEventListener('keydown', e=>{
      if(modal.style.display==='flex'){
        if(e.key==='Escape'){ closeModal(); }
        else if(e.key==='ArrowLeft'){ prevImage(e); }
        else if(e.key==='ArrowRight'){ nextImage(e); }
      }
    });

    // ===========================
    // ФОКУС-ТРАП У МОДАЛЬНОМУ ВІКНІ
    // ===========================
    let focusTrapHandler = null;
    function trapFocusInModal(){
      const selectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const nodes = modal.querySelectorAll(selectors);
      const focusable = Array.from(nodes).filter(el => !el.hasAttribute('disabled'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      focusTrapHandler = (e)=>{
        if (e.key !== 'Tab') return;
        if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      };
      document.addEventListener('keydown', focusTrapHandler);
    }
    function releaseFocusTrap(){ if(focusTrapHandler){ document.removeEventListener('keydown', focusTrapHandler); focusTrapHandler = null; } }

    // ======================
    // ГЛОБАЛЬНИЙ ЛІЧИЛЬНИК
    // ======================
    // Пояснення: попередня реалізація на localStorage працювала лише в межах одного браузера.
    // Тепер застосовано безкоштовний публічний сервіс CountAPI (https://countapi.xyz),
    // який зберігає значення на стороні сервера та показує однакові числа всім відвідувачам.
    // Unique рахується один раз з цього браузера (через localStorage) та збільшує глобальний лічильник на сервері.

    const COUNTAPI_NAMESPACE = 'class77-87-ulschool2'; // ← за бажанням змініть на свій унікальний простір імен
    const VISITED_FLAG = 'u2s_visited';

    async function countapiHit(key, amount=1){
      const url = `https://api.countapi.xyz/hit/${encodeURIComponent(COUNTAPI_NAMESPACE)}/${encodeURIComponent(key)}?amount=${amount}`;
      const res = await fetch(url, { cache:'no-store' });
      if(!res.ok) throw new Error('CountAPI hit error');
      return res.json();
    }
    async function countapiGet(key){
      const url = `https://api.countapi.xyz/get/${encodeURIComponent(COUNTAPI_NAMESPACE)}/${encodeURIComponent(key)}`;
      const res = await fetch(url, { cache:'no-store' });
      if(!res.ok) throw new Error('CountAPI get error');
      return res.json();
    }

    async function updateCounters(){
      const totalEl = document.getElementById('totalCount');
      const uniqueEl = document.getElementById('uniqueCount');
      // Загальні відвідини — інкрементуємо завжди
      try {
        const total = await countapiHit('total');
        totalEl.textContent = total.value.toLocaleString('uk-UA');
      } catch (e){
        // Фолбек локально, якщо мережа недоступна
        const localTotal = (parseInt(localStorage.getItem('totalVisits')||'0',10) + 1);
        localStorage.setItem('totalVisits', String(localTotal));
        totalEl.textContent = localTotal.toLocaleString('uk-UA');
        totalEl.title = 'Показник локальний (офлайн)';
      }

      // Унікальні — інкрементуємо лише при першому візиті з цього браузера
      const firstVisit = !localStorage.getItem(VISITED_FLAG);
      if(firstVisit){
        localStorage.setItem(VISITED_FLAG, '1');
        try {
          const unique = await countapiHit('unique');
          uniqueEl.textContent = unique.value.toLocaleString('uk-UA');
        } catch (e){
          const localUnique = (parseInt(localStorage.getItem('uniqueVisits')||'0',10) + 1);
          localStorage.setItem('uniqueVisits', String(localUnique));
          uniqueEl.textContent = localUnique.toLocaleString('uk-UA');
          uniqueEl.title = 'Показник локальний (офлайн)';
        }
      } else {
        try {
          const uniqueNow = await countapiGet('unique');
          uniqueEl.textContent = uniqueNow.value.toLocaleString('uk-UA');
        } catch (e){
          const localUnique = parseInt(localStorage.getItem('uniqueVisits')||'0',10);
          uniqueEl.textContent = localUnique.toLocaleString('uk-UA');
          uniqueEl.title = 'Показник локальний (офлайн)';
        }
      }
    }

    // ======================
    // ІНІЦІАЛІЗАЦІЯ
    // ======================
    document.addEventListener('DOMContentLoaded', ()=>{
      const last = localStorage.getItem('lastPageId');
      showPage(last || PAGES[0].id);
      updateCounters();
    });