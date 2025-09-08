const PAGES = [
  {
    id: "kindergarten",
    name: "Дитячий садочок",
    photos: Array.from(
      { length: 11 },
      (_, i) => `img/Дитячий садочок/${i + 1}.jpg`
    ),
  },
  {
    id: "school-days",
    name: "Шкільні будні",
    photos: Array.from(
      { length: 42 },
      (_, i) => `img/Шкільні будні/${i + 1}.jpg`
    ),
  },
  {
    id: "group-photos",
    name: "Колективні фото",
    photos: Array.from(
      { length: 11 },
      (_, i) => `img/Колективні фото/${i + 1}.jpg`
    ),
  },
  {
    id: "excursions",
    name: "Екскурсії",
    photos: Array.from({ length: 22 }, (_, i) => `img/Екскурсії/${i + 1}.jpg`),
  },
  {
    id: "meet97-07",
    name: "Зустріч 1997-2007р",
    photos: Array.from(
      { length: 32 },
      (_, i) => `img/Зустріч 1997-2007р/${i + 1}.jpg`
    ),
  },
  {
    id: "meet2017",
    name: "Зустріч 2017р",
    photos: Array.from(
      { length: 22 },
      (_, i) => `img/Зустріч 2017р/${i + 1}.jpg`
    ),
  },
  {
    id: "meet2022-25",
    name: "Зустріч 2022-2025р",
    photos: Array.from(
      { length: 12 },
      (_, i) => `img/Зустріч 2022-2025р/${i + 1}.jpg`
    ),
  },
  {
    id: "video",
    name: "Відео",
    videoUrl: "https://www.youtube.com/embed/9uBKizur3ZM",
  },
];

const menu = document.getElementById("menu"),
  content = document.getElementById("content"),
  modal = document.getElementById("modal"),
  modalContent = modal.querySelector(".modal-content"),
  modalImg = document.getElementById("modalImg"),
  modalVideo = document.getElementById("modalVideo"),
  modalCaption = document.getElementById("modalCaption"),
  speedSelect = document.getElementById("slideshowSpeed"),
  photoCounter = document.getElementById("photoCounter"),
  closeBtn = document.getElementById("closeBtn"),
  header = document.querySelector("header"),
  footer = document.querySelector("footer"),
  audio = document.getElementById("slideshowAudio"),
  musicBtn = document.getElementById("toggleMusic");

let currentPageId = null,
  currentIndex = 0,
  slideshowInterval = null,
  slideshowSpeed = 5000,
  lastFocusedElement = null,
  isVideoMode = false,
  musicPlaying = false;

// Нормалізація фото
function normalizePhoto(item, fallbackCaption) {
  return typeof item === "string"
    ? {
        src: item,
        caption: fallbackCaption,
      }
    : { src: item.src, caption: item.caption || fallbackCaption };
}

// Меню
function renderMenu(activeId) {
  menu.innerHTML = "";
  PAGES.forEach((page) => {
    const btn = document.createElement("button");
    btn.textContent = page.name;
    btn.setAttribute("aria-pressed", page.id === activeId ? "true" : "false");
    btn.setAttribute("aria-controls", `page-${page.id}`);
    btn.onclick = () => showPage(page.id);
    menu.appendChild(btn);
  });
}

// Показ сторінки
function showPage(pageId) {
  currentPageId = pageId;
  renderMenu(pageId);
  content.innerHTML = "";
  const page = PAGES.find((p) => p.id === pageId);
  if (!page) return;
  const pageDiv = document.createElement("div");
  pageDiv.className = "page active";
  pageDiv.id = `page-${pageId}`;
  if (page.photos) {
    const gallery = document.createElement("div");
    gallery.className = "gallery";
    page.photos.forEach((photo, index) => {
      const { src, caption } = normalizePhoto(photo, `Фото ${index + 1}`);
      const img = document.createElement("img");
      img.src = src;
      img.alt = caption;
      img.loading = "lazy";
      img.decoding = "async";
      img.onclick = () => openModal(src, caption, index, page.photos);
      img.tabIndex = 0;
      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(src, caption, index, page.photos);
        }
      });
      gallery.appendChild(img);
    });
    pageDiv.appendChild(gallery);
  } else if (page.videoUrl) {
    const videoDiv = document.createElement("div");
    videoDiv.className = "video-container";
    const iframe = document.createElement("iframe");
    iframe.src = page.videoUrl;
    iframe.title = page.name;
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    );
    videoDiv.appendChild(iframe);
    pageDiv.appendChild(videoDiv);
  }
  content.appendChild(pageDiv);
}

// Модальне вікно
function openModal(src, caption, index, photos) {
  lastFocusedElement = document.activeElement;
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page) return;
  if (page.videoUrl) {
    modalImg.style.display = "none";
    modalVideo.style.display = "block";
    modalVideo.src = page.videoUrl;
    modalCaption.textContent = "";
    photoCounter.textContent = "";
    isVideoMode = true;
  } else {
    modalImg.style.display = "block";
    modalVideo.style.display = "none";
    currentIndex = index;
    modalImg.src = src;
    modalImg.alt = caption;
    modalCaption.textContent = caption;
    photoCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
    modalContent.classList.add("visible");
    isVideoMode = false;
  }
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  closeBtn.focus();
  header.inert = true;
  footer.inert = true;
  content.inert = true;
  menu.inert = true;
}

// Закрити модалку
function closeModal() {
  modal.style.display = "none";
  stopSlideshow();
  audio.pause();
  musicPlaying = false;
  musicBtn.textContent = "🎵 Музика";
  modalImg.src = "";
  modalVideo.src = "";
  document.body.style.overflow = "";
  header.inert = false;
  footer.inert = false;
  content.inert = false;
  menu.inert = false;
  if (lastFocusedElement) lastFocusedElement.focus();
}

// Перехід фото
function prevImage() {
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page || !page.photos || isVideoMode) return;
  fadeImage(
    (currentIndex =
      (currentIndex - 1 + page.photos.length) % page.photos.length)
  );
}
function nextImage() {
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page || !page.photos || isVideoMode) return;
  currentIndex++;
  if (currentIndex >= page.photos.length) {
    advanceToNextAlbum();
    return;
  }
  fadeImage(currentIndex);
}

// Плавне затемнення
function fadeImage(index) {
  const page = PAGES.find((p) => p.id === currentPageId);
  const { src, caption } = normalizePhoto(
    page.photos[index],
    `Фото ${index + 1}`
  );
  modalImg.style.opacity = 0;
  setTimeout(() => {
    modalImg.src = src;
    modalImg.alt = caption;
    modalCaption.textContent = caption;
    photoCounter.textContent = `${index + 1} / ${page.photos.length}`;
    modalImg.style.opacity = 1;
  }, 300);
}

// Автоперехід між альбомами
function advanceToNextAlbum() {
  let currentAlbumIndex = PAGES.findIndex((p) => p.id === currentPageId);
  do {
    currentAlbumIndex = (currentAlbumIndex + 1) % PAGES.length;
  } while (!PAGES[currentAlbumIndex].photos);
  showPage(PAGES[currentAlbumIndex].id);
  currentIndex = 0;
  fadeImage(currentIndex);
}

// Слайдшоу
function toggleSlideshow() {
  if (slideshowInterval) {
    stopSlideshow();
  } else {
    startSlideshow();
  }
}
function startSlideshow() {
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page || !page.photos || isVideoMode) return;
  document.getElementById("slideshowStatus").textContent = "⏸ Зупинити";
  slideshowInterval = setInterval(nextImage, slideshowSpeed);
  if (!musicPlaying) {
    audio.play().catch(() => {});
    musicPlaying = true;
    musicBtn.textContent = "🔇 Вимкнути музику";
  }
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

// Клавіатура
document.addEventListener("keydown", (e) => {
  if (modal.style.display === "flex") {
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "ArrowLeft") {
      prevImage();
    } else if (e.key === "ArrowRight") {
      nextImage();
    }
  }
});

// Свайпи для мобільних
let touchStartX = 0,
  touchEndX = 0;
modalContent.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});
modalContent.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  let diff = touchEndX - touchStartX;
  if (diff > 50) {
    prevImage();
  } else if (diff < -50) {
    nextImage();
  }
});

// Музика
audio.addEventListener("ended", () => {
  if (slideshowInterval) {
    audio.currentTime = 0;
    audio.play();
  }
});
musicBtn.addEventListener("click", () => {
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
    musicBtn.textContent = "🎵 Музика";
  } else {
    audio.play().catch(() => {});
    musicPlaying = true;
    musicBtn.textContent = "🔇 Вимкнути музику";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  showPage(PAGES[0].id);
});

/* ---------------- ДОДАНИЙ СКРИПТ ДЛЯ ЛІЧИЛЬНИКА РОКІВ ----------------
   Лічильник показує, скільки повних років пройшло від дати випуску.
   Вважатимемо рік випуску: 1987. Для точності — якщо потрібна
   конкретна дата випуску (день/місяць), її можна змінити в змінній
   graduationDate.
-------------------------------------------------------------------- */
(function () {
  const graduationYear = 1987; // рік випуску
  // Якщо хочете конкретну дату випуску (день, місяць) — змініть тут:
  // формат: new Date(рік, місяцьIndex(0-11), день)
  // наприклад, 30 червня 1987 => new Date(1987, 5, 30)
  const graduationDate = new Date(graduationYear, 5, 30); // 30 червня 1987 (можна змінити)

  const yearsNumberEl = document.getElementById("yearsNumber");
  const yearsCounterEl = document.getElementById("yearsCounter");
  const yearsSuffixEl = document.getElementById("yearsSuffix");

  function computeFullYearsSince(date) {
    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();
    // якщо ще не пройшов день/місяць у цьому році — віднімемо 1
    const anniversaryThisYear = new Date(
      now.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    if (now < anniversaryThisYear) years--;
    return years >= 0 ? years : 0;
  }

  // Анімація від 0 до target за duration мс
  function animateNumber(target, duration = 1400) {
    const start = 0;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easing (easeOutCubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);
      yearsNumberEl.textContent = current;
      // при великих змінах даємо коротку пульсацію
      if (progress < 1 && progress > 0.6) {
        yearsNumberEl.classList.add("animate");
      } else {
        yearsNumberEl.classList.remove("animate");
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // фінальна пульсація
        yearsNumberEl.classList.add("animate");
        setTimeout(() => yearsNumberEl.classList.remove("animate"), 350);
        // оновлюємо aria-label для скрінрідерів
        yearsCounterEl.setAttribute(
          "aria-label",
          `Від випуску пройшло ${target} років`
        );
      }
    }
    requestAnimationFrame(step);
  }

  // Ініціалізація лічильника під час завантаження сторінки
  function initYearsCounter() {
    const years = computeFullYearsSince(graduationDate);
    // коректний суфікс для української мови
    const suffix = getUkrainianYearSuffix(years);
    yearsSuffixEl.textContent = suffix;
    animateNumber(years, 1400);
    // одноразове коротке оновлення щосекунди — якщо перехід через опівдні
    setInterval(() => {
      const newYears = computeFullYearsSince(graduationDate);
      if (parseInt(yearsNumberEl.textContent, 10) !== newYears) {
        yearsSuffixEl.textContent = getUkrainianYearSuffix(newYears);
        animateNumber(newYears, 900);
      }
    }, 60 * 1000); // перевірка щохвилини
  }

  function getUkrainianYearSuffix(n) {
    // Повертає правильний суфікс: "рік", "роки", "років"
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return "років";
    if (n1 > 1 && n1 < 5) return "роки";
    if (n1 === 1) return "рік";
    return "років";
  }

  // Запускаємо після DOMContentLoaded (вже є слушач, додаємо свій)
  document.addEventListener("DOMContentLoaded", initYearsCounter);
})();
/* ---------------- /лічильник років ---------------- */

const COUNTER_KEY = "k-vova-class_visitors1987"; // унікальний ключ лічильника
const API = "https://countapi.mileshilliard.com/api/v1"; // сервіс підрахунку

async function updateVisitCounter() {
  const out = document.getElementById("uniqueCount"); // місце для цифри
  let shown = false;

  try {
    // Кожен раз при заході збільшуємо лічильник (HIT)
    const resHit = await fetch(`${API}/hit/${encodeURIComponent(COUNTER_KEY)}`, {
      cache: "no-store",
      mode: "cors"
    });
    if (resHit.ok) {
      const dataHit = await resHit.json();
      const n = Number(dataHit?.value);
      if (Number.isFinite(n)) {
        out.textContent = n; // показати нове число
        shown = true;
      }
    }
  } catch (_) { }

  // Якщо нічого не вдалось отримати → показати дефіс
  if (!shown) out.textContent = "—";
}

// запуск після завантаження сторінки
document.addEventListener("DOMContentLoaded", () => {
  updateVisitCounter();
});

