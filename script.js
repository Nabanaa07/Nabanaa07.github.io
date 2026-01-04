// Production-Ready JavaScript for Nabana Website

// Configuration
const TWITCH_USERNAME = 'nabana07';
const CHECK_INTERVAL = 60000; // Check every 60 seconds

// ====== Page Loading System ======
// Hide loader when page is fully loaded
window.addEventListener('load', function() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        // Add a small delay to ensure content is painted
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 100);
    }
});

// Show loader on page navigation
window.addEventListener('beforeunload', function() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.classList.remove('hidden');
    }
});

// Intercept navigation links to show loader
document.addEventListener('DOMContentLoaded', function() {
    // Get all internal navigation links
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href$=".html"], a.nav-link, .btn-primary[href$=".html"], .link-card[href$=".html"]');
    
    internalLinks.forEach(link => {
        // Skip external links and hash links
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || link.hasAttribute('target')) {
            return;
        }
        
        link.addEventListener('click', function(e) {
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.classList.remove('hidden');
            }
        });
    });
});
// ====== End Page Loading System ======

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

// YouTube setup
const YOUTUBE_CHANNEL_ID = 'UCUehKKFJqxTRTzZWoqB9taw';
const MAX_VIDEOS = 50;
const YOUTUBE_API_KEY = 'AIzaSyAs1lIFGHmWwyxANPaDsnd82Wl2VfXSNN0';

// Parse YouTube duration format (PT1M30S) to seconds
function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '') || 0;
    const minutes = (match[2] || '').replace('M', '') || 0;
    const seconds = (match[3] || '').replace('S', '') || 0;
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
}

// Format seconds to MM:SS or HH:MM:SS
function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// Format view count (7200 -> 7.2K)
function formatViews(views) {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
}

// Time ago (e.g., "1 day ago")
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
}

async function fetchLatestVideos() {
    if (YOUTUBE_API_KEY) {
        try {
            console.log('Fetching videos from YouTube API...');
            
            // Get uploads playlist, channel info, and statistics
            const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_API_KEY}&id=${YOUTUBE_CHANNEL_ID}&part=contentDetails,snippet,statistics`;
            const channelResponse = await fetch(channelUrl);
            
            if (!channelResponse.ok) {
                throw new Error(`Channel API error: ${channelResponse.status}`);
            }
            
            const channelData = await channelResponse.json();
            if (!channelData.items || channelData.items.length === 0) {
                throw new Error('Channel not found');
            }
            
            const channelInfo = {
                name: channelData.items[0].snippet.title,
                avatar: channelData.items[0].snippet.thumbnails.default.url
            };
            
            channelStats = {
                subscribers: parseInt(channelData.items[0].statistics.subscriberCount),
                totalViews: parseInt(channelData.items[0].statistics.viewCount),
                totalVideos: parseInt(channelData.items[0].statistics.videoCount)
            };
            
            const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
            
            // Fetch videos from playlist
            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${MAX_VIDEOS}`;
            const playlistResponse = await fetch(playlistUrl);
            
            if (!playlistResponse.ok) {
                throw new Error(`Playlist API error: ${playlistResponse.status}`);
            }
            
            const playlistData = await playlistResponse.json();
            
            if (playlistData.items && playlistData.items.length > 0) {
                const videoIds = playlistData.items.map(item => item.snippet.resourceId.videoId);
                
                // Get video details including duration and view counts
                const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds.join(',')}&part=snippet,contentDetails,statistics`;
                const detailsResponse = await fetch(detailsUrl);
                
                if (!detailsResponse.ok) {
                    throw new Error(`Video details API error: ${detailsResponse.status}`);
                }
                
                const detailsData = await detailsResponse.json();
                
                const videos = detailsData.items.map(item => {
                    const videoId = item.id;
                    const title = item.snippet.title;
                    const duration = item.contentDetails.duration;
                    const views = parseInt(item.statistics.viewCount) || 0;
                    const publishedAt = new Date(item.snippet.publishedAt);
                    
                    const isShort = title.toLowerCase().includes('#shorts');
                    
                    return {
                        videoId,
                        title,
                        type: isShort ? 'short' : 'regular',
                        views,
                        publishedAt,
                        duration: formatDuration(parseDuration(duration)),
                        thumbnail: item.snippet.thumbnails.high?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                        channelName: channelInfo.name,
                        channelAvatar: channelInfo.avatar
                    };
                });
                
                console.log(`Loaded ${videos.length} videos`);
                return videos;
            }
        } catch (error) {
            console.error('YouTube API failed:', error);
        }
    }
    
    return [];
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

// Store all videos for filtering
let allVideos = [];
let currentFilter = 'all';
let currentView = 'grid';
let channelStats = {};

function createVideoCardWithInfo(video, viewType = 'grid') {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.setAttribute('data-video-id', video.videoId);
    videoCard.setAttribute('data-type', video.type);
    
    const durationBadge = video.type === 'short' 
        ? `<div class="shorts-badge"><img src="icons/png/youtube-shorts-icon.png" alt="Shorts" style="width: 24px; height: 24px;"></div>`
        : `<div class="duration-badge">${video.duration}</div>`;
    
    if (viewType === 'list') {
        videoCard.innerHTML = `
            <div class="video-thumbnail" onclick="loadVideo(this)">
                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg'">
                ${durationBadge}
                <div class="play-button">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-meta">
                    <span>${formatViews(video.views)} views</span>
                    <span> • </span>
                    <span>${timeAgo(video.publishedAt)}</span>
                </div>
            </div>
        `;
    } else {
        videoCard.innerHTML = `
            <div class="video-thumbnail" onclick="loadVideo(this)">
                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg'">
                ${durationBadge}
                <div class="play-button">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="video-metadata">
                <img src="${video.channelAvatar}" alt="${video.channelName}" class="channel-avatar">
                <div class="video-details">
                    <div class="video-title">${video.title}</div>
                    <div class="video-channel">${video.channelName}</div>
                    <div class="video-stats">${formatViews(video.views)} views • ${timeAgo(video.publishedAt)}</div>
                </div>
            </div>
        `;
    }
    
    return videoCard;
}

async function loadChannelStats() {
    const container = document.getElementById('stats-container');
    if (!container) return;
    
    const videos = await fetchLatestVideos();
    if (videos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">Failed to load stats</p>';
        return;
    }
    
    allVideos = videos;
    
    const totalVideoViews = videos.reduce((sum, v) => sum + v.views, 0);
    const avgViews = Math.floor(totalVideoViews / videos.length) || 0;
    const regularVideos = videos.filter(v => v.type === 'regular');
    const shorts = videos.filter(v => v.type === 'short');
    const mostViewed = [...videos].sort((a, b) => b.views - a.views)[0];
    const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 10);
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><img src="icons/png/youtubecircle.png" alt="YouTube" style="width: 48px; height: 48px;"></div>
                <div class="stat-value">${formatViews(channelStats.subscribers)}</div>
                <div class="stat-label">Subscribers</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><img src="icons/png/coloredeye.png" alt="Views" style="width: 48px; height: 48px;"></div>
                <div class="stat-value">${formatViews(channelStats.totalViews)}</div>
                <div class="stat-label">Total Channel Views</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><img src="icons/png/computerwithyoutubelogo.png" alt="Videos" style="width: 48px; height: 48px;"></div>
                <div class="stat-value">${channelStats.totalVideos}</div>
                <div class="stat-label">Total Videos</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><img src="icons/png/stats.png" alt="Stats" style="width: 48px; height: 48px;"></div>
                <div class="stat-value">${formatViews(avgViews)}</div>
                <div class="stat-label">Avg Views Per Video</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><img src="icons/png/computerwithyoutubelogo.png" alt="Videos" style="width: 48px; height: 48px;"></div>
                <div class="stat-value">${regularVideos.length}</div>
                <div class="stat-label">Regular Videos</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><img src="icons/png/live.png" alt="Shorts" style="width: 48px; height: 48px;"></div>
                <div class="stat-value">${shorts.length}</div>
                <div class="stat-label">Shorts</div>
            </div>
        </div>
        
        <div class="charts-container">
            <div class="chart-card">
                <h3>Top 10 Videos by Views</h3>
                <canvas id="topVideosChart"></canvas>
            </div>
            <div class="chart-card">
                <h3>Videos vs Shorts</h3>
                <canvas id="contentTypeChart"></canvas>
            </div>
        </div>
        
        ${mostViewed ? `
            <div class="most-viewed-section">
                <h3>Most Viewed Video</h3>
                <div class="most-viewed-card">
                    <img src="${mostViewed.thumbnail}" alt="${mostViewed.title}">
                    <div class="most-viewed-info">
                        <div class="most-viewed-title">${mostViewed.title}</div>
                        <div class="most-viewed-stats">${formatViews(mostViewed.views)} views • ${timeAgo(mostViewed.publishedAt)}</div>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
    
    // Create charts
    setTimeout(() => {
        createTopVideosChart(topVideos);
        createContentTypeChart(regularVideos.length, shorts.length);
    }, 100);
}

function createTopVideosChart(videos) {
    const ctx = document.getElementById('topVideosChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: videos.map((v, i) => `Video ${i + 1}`),
            datasets: [{
                label: 'Views',
                data: videos.map(v => v.views),
                backgroundColor: 'rgba(111, 232, 164, 0.6)',
                borderColor: 'rgba(111, 232, 164, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (items) => videos[items[0].dataIndex].title,
                        label: (item) => `${formatViews(item.parsed.y)} views`
                    }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => formatViews(value)
                    }
                }
            }
        }
    });
}

function createContentTypeChart(regularCount, shortsCount) {
    const ctx = document.getElementById('contentTypeChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Regular Videos', 'Shorts'],
            datasets: [{
                data: [regularCount, shortsCount],
                backgroundColor: [
                    'rgba(255, 228, 77, 0.6)',
                    'rgba(111, 232, 164, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 228, 77, 1)',
                    'rgba(111, 232, 164, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (item) => `${item.label}: ${item.parsed} videos`
                    }
                }
            }
        }
    });
}

function renderFilteredVideos() {
    const container = document.getElementById('videos-container');
    if (!container) return;
    
    if (currentFilter === 'stats') {
        renderChannelStats();
        return;
    }
    
    container.innerHTML = '';
    container.className = `videos-container ${currentView}-view`;
    
    let filteredVideos = [];
    
    switch (currentFilter) {
        case 'all':
            filteredVideos = allVideos;
            break;
        case 'latest':
            filteredVideos = allVideos.filter(v => v.type === 'regular');
            break;
        case 'shorts':
            filteredVideos = allVideos.filter(v => v.type === 'short');
            break;
        case 'popular':
            filteredVideos = [...allVideos].sort((a, b) => b.views - a.views);
            break;
    }
    
    if (filteredVideos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No videos found for this filter.</p>';
        return;
    }
    
    filteredVideos.forEach(video => {
        container.appendChild(createVideoCardWithInfo(video, currentView));
    });
}

function initVideoFilters() {
    const filterBtns = document.querySelectorAll('.yt-tab');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderFilteredVideos();
        });
    });
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.getAttribute('data-view');
            renderFilteredVideos();
        });
    });
}

async function loadYouTubeVideos() {
    const container = document.getElementById('videos-container');
    const regularGrid = document.getElementById('regular-videos');
    const shortsGrid = document.getElementById('shorts-videos');
    
    // New videos page with filters
    if (container) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">Loading...</p>';
        
        const videos = await fetchLatestVideos();
        allVideos = videos;
        
        if (videos.length > 0) {
            renderFilteredVideos();
            initVideoFilters();
        } else {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">Couldn\'t load videos. <a href="https://www.youtube.com/@Nabana07" target="_blank" style="color: var(--mint-green);">Check YouTube</a></p>';
        }
        return;
    }
    
    // Old video grid code
    
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

// Page init
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initThemeSwitcher();
    updateActiveNavLink();
    
    // Load videos if we're on videos page
    if (document.querySelector('.videos-grid') || document.getElementById('videos-container')) {
        loadYouTubeVideos();
    }
    
    // Load stats if we're on stats page
    if (document.getElementById('stats-container')) {
        loadChannelStats();
    }
    
    // Start checking Twitch status
    checkTwitchLiveStatus();
    setInterval(checkTwitchLiveStatus, CHECK_INTERVAL);
    
    // Fade-in on scroll
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
    
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        fadeObserver.observe(section);
    });
    
    // Hero fade in
    const hero = document.querySelector('.hero-content');
    if (hero) {
        setTimeout(() => hero.style.opacity = '1', 100);
    }
});