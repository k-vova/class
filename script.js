 /* ---------------------------------------------------------
       КОНФІГУРАЦІЯ СТОРІНОК/КАТЕГОРІЙ:
       - id: унікальний ідентифікатор сторінки
       - name: відображувана назва в меню/таймлайні
       - photos: масив або рядків (шляхів до зображень), або об'єктів { src, caption }
       - videoUrl: URL для вбудовування відео з YouTube (або ін.)
       --------------------------------------------------------- */
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
        photos: Array.from({ length: 9 }, (_, i) => `img/Зустріч 2022-2025р/${i + 1}.jpg`)
      },
      {
        id: 'video',
        name: 'Відео',
        videoUrl: 'https://www.youtube.com/embed/9uBKizur3ZM'
      }

      /* ПРИКЛАД довільного підпису:
      {
        id: 'example',
        name: 'З прикладами підписів',
        photos: [
          { src: 'img/Приклад/1.jpg', caption: 'Похід до музею — 1986' },
          { src: 'img/Приклад/2.jpg', caption: 'Останній дзвоник — 1987' }
        ]
      }
      */
    ];

    /* ---------------------------------------------------------
       КЕШУЄМО ПОСИЛАННЯ НА КЛЮЧОВІ DOM-ЕЛЕМЕНТИ ДЛЯ ШВИДШОГО ДОСТУПУ
       --------------------------------------------------------- */
    const menu = document.getElementById('menu');                 // Контейнер головного меню
    const content = document.getElementById('content');           // Контейнер для сторінок (галерей/відео)
    const modal = document.getElementById('modal');               // Модальне вікно (бекдроп)
    const modalContent = modal.querySelector('.modal-content');   // Внутрішній контейнер модалки
    const modalImg = document.getElementById('modalImg');         // Елемент <img> для фото в модалці
    const modalVideo = document.getElementById('modalVideo');     // Елемент <iframe> для відео в модалці
    const modalCaption = document.getElementById('modalCaption'); // Підпис під фото/відео
    const speedSelect = document.getElementById('slideshowSpeed');// Випадаючий список швидкості слайдшоу
    const photoCounter = document.getElementById('photoCounter'); // Лічильник "Фото X з Y"
    const closeBtn = document.getElementById('closeBtn');         // Кнопка "Закрити" (для фокусу)
    const header = document.querySelector('header');              // Хедер (щоб ховати від скрінрідера під час модалки)
    const footer = document.querySelector('footer');              // Футер (аналогічно)

    /* ---------------------------------------------------------
       СТАН ДОДАТКА (ПОТОЧНА СТОРІНКА, ІНДЕКС ФОТО, СЛАЙДШОУ тощо)
       --------------------------------------------------------- */
    let currentPageId = null;           // id активної сторінки/категорії
    let currentIndex = 0;               // індекс поточного фото в масиві
    let slideshowInterval = null;       // ідентифікатор setInterval для слайдшоу
    let slideshowSpeed = 3000;          // поточна швидкість слайдшоу (мс)
    let lastFocusedElement = null;      // останній фокусний елемент перед відкриттям модалки
    let isVideoMode = false;            // чи показуємо відео в модалці

    /* ---------------------------------------------------------
       ДОПОМОЖНІ ФУНКЦІЇ ДЛЯ МАСИВУ ФОТО:
       - нормалізуємо елемент масиву: приймаємо або рядок, або {src, caption}
       - генеруємо підпис за замовчуванням, якщо не задано
       --------------------------------------------------------- */
    function normalizePhoto(item, fallbackCaption) {
      if (typeof item === 'string') {
        return { src: item, caption: fallbackCaption };
      }
      // Якщо вже об’єкт — повертаємо з дефолтним caption, якщо його немає
      return { src: item.src, caption: item.caption || fallbackCaption };
    }

    /* ---------------------------------------------------------
       РЕНДЕР ГОЛОВНОГО МЕНЮ (вкладки)
       - activeId: id активної сторінки, щоб виділити її в меню
       - додаємо aria-pressed і aria-current для кращої доступності
       --------------------------------------------------------- */
    function renderMenu(activeId) {
      menu.innerHTML = ''; // очищуємо меню
      PAGES.forEach(p => {
        const btn = document.createElement('button'); // створюємо кнопку-вкладку
        btn.type = 'button';                           // явно тип кнопки
        btn.textContent = p.name;                      // текст із назвою категорії
        btn.setAttribute('aria-pressed', p.id === activeId ? 'true' : 'false'); // стан натиснутості
        if (p.id === activeId) btn.setAttribute('aria-current', 'page');        // позначка активної «сторінки»
        btn.onclick = () => renderPage(p.id);          // при кліку — рендеримо потрібну сторінку
        menu.appendChild(btn);                         // додаємо кнопку до меню
      });
    }

    /* ---------------------------------------------------------
       РЕНДЕР СТОРІНКИ:
       - відображає галерею або відео залежно від конфігурації PAGES
       - робить сторінку активною
       --------------------------------------------------------- */
    function renderPage(pageId) {
      renderMenu(pageId);        // спершу оновлюємо видимість активної вкладки в меню
      currentPageId = pageId;    // оновлюємо стан активної сторінки

      const page = document.createElement('div'); // новий контейнер сторінки
      page.className = 'page active';             // робимо його активним

      const current = PAGES.find(p => p.id === pageId); // знаходимо опис сторінки

      // Якщо є фото — рендеримо галерею
      if (current.photos) {
        const gallery = document.createElement('div'); // контейнер сітки
        gallery.className = 'gallery';

        current.photos.forEach((item, idx) => {
          // Генеруємо зрозумілий підпис за замовчуванням
          const fallbackCaption = `Фото ${idx + 1} — ${current.name}`;
          // Нормалізуємо фото (рядок або об’єкт)
          const { src, caption } = normalizePhoto(item, fallbackCaption);
          // Додаємо зображення в галерею
          addImageToGallery({ src, caption }, gallery, idx, current.name);
        });

        page.appendChild(gallery); // вставляємо галерею в сторінку
      }

      // Якщо є відео — рендеримо адаптивний контейнер з iframe і кнопкою «Відкрити у модалці»
      if (current.videoUrl) {
        const videoWrapper = document.createElement('div'); // контейнер 16:9
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

        // Кнопка для відкриття відео у модалці (повноекранніша подача)
        const openVideoBtn = document.createElement('button');
        openVideoBtn.type = 'button';
        openVideoBtn.style.marginTop = '12px';
        openVideoBtn.textContent = 'Відкрити відео в модалці';
        openVideoBtn.setAttribute('aria-label', 'Відкрити відео в модальному вікні у збільшеному розмірі');
        openVideoBtn.onclick = () => openVideoModal(current.videoUrl, 'Спогади однокласників — відео');

        page.appendChild(videoWrapper);
        page.appendChild(openVideoBtn);
      }

      // Очищаємо попередній контент і вставляємо щойно зібрану сторінку
      content.innerHTML = '';
      content.appendChild(page);

      // Коли рендеримо нову сторінку — на всяк випадок закриваємо модалку/зупиняємо слайдшоу
      closeModal();
    }

    /* ---------------------------------------------------------
       ДОДАЄМО ОДНЕ ЗОБРАЖЕННЯ В ГАЛЕРЕЮ
       - item: { src, caption }
       - gallery: контейнер-сітка
       - idx: позиція в масиві
       - category: назва категорії (для alt/описів)
       --------------------------------------------------------- */
    function addImageToGallery(item, gallery, idx, category) {
      const img = document.createElement('img');          // створюємо зображення
      img.src = item.src;                                 // шлях до файлу
      img.alt = item.caption || `Фото ${idx + 1} з категорії "${category}"`; // доступний опис
      img.loading = 'lazy';                                // ліниве завантаження для продуктивності
      img.decoding = 'async';                              // асинхронне декодування для швидшого рендера
      img.setAttribute('aria-label', `Відкрити фото ${idx + 1} з категорії ${category}`); // явне aria-label
      img.onclick = () => openImageModal(idx);             // клік — відкриваємо модалку з фото
      gallery.appendChild(img);                            // додаємо в DOM
    }

    /* ---------------------------------------------------------
       ВІДКРИТТЯ МОДАЛКИ З ФОТО
       - запам’ятовуємо фокус, блокуємо прокрутку body, ховаємо фонові області від скрінрідера
       - вмикаємо «режим фото», виставляємо поточний індекс і оновлюємо вміст
       --------------------------------------------------------- */
    function openImageModal(index) {
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page?.photos) return;              // захист на випадок відсутності фото
      isVideoMode = false;                    // позначаємо, що зараз фото-режим
      currentIndex = index;                   // зберігаємо індекс поточного фото

      lastFocusedElement = document.activeElement; // запам’ятовуємо, що було у фокусі
      document.body.style.overflow = 'hidden';     // блокуємо прокрутку фону під модалкою

      // Ховаємо фон від скрінрідерів, поки відкрита модалка
      header.setAttribute('aria-hidden', 'true');
      content.setAttribute('aria-hidden', 'true');
      footer.setAttribute('aria-hidden', 'true');

      // Перемикаємо видимість елементів модалки (показуємо IMG, ховаємо VIDEO)
      modalImg.style.display = '';
      modalVideo.style.display = 'none';
      document.getElementById('slideshowStatus').textContent = '▶️ Слайдшоу'; // скидаємо текст, на випадок якщо було відео

      modal.style.display = 'flex';   // показуємо саму модалку
      updateModalImage();             // відмальовуємо фото/лічильник/підпис

      // Ставимо фокус усередину модалки (на кнопку «Закрити»), щоб клавіатура працювала «в модалці»
      closeBtn.focus();
    }

    /* ---------------------------------------------------------
       ВІДКРИТТЯ МОДАЛКИ З ВІДЕО
       - показуємо iframe у модалці, ховаємо картинку
       - відключаємо елементи, неактуальні для відео (лічильник/навігацію фото)
       --------------------------------------------------------- */
    function openVideoModal(url, captionText = 'Відео') {
      isVideoMode = true;                        // позначаємо режим відео
      lastFocusedElement = document.activeElement; // зберігаємо фокус
      document.body.style.overflow = 'hidden';     // блокуємо прокрутку

      // Ховаємо фон від скрінрідера
      header.setAttribute('aria-hidden', 'true');
      content.setAttribute('aria-hidden', 'true');
      footer.setAttribute('aria-hidden', 'true');

      // Готуємо модалку до показу відео
      modalImg.style.display = 'none';            // ховаємо зображення
      modalVideo.style.display = '';              // показуємо відео
      modalVideo.src = url;                       // підставляємо URL
      modalCaption.textContent = captionText;     // підпис під відео
      photoCounter.textContent = '';              // лічильник фото неактуальний

      // Зупиняємо слайдшоу, якщо працювало
      stopSlideshow();

      // Показуємо модалку і фокус
      modal.style.display = 'flex';
      closeBtn.focus();
    }

    /* ---------------------------------------------------------
       ЗАКРИТТЯ МОДАЛКИ
       - повертаємо прокрутку body, знімаємо aria-hidden із фонових секцій
       - зупиняємо слайдшоу, очищуємо джерела, повертаємо фокус
       --------------------------------------------------------- */
    function closeModal() {
      modal.style.display = 'none';               // ховаємо модалку
      modalImg.src = '';                          // очищуємо джерело зображення (звільняємо пам’ять)
      modalVideo.src = '';                        // зупиняємо відео (очищення src зупиняє відтворення)
      stopSlideshow();                            // на всяк випадок припиняємо слайдшоу
      document.body.style.overflow = '';          // повертаємо прокрутку

      // Повертаємо доступність фону для скрінрідерів
      header.removeAttribute('aria-hidden');
      content.removeAttribute('aria-hidden');
      footer.removeAttribute('aria-hidden');

      // Повертаємо фокус на той елемент, що був активний до відкриття модалки
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
      isVideoMode = false;                        // скидаємо режим відео
    }

    /* ---------------------------------------------------------
       ОНОВЛЕННЯ ВМІСТУ МОДАЛКИ ДЛЯ ПОТОЧНОГО ФОТО
       - підставляємо src/alt, рахуємо лічильник, показуємо підпис
       --------------------------------------------------------- */
    function updateModalImage() {
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page?.photos) return; // якщо нема фото — виходимо

      // Нормалізуємо поточне фото і встановлюємо дані
      const fallbackCaption = `Фото ${currentIndex + 1} — ${page.name}`;
      const { src, caption } = normalizePhoto(page.photos[currentIndex], fallbackCaption);

      modalImg.src = src;                            // показуємо фото
      modalImg.alt = caption;                        // альтернативний текст (доступність)
      modalCaption.textContent = caption;            // підпис під фото
      photoCounter.textContent = `Фото ${currentIndex + 1} з ${page.photos.length}`; // X з Y
    }

    /* ---------------------------------------------------------
       НАВІГАЦІЯ ПО ФОТО (НАЗАД)
       - зупиняємо слайдшоу під час ручної навігації
       --------------------------------------------------------- */
    function prevImage(event) {
      if (event) event.stopPropagation();            // не «пробиваємо» клік у бекдроп
      if (isVideoMode) return;                       // у відео-режимі кнопка неактуальна
      stopSlideshow();                               // зупиняємо слайдшоу
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page?.photos) return;
      currentIndex = (currentIndex - 1 + page.photos.length) % page.photos.length; // циклічна навігація
      updateModalImage();                            // оновлюємо вміст
    }

    /* ---------------------------------------------------------
       НАВІГАЦІЯ ПО ФОТО (ВПЕРЕД)
       --------------------------------------------------------- */
    function nextImage(event) {
      if (event) event.stopPropagation();
      if (isVideoMode) return;
      stopSlideshow();
      const page = PAGES.find(p => p.id === currentPageId);
      if (!page?.photos) return;
      currentIndex = (currentIndex + 1) % page.photos.length;
      updateModalImage();
    }

    /* ---------------------------------------------------------
       ПЕРЕМИКАЧ СЛАЙДШОУ (Старт/Пауза)
       --------------------------------------------------------- */
    function toggleSlideshow() {
      if (isVideoMode) return; // не запускаємо слайдшоу у відео
      if (slideshowInterval) {
        stopSlideshow();       // якщо працює — зупиняємо
      } else {
        startSlideshow();      // якщо зупинене — запускаємо
      }
    }

    /* ---------------------------------------------------------
       СТАРТ СЛАЙДШОУ
       - через setInterval гортаємо фото з обраною швидкістю
       --------------------------------------------------------- */
    function startSlideshow() {
      document.getElementById('slideshowStatus').textContent = '⏸ Пауза'; // оновлюємо текст кнопки
      slideshowInterval = setInterval(() => {
        const page = PAGES.find(p => p.id === currentPageId);
        if (page?.photos) {
          currentIndex = (currentIndex + 1) % page.photos.length; // переходимо до наступного фото
          updateModalImage();                                      // оновлюємо вміст
        }
      }, slideshowSpeed);
    }

    /* ---------------------------------------------------------
       ЗУПИНКА СЛАЙДШОУ
       --------------------------------------------------------- */
    function stopSlideshow() {
      document.getElementById('slideshowStatus').textContent = '▶️ Слайдшоу'; // повертаємо текст кнопки
      clearInterval(slideshowInterval);    // зупиняємо інтервал
      slideshowInterval = null;            // скидаємо стан
    }

    /* ---------------------------------------------------------
       ЗМІНА ШВИДКОСТІ СЛАЙДШОУ
       - читаємо значення з <select>, перезапускаємо якщо потрібно
       --------------------------------------------------------- */
    function changeSlideshowSpeed() {
      slideshowSpeed = parseInt(speedSelect.value, 10); // конвертуємо рядок у число
      if (slideshowInterval) {
        stopSlideshow(); // перезапускаємо з новою швидкістю
        startSlideshow();
      }
    }

    /* ---------------------------------------------------------
       КЕРУВАННЯ ЖЕСТАМИ SWIPE ДЛЯ МОБІЛЬНОЇ МОДАЛКИ
       - визначаємо напрямок свайпа і гортаймо фото
       --------------------------------------------------------- */
    let touchStartX = 0;
    let touchEndX = 0;
    modal.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
    modal.addEventListener('touchend',   e => { touchEndX   = e.changedTouches[0].screenX; handleGesture(); });
    function handleGesture() {
      if (isVideoMode) return; // свайпи неактуальні для відео
      if (touchEndX < touchStartX - 50) nextImage(); // свайп ліворуч -> наступне
      if (touchEndX > touchStartX + 50) prevImage(); // свайп праворуч -> попереднє
    }

    /* ---------------------------------------------------------
       КЛАВІАТУРНА НАВІГАЦІЯ:
       - стрілки ←/→ гортають фото
       - Esc закриває модалку
       - Tab-trap: фокус «ходить» по елементах модалки, не виходячи назовні
       --------------------------------------------------------- */
    document.addEventListener('keydown', (e) => {
      if (modal.style.display === 'flex') {
        if (!isVideoMode) {
          if (e.key === 'ArrowLeft') prevImage();
          if (e.key === 'ArrowRight') nextImage();
        }
        if (e.key === 'Escape') closeModal();

        // Реалізація фокус-трапу (щоб Tab не «втікав» з модалки)
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

    /* ---------------------------------------------------------
       ЛІЧИЛЬНИК УНІКАЛЬНИХ ВІДВІДУВАЧІВ
       - використовуємо CountAPI-сумісну точку
       - робимо безпечний доступ до localStorage (можливі винятки)
       - додаємо fallback '—' замість '0', якщо нічого не вдалося отримати
       --------------------------------------------------------- */
    const VISITED_KEY = 'class_visited_v2';                 // ключ, що позначає, чи вже заходив користувач
    const COUNTER_KEY = 'k-vova-class_visitors1987';        // унікальний ключ лічильника
    const API = 'https://countapi.mileshilliard.com/api/v1';// базовий URL API

    // Безпечне читання з localStorage
    function safeGetLocal(key) { try { return localStorage.getItem(key); } catch { return null; } }
    // Безпечний запис у localStorage
    function safeSetLocal(key, val) { try { localStorage.setItem(key, val); } catch {} }

    // Оновлення значення лічильника на сторінці
    async function updateUniqueCounter() {
      const out = document.getElementById('uniqueCount');     // елемент, де показується число
      const visited = safeGetLocal(VISITED_KEY) === '1';      // чи вже рахували цього користувача
      let shown = false;                                      // прапорець — чи показали якесь коректне число

      try {
        // 1) Прагнемо дізнатись поточне значення лічильника
        const resGet = await fetch(`${API}/get/${encodeURIComponent(COUNTER_KEY)}`, { cache: 'no-store', mode: 'cors' });
        if (resGet.ok) {
          const dataGet = await resGet.json();
          const n = Number(dataGet?.value);
          if (Number.isFinite(n)) { out.textContent = n; shown = true; }
        }

        // 2) Якщо користувач ще не врахований — інкрементуємо лічильник і оновлюємо показ
        if (!visited) {
          const resHit = await fetch(`${API}/hit/${encodeURIComponent(COUNTER_KEY)}`, { cache: 'no-store', mode: 'cors' });
          if (resHit.ok) {
            const dataHit = await resHit.json();
            const n2 = Number(dataHit?.value);
            if (Number.isFinite(n2)) { out.textContent = n2; shown = true; }
            safeSetLocal(VISITED_KEY, '1'); // позначаємо, що користувач уже порахований
          }
        }
      } catch (_) {
        // У разі будь-якої помилки просто переходимо до fallback
      }

      // Fallback — якщо нічого не вдалося показати, замість «0» відобразимо «—»
      if (!shown) out.textContent = '—';
    }

    /* ---------------------------------------------------------
       ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ ДОКУМЕНТА
       - рендеримо першу сторінку
       - оновлюємо лічильник унікальних відвідувачів
       --------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', () => {
      renderPage(PAGES[0].id);  // за замовчуванням відкриваємо першу сторінку («Дитячий садочок»)
      updateUniqueCounter();    // запускаємо оновлення лічильника
    });