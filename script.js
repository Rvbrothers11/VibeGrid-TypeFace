const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsGrid = document.getElementById('results-grid');
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('progress-bar');
const lyricsContainer = document.getElementById('lyrics-container');
const resumeBtn = document.getElementById('resume-scroll-btn');

let activeTrack = null; 
let hoverTimeout;
let playlist = [];
let history = [];
let isUserScrolling = false;

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => { 
    if(e.key === 'Enter') performSearch(); 
});

function performSearch() {
    const query = searchInput.value;
    if (!query) return;
    
    resultsGrid.innerHTML = '<div class="empty-state">Pulling from iTunes API...</div>';
    fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&entity=song&limit=24')
        .then(res => res.json())
        .then(data => renderResults(data.results))
        .catch(err => {
            resultsGrid.innerHTML = '<div class="empty-state">Error fetching music data.</div>';
        });
}

function renderResults(tracks) {
    resultsGrid.innerHTML = '';
    tracks.forEach(track => {
        const card = document.createElement('div');
        card.className = 'track-card';
        card.innerHTML = `<img src="${track.artworkUrl100.replace('100x100', '300x300')}" alt="cover">
                          <div class="track-title">${track.trackName}</div>
                          <div class="track-artist">${track.artistName}</div>`;
        card.addEventListener('mouseenter', () => handleHoverPlay(track));
        card.addEventListener('mouseleave', handleHoverStop);
        card.addEventListener('click', () => lockTrack(track));
        resultsGrid.appendChild(card);
    });
}

function handleHoverPlay(track) {
    if (activeTrack && track.trackId === activeTrack.trackId) return;
    clearTimeout(hoverTimeout);
    
    hoverTimeout = setTimeout(() => {
        audioPlayer.src = track.previewUrl;
        audioPlayer.play();
    }, 300);
}

function handleHoverStop() {
    if (activeTrack) return;
    clearTimeout(hoverTimeout);
    audioPlayer.pause();
    audioPlayer.src = '';
}

function lockTrack(track) {
    activeTrack = track;
    clearTimeout(hoverTimeout);

    audioPlayer.src = track.previewUrl;
    audioPlayer.play();
    updatePlayerUI(track);
    playPauseBtn.textContent = 'Pause';

    isUserScrolling = false;
    resumeBtn.classList.remove('visible');
    addToHistory(track);
    fetchRealLyrics(track.artistName, track.trackName);
}

function updatePlayerUI(track) {
    document.getElementById('np-title').textContent = track.trackName;
    document.getElementById('np-artist').textContent = track.artistName;
    document.getElementById('np-image').src = track.artworkUrl100;
}

playPauseBtn.addEventListener('click', () => {
    if (!audioPlayer.src) return;
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.textContent = 'Pause';
    }
    else {
        audioPlayer.pause();
        playPauseBtn.textContent = 'Play';
    }
});

audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = percent + '%';
        if (!isUserScrolling) {
            syncLyricsScroll(percent / 100);
        }
    }
});

function syncLyricsScroll(progressRatio) {
    if (lyricsContainer.scrollHeight > lyricsContainer.clientHeight) {
        const maxScroll = lyricsContainer.scrollHeight - lyricsContainer.clientHeight;
        lyricsContainer.ScrollTo({top: maxScroll * progressRatio, behaviour: 'smooth' });
    }
}

function handleManualInteraction() {
    if (!activeTrack || audioPlayer.paused) return;
    isUserScrolling = true;
    resumeBtn.classList.add('visible');
}

lyricsContainer.addEventListener('wheel', handleManualInteraction);
lyricsContainer.addEventListener('touchstart', handleManualInteraction);
lyricsContainer.addEventListener('mousedown', handleManualInteraction);