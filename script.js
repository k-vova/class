const PAGES = [{
    id: "kindergarten",
    name: "Дитячий садочок",
    photos: Array.from({
        length: 11
    }, (_, i) => `img/Дитячий садочок/${i + 1}.webp`),
}, {
    id: "school-days",
    name: "Шкільні будні",
    photos: Array.from({
        length: 42
    }, (_, i) => `img/Шкільні будні/${i + 1}.webp`),
}, {
    id: "group-photos",
    name: "Колективні фото",
    photos: Array.from({
        length: 12
    }, (_, i) => `img/Колективні фото/${i + 1}.webp`),
}, {
    id: "excursions",
    name: "Екскурсії",
    photos: Array.from({
        length: 27
    }, (_, i) => `img/Екскурсії/${i + 1}.webp`),
}, {
    id: "After-schoolmeetings",
    name: "Зустрічі після школи",
    photos: Array.from({
        length: 6
    }, (_, i) => `img/Зустрічі після школи/${i + 1}.webp`),
}, {
    id: "meet97-07",
    name: "Зустріч 1997-2007р",
    photos: Array.from({
        length: 35
    }, (_, i) => `img/Зустріч 1997-2007р/${i + 1}.webp`),
}, {
    id: "meet2017",
    name: "Зустріч 2017р",
    photos: Array.from({
        length: 22
    }, (_, i) => `img/Зустріч 2017р/${i + 1}.webp`),
}, {
    id: "meet2022-25",
    name: "Зустріч 2022-2025р",
    photos: Array.from({
        length: 12
    }, (_, i) => `img/Зустріч 2022-2025р/${i + 1}.webp`),
}, {
    id: "local-videos",
    name: "Відео",
    localVideos: ["video/clip1.mp4", "video/clip2.mp4", "video/clip3.mp4", "video/clip4.mp4",],
}, {
    id: "youtube-videos",
    name: "Відео YouTube",
    youtubeVideos: [{
        id: "9uBKizur3ZM",
        caption: "Ульянівська середня школа №2"
    },],
},
{
    id: "radio",
    name: "Радіо FM",
    isRadio: true,
    // --- Ось нове посилання ---
    streamUrl: "https://stream.radio.promodj.com/radio-relax-128"
},
];
const MUSIC_PLAYLIST = [{
    name: "Пісня 1",
    path: "audio/song1.mp3"
}, {
    name: "Пісня 2",
    path: "audio/song2.mp3"
}, {
    name: "Пісня 3",
    path: "audio/song3.mp3"
}, {
    name: "Пісня 4",
    path: "audio/song4.mp3"
}, {
    name: "Пісня 5",
    path: "audio/song5.mp3"
},];
const initialScreen = document.getElementById("initialScreen"),
    menuContainer = document.querySelector(".menu-container"),
    menuButton = document.getElementById("menuButton"),
    backButton = document.getElementById("backButton"),
    menu = document.getElementById("menu"),
    content = document.getElementById("content"),
    modal = document.getElementById("modal"),
    modalContent = modal.querySelector(".modal-content"),
    modalImg = document.getElementById("modalImg"),
    modalLocalVideo = document.getElementById("modalLocalVideo"),
    modalCaption = document.getElementById("modalCaption"),
    speedSelect = document.getElementById("slideshowSpeed"),
    photoCounter = document.getElementById("photoCounter"),
    closeBtn = document.getElementById("closeBtn"),
    prevBtn = document.getElementById("prevBtn"),
    nextBtn = document.getElementById("nextBtn"),
    toggleSlideshowBtn = document.getElementById("toggleSlideshowBtn"),
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
    slideshowSpeed = 5e3,
    lastFocusedElement = null,
    isZoomed = !1,
    musicPlaying = !1,
    wakeLock = null,
    isSlideshowRunning = !1,
    iosKeepAwakeActive = !1,
    iosKeepAwakeVisibilityHandler = null;
let slideshowPlaylist = [];
let currentSlideshowIndex = -1;

function normalizePhoto(item, fallbackCaption) {
    return typeof item === "string" ? {
        src: item,
        caption: fallbackCaption
    } : {
        src: item.src,
        caption: item.caption || fallbackCaption
    }
}

function renderInitialScreen() {
    initialScreen.classList.remove("hidden"), content.classList.add("hidden"), content.innerHTML = "", backButton.classList.add("hidden"), menuContainer.classList.remove("active"), currentPageId = null, renderMenu(null)
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
        btn.onclick = () => (location.hash = page.id);
        menu.appendChild(btn);
    });
}

function renderPage(pageId) {
    menuContainer.classList.remove("active"), window.scrollTo(0, 0), initialScreen.classList.add("hidden"), content.classList.remove("hidden"), backButton.classList.remove("hidden"), currentPageId = pageId, renderMenu(pageId), content.innerHTML = "";
    const page = PAGES.find((p) => p.id === pageId);
    if (!page) return;

    if (page.isRadio) {
        const pageDiv = document.createElement("div");
        pageDiv.className = "page";
        pageDiv.id = `page-${pageId}`;

        const title = document.createElement("h3");
        title.className = "album-title";
        title.textContent = page.name;
        pageDiv.appendChild(title);

        const playerContainer = document.createElement("div");
        playerContainer.className = "radio-player-container";

        const audioPlayer = document.createElement("audio");
        audioPlayer.setAttribute("controls", "");
        audioPlayer.setAttribute("preload", "auto");
        audioPlayer.src = page.streamUrl;

        const infoText = document.createElement("p");
        infoText.className = "radio-info";
        infoText.textContent = "Натисніть Play для початку прослуховування. Для роботи потрібне з'єднання з Інтернетом.";

        playerContainer.appendChild(infoText);
        playerContainer.appendChild(audioPlayer);
        pageDiv.appendChild(playerContainer);
        content.appendChild(pageDiv);
    } else if (page.id === "youtube-videos") {
        if (page.youtubeVideos && page.youtubeVideos.length > 0) {
            const video = page.youtubeVideos[0];
            const pageContainer = document.createElement("div");
            pageContainer.className = "page";
            pageContainer.id = `page-${page.id}`;
            const title = document.createElement("h3");
            title.className = "album-title";
            title.textContent = page.name;
            pageContainer.appendChild(title);
            const videoContainer = document.createElement("div");
            videoContainer.className = "video-page-container";
            const iframe = document.createElement("iframe");
            iframe.src = `https://www.youtube.com/embed/${video.id}?rel=0`;
            iframe.title = video.caption;
            iframe.allow =
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.setAttribute("allowfullscreen", "");
            videoContainer.appendChild(iframe);
            pageContainer.appendChild(videoContainer);
            content.appendChild(pageContainer);
        }
    } else {
        const pageDiv = document.createElement("div");
        pageDiv.className = "page";
        pageDiv.id = `page-${pageId}`;
        const title = document.createElement("h3");
        title.className = "album-title";
        title.textContent = page.name;
        pageDiv.appendChild(title);
        const gallery = document.createElement("div");
        gallery.className = "gallery";

        if (page.photos) {
            page.photos.forEach((photo, index) => {
                const {
                    src,
                    caption
                } = normalizePhoto(
                    photo,
                    `Фото ${index + 1}`
                );
                const frame = document.createElement("div");
                frame.className = "neon-frame";
                const img = document.createElement("img");
                img.src = src;
                img.alt = caption;
                img.loading = "lazy";
                img.decoding = "async";
                frame.onclick = () => navigateToModal(page.id, index, false);
                frame.tabIndex = 0;
                frame.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigateToModal(page.id, index, false);
                    }
                });
                frame.appendChild(img);
                gallery.appendChild(frame);
            });
        } else if (page.localVideos) {
            page.localVideos.forEach((videoPath, index) => {
                const frame = document.createElement("div");
                frame.className = "neon-frame";
                const vid = document.createElement("video");
                vid.src = videoPath;
                vid.setAttribute("preload", "metadata");
                vid.setAttribute("playsinline", "");
                vid.muted = true;
                frame.onclick = () => navigateToModal(page.id, index, true);
                frame.tabIndex = 0;
                frame.setAttribute(
                    "aria-label",
                    `${page.name} — відео ${index + 1}`
                );
                frame.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigateToModal(page.id, index, true);
                    }
                });
                frame.appendChild(vid);
                gallery.appendChild(frame);
            });
        }
        pageDiv.appendChild(gallery);
        content.appendChild(pageDiv);
    }
}

function setPhotoControlVisibility(visible) {
    document.querySelectorAll(".photo-only").forEach((el) => {
        el.style.display = visible ? "" : "none";
    });
}

function navigateToModal(pageId, index) {
    const page = PAGES.find((p) => p.id === pageId);
    if (!page) return;
    currentPageId = pageId;
    currentIndex = index;
    location.hash = "modal";
}

function showModal() {
    lastFocusedElement = document.activeElement;
    const page = PAGES.find((p) => p.id === currentPageId);
    if (!page) return;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    header.inert = true;
    footer.inert = true;
    content.inert = true;
    initialScreen.inert = true;
    if (page.localVideos && page.id === "local-videos") {
        modalImg.style.display = "none";
        modalLocalVideo.style.display = "block";
        modalLocalVideo.src = page.localVideos[currentIndex];
        modalCaption.textContent = page.name;
        photoCounter.textContent = `Відео ${currentIndex + 1} / ${page.localVideos.length
            }`;
        setPhotoControlVisibility(false);
        modalLocalVideo
            .play()
            .catch((e) => console.error("Video play failed:", e));
    } else if (page.photos) {
        modalImg.style.display = "block";
        modalLocalVideo.style.display = "none";
        try {
            modalLocalVideo.pause();
        } catch (e) { }
        modalLocalVideo.src = "";
        const {
            src,
            caption
        } = normalizePhoto(
            page.photos[currentIndex],
            `Фото ${currentIndex + 1}`
        );
        modalImg.src = src;
        modalImg.alt = caption;
        modalCaption.textContent = page.name;
        photoCounter.textContent = `${currentIndex + 1} / ${page.photos.length
            }`;
        setPhotoControlVisibility(true);
    }
    modalContent.classList.add("visible");
    closeBtn.focus();
}

function hideModal() {
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

function prevMedia() {
    if (slideshowInterval) stopSlideshow();
    const page = PAGES.find((p) => p.id === currentPageId);
    if (!page) return;

    if (!page.photos || page.photos.length === 0) {
        if (page.localVideos) {
            const items = page.localVideos;
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateModalContent();
        }
        return;
    }

    let globalIndex = slideshowPlaylist.findIndex(item =>
        item.pageId === currentPageId && item.photoIndex === currentIndex
    );

    if (globalIndex === -1) {
        const items = page.photos;
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateModalContent();
        return;
    }

    globalIndex = (globalIndex - 1 + slideshowPlaylist.length) % slideshowPlaylist.length;

    const prevItem = slideshowPlaylist[globalIndex];
    currentPageId = prevItem.pageId;
    currentIndex = prevItem.photoIndex;

    updateModalContent();
}

function nextMedia() {
    if (slideshowInterval) stopSlideshow();
    const page = PAGES.find((p) => p.id === currentPageId);
    if (!page) return;

    if (!page.photos || page.photos.length === 0) {
        if (page.localVideos) {
            const items = page.localVideos;
            currentIndex = (currentIndex + 1) % items.length;
            updateModalContent();
        }
        return;
    }

    let globalIndex = slideshowPlaylist.findIndex(item =>
        item.pageId === currentPageId && item.photoIndex === currentIndex
    );

    if (globalIndex === -1) {
        const items = page.photos;
        currentIndex = (currentIndex + 1) % items.length;
        updateModalContent();
        return;
    }

    globalIndex = (globalIndex + 1) % slideshowPlaylist.length;

    const nextItem = slideshowPlaylist[globalIndex];
    currentPageId = nextItem.pageId;
    currentIndex = nextItem.photoIndex;

    updateModalContent();
}

function updateModalContent() {
    const page = PAGES.find((p) => p.id === currentPageId);
    if (!page) return;
    if (page.localVideos && page.id === "local-videos") {
        modalLocalVideo.src = page.localVideos[currentIndex];
        photoCounter.textContent = `Відео ${currentIndex + 1} / ${page.localVideos.length
            }`;
        modalLocalVideo
            .play()
            .catch((e) => console.error("Video play failed:", e));
    } else if (page.photos) {
        fadeImage(currentIndex);
    }
    resetTransform();
}

function fadeImage(index) {
    const page = PAGES.find((p) => p.id === currentPageId);
    if (!page || !page.photos) return;
    const {
        src,
        caption
    } = normalizePhoto(
        page.photos[index],
        `Фото ${index + 1}`
    );
    modalImg.style.opacity = 0;
    setTimeout(() => {
        const showNewImage = () => {
            modalImg.alt = caption;
            modalCaption.textContent = page.name;
            photoCounter.textContent = `${index + 1} / ${page.photos.length}`;
            modalImg.style.opacity = 1;
            modalImg.removeEventListener("load", showNewImage);
        };
        modalImg.addEventListener("load", showNewImage);
        modalImg.src = src;
        if (modalImg.complete) {
            showNewImage();
        }
    }, 300);
}

function toggleSlideshow() {
    if (slideshowInterval) stopSlideshow();
    else startSlideshow();
}

function createSlideshowPlaylist() {
    slideshowPlaylist = [];
    PAGES.forEach((page) => {
        if (page.photos && page.photos.length > 0) {
            page.photos.forEach((_, index) => {
                slideshowPlaylist.push({
                    pageId: page.id,
                    photoIndex: index
                });
            });
        }
    });
}

function advanceSlideshow() {
    if (!isSlideshowRunning || slideshowPlaylist.length === 0) {
        stopSlideshow();
        return;
    }
    currentSlideshowIndex =
        (currentSlideshowIndex + 1) % slideshowPlaylist.length;
    const {
        pageId,
        photoIndex
    } = slideshowPlaylist[currentSlideshowIndex];
    currentPageId = pageId;
    currentIndex = photoIndex;
    updateModalContent();
}

function startSlideshow() {
    const page = PAGES.find((p) => p.id === currentPageId);
    if (!page || !page.photos) return;
    currentSlideshowIndex = slideshowPlaylist.findIndex(
        (item) =>
            item.pageId === currentPageId && item.photoIndex === currentIndex
    );
    if (currentSlideshowIndex === -1) {
        console.error("Не вдалося знайти поточне фото. Починаю спочатку.");
        currentSlideshowIndex = 0;
    }
    document.getElementById("slideshowStatus").textContent = "⏸ Зупинити";
    slideshowInterval = setInterval(advanceSlideshow, slideshowSpeed);
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
speedSelect.addEventListener("change", changeSlideshowSpeed);
toggleSlideshowBtn.addEventListener("click", toggleSlideshow);
document.addEventListener("keydown", (e) => {
    if (modal.style.display === "flex") {
        if (e.key === "Escape") history.back();
        else if (e.key === "ArrowLeft" && !isZoomed) prevMedia();
        else if (e.key === "ArrowRight" && !isZoomed) nextMedia();
    }
});
let startTouchX = 0,
    startTouchY = 0,
    lastTouchX = 0,
    lastTouchY = 0,
    pinchStartDistance = 0,
    scale = 1,
    lastScale = 1,
    translateX = 0,
    translateY = 0,
    lastTranslateX = 0,
    lastTranslateY = 0;
const MIN_SCALE = 1,
    MAX_SCALE = 4,
    ZOOM_BLOCK_THRESHOLD = 1.05,
    SWIPE_THRESHOLD = 50;
let isPanning = !1;

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
    }, {
    passive: true
}
);
modalContent.addEventListener(
    "touchmove",
    (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dist = getDistance(e.touches);
            if (pinchStartDistance > 0) {
                let newScale = (dist / pinchStartDistance) * lastScale;
                scale = clamp(newScale, MIN_SCALE, MAX_SCALE);
                isZoomed = scale > ZOOM_BLOCK_THRESHOLD;
                applyTransform();
            }
        } else if (e.touches.length === 1) {
            const t = e.touches[0];
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
    }, {
    passive: false
}
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
                const endX = e.changedTouches[0].clientX,
                    endY = e.changedTouches[0].clientY;
                const diffX = endX - startTouchX;
                if (
                    Math.abs(diffX) > SWIPE_THRESHOLD &&
                    Math.abs(diffX) > Math.abs(endY - startTouchY)
                ) {
                    if (diffX > 0) prevMedia();
                    else nextMedia();
                }
            }
        } else if (e.touches.length === 1) {
            startTouchX = e.touches[0].clientX;
            startTouchY = e.touches[0].clientY;
            lastTouchX = startTouchX;
            lastTouchY = startTouchY;
        }
    }, {
    passive: false
}
);
modal.addEventListener("click", (e) => {
    if (e.target === modal) history.back();
});

function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX,
        dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}
audio.addEventListener("ended", () => {
    if (slideshowInterval && musicPlaying) {
        const nextTrackIndex =
            (musicSelector.selectedIndex + 1) % MUSIC_PLAYLIST.length;
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
    if (musicPlaying) {
        audio.play().catch(() => { });
    }
}
const graduationYear = 1987,
    graduationDate = new Date(graduationYear, 5, 30);
let yearsNumberEl, yearsCounterEl, yearsSuffixEl;

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
    if (!yearsNumberEl) return;
    const start = 0,
        startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime,
            progress = Math.min(elapsed / duration, 1),
            eased = 1 - Math.pow(1 - progress, 3),
            current = Math.floor(start + (target - start) * eased);
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
    if (!yearsNumberEl || !yearsCounterEl || !yearsSuffixEl) return;
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
const COUNTER_KEY = "k-vova-class_visitors1987",
    API = "https://countapi.mileshilliard.com/api/v1";
async function updateVisitCounter() {
    const out = document.getElementById("uniqueCount");
    let shown = false;
    try {
        const resHit = await fetch(
            `${API}/hit/${encodeURIComponent(COUNTER_KEY)}`, {
            cache: "no-store",
            mode: "cors"
        }
        );
        if (resHit.ok) {
            const dataHit = await resHit.json(),
                n = Number(dataHit && dataHit.value);
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
    if (!keepAwakeVideo || iosKeepAwakeActive) return;
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

function router() {
    const hash = window.location.hash.substring(1);
    const page = PAGES.find((p) => p.id === hash);
    if (hash !== "modal" && modal.style.display === "flex") {
        hideModal();
    }
    if (hash === "modal") {
        if (modal.style.display !== "flex" && currentPageId) {
            showModal();
        } else if (!currentPageId) {
            location.hash = "";
        }
    } else if (page) {
        renderPage(hash);
    } else {
        renderInitialScreen();
    }
}
document.addEventListener("DOMContentLoaded", () => {
    createSlideshowPlaylist();
    populateMusicSelector();
    updateVisitCounter();
    initYearsCounter();
    router();
    window.addEventListener("hashchange", router);
    if (musicSelector) {
        musicSelector.addEventListener("change", changeTrack);
    }
    menuButton.addEventListener("click", (e) => {
        e.stopPropagation();
        menuContainer.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
        if (!menuContainer.contains(e.target)) {
            menuContainer.classList.remove("active");
        }
    });
    backButton.addEventListener("click", () => {
        location.hash = "";
    });
    closeBtn.addEventListener("click", () => {
        history.back();
    });
    prevBtn.addEventListener("click", prevMedia);
    nextBtn.addEventListener("click", nextMedia);
});