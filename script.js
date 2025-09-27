const PAGES = [
  {
    id: "kindergarten",
    name: "Дитячий садочок",
    photos: Array.from(
      { length: 11 },
      (_, i) => `img/Дитячий садочок/${i + 1}.webp`
    ),
  },
  {
    id: "school-days",
    name: "Шкільні будні",
    photos: Array.from(
      { length: 42 },
      (_, i) => `img/Шкільні будні/${i + 1}.webp`
    ),
  },
  {
    id: "group-photos",
    name: "Колективні фото",
    photos: Array.from(
      { length: 12 },
      (_, i) => `img/Колективні фото/${i + 1}.webp`
    ),
  },
  {
    id: "excursions",
    name: "Екскурсії",
    photos: Array.from(
      { length: 27 },
      (_, i) => `img/Екскурсії/${i + 1}.webp`
    ),
  },
  {
    id: "After-schoolmeetings",
    name: "Зустрічі після школи",
    photos: Array.from(
      { length: 6 },
      (_, i) => `img/Зустрічі після школи/${i + 1}.webp`
    ),
  },
  {
    id: "meet97-07",
    name: "Зустріч 1997-2007р",
    photos: Array.from(
      { length: 35 },
      (_, i) => `img/Зустріч 1997-2007р/${i + 1}.webp`
    ),
  },
  {
    id: "meet2017",
    name: "Зустріч 2017р",
    photos: Array.from(
      { length: 22 },
      (_, i) => `img/Зустріч 2017р/${i + 1}.webp`
    ),
  },
  {
    id: "meet2022-25",
    name: "Зустріч 2022-2025р",
    photos: Array.from(
      { length: 12 },
      (_, i) => `img/Зустріч 2022-2025р/${i + 1}.webp`
    ),
  },
  {
    id: "local-videos",
    name: "Відео",
    localVideos: [
      "video/clip1.mp4",
      "video/clip2.mp4",
      "video/clip3.mp4",
      "video/clip4.mp4",
    ],
  },
  // === НОВИЙ ОБ'ЄДНАНИЙ АЛЬБОМ ДЛЯ YOUTUBE ===
  {
    id: "youtube",
    name: "Відео YouTube",
    youtubeVideos: [
      {
        url: "https://www.youtube.com/embed/9uBKizur3ZM",
        name: "Спогади в 50 років",
      },
      {
        url: "https://www.youtube.com/embed/shRL41ZJUU4",
        name: "Благовіщенське 2019 рік",
      },
      {
        url: "https://www.youtube.com/embed/R2rqtN4cBSs",
        name: "Районні змагання легкоатлетів 1982 рік",
      }
      // Можете додати більше відео тут, скопіювавши блок вище
    ],
  },
];
const MUSIC_PLAYLIST = [
  { name: "Пісня 1", path: "audio/song1.mp3" },
  { name: "Пісня 2", path: "audio/song2.mp3" },
  { name: "Пісня 3", path: "audio/song3.mp3" },
  { name: "Пісня 4", path: "audio/song4.mp3" },
  { name: "Пісня 5", path: "audio/song5.mp3" },
];
const initialScreen = document.getElementById("initialScreen"),
  menuButton = document.getElementById("menuButton"),
  backButton = document.getElementById("backButton"),
  menu = document.getElementById("menu"),
  content = document.getElementById("content"),
  modal = document.getElementById("modal"),
  modalContent = modal.querySelector(".modal-content"),
  modalImg = document.getElementById("modalImg"),
  modalVideoWrapper = modal.querySelector(".modal-video-wrapper"),
  modalVideo = document.getElementById("modalVideo"),
  modalLocalVideo = document.getElementById("modalLocalVideo"),
  modalCaption = document.getElementById("modalCaption"),
  speedSelect = document.getElementById("slideshowSpeed"),
  photoCounter = document.getElementById("photoCounter"),
  closeBtn = document.getElementById("closeBtn"),
  header = document.querySelector("header"),
  footer = document.querySelector("footer"),
  audio = document.getElementById("slideshowAudio"),
  musicBtn = document.getElementById("toggleMusic"),
  musicIcon = musicBtn.querySelector(".music-icon"),
  musicSelector = document.getElementById("musicSelector"),
  keepAwakeVideo = document.getElementById("keepAwakeVideo");

let currentPageId = null,
  currentIndex = 0,
  slideshowInterval = null,
  slideshowSpeed = 5000,
  lastFocusedElement = null,
  isVideoMode = false,
  musicPlaying = false;
let wakeLock = null;
let isSlideshowRunning = false;
let iosKeepAwakeActive = false;
let iosKeepAwakeVisibilityHandler = null;
const isIOS = (() => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const isIpad =
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    /iPad/.test(ua);
  return /iPhone|iPad|iPod/.test(ua) || isIpad;
})();

function normalizePhoto(item, fallbackCaption) {
  return typeof item === "string"
    ? { src: item, caption: fallbackCaption }
    : { src: item.src, caption: item.caption || fallbackCaption };
}
function showInitialScreen() {
  initialScreen.classList.remove("hidden");
  content.classList.add("hidden");
  content.innerHTML = "";
  backButton.classList.add("hidden");

  menu.classList.add("hidden");
  menuButton.classList.remove("hidden");

  currentPageId = null;
  renderMenu(null);
  document.body.classList.add("ken-burns-active");
}

function showAlbumMenu() {
  window.scrollTo(0, 0);
  initialScreen.classList.remove("hidden");
  content.classList.add("hidden");
  content.innerHTML = "";
  backButton.classList.add("hidden");

  menu.classList.remove("hidden");
  menuButton.classList.add("hidden");

  currentPageId = null;
  renderMenu(null);
  document.body.classList.remove("ken-burns-active");
}

function renderMenu(activeId) {
  menu.innerHTML = "";
  PAGES.forEach((page) => {
    const btn = document.createElement("button");
    btn.textContent = page.name;
    btn.setAttribute(
      "aria-pressed",
      page.id === activeId ? "true" : "false"
    );
    btn.setAttribute("aria-controls", `page-${page.id}`);
    btn.onclick = () => showPage(page.id);
    menu.appendChild(btn);
  });
}

function showPage(pageId) {
  window.scrollTo(0, 0);
  initialScreen.classList.add("hidden");
  content.classList.remove("hidden");
  backButton.classList.remove("hidden");
  currentPageId = pageId;
  renderMenu(pageId);
  content.innerHTML = "";
  const page = PAGES.find((p) => p.id === pageId);
  if (!page) return;
  const pageDiv = document.createElement("div");
  pageDiv.className = "page";
  pageDiv.id = `page-${pageId}`;
  document.body.classList.remove("ken-burns-active");
  const title = document.createElement("h3");
  title.className = "album-title";
  title.textContent = page.name;
  pageDiv.appendChild(title);
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
  } else if (page.localVideos) {
    const gallery = document.createElement("div");
    gallery.className = "gallery";
    page.localVideos.forEach((videoPath, index) => {
      const vid = document.createElement("video");
      vid.src = videoPath;
      vid.setAttribute("preload", "metadata");
      vid.setAttribute("playsinline", "");
      vid.muted = true;
      vid.tabIndex = 0;
      vid.setAttribute("aria-label", `${page.name} — відео ${index + 1}`);
      vid.onclick = () =>
        openLocalVideoModal(
          videoPath,
          page.name,
          index,
          page.localVideos
        );
      vid.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLocalVideoModal(
            videoPath,
            page.name,
            index,
            page.localVideos
          );
        }
      });
      gallery.appendChild(vid);
    });
    pageDiv.appendChild(gallery);
  } else if (page.youtubeVideos) {
    // === НОВА ЛОГІКА ДЛЯ ГАЛЕРЕЇ YOUTUBE ===
    const gallery = document.createElement("div");
    gallery.className = "gallery";
    page.youtubeVideos.forEach((video) => {
      const videoId = video.url.split('/').pop().split('?').shift();
      if (!videoId) return;

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      const img = document.createElement("img");
      img.src = thumbnailUrl;
      img.alt = video.name;
      img.loading = "lazy";
      img.decoding = "async";
      img.onclick = () => openYouTubeModal(video.url, video.name);
      img.tabIndex = 0;
      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openYouTubeModal(video.url, video.name);
        }
      });
      gallery.appendChild(img);
    });
    pageDiv.appendChild(gallery);
  }
  content.appendChild(pageDiv);
}


function openYouTubeModal(url, name) {
  lastFocusedElement = document.activeElement;
  modalImg.style.display = "none";
  modalLocalVideo.style.display = "none";
  modalVideoWrapper.style.display = "block";
  modalVideo.src = url;
  modalCaption.textContent = name;
  photoCounter.textContent = "";
  isVideoMode = true;
  setPhotoControlVisibility(false);
  modal.style.display = "flex";
  modalContent.classList.add("visible");
  document.body.style.overflow = "hidden";
  closeBtn.focus();
  header.inert = true;
  footer.inert = true;
  content.inert = true;
  initialScreen.inert = true;
}

function setPhotoControlVisibility(visible) {
  const els = document.querySelectorAll(".photo-only");
  els.forEach((el) => {
    el.style.display = visible ? "" : "none";
  });
}

function openModal(src, caption, index, photos) {
  lastFocusedElement = document.activeElement;
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page) return;

  modalImg.style.display = "block";
  modalVideoWrapper.style.display = "none";
  if (modalLocalVideo) {
    modalLocalVideo.style.display = "none";
    try {
      modalLocalVideo.pause();
    } catch (e) { }
    modalLocalVideo.src = "";
  }
  currentIndex = index;
  modalImg.src = src;
  modalImg.alt = caption;
  modalCaption.textContent = page.name;
  photoCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
  modalContent.classList.add("visible");
  isVideoMode = false;
  setPhotoControlVisibility(true);

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  closeBtn.focus();
  header.inert = true;
  footer.inert = true;
  content.inert = true;
  initialScreen.inert = true;
}

function openLocalVideoModal(src, caption, index, videos) {
  lastFocusedElement = document.activeElement;
  modalImg.style.display = "none";
  modalVideoWrapper.style.display = "none";
  modalLocalVideo.style.display = "block";
  currentIndex = index;
  modalLocalVideo.src = src;
  modalCaption.textContent = caption;
  photoCounter.textContent = `Відео ${currentIndex + 1} / ${videos.length
    }`;
  modal.style.display = "flex";
  modalContent.classList.add("visible");
  document.body.style.overflow = "hidden";
  header.inert = true;
  footer.inert = true;
  content.inert = true;
  initialScreen.inert = true;
  isVideoMode = true;
  setPhotoControlVisibility(false);
  modalLocalVideo
    .play()
    .catch((e) => console.error("Video play failed:", e));
  closeBtn.focus();
}

function closeModal() {
  modal.style.display = "none";
  document.body.style.overflow = "";
  modalContent.classList.remove("visible");
  header.inert = false;
  footer.inert = false;
  content.inert = false;
  initialScreen.inert = false;
  if (slideshowInterval) stopSlideshow();
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
    musicIcon.textContent = "🔊";
  }
  releaseWakeLock();
  modalVideo.src = "";
  try {
    modalLocalVideo.pause();
  } catch (e) { }
  modalLocalVideo.src = "";
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
  resetTransform();
}

function prevVideo() {
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page || !page.localVideos) return;
  currentIndex =
    (currentIndex - 1 + page.localVideos.length) %
    page.localVideos.length;
  updateLocalVideo();
}

function nextVideo() {
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page || !page.localVideos) return;
  currentIndex = (currentIndex + 1) % page.localVideos.length;
  updateLocalVideo();
}

function updateLocalVideo() {
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page || !page.localVideos) return;
  const newSrc = page.localVideos[currentIndex];
  modalLocalVideo.src = newSrc;
  photoCounter.textContent = `Відео ${currentIndex + 1} / ${page.localVideos.length
    }`;
  modalLocalVideo
    .play()
    .catch((e) => console.error("Video play failed:", e));
}

function prevImage() {
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page || !page.photos || isVideoMode) return;
  currentIndex =
    (currentIndex - 1 + page.photos.length) % page.photos.length;
  fadeImage(currentIndex);
  resetTransform();
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
  resetTransform();
}
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
    modalCaption.textContent = page.name;
    photoCounter.textContent = `${index + 1} / ${page.photos.length}`;
    modalImg.style.opacity = 1;
  }, 300);
}
function advanceToNextAlbum() {
  let currentAlbumIndex = PAGES.findIndex((p) => p.id === currentPageId);
  let nextIndex = (currentAlbumIndex + 1) % PAGES.length;
  let iterations = 0;
  while (
    (!PAGES[nextIndex].photos || PAGES[nextIndex].photos.length === 0) &&
    iterations < PAGES.length
  ) {
    nextIndex = (nextIndex + 1) % PAGES.length;
    iterations++;
  }
  const nextPage = PAGES[nextIndex];
  if (nextPage.photos && nextPage.photos.length > 0) {
    showPage(nextPage.id);
    currentIndex = 0;
    openModal(
      normalizePhoto(nextPage.photos[currentIndex], `Фото 1`).src,
      normalizePhoto(nextPage.photos[currentIndex], `Фото 1`).caption,
      currentIndex,
      nextPage.photos
    );
    isVideoMode = false;
  }
}
function toggleSlideshow() {
  if (slideshowInterval) stopSlideshow();
  else startSlideshow();
}
function startSlideshow() {
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page || !page.photos || isVideoMode) return;
  document.getElementById("slideshowStatus").textContent = "⏸ Зупинити";
  slideshowInterval = setInterval(() => {
    nextImage();
  }, slideshowSpeed);
  isSlideshowRunning = true;
  if (!musicPlaying) {
    audio.play().catch(() => { });
    musicPlaying = true;
    musicIcon.textContent = "🔇";
  }
  requestWakeLockOrFallback();
}
function stopSlideshow() {
  document.getElementById("slideshowStatus").textContent = "▶️ Слайдшоу";
  clearInterval(slideshowInterval);
  slideshowInterval = null;
  isSlideshowRunning = false;
  releaseWakeLock();
}
function changeSlideshowSpeed() {
  slideshowSpeed = parseInt(speedSelect.value, 10);
  if (slideshowInterval) {
    stopSlideshow();
    startSlideshow();
  }
}

document.addEventListener("keydown", (e) => {
  if (modal.style.display === "flex") {
    if (e.key === "Escape") closeModal();
    else if (e.key === "ArrowLeft" && !isZoomed) {
      const page = PAGES.find((p) => p.id === currentPageId);
      if (page && page.localVideos) prevVideo();
      else if (page && page.photos) prevImage();
    } else if (e.key === "ArrowRight" && !isZoomed) {
      const page = PAGES.find((p) => p.id === currentPageId);
      if (page && page.localVideos) nextVideo();
      else if (page && page.photos) nextImage();
    }
  }
});

let startTouchX = 0,
  startTouchY = 0;
let lastTouchX = 0,
  lastTouchY = 0;
let pinchStartDistance = 0;
let scale = 1;
let lastScale = 1;
let translateX = 0;
let translateY = 0;
let lastTranslateX = 0;
let lastTranslateY = 0;
let isZoomed = false;
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_BLOCK_THRESHOLD = 1.05;
const SWIPE_THRESHOLD = 50;
let isPanning = false;
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
function applyTransform() {
  modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}
function resetTransform() {
  scale = 1;
  lastScale = 1;
  translateX = 0;
  translateY = 0;
  lastTranslateX = 0;
  lastTranslateY = 0;
  isZoomed = false;
  modalImg.style.transition = "transform 180ms ease";
  applyTransform();
  setTimeout(() => {
    modalImg.style.transition = "";
  }, 200);
}
modalContent.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length === 2) {
      pinchStartDistance = getDistance(e.touches);
      lastScale = scale;
    } else if (e.touches.length === 1) {
      startTouchX = e.touches[0].clientX;
      startTouchY = e.touches[0].clientY;
      lastTouchX = startTouchX;
      lastTouchY = startTouchY;
      isPanning = false;
    }
  },
  { passive: true }
);
modalContent.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getDistance(e.touches);
      if (pinchStartDistance > 0) {
        let newScale = (dist / pinchStartDistance) * lastScale;
        newScale = clamp(newScale, MIN_SCALE, MAX_SCALE);
        scale = newScale;
        isZoomed = scale > ZOOM_BLOCK_THRESHOLD;
        applyTransform();
      }
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - lastTouchX;
      const dy = t.clientY - lastTouchY;
      lastTouchX = t.clientX;
      lastTouchY = t.clientY;
      if (isZoomed) {
        e.preventDefault();
        isPanning = true;
        translateX = lastTranslateX + (t.clientX - startTouchX);
        translateY = lastTranslateY + (t.clientY - startTouchY);
        const limit = 2000;
        translateX = clamp(translateX, -limit, limit);
        translateY = clamp(translateY, -limit, limit);
        applyTransform();
      }
    }
  },
  { passive: false }
);

modalContent.addEventListener(
  "touchend",
  (e) => {
    if (e.touches.length === 0) {
      if (pinchStartDistance !== 0) {
        if (scale <= ZOOM_BLOCK_THRESHOLD) {
          resetTransform();
        } else {
          lastScale = scale;
          lastTranslateX = translateX;
          lastTranslateY = translateY;
          modalImg.style.transition = "transform 120ms ease";
          applyTransform();
          setTimeout(() => {
            modalImg.style.transition = "";
          }, 150);
          isZoomed = true;
        }
        pinchStartDistance = 0;
        return;
      }
      if (isPanning) {
        lastTranslateX = translateX;
        lastTranslateY = translateY;
        isPanning = false;
        return;
      }
      if (!isZoomed) {
        const changed = e.changedTouches[0];
        const endX = changed.clientX;
        const endY = changed.clientY;
        const diffX = endX - startTouchX;
        const diffY = endY - startTouchY;
        if (
          Math.abs(diffX) > SWIPE_THRESHOLD &&
          Math.abs(diffX) > Math.abs(diffY)
        ) {
          const page = PAGES.find((p) => p.id === currentPageId);
          if (diffX > 0) {
            if (page && page.localVideos) prevVideo();
            else if (page && page.photos) prevImage();
          } else {
            if (page && page.localVideos) nextVideo();
            else if (page && page.photos) nextImage();
          }
        }
      }
    } else if (e.touches.length === 1) {
      startTouchX = e.touches[0].clientX;
      startTouchY = e.touches[0].clientY;
      lastTouchX = startTouchX;
      lastTouchY = startTouchY;
    }
  },
  { passive: false }
);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
audio.addEventListener("ended", () => {
  if (slideshowInterval && musicPlaying) {
    const currentTrackIndex = musicSelector.selectedIndex;
    const nextTrackIndex =
      (currentTrackIndex + 1) % MUSIC_PLAYLIST.length;
    musicSelector.selectedIndex = nextTrackIndex;
    changeTrack();
  }
});
musicBtn.addEventListener("click", () => {
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
    musicIcon.textContent = "🔊";
  } else {
    audio.play().catch(() => { });
    musicPlaying = true;
    musicIcon.textContent = "🔇";
  }
});
function populateMusicSelector() {
  if (!musicSelector) return;
  MUSIC_PLAYLIST.forEach((track) => {
    const option = document.createElement("option");
    option.value = track.path;
    option.textContent = track.name;
    musicSelector.appendChild(option);
  });
  if (audio && MUSIC_PLAYLIST.length > 0) {
    audio.src = MUSIC_PLAYLIST[0].path;
  }
}
function changeTrack() {
  const selectedTrackPath = musicSelector.value;
  audio.src = selectedTrackPath;
  audio.load();
  if (musicPlaying) {
    audio.play().catch(() => { });
  }
}
const graduationYear = 1987;
const graduationDate = new Date(graduationYear, 5, 30);
let yearsNumberEl;
let yearsCounterEl;
let yearsSuffixEl;
function computeFullYearsSince(date) {
  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const anniversaryThisYear = new Date(
    now.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  if (now < anniversaryThisYear) years--;
  return years >= 0 ? years : 0;
}
function animateNumber(target, duration = 1400) {
  if (!yearsNumberEl) {
    console.warn("yearsNumberEl is not initialized yet.");
    return;
  }
  const start = 0;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);
    yearsNumberEl.textContent = current;
    if (progress < 1 && progress > 0.6)
      yearsNumberEl.classList.add("animate");
    else yearsNumberEl.classList.remove("animate");
    if (progress < 1) requestAnimationFrame(step);
    else {
      yearsNumberEl.classList.add("animate");
      setTimeout(() => yearsNumberEl.classList.remove("animate"), 350);
      yearsCounterEl.setAttribute(
        "aria-label",
        `Від випуску пройшло ${target} років`
      );
    }
  }
  requestAnimationFrame(step);
}
function getUkrainianYearSuffix(n) {
  n = Math.abs(n) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return "років";
  if (n1 > 1 && n1 < 5) return "роки";
  if (n1 === 1) return "рік";
  return "років";
}
function initYearsCounter() {
  yearsNumberEl = document.getElementById("yearsNumber");
  yearsCounterEl = document.getElementById("yearsCounter");
  yearsSuffixEl = document.getElementById("yearsSuffix");
  if (!yearsNumberEl || !yearsCounterEl || !yearsSuffixEl) {
    console.error("One or more year counter DOM elements not found!");
    return;
  }
  const years = computeFullYearsSince(graduationDate);
  const suffix = getUkrainianYearSuffix(years);
  yearsSuffixEl.textContent = suffix;
  animateNumber(years, 1400);
  setInterval(() => {
    const newYears = computeFullYearsSince(graduationDate);
    if (parseInt(yearsNumberEl.textContent, 10) !== newYears) {
      yearsSuffixEl.textContent = getUkrainianYearSuffix(newYears);
      animateNumber(newYears, 900);
    }
  }, 60 * 1000);
}
const COUNTER_KEY = "k-vova-class_visitors1987";
const API = "https://countapi.mileshilliard.com/api/v1";
async function updateVisitCounter() {
  const out = document.getElementById("uniqueCount");
  let shown = false;
  try {
    const resHit = await fetch(
      `${API}/hit/${encodeURIComponent(COUNTER_KEY)}`,
      { cache: "no-store", mode: "cors" }
    );
    if (resHit.ok) {
      const dataHit = await resHit.json();
      const n = Number(dataHit?.value);
      if (Number.isFinite(n)) {
        out.textContent = n;
        shown = true;
      }
    }
  } catch (_) { }
  if (!shown) out.textContent = "—";
}
async function requestWakeLockOrFallback() {
  if ("wakeLock" in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => { });
      document.addEventListener(
        "visibilitychange",
        handleVisibilityChangeForWakeLock
      );
    } catch (err) {
      startIOSKeepAwake();
    }
  } else {
    startIOSKeepAwake();
  }
}
function handleVisibilityChangeForWakeLock() {
  if (document.visibilityState === "visible" && isSlideshowRunning) {
    requestWakeLockOrFallback();
  }
}
async function releaseWakeLock() {
  try {
    if (wakeLock !== null) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch (err) { }
  document.removeEventListener(
    "visibilitychange",
    handleVisibilityChangeForWakeLock
  );
  stopIOSKeepAwake();
}
function startIOSKeepAwake() {
  if (!keepAwakeVideo) return;
  if (iosKeepAwakeActive) return;
  try {
    keepAwakeVideo.setAttribute("playsinline", "");
    keepAwakeVideo.setAttribute("muted", "");
    keepAwakeVideo.muted = true;
    keepAwakeVideo.loop = true;
    keepAwakeVideo.preload = "auto";
    keepAwakeVideo.crossOrigin = "anonymous";
  } catch (e) { }
  if (!keepAwakeVideo.src) {
    keepAwakeVideo.src = "video/keep-awake.mp4";
  }
  const tryPlay = async () => {
    try {
      keepAwakeVideo.currentTime = 0;
      await keepAwakeVideo.play();
      iosKeepAwakeActive = true;
    } catch (err2) {
      iosKeepAwakeActive = false;
    }
  };
  tryPlay();
  iosKeepAwakeVisibilityHandler = () => {
    if (document.visibilityState === "visible" && isSlideshowRunning) {
      keepAwakeVideo.play().catch(() => { });
    }
  };
  document.addEventListener(
    "visibilitychange",
    iosKeepAwakeVisibilityHandler
  );
}
keepAwakeVideo.addEventListener(
  "error",
  function onKeepAwakeError(e) { },
  { once: true }
);
function stopIOSKeepAwake() {
  if (!keepAwakeVideo) return;
  try {
    keepAwakeVideo.pause();
    try {
      keepAwakeVideo.currentTime = 0;
    } catch (e) { }
  } catch (err) { }
  iosKeepAwakeActive = false;
  if (iosKeepAwakeVisibilityHandler) {
    document.removeEventListener(
      "visibilitychange",
      iosKeepAwakeVisibilityHandler
    );
    iosKeepAwakeVisibilityHandler = null;
  }
}
document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "visible" && isSlideshowRunning) {
    await requestWakeLockOrFallback();
  }
});
window.addEventListener("pagehide", async () => {
  await releaseWakeLock();
});
document.addEventListener("DOMContentLoaded", () => {
  showInitialScreen();
  renderMenu(null);
  populateMusicSelector();
  updateVisitCounter();
  initYearsCounter();
  if (musicSelector) {
    musicSelector.addEventListener("change", changeTrack);
  }
  menuButton.addEventListener("click", () => {
    menuButton.classList.add('hidden');
    menu.classList.remove('hidden');
  });

  backButton.addEventListener("click", () => {
    showAlbumMenu();
  });
});