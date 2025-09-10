// ---------------------------
// Config / Pages (unchanged)
// ---------------------------
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

// ---------------------------
// DOM refs + state
// ---------------------------
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
  musicBtn = document.getElementById("toggleMusic"),
  keepAwakeVideo = document.getElementById("keepAwakeVideo");

let currentPageId = null,
  currentIndex = 0,
  slideshowInterval = null,
  slideshowSpeed = 5000,
  lastFocusedElement = null,
  isVideoMode = false,
  musicPlaying = false;

// Wake lock variables
let wakeLock = null;
let isSlideshowRunning = false;

// Detect iOS (cover modern indicators)
const isIOS = (() => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  // iPad on iOS 13+ may report MacIntel — check for touch + Mac platform
  const isIpad =
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    /iPad/.test(ua);
  return /iPhone|iPad|iPod/.test(ua) || isIpad;
})();

// ---------------------------
// helpers
// ---------------------------
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

// ---------------------------
// Modal open/close / focus management
// ---------------------------
function openModal(src, caption, index, photos) {
  lastFocusedElement = document.activeElement;
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page) return;
  if (page.videoUrl) {
    modalImg.style.display = "none";
    modalVideo.style.display = "block";
    modalVideo.src = page.videoUrl;
    // show the album/page name as caption for video mode as well
    modalCaption.textContent = page.name;
    photoCounter.textContent = "";
    isVideoMode = true;
  } else {
    modalImg.style.display = "block";
    modalVideo.style.display = "none";
    currentIndex = index;
    modalImg.src = src;
    // keep img alt descriptive (it may be 'Фото N') for accessibility
    modalImg.alt = caption;
    // set modal caption to the album (page) name instead of "Фото N"
    modalCaption.textContent = page.name;
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
  resetTransform();
}

function closeModal() {
  modal.style.display = "none";
  stopSlideshow();
  releaseWakeLock(); // release wake lock/fallbacks
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

// ---------------------------
// Image navigation and fade
// ---------------------------
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
    // keep the alt for accessibility but show album name below the photo
    modalImg.alt = caption;
    // set the caption to album name (page.name)
    modalCaption.textContent = page.name;
    photoCounter.textContent = `${index + 1} / ${page.photos.length}`;
    modalImg.style.opacity = 1;
  }, 300);
}

function advanceToNextAlbum() {
  let currentAlbumIndex = PAGES.findIndex((p) => p.id === currentPageId);
  let nextIndex = (currentAlbumIndex + 1) % PAGES.length;
  while (PAGES[nextIndex].videoUrl) nextIndex = (nextIndex + 1) % PAGES.length;
  const nextPage = PAGES[nextIndex];
  showPage(nextPage.id);
  currentIndex = 0;
  if (nextPage.photos && nextPage.photos.length) {
    openModal(
      normalizePhoto(nextPage.photos[currentIndex], `Фото 1`).src,
      normalizePhoto(nextPage.photos[currentIndex], `Фото 1`).caption,
      currentIndex,
      nextPage.photos
    );
    isVideoMode = false;
  }
}

// ---------------------------
// Slideshow & music (with wake lock)
// ---------------------------
function toggleSlideshow() {
  if (slideshowInterval) stopSlideshow();
  else startSlideshow();
}

function startSlideshow() {
  const page = PAGES.find((p) => p.id === currentPageId);
  if (!page || !page.photos || isVideoMode) return;
  document.getElementById("slideshowStatus").textContent = "⏸ Зупинити";
  // Use setInterval to advance images
  slideshowInterval = setInterval(() => {
    nextImage();
  }, slideshowSpeed);
  isSlideshowRunning = true;
  // Try to start audio (optional)
  if (!musicPlaying) {
    audio.play().catch(() => {
      /* ignore */
    });
    musicPlaying = true;
    musicBtn.textContent = "🔇 Вимкнути музику";
  }
  // Request wake lock or iOS fallback
  requestWakeLockOrFallback();
}

function stopSlideshow() {
  document.getElementById("slideshowStatus").textContent = "▶️ Слайдшоу";
  clearInterval(slideshowInterval);
  slideshowInterval = null;
  isSlideshowRunning = false;
  // release wake lock / fallback
  releaseWakeLock();
}

function changeSlideshowSpeed() {
  slideshowSpeed = parseInt(speedSelect.value, 10);
  if (slideshowInterval) {
    stopSlideshow();
    startSlideshow();
  }
}

// ---------------------------
// Keyboard navigation
// ---------------------------
document.addEventListener("keydown", (e) => {
  if (modal.style.display === "flex") {
    if (e.key === "Escape") closeModal();
    else if (e.key === "ArrowLeft" && !isZoomed) prevImage();
    else if (e.key === "ArrowRight" && !isZoomed) nextImage();
  }
});

// ---------------------------
// Pinch-to-zoom + Panning
// ---------------------------
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
      // start pinch
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
      // pinch in progress
      e.preventDefault(); // prevent page scroll while pinching
      const dist = getDistance(e.touches);
      if (pinchStartDistance > 0) {
        let newScale = (dist / pinchStartDistance) * lastScale;
        newScale = clamp(newScale, MIN_SCALE, MAX_SCALE);
        scale = newScale;
        isZoomed = scale > ZOOM_BLOCK_THRESHOLD;
        // When pinch changes, keep translate values within reasonable bounds:
        applyTransform();
      }
    } else if (e.touches.length === 1) {
      // single touch move: if zoomed -> pan; if not zoomed -> do not prevent (allow swipe on touchend)
      const t = e.touches[0];
      const dx = t.clientX - lastTouchX;
      const dy = t.clientY - lastTouchY;
      lastTouchX = t.clientX;
      lastTouchY = t.clientY;
      if (isZoomed) {
        e.preventDefault(); // prevent page scroll while panning
        isPanning = true;
        translateX = lastTranslateX + (t.clientX - startTouchX);
        translateY = lastTranslateY + (t.clientY - startTouchY);
        // Optional: limit translate to not move image too far from view — simple clamp
        const limit = 2000; // large limit so user can pan freely; adjust if desired
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
    // if pinch ended (no more touches), finalize
    if (e.touches.length === 0) {
      if (pinchStartDistance !== 0) {
        // finalize pinch
        if (scale <= ZOOM_BLOCK_THRESHOLD) {
          resetTransform();
        } else {
          // keep the scale and translate as is; commit lastTranslate values
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

      // If it was a pan, commit the last translate
      if (isPanning) {
        lastTranslateX = translateX;
        lastTranslateY = translateY;
        isPanning = false;
        return;
      }

      // If not zoomed -> possible swipe
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
      // If one finger remains after pinch -> update starts for further interactions
      startTouchX = e.touches[0].clientX;
      startTouchY = e.touches[0].clientY;
      lastTouchX = startTouchX;
      lastTouchY = startTouchY;
    }
  },
  { passive: false }
);

// Close modal when clicking outside content
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// helper distance function
function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// audio loop handling
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
    audio.play().catch(() => {
      /* ignore */
    });
    musicPlaying = true;
    musicBtn.textContent = "🔇 Вимкнути музику";
  }
});

// init
document.addEventListener("DOMContentLoaded", () => {
  showPage(PAGES[0].id);
});

/* ---------------- ЛІЧИЛЬНИК РОКІВ ---------------- */
(function () {
  const graduationYear = 1987;
  const graduationDate = new Date(graduationYear, 5, 30); // 30 червня 1987

  const yearsNumberEl = document.getElementById("yearsNumber");
  const yearsCounterEl = document.getElementById("yearsCounter");
  const yearsSuffixEl = document.getElementById("yearsSuffix");

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

  function initYearsCounter() {
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

  function getUkrainianYearSuffix(n) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return "років";
    if (n1 > 1 && n1 < 5) return "роки";
    if (n1 === 1) return "рік";
    return "років";
  }

  document.addEventListener("DOMContentLoaded", initYearsCounter);
})();
/* ---------------- /ЛІЧИЛЬНИК РОКІВ ---------------- */

// Лічильник унікальних відвідувачів
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
  } catch (_) {}
  if (!shown) out.textContent = "—";
}

document.addEventListener("DOMContentLoaded", () => {
  updateVisitCounter();
});

// ---------------------------
// Wake Lock + iOS fallback
// ---------------------------
async function requestWakeLockOrFallback() {
  // If Wake Lock API available
  if ("wakeLock" in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => {
        // console.log('Wake Lock released');
      });
      // Re-request if visibility changes
      document.addEventListener(
        "visibilitychange",
        handleVisibilityChangeForWakeLock
      );
    } catch (err) {
      // console.warn('Wake Lock request failed:', err);
      // fallback to iOS/video approach
      startIOSKeepAwake();
    }
  } else {
    // No Wake Lock support -> try iOS fallback
    startIOSKeepAwake();
  }
}

function handleVisibilityChangeForWakeLock() {
  if (document.visibilityState === "visible" && isSlideshowRunning) {
    // try re-requesting
    requestWakeLockOrFallback();
  }
}

async function releaseWakeLock() {
  // Release Wake Lock if present
  try {
    if (wakeLock !== null) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch (err) {
    // ignore
  } finally {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChangeForWakeLock
    );
  }
  // stop iOS fallback
  stopIOSKeepAwake();
}

// iOS fallback: attempt to keep screen awake by playing a small invisible looping video (muted, playsinline).
// Note: For reliable behaviour on iOS you should provide small silent MP4 file at 'video/keep-awake.mp4'.
function startIOSKeepAwake() {
  // If not iOS, still attempt — some Android browsers might also respect inline video
  if (!keepAwakeVideo) return;
  // If a src isn't set, try to use a built-in local file path; user should place a small mp4 there.
  if (!keepAwakeVideo.src) {
    // Path where you can drop a tiny silent mp4 file for best results.
    // If you don't have such file, the attempt may still fail silently.
    keepAwakeVideo.src = "video/keep-awake.mp4";
  }
  // attempt play
  keepAwakeVideo
    .play()
    .then(() => {
      // console.log('keepAwakeVideo playing as fallback');
    })
    .catch((err) => {
      // play may be blocked if user hasn't interacted — but in our case slideshow start is user-initiated
      // console.warn('keepAwakeVideo play failed:', err);
    });
}

function stopIOSKeepAwake() {
  if (!keepAwakeVideo) return;
  try {
    keepAwakeVideo.pause();
    // clear src if you want: keepAwakeVideo.src = '';
  } catch (err) {
    // ignore
  }
}

// Visibility change: when user returns to the tab, re-request wake lock if needed
document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "visible" && isSlideshowRunning) {
    await requestWakeLockOrFallback();
  }
});

// Clean up on unload
window.addEventListener("pagehide", async () => {
  await releaseWakeLock();
});

// ---------------------------
// End of Wake Lock logic
// ---------------------------
