/* ============================================
   PCSpecialist Radio - App Logic
   ============================================ */

const GENRES = {
  lofi: { name: 'Lofi', videoId: 'jfKfPfyJRdk' },
  deephouse: { name: 'Deep House', videoId: 'D4MdHQOILdw' },
  synthwave: { name: 'Synthwave', videoId: '4xDzrJKXOOY' },
  ambient: { name: 'Ambient', videoId: 'Y4u7D7xCvtw' },
};

let player = null;
let currentGenre = 'lofi';
let isPlaying = false;
let volume = 50;
let playerReady = false;

// ---- DOM Elements ----
const playPauseBtn = document.getElementById('play-pause');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');
const volDownBtn = document.getElementById('vol-down');
const volUpBtn = document.getElementById('vol-up');
const volumeFill = document.getElementById('volume-fill');
const volumeLabel = document.getElementById('volume-label');
const currentGenreEl = document.getElementById('current-genre');
const statusDot = document.querySelector('.status-dot');
const statusText = document.getElementById('status-text');
const presetBtns = document.querySelectorAll('.preset');

// ---- YouTube IFrame API ----
function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt-player', {
    height: '1',
    width: '1',
    videoId: GENRES[currentGenre].videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
}

function onPlayerReady() {
  playerReady = true;
  player.setVolume(volume);
  setStatus('ready', 'Ready');
}

function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.PLAYING:
      isPlaying = true;
      updatePlayButton();
      setStatus('live', 'Live');
      break;
    case YT.PlayerState.PAUSED:
      isPlaying = false;
      updatePlayButton();
      setStatus('ready', 'Paused');
      break;
    case YT.PlayerState.BUFFERING:
      setStatus('buffering', 'Buffering');
      break;
    case YT.PlayerState.ENDED:
      // Livestreams shouldn't end, but reload if they do
      player.loadVideoById(GENRES[currentGenre].videoId);
      break;
  }
}

function onPlayerError(event) {
  isPlaying = false;
  updatePlayButton();
  setStatus('error', 'Station Offline');
}

// ---- Controls ----
function togglePlayPause() {
  if (!playerReady) return;

  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function switchGenre(genre) {
  if (!playerReady || genre === currentGenre) return;

  currentGenre = genre;
  currentGenreEl.textContent = GENRES[genre].name;

  // Update preset buttons
  presetBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.genre === genre);
  });

  // Load new stream
  player.loadVideoById(GENRES[genre].videoId);
  setStatus('buffering', 'Buffering');
}

function changeVolume(delta) {
  volume = Math.max(0, Math.min(100, volume + delta));
  if (playerReady) {
    player.setVolume(volume);
  }
  updateVolumeUI();
}

// ---- UI Updates ----
function updatePlayButton() {
  if (isPlaying) {
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
    playPauseBtn.classList.add('playing');
    playPauseBtn.setAttribute('aria-label', 'Pause');
  } else {
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
    playPauseBtn.classList.remove('playing');
    playPauseBtn.setAttribute('aria-label', 'Play');
  }
}

function updateVolumeUI() {
  volumeFill.style.width = volume + '%';
  volumeLabel.textContent = volume + '%';
}

function setStatus(state, text) {
  statusDot.className = 'status-dot';
  if (state === 'live') statusDot.classList.add('live');
  else if (state === 'buffering') statusDot.classList.add('buffering');
  else if (state === 'error') statusDot.classList.add('error');
  statusText.textContent = text;
}

// ---- Event Listeners ----
playPauseBtn.addEventListener('click', togglePlayPause);
volDownBtn.addEventListener('click', () => changeVolume(-10));
volUpBtn.addEventListener('click', () => changeVolume(10));

presetBtns.forEach((btn) => {
  btn.addEventListener('click', () => switchGenre(btn.dataset.genre));
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    togglePlayPause();
  } else if (e.code === 'ArrowUp') {
    e.preventDefault();
    changeVolume(10);
  } else if (e.code === 'ArrowDown') {
    e.preventDefault();
    changeVolume(-10);
  } else if (e.key >= '1' && e.key <= '4') {
    const genres = Object.keys(GENRES);
    switchGenre(genres[parseInt(e.key) - 1]);
  }
});

// ---- Service Worker Registration ----
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    // SW registration failed silently - app still works
  });
}

// Expose callback globally for YouTube API
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
