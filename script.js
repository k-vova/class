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
    photos: Array.from({ length: 27 }, (_, i) => `img/Екскурсії/${i + 1}.webp`),
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
  {
    id: "video",
    name: "Відео YouTube",
    videoUrl: "https://www.youtube.com/embed/9uBKizur3ZM",
  },
];

const MUSIC_PLAYLIST = [
  { name: "Пісня 1", path: "audio/song1.mp3" },
  { name: "Пісня 2", path: "audio/song2.mp3" },
  { name: "Пісня 3", path: "audio/song3.mp3" },
  { name: "Пісня 4", path: "audio/song4.mp3" },
  { name: "Пісня 5", path: "audio/song5.mp3" },
];

const menu = document.getElementById("menu"),
  content = document.getElementById("content"),
  modal = document.getElementById("modal"),
  modalContent = modal.querySelector(".modal-content"),
  modalImg = document.getElementById("modalImg"),
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
  } else if (page.localVideos) {
    const gallery = document.createElement("div");
    gallery.className = "gallery";
    page.localVideos.forEach((videoPath, index) => {
      const vidWrap = document.createElement("div");
      const vid = document.createElement("video");
      vid.src = videoPath;
      vid.setAttribute("preload", "metadata");
      vid.setAttribute("playsinline", "");
      vid.muted = true;
      vid.tabIndex = 0;
      vid.setAttribute("aria-label", `${page.name} — відео ${index + 1}`);
      vid.onclick = () =>
        openLocalVideoModal(videoPath, `${page.name}`, index, page.localVideos);
      vid.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLocalVideoModal(
            videoPath,
            `${page.name}`,
            index,
            page.localVideos
          );
        }
      });
      vid.controls = false;
      vid.style.cursor = "pointer";
      vid.style.width = "100%";
      vid.style.borderRadius = "10px";
      vid.style.objectFit = "cover";
      vidWrap.appendChild(vid);
      gallery.appendChild(vidWrap);
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
  if (page.videoUrl) {
    modalImg.style.display = "none";
    modalVideo.style.display = "block";
    modalVideo.src = page.videoUrl;
    modalCaption.textContent = page.name;
    photoCounter.textContent = "";
    isVideoMode = true;
    setPhotoControlVisibility(false);
  } else {
    modalImg.style.display = "block";
    modalVideo.style.display = "none";
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
  }
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  closeBtn.focus();
  header.inert = true;
  footer.inert = true;
  content.inert = true;
  menu.inert = true;
  resetTransform();
}

function openLocalVideoModal(src, caption, index, videos) {
  lastFocusedElement = document.activeElement;
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page) return;
  modalImg.style.display = "none";
  modalVideo.style.display = "none";
  if (modalLocalVideo) {
    modalLocalVideo.style.display = "block";
    modalLocalVideo.src = src;
    modalLocalVideo.currentTime = 0;
    modalLocalVideo.load();
    modalLocalVideo.play().catch(() => { });
  }
  modalCaption.textContent = caption || page.name;
  photoCounter.textContent = `${index + 1} / ${videos.length}`;
  modalContent.classList.add("visible");
  isVideoMode = true;
  setPhotoControlVisibility(false);
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  closeBtn.focus();
  header.inert = true;
  footer.inert = true;
  content.inert = true;
  menu.inert = true;
  resetTransform();
}

function closeModal() {
  modal.style.display = "none";
  stopSlideshow();
  releaseWakeLock();
  audio.pause();
  musicPlaying = false;
  musicIcon.textContent = "🔊";
  modalImg.src = "";
  modalVideo.src = "";
  if (modalLocalVideo) {
    try {
      modalLocalVideo.pause();
    } catch (e) { }
    modalLocalVideo.src = "";
    modalLocalVideo.style.display = "none";
  }
  document.body.style.overflow = "";
  header.inert = false;
  footer.inert = false;
  content.inert = false;
  menu.inert = false;
  if (lastFocusedElement) lastFocusedElement.focus();
  setPhotoControlVisibility(true);
}

function prevImage() {
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page || !page.photos || isVideoMode) return;
  currentIndex = (currentIndex - 1 + page.photos.length) % page.photos.length;
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
    else if (e.key === "ArrowLeft" && !isZoomed) prevImage();
    else if (e.key === "ArrowRight" && !isZoomed) nextImage();
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
          if (diffX > 0) prevImage();
          else nextImage();
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
    const nextTrackIndex = (currentTrackIndex + 1) % MUSIC_PLAYLIST.length;
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
    audio.play().catch(() => {
      /* ігноруємо помилку */
    });
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
    if (progress < 1 && progress > 0.6) yearsNumberEl.classList.add("animate");
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
  document.addEventListener("visibilitychange", iosKeepAwakeVisibilityHandler);
}

keepAwakeVideo.addEventListener("error", function onKeepAwakeError(e) { }, {
  once: true,
});

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
  showPage(PAGES[0].id);
  populateMusicSelector();
  updateVisitCounter();
  initYearsCounter();

  if (musicSelector) {
    musicSelector.addEventListener("change", changeTrack);
  }
});



