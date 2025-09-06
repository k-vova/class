const PAGES=[
{
  id:'kindergarten',
  name:'Дитячий садочок',
  photos:Array.from({length:11},(_,i)=>`img/Дитячий садочок/${i+1}.jpg`)
},
{
  id:'school-days',
  name:'Шкільні будні',
  photos:Array.from({length:42},(_,i)=>`img/Шкільні будні/${i+1}.jpg`)
},
{
  id:'group-photos',
  name:'Колективні фото',
  photos:Array.from({length:11},(_,i)=>`img/Колективні фото/${i+1}.jpg`)
},
{
  id:'excursions',
  name:'Екскурсії',
  photos:Array.from({length:22},(_,i)=>`img/Екскурсії/${i+1}.jpg`)
},
{
  id:'meet97-07',
  name:'Зустріч 1997-2007р',
  photos:Array.from({length:32},(_,i)=>`img/Зустріч 1997-2007р/${i+1}.jpg`)
},
{
  id:'meet2017',
  name:'Зустріч 2017р',
  photos:Array.from({length:22},(_,i)=>`img/Зустріч 2017р/${i+1}.jpg`)
},
{
  id:'meet2022-25',
  name:'Зустріч 2022-2025р',
  photos:Array.from({length:12},(_,i)=>`img/Зустріч 2022-2025р/${i+1}.jpg`)
},
{
  id:'video',name:'Відео',videoUrl:'https://www.youtube.com/embed/9uBKizur3ZM'
}
];

const menu=document.getElementById('menu'),
content=document.getElementById('content'),
modal=document.getElementById('modal'),
modalContent=modal.querySelector('.modal-content'),
modalImg=document.getElementById('modalImg'),
modalVideo=document.getElementById('modalVideo'),
modalCaption=document.getElementById('modalCaption'),
speedSelect=document.getElementById('slideshowSpeed'),
photoCounter=document.getElementById('photoCounter'),
closeBtn=document.getElementById('closeBtn'),
header=document.querySelector('header'),
footer=document.querySelector('footer'),
audio=document.getElementById('slideshowAudio'),
musicBtn=document.getElementById('toggleMusic');

let currentPageId=null,
currentIndex=0,
slideshowInterval=null,
slideshowSpeed=3000,
lastFocusedElement=null,
isVideoMode=false,
musicPlaying=false;

// Нормалізація фото
function normalizePhoto(item,fallbackCaption){
  return typeof item==='string'?{
    src:item,caption:fallbackCaption}:{src:item.src,caption:item.caption||fallbackCaption};
  }

// Меню
function renderMenu(activeId){
  menu.innerHTML='';
  PAGES.forEach(page=>{const btn=document.createElement('button');
    btn.textContent=page.name;
    btn.setAttribute('aria-pressed',page.id===activeId?'true':'false');
    btn.setAttribute('aria-controls',`page-${page.id}`);
    btn.onclick=()=>showPage(page.id);
    menu.appendChild(btn);
  }
);
}

// Показ сторінки
function showPage(pageId){currentPageId=pageId;
  renderMenu(pageId);
  content.innerHTML='';
  const page=PAGES.find(p=>p.id===pageId);
  if(!page)return;
  const pageDiv=document.createElement('div');
  pageDiv.className='page active';
  pageDiv.id=`page-${pageId}`; 
  if(page.photos){const gallery=document.createElement('div');
    gallery.className='gallery';
    page.photos.forEach((photo,index)=>{const{src,caption}=normalizePhoto(photo,`Фото ${index+1}`);
    const img=document.createElement('img');
    img.src=src;
    img.alt=caption;
    img.loading='lazy';
    img.decoding='async';
    img.onclick=()=>openModal(src,caption,index,page.photos);
    img.tabIndex=0;
    img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal(src,caption,index,page.photos);
    }
    }
    );
    gallery.appendChild(img);
  });
  pageDiv.appendChild(gallery);
}else if(page.videoUrl){const videoDiv=document.createElement('div');
  videoDiv.className='video-container';
  const iframe=document.createElement('iframe');
  iframe.src=page.videoUrl;
  iframe.title=page.name;
  iframe.allowFullscreen=true;
  iframe.loading='lazy';
  iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  videoDiv.appendChild(iframe);
  pageDiv.appendChild(videoDiv);
}content.appendChild(pageDiv);
}

// Модальне вікно
function openModal(src,caption,index,photos){lastFocusedElement=document.activeElement;
  const page=PAGES.find(p=>p.id===currentPageId);
  if(!page)return;
  if(page.videoUrl){modalImg.style.display='none';
    modalVideo.style.display='block';
    modalVideo.src=page.videoUrl;
    modalCaption.textContent='';
    photoCounter.textContent='';
    isVideoMode=true;}else{modalImg.style.display='block';
      modalVideo.style.display='none';
      currentIndex=index;
      modalImg.src=src;
      modalImg.alt=caption;
      modalCaption.textContent=caption;
      photoCounter.textContent=`${currentIndex+1} / ${photos.length}`;
      modalContent.classList.add('visible');
      isVideoMode=false;
    }
    modal.style.display='flex';
    document.body.style.overflow='hidden';
    closeBtn.focus();header.inert=true;
    footer.inert=true;
    content.inert=true;
    menu.inert=true;
  }

// Закрити модалку
function closeModal(){modal.style.display='none';
  stopSlideshow();
  audio.pause();
  musicPlaying=false;
  musicBtn.textContent='🎵 Музика';
  modalImg.src='';
  modalVideo.src='';
  document.body.style.overflow='';
  header.inert=false;
  footer.inert=false;
  content.inert=false;
  menu.inert=false;
  if(lastFocusedElement)lastFocusedElement.focus();}

// Перехід фото
function prevImage(){const page=PAGES.find(p=>p.id===currentPageId);
  if(!page||!page.photos||isVideoMode)return;
  fadeImage(currentIndex=(currentIndex-1+page.photos.length)%page.photos.length);
}
function nextImage(){const page=PAGES.find(p=>p.id===currentPageId);
  if(!page||!page.photos||isVideoMode)return;
  currentIndex++;
  if(currentIndex>=page.photos.length){advanceToNextAlbum();
    return;}fadeImage(currentIndex);
  }

// Плавне затемнення
function fadeImage(index){const page=PAGES.find(p=>p.id===currentPageId);
  const{src,caption}=normalizePhoto(page.photos[index],`Фото ${index+1}`);
  modalImg.style.opacity=0;setTimeout(()=>{modalImg.src=src;
    modalImg.alt=caption;modalCaption.textContent=caption;
    photoCounter.textContent=`${index+1} / ${page.photos.length}`;
    modalImg.style.opacity=1;
  },300);
}

// Автоперехід між альбомами
function advanceToNextAlbum(){let currentAlbumIndex=PAGES.findIndex(p=>p.id===currentPageId);
  do{currentAlbumIndex=(currentAlbumIndex+1)%PAGES.length;
  }while(!PAGES[currentAlbumIndex].photos);
  showPage(PAGES[currentAlbumIndex].id);
  currentIndex=0;fadeImage(currentIndex);
}

// Слайдшоу
function toggleSlideshow(){if(slideshowInterval){stopSlideshow();
}else{startSlideshow();
}
}
function startSlideshow(){const page=PAGES.find(p=>p.id===currentPageId);
  if(!page||!page.photos||isVideoMode)return;
  document.getElementById('slideshowStatus').textContent='⏸ Зупинити';
  slideshowInterval=setInterval(nextImage,slideshowSpeed);
  if(!musicPlaying){audio.play().catch(()=>{});
  musicPlaying=true;musicBtn.textContent='🔇 Вимкнути музику';
}
}
function stopSlideshow(){document.getElementById('slideshowStatus').textContent='▶️ Слайдшоу';
  clearInterval(slideshowInterval);
  slideshowInterval=null;
}
function changeSlideshowSpeed(){slideshowSpeed=parseInt(speedSelect.value,10);
  if(slideshowInterval){stopSlideshow();
    startSlideshow();
  }
}

// Клавіатура
document.addEventListener('keydown',e=>{if(modal.style.display==='flex'){if(e.key==='Escape'){closeModal();
}else if(e.key==='ArrowLeft'){prevImage();
}else if(e.key==='ArrowRight'){nextImage();
}
}
}
);

// Свайпи для мобільних
let touchStartX=0,touchEndX=0;
modalContent.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].screenX;});
modalContent.addEventListener('touchend',e=>{touchEndX=e.changedTouches[0].screenX;
  let diff=touchEndX-touchStartX;if(diff>50){prevImage();
  }else if(diff<-50){nextImage();
  }
}
);

// Музика
audio.addEventListener('ended',()=>{if(slideshowInterval){audio.currentTime=0;
  audio.play();
}
}
);
musicBtn.addEventListener('click',()=>{if(musicPlaying){audio.pause();
  musicPlaying=false;
  musicBtn.textContent='🎵 Музика';}else{audio.play().catch(()=>{});
  musicPlaying=true;musicBtn.textContent='🔇 Вимкнути музику';
}
}
);

document.addEventListener('DOMContentLoaded',()=>{showPage(PAGES[0].id);
}
);
