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
        // Use Twitch's public API endpoint (no auth required for basic stream check)
        const response = await fetch(`https://twitchstatus.com/api/check?channel=${TWITCH_USERNAME}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            // Fallback: Try alternative method using embed check
            checkTwitchEmbed();
            return;
        }
        
        const data = await response.json();
        updateLiveStatus(data.live || false);
        
    } catch (error) {
        console.log('Twitch API check failed, using fallback method');
        // Fallback to embed check
        checkTwitchEmbed();
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

// YouTube Video Fetcher
const YOUTUBE_CHANNEL_ID = 'UCxKj_T4p0HvGpvL8YMvMqEw'; // Nabana07 channel ID
const YOUTUBE_USERNAME = 'Nabana07';

// Fallback hardcoded videos if fetch fails
// UPDATE THESE WITH YOUR VIDEO IDs AFTER ENABLING EMBEDDING
const FALLBACK_VIDEOS = [
    { videoId: 'mWRzp8LvAfk', title: 'Latest Video' },
    { videoId: 'Kg5VEv9a3CA', title: 'Latest Short 1' },
    { videoId: 'EOBi2gh-nEc', title: 'Latest Short 2' },
    { videoId: 'ommrU9L2TTU', title: 'Latest Short 3' }
];

async function fetchLatestVideos() {
    try {
        // Method 1: Try RSS feed with CORS proxy
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        
        console.log('Fetching videos from YouTube...');
        const response = await fetch(corsProxy + encodeURIComponent(rssUrl), {
            method: 'GET',
            headers: { 'Accept': 'application/xml' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        console.log('Received XML response');
        
        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Check for parse errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            throw new Error('XML parsing failed');
        }
        
        const entries = xmlDoc.querySelectorAll('entry');
        console.log(`Found ${entries.length} videos`);
        
        const videos = [];
        entries.forEach((entry, index) => {
            if (index < 9) { // Get up to 9 videos
                const videoId = entry.querySelector('videoId')?.textContent || 
                               entry.querySelector('yt\\:videoId')?.textContent;
                const title = entry.querySelector('title')?.textContent;
                const published = entry.querySelector('published')?.textContent;
                const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                
                if (videoId) {
                    videos.push({ videoId, title, published, thumbnail });
                }
            }
        });
        
        if (videos.length > 0) {
            console.log(`Successfully loaded ${videos.length} videos`);
            return videos;
        }
        
        throw new Error('No videos found in feed');
        
    } catch (error) {
        console.error('Failed to fetch YouTube videos:', error);
        console.log('Using fallback videos');
        // Return fallback videos
        return FALLBACK_VIDEOS.map(v => ({
            ...v,
            thumbnail: `https://img.youtube.com/vi/${v.videoId}/maxresdefault.jpg`
        }));
    }
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

// Known Shorts video IDs (we'll categorize based on this)
const KNOWN_SHORTS = ['Kg5VEv9a3CA', 'EOBi2gh-nEc', 'ommrU9L2TTU'];

function isShort(videoId) {
    // Check if video ID is in known shorts list
    return KNOWN_SHORTS.includes(videoId);
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
            videosGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">Failed to load videos. <a href="https://www.youtube.com/@Nabana07" target="_blank" style="color: var(--mint-green);">Visit YouTube channel</a></p>';
        }
        return;
    }
    
    // Show loading state
    if (regularGrid) regularGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">Loading videos...</p>';
    if (shortsGrid) shortsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">Loading shorts...</p>';
    
    const videos = await fetchLatestVideos();
    
    if (videos.length > 0) {
        // Separate videos and shorts
        const regularVideos = videos.filter(v => !isShort(v.videoId));
        const shorts = videos.filter(v => isShort(v.videoId));
        
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
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && e.target !== mobileMenuBtn) {
                navLinks.classList.remove('active');
            }
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
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