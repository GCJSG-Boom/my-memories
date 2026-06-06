/* ============================================
   时光札记 · My Memory Journal — 交互脚本
   包含动态内容加载 + 交互功能
   ============================================ */

document.addEventListener('DOMContentLoaded', async function () {

    // ==========================================
    // 第 0 步：从 JSON 文件加载动态内容
    // ==========================================
    await loadAllContent();

    // ==========================================
    // 第 1 步：导航栏滚动效果
    // ==========================================
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
    if (navToggle) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
    }

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

    // ==========================================
    // 第 2 步：英雄区粒子效果
    // ==========================================
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

    // ==========================================
    // 第 3 步：滚动显示动画
    // ==========================================
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

    // ==========================================
    // 第 4 步：灯箱
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let lightboxImages = [];
    let lightboxIndex = 0;

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

    document.addEventListener('click', function (e) {
        const lightboxTrigger = e.target.closest('[data-lightbox]');
        if (lightboxTrigger) {
            e.preventDefault();
            collectLightboxImages();
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

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevLightbox();
        if (e.key === 'ArrowRight') nextLightbox();
    });

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    // ==========================================
    // 第 5 步：全局音乐播放器
    // ==========================================
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

    document.addEventListener('play', function (e) {
        if (e.target.tagName === 'AUDIO' && e.target !== globalAudio) {
            collectPlaylist();
            const src = e.target.querySelector('source');
            if (src) {
                const idx = playlist.findIndex(function (t) { return t.src === src.src; });
                if (idx >= 0 && idx !== currentTrack) {
                    globalAudio.pause();
                    isPlaying = false;
                    playerPlay.innerHTML = '<i class="fas fa-play"></i>';

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

    document.addEventListener('click', function (e) {
        if (!playerPanel.contains(e.target) && e.target !== playerToggle && !playerToggle.contains(e.target)) {
            playerPanel.classList.remove('open');
        }
    });

    // ==========================================
    // 第 6 步："阅读更多" 展开效果
    // ==========================================
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

    // ==========================================
    // 初始化完成
    // ==========================================
    console.log('🌸 时光札记已就绪 — 愿每一个瞬间都被温柔铭记。');
});

// ============================================================
// 动态内容加载函数
// ============================================================

/** 标签类型 → CSS 类名 / 图标 / 文字 映射 */
var TAG_MAP = {
    video:  { cls: 'tag-video',  icon: 'fa-video',   label: '视频' },
    photo:  { cls: 'tag-photo',  icon: 'fa-camera',  label: '照片' },
    music:  { cls: 'tag-music',  icon: 'fa-music',   label: '音乐' },
    travel: { cls: 'tag-travel', icon: 'fa-plane',   label: '旅行' },
    life:   { cls: 'tag-life',   icon: 'fa-heart',   label: '生活' }
};

/** 中文月份缩写 */
var MONTHS_CN = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

/**
 * 从 "YYYY-MM-DD" 格式解析出日、月、年
 */
function parseDate(dateStr) {
    var parts = dateStr.split('-');
    if (parts.length !== 3) return { day: '??', month: '??月', year: '????' };
    var monthIndex = parseInt(parts[1], 10) - 1;
    return {
        day: parseInt(parts[2], 10).toString(),
        month: MONTHS_CN[monthIndex] || (parts[1] + '月'),
        year: parts[0]
    };
}

/**
 * 加载所有动态内容
 */
async function loadAllContent() {
    // 并行加载所有内容文件
    var results = await Promise.allSettled([
        fetch('/content/site.json').then(function(r) { return r.ok ? r.json() : null; }),
        fetch('/content/timeline.json').then(function(r) { return r.ok ? r.json() : null; }),
        fetch('/content/gallery.json').then(function(r) { return r.ok ? r.json() : null; }),
        fetch('/content/music.json').then(function(r) { return r.ok ? r.json() : null; })
    ]);

    var siteData   = results[0].status === 'fulfilled' ? results[0].value : null;
    var timelineData = results[1].status === 'fulfilled' ? results[1].value : null;
    var galleryData  = results[2].status === 'fulfilled' ? results[2].value : null;
    var musicData    = results[3].status === 'fulfilled' ? results[3].value : null;

    // 提取列表（JSON 文件使用命名字段包裹）
    var timeline  = timelineData ? (timelineData.entries || timelineData) : null;
    var gallery   = galleryData  ? (galleryData.images  || galleryData)  : null;
    var musicList = musicData    ? (musicData.songs    || musicData)    : null;

    // 应用网站设置
    if (siteData) applySiteSettings(siteData);

    // 渲染各区块
    if (timeline && Array.isArray(timeline) && timeline.length > 0)  renderTimeline(timeline);
    if (gallery && Array.isArray(gallery) && gallery.length > 0)     renderGallery(gallery);
    if (musicList && Array.isArray(musicList) && musicList.length > 0) renderMusic(musicList);

    // 重新初始化滚动观察（因为新增了 .reveal 元素）
    resetRevealObserver();
}

/**
 * 将 site.json 的数据应用到页面
 */
function applySiteSettings(data) {
    var hero = data.hero || {};
    var about = data.about || {};
    var social = data.social || {};
    var footer = data.footer || {};

    // 英雄区
    setText('heroSubtitle', hero.hero_subtitle);
    setText('heroTitle', hero.hero_title);
    setHtml('heroDesc', hero.hero_desc);

    // 关于我
    setText('aboutTitle', about.about_title);
    setHtml('aboutBody', (about.about_body || '').replace(/\n/g, '<br>'));
    var avatarImg = document.getElementById('aboutAvatar');
    if (avatarImg && about.about_avatar) { avatarImg.src = about.about_avatar; }

    // 社交链接
    var socialLinks = document.querySelectorAll('.about-social a');
    var socialKeys = ['social_github', 'social_twitter', 'social_instagram', 'social_email'];
    socialKeys.forEach(function(key, i) {
        if (socialLinks[i] && social[key]) {
            socialLinks[i].setAttribute('href', social[key]);
        }
    });

    // 页脚
    setText('footerCopyright', footer.footer_copyright);
    setText('footerQuote', footer.footer_quote);
}

/**
 * 渲染时光轴
 */
function renderTimeline(entries) {
    var container = document.getElementById('timelineContainer');
    if (!container) return;

    var html = '';
    entries.forEach(function(entry) {
        var tag = TAG_MAP[entry.tag_type] || TAG_MAP['life'];
        var date = parseDate(entry.date);

        html += '<article class="timeline-card reveal" data-date="' + entry.date + '">';
        html += '  <div class="card-date">';
        html += '    <span class="date-day">' + date.day + '</span>';
        html += '    <span class="date-month">' + date.month + '</span>';
        html += '    <span class="date-year">' + date.year + '</span>';
        html += '  </div>';
        html += '  <div class="card-body">';
        html += '    <div class="card-tag ' + tag.cls + '"><i class="fas ' + tag.icon + '"></i> ' + tag.label + '</div>';
        html += '    <h3 class="card-title">' + escapeHtml(entry.title) + '</h3>';
        html += '    <p class="card-text">' + escapeHtml(entry.body || '') + '</p>';

        // 媒体区域
        if (entry.media_type === 'video' && entry.video_url) {
            html += '    <div class="card-media"><div class="video-wrapper">';
            html += '      <video controls' + (entry.video_poster ? ' poster="' + entry.video_poster + '"' : '') + ' preload="metadata">';
            html += '        <source src="' + entry.video_url + '" type="video/mp4">';
            html += '        您的浏览器不支持视频播放。';
            html += '      </video>';
            html += '    </div></div>';
        } else if (entry.media_type === 'image' && entry.images && entry.images.length > 0) {
            html += '    <div class="card-media"><div class="card-media-grid">';
            entry.images.forEach(function(img) {
                var extraClass = img.portrait ? ' portrait' : '';
                html += '      <div class="img-card' + extraClass + '" data-lightbox="' + escapeAttr(img.caption || entry.title) + '">';
                html += '        <img src="' + img.src + '" alt="' + escapeAttr(img.caption || '') + '" loading="lazy">';
                html += '      </div>';
            });
            html += '    </div></div>';
        } else if (entry.media_type === 'music') {
            var coverUrl = entry.audio_cover || 'https://picsum.photos/seed/default/200/200';
            html += '    <div class="card-media"><div class="music-player-mini">';
            html += '      <div class="music-cover">';
            html += '        <img src="' + coverUrl + '" alt="封面" loading="lazy">';
            html += '        <div class="music-vinyl"></div>';
            html += '      </div>';
            html += '      <div class="music-info">';
            html += '        <span class="music-title">' + escapeHtml(entry.audio_title || '') + '</span>';
            html += '        <span class="music-artist">' + escapeHtml(entry.audio_artist || '') + '</span>';
            if (entry.audio_url) {
                html += '        <audio controls><source src="' + entry.audio_url + '" type="audio/mpeg"></audio>';
            }
            html += '      </div>';
            html += '    </div></div>';
        }

        html += '    <div class="card-footer">';
        if (entry.location) {
            html += '      <span class="card-location"><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(entry.location) + '</span>';
        }
        html += '      <button class="card-more" data-expand>阅读更多 <i class="fas fa-arrow-right"></i></button>';
        html += '    </div>';
        html += '  </div>';
        html += '</article>';
    });

    container.innerHTML = html;
}

/**
 * 渲染映像集（瀑布流图片）
 */
function renderGallery(images) {
    var container = document.getElementById('galleryContainer');
    if (!container) return;

    var html = '';
    images.forEach(function(item) {
        var sizeClass = item.size || '';
        html += '<div class="gallery-item' + (sizeClass ? ' ' + sizeClass : '') + '" data-lightbox="' + escapeAttr('映像 · ' + item.title) + '">';
        html += '  <img src="' + item.image + '" alt="' + escapeAttr(item.title) + '" loading="lazy">';
        html += '  <div class="gallery-item-overlay"><span>' + escapeHtml(item.title) + '</span></div>';
        html += '</div>';
    });

    container.innerHTML = html;
}

/**
 * 渲染音乐盒
 */
function renderMusic(songs) {
    var container = document.getElementById('musicContainer');
    if (!container) return;

    var html = '';
    songs.forEach(function(song) {
        html += '<div class="music-card reveal">';
        html += '  <div class="music-card-cover">';

        if (song.type === 'bilibili' && song.bvid) {
            // B站嵌入
            html += '    <iframe src="//player.bilibili.com/player.html?bvid=' + song.bvid + '&page=1&autoplay=0"';
            html += '            scrolling="no" border="0" frameborder="no" framespacing="0"';
            html += '            allowfullscreen="true" loading="lazy"';
            html += '            style="width:100%;height:100%;aspect-ratio:16/9;border-radius:14px;">';
            html += '    </iframe>';
        } else {
            // 普通封面 + 播放按钮
            var coverSrc = song.cover || 'https://picsum.photos/seed/music' + Math.random() + '/400/300';
            html += '    <img src="' + coverSrc + '" alt="' + escapeAttr(song.title) + '" loading="lazy">';
            html += '    <div class="music-card-play"><i class="fas fa-play"></i></div>';
        }

        html += '  </div>';
        html += '  <div class="music-card-body">';
        html += '    <h4>' + escapeHtml(song.title) + '</h4>';
        html += '    <p>' + escapeHtml(song.artist) + '</p>';

        if (song.type === 'audio' && song.audio_url) {
            html += '    <audio controls><source src="' + song.audio_url + '" type="audio/mpeg"></audio>';
        } else if (song.type === 'bilibili' && song.bvid) {
            html += '    <span class="card-tag tag-music" style="font-size:0.75rem;">';
            html += '      <i class="fas fa-play-circle"></i> B站播放';
            html += '    </span>';
        }

        html += '  </div>';
        html += '</div>';
    });

    container.innerHTML = html;
}

/**
 * 重新注册滚动观察器（渲染动态内容后调用）
 */
function resetRevealObserver() {
    var observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(function(el) {
        observer.observe(el);
    });
}

// ============================================================
// 工具函数
// ============================================================

/** 安全设置元素的文本内容 */
function setText(id, text) {
    var el = document.getElementById(id);
    if (el && text !== undefined && text !== null) {
        el.textContent = text;
    }
}

/** 安全设置元素的 HTML 内容 */
function setHtml(id, html) {
    var el = document.getElementById(id);
    if (el && html !== undefined && html !== null) {
        el.innerHTML = html;
    }
}

/** 转义 HTML 特殊字符 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** 转义 HTML 属性值 */
function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
