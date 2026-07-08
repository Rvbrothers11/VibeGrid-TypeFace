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