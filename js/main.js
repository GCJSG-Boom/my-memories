/* ============================================
   时光札记 · My Memory Journal — 交互脚本
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ========== 导航栏滚动效果 ==========
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    function updateNavbar() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // 移动端菜单
    navToggle.addEventListener('click', function () {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // 点击导航链接关闭菜单
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // 当前 section 高亮导航
    const sections = document.querySelectorAll('section, header, main');
    const navAs = document.querySelectorAll('.nav-links a');

    function highlightNav() {
        let current = '';
        sections.forEach(function (sec) {
            const top = sec.getBoundingClientRect().top;
            if (top < 200) {
                current = sec.getAttribute('id') || '';
            }
        });
        navAs.forEach(function (a) {
            a.classList.remove('active');
            if (a.getAttribute('href') === '#' + current) {
                a.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });

    // ========== 英雄区粒子效果 ==========
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = (60 + Math.random() * 40) + '%';
            particle.style.width = (2 + Math.random() * 4) + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDuration = (6 + Math.random() * 12) + 's';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // ========== 滚动显示动画 (Intersection Observer) ==========
    const revealEls = document.querySelectorAll('.reveal');
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealEls.forEach(function (el) {
        revealObserver.observe(el);
    });

    // ========== 灯箱 ==========
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let lightboxImages = [];
    let lightboxIndex = 0;

    // 收集所有可点灯箱的图片
    function collectLightboxImages() {
        lightboxImages = [];
        document.querySelectorAll('[data-lightbox]').forEach(function (el) {
            const img = el.querySelector('img');
            if (img) {
                lightboxImages.push({
                    src: img.src,
                    caption: el.getAttribute('data-lightbox') || ''
                });
            }
        });
    }
    collectLightboxImages();

    function openLightbox(index) {
        if (lightboxImages.length === 0) return;
        lightboxIndex = index;
        const item = lightboxImages[lightboxIndex];
        lightboxImg.src = item.src;
        lightboxCaption.textContent = item.caption;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    function prevLightbox() {
        if (lightboxImages.length === 0) return;
        lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        const item = lightboxImages[lightboxIndex];
        lightboxImg.src = item.src;
        lightboxCaption.textContent = item.caption;
    }

    function nextLightbox() {
        if (lightboxImages.length === 0) return;
        lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
        const item = lightboxImages[lightboxIndex];
        lightboxImg.src = item.src;
        lightboxCaption.textContent = item.caption;
    }

    // 事件委托：点击 data-lightbox 元素
    document.addEventListener('click', function (e) {
        const lightboxTrigger = e.target.closest('[data-lightbox]');
        if (lightboxTrigger) {
            e.preventDefault();
            collectLightboxImages(); // 刷新列表
            const src = lightboxTrigger.querySelector('img');
            if (src) {
                const idx = lightboxImages.findIndex(function (item) {
                    return item.src === src.src;
                });
                openLightbox(idx >= 0 ? idx : 0);
            }
        }
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevLightbox);
    lightboxNext.addEventListener('click', nextLightbox);

    // 键盘控制
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevLightbox();
        if (e.key === 'ArrowRight') nextLightbox();
    });

    // 点击背景关闭
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    // ========== 全局音乐播放器 ==========
    const globalAudio = document.getElementById('globalAudio');
    const playerToggle = document.getElementById('playerToggle');
    const playerPanel = document.getElementById('playerPanel');
    const playerCover = document.getElementById('playerCover');
    const playerTitle = document.getElementById('playerTitle');
    const playerArtist = document.getElementById('playerArtist');
    const playerPlay = document.getElementById('playerPlay');
    const playerPrev = document.getElementById('playerPrev');
    const playerNext = document.getElementById('playerNext');
    const playerVolume = document.getElementById('playerVolume');

    let playlist = [];
    let currentTrack = -1;
    let isPlaying = false;

    // 从页面上收集所有 audio 元素构建播放列表
    function collectPlaylist() {
        playlist = [];
        document.querySelectorAll('.music-card-body audio, .music-info audio').forEach(function (audio, index) {
            const card = audio.closest('.music-card-body') || audio.closest('.music-info');
            let title = '未知曲目';
            let artist = '未知艺术家';
            let cover = '';

            if (card) {
                const h4 = card.querySelector('h4');
                const p = card.querySelector('p');
                if (h4) title = h4.textContent;
                if (p) artist = p.textContent;

                // 尝试获取封面
                const cardCover = card.closest('.music-card');
                if (cardCover) {
                    const img = cardCover.querySelector('.music-card-cover img');
                    if (img) cover = img.src;
                }
                const miniCover = card.closest('.music-player-mini');
                if (miniCover) {
                    const img = miniCover.querySelector('.music-cover img');
                    if (img) cover = img.src;
                }
            }

            playlist.push({
                title: title,
                artist: artist,
                cover: cover,
                src: audio.querySelector('source') ? audio.querySelector('source').src : '',
                audioElement: audio
            });
        });
    }

    function loadTrack(index) {
        if (playlist.length === 0) return;
        currentTrack = index;
        const track = playlist[currentTrack];
        globalAudio.src = track.src;
        playerTitle.textContent = track.title;
        playerArtist.textContent = track.artist;
        if (track.cover) {
            playerCover.src = track.cover;
        }
    }

    function playTrack(index) {
        collectPlaylist();
        if (playlist.length === 0) return;
        if (index !== currentTrack) {
            loadTrack(index);
        }
        globalAudio.play().then(function () {
            isPlaying = true;
            playerPlay.innerHTML = '<i class="fas fa-pause"></i>';
        }).catch(function () {
            // 自动播放被阻止
        });
    }

    function togglePlay() {
        if (playlist.length === 0) {
            collectPlaylist();
        }
        if (playlist.length === 0) return;

        if (currentTrack < 0) {
            loadTrack(0);
        }

        if (isPlaying) {
            globalAudio.pause();
            isPlaying = false;
            playerPlay.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            globalAudio.play().then(function () {
                isPlaying = true;
                playerPlay.innerHTML = '<i class="fas fa-pause"></i>';
            }).catch(function () {});
        }
    }

    function prevTrack() {
        collectPlaylist();
        if (playlist.length === 0) return;
        const idx = currentTrack <= 0 ? playlist.length - 1 : currentTrack - 1;
        playTrack(idx);
    }

    function nextTrack() {
        collectPlaylist();
        if (playlist.length === 0) return;
        const idx = currentTrack >= playlist.length - 1 ? 0 : currentTrack + 1;
        playTrack(idx);
    }

    // 播放器面板
    playerToggle.addEventListener('click', function () {
        playerPanel.classList.toggle('open');
    });

    playerPlay.addEventListener('click', togglePlay);
    playerPrev.addEventListener('click', prevTrack);
    playerNext.addEventListener('click', nextTrack);

    playerVolume.addEventListener('input', function () {
        globalAudio.volume = this.value / 100;
    });
    globalAudio.volume = 0.5;

    globalAudio.addEventListener('ended', nextTrack);

    globalAudio.addEventListener('play', function () {
        isPlaying = true;
        playerPlay.innerHTML = '<i class="fas fa-pause"></i>';
    });

    globalAudio.addEventListener('pause', function () {
        isPlaying = false;
        playerPlay.innerHTML = '<i class="fas fa-play"></i>';
    });

    // 点击页面上的 audio 元素时同步到全局播放器
    document.addEventListener('play', function (e) {
        if (e.target.tagName === 'AUDIO' && e.target !== globalAudio) {
            // 用户点击了页面内嵌的 audio
            collectPlaylist();
            const src = e.target.querySelector('source');
            if (src) {
                const idx = playlist.findIndex(function (t) { return t.src === src.src; });
                if (idx >= 0 && idx !== currentTrack) {
                    // 暂停全局播放器，让页面内嵌播放器播放
                    globalAudio.pause();
                    isPlaying = false;
                    playerPlay.innerHTML = '<i class="fas fa-play"></i>';

                    // 同步信息
                    currentTrack = idx;
                    const track = playlist[currentTrack];
                    playerTitle.textContent = track.title;
                    playerArtist.textContent = track.artist;
                    if (track.cover) playerCover.src = track.cover;
                    globalAudio.src = track.src;
                }
            }
        }
    }, true);

    // 点击面板外关闭
    document.addEventListener('click', function (e) {
        if (!playerPanel.contains(e.target) && e.target !== playerToggle && !playerToggle.contains(e.target)) {
            playerPanel.classList.remove('open');
        }
    });

    // ========== "阅读更多" 展开效果 ==========
    document.querySelectorAll('[data-expand]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const card = this.closest('.card-body');
            const text = card.querySelector('.card-text');
            if (text) {
                const isExpanded = text.style.maxHeight;
                if (isExpanded) {
                    text.style.maxHeight = '';
                    text.style.overflow = '';
                    this.innerHTML = '阅读更多 <i class="fas fa-arrow-right"></i>';
                } else {
                    text.style.maxHeight = text.scrollHeight + 'px';
                    text.style.overflow = 'visible';
                    this.innerHTML = '收起 <i class="fas fa-arrow-up"></i>';
                }
            }
        });
    });

    // ========== 初始化完成 ==========
    console.log('🌸 时光札记已就绪 — 愿每一个瞬间都被温柔铭记。');
});
