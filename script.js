// Production-Ready JavaScript for Nabana Website

// Configuration
const TWITCH_USERNAME = 'nabana07';
const CHECK_INTERVAL = 60000; // Check every 60 seconds

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Tab functionality for content section
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all content
        document.getElementById('videos-content').classList.add('hidden');
        document.getElementById('shorts-content').classList.add('hidden');
        
        // Show selected content
        const tabName = this.getAttribute('data-tab');
        document.getElementById(`${tabName}-content`).classList.remove('hidden');
    });
});

// Add active class to navigation links based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const navHeight = document.querySelector('.navbar').offsetHeight;
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Debounce function for scroll performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add scroll event listener with debounce
window.addEventListener('scroll', debounce(updateActiveNavLink, 50));

// Twitch Live Detection System
async function checkTwitchLiveStatus() {
    try {
        // Use decapi.me - a reliable public Twitch API proxy
        const response = await fetch(`https://decapi.me/twitch/uptime/${TWITCH_USERNAME}`);
        const text = await response.text();
        
        // If response is a valid uptime (not "channel is offline"), stream is live
        const isLive = !text.includes('offline') && !text.includes('error') && text.trim().length > 0;
        
        updateLiveStatus(isLive);
        
    } catch (error) {
        console.log('Twitch live check failed:', error);
        // Default to offline on error
        updateLiveStatus(false);
    }
}

// Fallback method: Check using Twitch embed
function checkTwitchEmbed() {
    // Create a hidden iframe to check if stream is live
    const testFrame = document.createElement('iframe');
    testFrame.style.display = 'none';
    testFrame.src = `https://player.twitch.tv/?channel=${TWITCH_USERNAME}&parent=${window.location.hostname}&muted=true`;
    
    testFrame.onload = function() {
        // If iframe loads successfully, assume stream might be live
        // This is a basic check - in production you'd want proper API access
        setTimeout(() => {
            document.body.removeChild(testFrame);
        }, 2000);
    };
    
    document.body.appendChild(testFrame);
    
    // For now, keep offline as default
    updateLiveStatus(false);
}

// Update UI based on live status
function updateLiveStatus(isLive) {
    const liveIndicator = document.getElementById('live-indicator');
    const offlineState = document.getElementById('offline-state');
    const liveState = document.getElementById('live-state');
    
    if (isLive) {
        // Show live indicator in hero
        if (liveIndicator) {
            liveIndicator.style.display = 'inline-flex';
        }
        
        // Show live stream embed
        if (offlineState && liveState) {
            offlineState.style.display = 'none';
            liveState.style.display = 'block';
            
            // Initialize Twitch embed
            initTwitchEmbed();
        }
    } else {
        // Hide live indicator
        if (liveIndicator) {
            liveIndicator.style.display = 'none';
        }
        
        // Show offline state
        if (offlineState && liveState) {
            offlineState.style.display = 'block';
            liveState.style.display = 'none';
        }
    }
}

// Initialize Twitch embed player
function initTwitchEmbed() {
    const embedContainer = document.getElementById('twitch-embed');
    if (!embedContainer || embedContainer.hasChildNodes()) return;
    
    try {
        new Twitch.Embed('twitch-embed', {
            width: '100%',
            height: '100%',
            channel: TWITCH_USERNAME,
            layout: 'video',
            autoplay: false,
            muted: false,
            theme: 'dark',
            parent: [window.location.hostname, 'nabanaa07.github.io']
        });
    } catch (error) {
        console.log('Twitch embed initialization failed:', error);
    }
}

// Load YouTube video player on click
function loadVideo(thumbnail) {
    const videoCard = thumbnail.closest('.video-card');
    const videoId = videoCard.getAttribute('data-video-id');
    
    // Create iframe with proper YouTube embed format
    const iframe = document.createElement('iframe');
    
    // Use YouTube's exact embed format
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.title = 'YouTube video player';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    
    // Styling
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    // Replace thumbnail with iframe
    thumbnail.innerHTML = '';
    thumbnail.appendChild(iframe);
    
    console.log(`Loading video: ${videoId}`);
}

// YouTube Configuration
const YOUTUBE_CHANNEL_ID = 'UCxKj_T4p0HvGpvL8YMvMqEw'; // Nabana07's channel ID
const MAX_VIDEOS = 15; // Number of videos to fetch

// YouTube Data API v3 key
const YOUTUBE_API_KEY = 'AIzaSyAs1lIFGHmWwyxANPaDsnd82Wl2VfXSNN0';

// Fallback videos in case RSS feed fails
const FALLBACK_VIDEOS = [
    { videoId: 'mWRzp8LvAfk', title: 'Latest Video', type: 'regular' },
    { videoId: 'Kg5VEv9a3CA', title: 'Short 1', type: 'short' }
];

// Known shorts video IDs - update this when you publish new shorts
const KNOWN_SHORTS = [
    'Kg5VEv9a3CA',
    'EOBi2gh-nEc',
    'ommrU9L2TTU'
];

// Fetch videos from YouTube using API v3 or RSS fallback
async function fetchLatestVideos() {
    // Try YouTube Data API v3 first (if API key is provided)
    if (YOUTUBE_API_KEY) {
        try {
            console.log('Fetching videos from YouTube Data API v3...');
            
            const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=${MAX_VIDEOS}&type=video`;
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error ${response.status}:`, errorText);
                throw new Error(`API returned ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.items && data.items.length > 0) {
                const videos = data.items.map(item => {
                    const videoId = item.id.videoId;
                    const title = item.snippet.title;
                    const isShort = KNOWN_SHORTS.includes(videoId);
                    
                    return {
                        videoId,
                        title,
                        type: isShort ? 'short' : 'regular',
                        thumbnail: item.snippet.thumbnails.high?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                    };
                });
                
                console.log(`Successfully loaded ${videos.length} videos from YouTube API`);
                return videos;
            }
        } catch (error) {
            console.warn('YouTube API failed:', error.message);
            console.log('Falling back to RSS feed...');
        }
    }
    
    // Fallback to RSS feed with CORS proxies
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
    const corsProxies = [
        `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`
    ];
    
    for (const proxyUrl of corsProxies) {
        try {
            console.log('Trying RSS feed via CORS proxy...');
            const response = await fetch(proxyUrl, { 
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) continue;
            
            const xmlText = await response.text();
            
            if (!xmlText.includes('<?xml') && !xmlText.includes('<feed')) continue;
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            if (xmlDoc.querySelector('parsererror')) continue;
            
            let entries = xmlDoc.querySelectorAll('entry');
            if (entries.length === 0) entries = xmlDoc.getElementsByTagName('entry');
            if (entries.length === 0) continue;
            
            const videos = [];
            
            entries.forEach((entry, index) => {
                if (index >= MAX_VIDEOS) return;
                
                let videoId = entry.querySelector('videoId')?.textContent;
                if (!videoId) {
                    const ytVideoId = entry.getElementsByTagName('yt:videoId')[0];
                    videoId = ytVideoId?.textContent;
                }
                if (!videoId) {
                    const link = entry.querySelector('link')?.getAttribute('href');
                    if (link) {
                        const match = link.match(/watch\?v=([^&]+)/);
                        videoId = match?.[1];
                    }
                }
                
                const title = entry.querySelector('title')?.textContent;
                
                if (videoId && title) {
                    const isShort = KNOWN_SHORTS.includes(videoId);
                    videos.push({
                        videoId,
                        title,
                        type: isShort ? 'short' : 'regular',
                        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                    });
                }
            });
            
            if (videos.length > 0) {
                console.log(`Successfully loaded ${videos.length} videos from RSS feed`);
                return videos;
            }
        } catch (error) {
            continue;
        }
    }
    
    // All methods failed, use fallback
    console.warn('All fetch methods failed, using fallback videos');
    return FALLBACK_VIDEOS.map(v => ({
        ...v,
        thumbnail: `https://img.youtube.com/vi/${v.videoId}/maxresdefault.jpg`
    }));
}

function renderVideos(videos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.setAttribute('data-video-id', video.videoId);
        
        videoCard.innerHTML = `
            <div class="video-thumbnail" onclick="loadVideo(this)">
                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg'">
                <div class="play-button">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
        `;
        
        container.appendChild(videoCard);
    });
}

function isShort(video) {
    // Check if video is marked as a short
    return video.type === 'short';
}

function createVideoCard(video) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.setAttribute('data-video-id', video.videoId);
    
    videoCard.innerHTML = `
        <div class="video-thumbnail" onclick="loadVideo(this)">
            <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg'">
            <div class="play-button">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
        </div>
    `;
    
    return videoCard;
}

async function loadYouTubeVideos() {
    const regularGrid = document.getElementById('regular-videos');
    const shortsGrid = document.getElementById('shorts-videos');
    
    // Show loading state
    if (regularGrid) regularGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">Loading videos...</p>';
    if (shortsGrid) shortsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">Loading shorts...</p>';
    
    // Check if we're on the videos page
    if (!regularGrid && !shortsGrid) {
        const videosGrid = document.querySelector('.videos-grid');
        if (!videosGrid) return;
        
        // Fallback for single grid (homepage or other pages)
        videosGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">Loading videos...</p>';
        const videos = await fetchLatestVideos();
        
        if (videos.length > 0) {
            videosGrid.innerHTML = '';
            videos.forEach(video => {
                videosGrid.appendChild(createVideoCard(video));
            });
        } else {
            videosGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">No videos configured. <a href="https://www.youtube.com/@Nabana07" target="_blank" style="color: var(--mint-green);">Visit YouTube channel</a></p>';
        }
        return;
    }
    
    const videos = await fetchLatestVideos();
    
    if (videos.length > 0) {
        // Separate videos and shorts
        const regularVideos = videos.filter(v => !isShort(v));
        const shorts = videos.filter(v => isShort(v));
        
        // Render regular videos
        if (regularGrid) {
            regularGrid.innerHTML = '';
            if (regularVideos.length > 0) {
                regularVideos.forEach(video => {
                    regularGrid.appendChild(createVideoCard(video));
                });
            } else {
                regularGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">No regular videos yet. Check back soon!</p>';
            }
        }
        
        // Render shorts
        if (shortsGrid) {
            shortsGrid.innerHTML = '';
            if (shorts.length > 0) {
                shorts.forEach(video => {
                    shortsGrid.appendChild(createVideoCard(video));
                });
            } else {
                shortsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">No shorts yet. Check back soon!</p>';
            }
        }
    } else {
        if (regularGrid) regularGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">Failed to load videos. <a href="https://www.youtube.com/@Nabana07" target="_blank" style="color: var(--mint-green);">Visit YouTube channel</a></p>';
        if (shortsGrid) shortsGrid.innerHTML = '';
    }
}

// Theme Effects Configuration
const themeEffects = {
    'egirl': ['💕', '💖', '🎀', '✨', '💗', '🌸', '💝', '🦄'],
    'banana': ['🍌', '🐵', '🦍', '🍞', '🥐'],
    'chocolate': ['🍫', '🍪', '☕', '🧁', '🎂'],
    'light': ['☀️', '🌟', '⭐', '✨', '💡'],
    'dark': ['🌙', '✨', '⭐', '🌃'],
    'extra-dark': ['🌑', '🖤', '💀', '🦇']
};

// Create falling animation
function createFallingEffect(theme) {
    const container = document.getElementById('theme-effects');
    if (!container) return;
    
    // Clear existing effects
    container.innerHTML = '';
    
    const emojis = themeEffects[theme];
    if (!emojis) return;
    
    // Create 15 falling items
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const item = document.createElement('div');
            item.className = 'falling-item';
            item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            item.style.left = Math.random() * 100 + '%';
            item.style.animationDuration = (Math.random() * 2 + 3) + 's';
            item.style.fontSize = (Math.random() * 1.5 + 1.5) + 'rem';
            
            container.appendChild(item);
            
            // Remove after animation
            setTimeout(() => {
                item.remove();
            }, 5000);
        }, i * 100);
    }
}

// Theme Switcher Functionality
function initThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('nabana-theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Toggle menu
    if (themeToggle && themeMenu) {
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = themeMenu.style.display === 'block';
            themeMenu.style.display = isVisible ? 'none' : 'block';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            themeMenu.style.display = 'none';
        });
        
        themeMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('nabana-theme', theme);
            
            // Trigger falling effect
            createFallingEffect(theme);
            
            if (themeMenu) {
                themeMenu.style.display = 'none';
            }
        });
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.getElementById('mobile-overlay');
    
    function closeMenu() {
        navLinks.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset to hamburger icon
        const svg = mobileMenuBtn.querySelector('svg');
        if (svg) {
            svg.innerHTML = '<path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/>';
        }
    }
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = navLinks.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
            
            // Toggle body scroll
            document.body.style.overflow = isActive ? 'hidden' : '';
            
            // Update hamburger icon
            const svg = mobileMenuBtn.querySelector('svg');
            if (svg) {
                svg.innerHTML = isActive 
                    ? '<path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>'
                    : '<path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/>';
            }
        });
        
        // Close menu when clicking overlay
        if (overlay) {
            overlay.addEventListener('click', closeMenu);
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                if (navLinks.classList.contains('active')) {
                    closeMenu();
                }
            }
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initThemeSwitcher();
    updateActiveNavLink();
    
    // Load YouTube videos if on videos page
    if (document.querySelector('.videos-grid')) {
        loadYouTubeVideos();
    }
    
    // Check Twitch live status immediately
    checkTwitchLiveStatus();
    
    // Set up interval to check periodically
    setInterval(checkTwitchLiveStatus, CHECK_INTERVAL);
    
    // Add fade-in animation to sections on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all sections for fade-in effect
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });
    
    // Smooth reveal for hero content
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '1';
        }
    }, 100);
});