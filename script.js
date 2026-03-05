/* =============================================================
   WELCOME SCREEN
   ============================================================= */
const welcomeOverlay = document.getElementById('welcome-overlay');
const welcomeBtn = document.getElementById('welcome-enter-btn');
const alreadyVisited = sessionStorage.getItem('fw-visited');

if (alreadyVisited) {
    welcomeOverlay.classList.add('hidden');
    welcomeOverlay.addEventListener('transitionend', () => {
        welcomeOverlay.style.display = 'none';
    }, { once: true });
}

welcomeBtn.addEventListener('click', () => {
    sessionStorage.setItem('fw-visited', '1');
    welcomeOverlay.classList.add('hidden');
    setTimeout(() => { welcomeOverlay.style.display = 'none'; }, 900);
});

/* =============================================================
   CLOCK
   ============================================================= */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const elHours = document.getElementById('clock-hours');
const elMinutes = document.getElementById('clock-minutes');
const elDate = document.getElementById('clock-date');
const elAmPm = document.getElementById('clock-ampm');

let use24h = false; // default to 12-hour

function updateClock() {
    const now = new Date();
    let h = now.getHours();

    if (!use24h) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        elAmPm.textContent = ampm;
    }

    elHours.textContent = String(h).padStart(2, '0');
    elMinutes.textContent = String(now.getMinutes()).padStart(2, '0');
    elDate.textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
}

updateClock();
setInterval(updateClock, 1000);

/* =============================================================
   12/24 HOUR FORMAT TOGGLE
   ============================================================= */
const format12 = document.getElementById('format-12');
const format24 = document.getElementById('format-24');
const formatSlider = document.getElementById('format-slider');

function setClockFormat(is24) {
    use24h = is24;

    // Update active label
    format12.classList.toggle('active', !is24);
    format24.classList.toggle('active', is24);

    // Slide the indicator
    formatSlider.classList.toggle('right', is24);

    // Show/hide AM-PM
    elAmPm.classList.toggle('hidden-ampm', is24);

    // Smooth transition on the clock digits
    const clockContainer = document.getElementById('clock-container');
    clockContainer.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    clockContainer.style.opacity = '0.6';
    clockContainer.style.transform = 'scale(0.97)';
    setTimeout(() => {
        updateClock();
        clockContainer.style.opacity = '1';
        clockContainer.style.transform = 'scale(1)';
    }, 150);
}

format12.addEventListener('click', () => setClockFormat(false));
format24.addEventListener('click', () => setClockFormat(true));

/* =============================================================
   THEME TOGGLE (sunset → night → evening → sunset)
   ============================================================= */
const THEMES = ['sunset', 'night', 'evening'];
let themeIndex = 0;

document.getElementById('btn-theme').addEventListener('click', () => {
    themeIndex = (themeIndex + 1) % THEMES.length;
    document.body.setAttribute('data-theme', THEMES[themeIndex]);
});

/* =============================================================
   CLOCK POSITION TOGGLE
   ============================================================= */
const POSITIONS = ['center', 'top', 'bottom-left'];
let posIndex = 0;
const dashboard = document.getElementById('dashboard');

document.getElementById('btn-clock-pos').addEventListener('click', () => {
    posIndex = (posIndex + 1) % POSITIONS.length;
    dashboard.setAttribute('data-clock-pos', POSITIONS[posIndex]);

    // Reset any manual drag when switching presets
    const clockEl = document.getElementById('clock-container');
    clockEl.classList.remove('clock-dragging');
    clockEl.style.left = '';
    clockEl.style.top = '';
});

/* =============================================================
   CLOCK DRAG — freely reposition the clock anywhere
   ============================================================= */
(function () {
    const clockEl = document.getElementById('clock-container');
    let isDragging = false;
    let startX, startY, origLeft, origTop;
    const DEAD_ZONE = 5; // px — prevents accidental drag on simple click
    let dragStarted = false;

    function pointerDown(e) {
        // Ignore if clicking inside a button / interactive child
        if (e.target.closest('button, input, a')) return;

        const evt = e.touches ? e.touches[0] : e;
        isDragging = true;
        dragStarted = false;

        // If already dragging-state, use current position; otherwise compute from bounding rect
        const rect = clockEl.getBoundingClientRect();
        origLeft = rect.left;
        origTop = rect.top;
        startX = evt.clientX;
        startY = evt.clientY;

        e.preventDefault();
    }

    function pointerMove(e) {
        if (!isDragging) return;
        const evt = e.touches ? e.touches[0] : e;
        const dx = evt.clientX - startX;
        const dy = evt.clientY - startY;

        // Only start actual drag after exceeding dead-zone
        if (!dragStarted) {
            if (Math.abs(dx) < DEAD_ZONE && Math.abs(dy) < DEAD_ZONE) return;
            dragStarted = true;
            clockEl.classList.add('clock-dragging');
        }

        clockEl.style.left = `${origLeft + dx}px`;
        clockEl.style.top = `${origTop + dy}px`;
    }

    function pointerUp() {
        isDragging = false;
        dragStarted = false;
    }

    // Mouse events
    clockEl.addEventListener('mousedown', pointerDown);
    window.addEventListener('mousemove', pointerMove);
    window.addEventListener('mouseup', pointerUp);

    // Touch events
    clockEl.addEventListener('touchstart', pointerDown, { passive: false });
    window.addEventListener('touchmove', pointerMove, { passive: false });
    window.addEventListener('touchend', pointerUp);
})();

/* =============================================================
   PANEL TOGGLE LOGIC
   ============================================================= */
const panels = {
    pomodoro: document.getElementById('pomodoro-panel'),
    stopwatch: document.getElementById('stopwatch-panel'),
    music: document.getElementById('music-panel'),
};

function togglePanel(name) {
    const panel = panels[name];
    const btn = document.getElementById(`btn-${name === 'music' ? 'music' : name}`);
    const isVisible = panel.classList.contains('visible');

    // Close all panels
    Object.values(panels).forEach(p => p.classList.remove('visible'));
    document.querySelectorAll('.toolbar-btn').forEach(b => b.classList.remove('active'));

    if (!isVisible) {
        panel.classList.add('visible');
        btn.classList.add('active');
    }
}

document.getElementById('btn-pomodoro').addEventListener('click', () => togglePanel('pomodoro'));
document.getElementById('btn-stopwatch').addEventListener('click', () => togglePanel('stopwatch'));
document.getElementById('btn-music').addEventListener('click', () => togglePanel('music'));

/* =============================================================
   POMODORO TIMER
   ============================================================= */
const POMO_FOCUS = 25 * 60;
const POMO_BREAK = 5 * 60;
const POMO_LONG_BREAK = 15 * 60;
let pomoTime = POMO_FOCUS;
let pomoRunning = false;
let pomoInterval = null;
let pomoIsFocus = true;
let pomoSessions = 0;
const pomoDisplay = document.getElementById('pomo-display');
const pomoLabel = document.getElementById('pomo-label');
const pomoRing = document.getElementById('pomo-ring-fill');
const pomoCircumference = 2 * Math.PI * 42;

pomoRing.style.strokeDasharray = pomoCircumference;

function updatePomoDisplay() {
    const m = Math.floor(pomoTime / 60);
    const s = pomoTime % 60;
    pomoDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    const total = pomoIsFocus ? POMO_FOCUS : (pomoSessions % 4 === 0 && pomoSessions > 0 ? POMO_LONG_BREAK : POMO_BREAK);
    const progress = 1 - (pomoTime / total);
    pomoRing.style.strokeDashoffset = pomoCircumference * (1 - progress);
}

updatePomoDisplay();

document.getElementById('pomo-start').addEventListener('click', function () {
    if (pomoRunning) {
        clearInterval(pomoInterval);
        pomoRunning = false;
        this.textContent = 'Resume';
    } else {
        pomoRunning = true;
        this.textContent = 'Pause';
        pomoInterval = setInterval(() => {
            pomoTime--;
            if (pomoTime < 0) {
                clearInterval(pomoInterval);
                pomoRunning = false;

                if (pomoIsFocus) {
                    pomoSessions++;
                    updatePomoDots();
                    pomoIsFocus = false;
                    pomoTime = (pomoSessions % 4 === 0) ? POMO_LONG_BREAK : POMO_BREAK;
                    pomoLabel.textContent = (pomoSessions % 4 === 0) ? 'Long Break' : 'Short Break';
                } else {
                    pomoIsFocus = true;
                    pomoTime = POMO_FOCUS;
                    pomoLabel.textContent = 'Focus Session';
                }
                document.getElementById('pomo-start').textContent = 'Start';
            }
            updatePomoDisplay();
        }, 1000);
    }
});

document.getElementById('pomo-reset').addEventListener('click', () => {
    clearInterval(pomoInterval);
    pomoRunning = false;
    pomoIsFocus = true;
    pomoTime = POMO_FOCUS;
    pomoSessions = 0;
    pomoLabel.textContent = 'Focus Session';
    document.getElementById('pomo-start').textContent = 'Start';
    updatePomoDisplay();
    updatePomoDots();
});

function updatePomoDots() {
    const dots = document.querySelectorAll('.pomo-dot');
    dots.forEach((d, i) => {
        d.classList.toggle('filled', i < (pomoSessions % 5));
    });
}

/* =============================================================
   STOPWATCH
   ============================================================= */
let swTime = 0;
let swRunning = false;
let swInterval = null;
let swLaps = [];
const swDisplay = document.getElementById('sw-display');
const swLapsList = document.getElementById('sw-laps');

function formatSW(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}<span style="font-size:1.4rem;opacity:0.5">.${String(cs).padStart(2, '0')}</span>`;
}

function updateSWDisplay() {
    swDisplay.innerHTML = formatSW(swTime);
}

document.getElementById('sw-start').addEventListener('click', function () {
    if (swRunning) {
        clearInterval(swInterval);
        swRunning = false;
        this.textContent = 'Resume';
    } else {
        swRunning = true;
        this.textContent = 'Pause';
        const startAt = Date.now() - swTime;
        swInterval = setInterval(() => {
            swTime = Date.now() - startAt;
            updateSWDisplay();
        }, 30);
    }
});

document.getElementById('sw-lap').addEventListener('click', () => {
    if (swTime > 0) {
        swLaps.push(swTime);
        const lapEl = document.createElement('div');
        lapEl.style.padding = '0.15rem 0';
        lapEl.style.borderBottom = '1px solid var(--widget-border)';
        lapEl.textContent = `Lap ${swLaps.length}: ${String(Math.floor(swTime / 60000)).padStart(2, '0')}:${String(Math.floor((swTime % 60000) / 1000)).padStart(2, '0')}.${String(Math.floor((swTime % 1000) / 10)).padStart(2, '0')}`;
        swLapsList.prepend(lapEl);
    }
});

document.getElementById('sw-reset').addEventListener('click', () => {
    clearInterval(swInterval);
    swRunning = false;
    swTime = 0;
    swLaps = [];
    swLapsList.innerHTML = '';
    document.getElementById('sw-start').textContent = 'Start';
    updateSWDisplay();
});

/* =============================================================
   LOFI MUSIC PLAYER (YouTube live stream audio via iframe)
   ============================================================= */
const lofiIframe = document.getElementById('lofi-iframe');
const musicPlayBtn = document.getElementById('music-play-btn');
const musicPlayIcon = document.getElementById('music-play-icon');
const volumeSlider = document.getElementById('volume-slider');
const musicBars = document.querySelectorAll('.music-bar');
let musicPlaying = false;

// Lofi Girl live stream — embedded as iframe to extract audio
const LOFI_URL = 'https://www.youtube.com/watch?v=TtkFsfOP9QI';

const PLAY_SVG = '<polygon points="6,3 20,12 6,21" />';
const PAUSE_SVG = '<rect x="5" y="3" width="5" height="18" rx="1" /><rect x="14" y="3" width="5" height="18" rx="1" />';

musicPlayBtn.addEventListener('click', () => {
    if (!musicPlaying) {
        lofiIframe.src = LOFI_URL;
        musicPlaying = true;
        musicPlayIcon.innerHTML = PAUSE_SVG;
        musicBars.forEach(b => b.classList.add('playing'));
    } else {
        lofiIframe.src = '';
        musicPlaying = false;
        musicPlayIcon.innerHTML = PLAY_SVG;
        musicBars.forEach(b => b.classList.remove('playing'));
    }
});

// Volume control — sets iframe volume via postMessage (YouTube IFrame API)
volumeSlider.addEventListener('input', () => {
    const vol = parseInt(volumeSlider.value);
    try {
        lofiIframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'setVolume',
            args: [vol]
        }), '*');
    } catch (e) { /* cross-origin */ }
});

/* =============================================================
   MOCK WEATHER
   ============================================================= */
async function fetchWeather() {
    return { temp: 24, condition: 'Clear Skies', icon: 'sun' };
}

const weatherIconPaths = {
    sun: `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`,
    cloud: `<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>`,
    rain: `<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>`,
    snow: `<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><line x1="12" y1="14" x2="12" y2="22"/><line x1="9" y1="18" x2="15" y2="18"/>`,
    storm: `<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><polyline points="13 16 12 21 15 21 14 24"/>`
};

async function updateWeather() {
    try {
        const data = await fetchWeather();
        document.getElementById('weather-temp').textContent = `${data.temp}°C`;
        document.getElementById('weather-condition').textContent = data.condition;
        const svg = document.getElementById('weather-svg');
        if (weatherIconPaths[data.icon]) svg.innerHTML = weatherIconPaths[data.icon];
    } catch (e) { console.warn('Weather error:', e); }
}
updateWeather();
setInterval(updateWeather, 600000);

/* =============================================================
   FIREFLY PARTICLE SYSTEM
   ============================================================= */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Firefly {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 1;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = 0;
        this.targetOpacity = Math.random() * 0.6 + 0.2;
        this.fadeSpeed = Math.random() * 0.008 + 0.003;
        this.fadingIn = true;
        this.life = Math.random() * 400 + 200;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.fadingIn) {
            this.opacity += this.fadeSpeed;
            if (this.opacity >= this.targetOpacity) this.fadingIn = false;
        } else {
            this.life--;
            if (this.life <= 0) {
                this.opacity -= this.fadeSpeed * 2;
                if (this.opacity <= 0) this.reset();
            }
        }
    }

    draw() {
        const cs = getComputedStyle(document.documentElement);
        const color = cs.getPropertyValue('--particle-color').trim() || 'rgba(255,180,100,0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${this.opacity})`);
        ctx.shadowBlur = this.size * 6;
        ctx.shadowColor = color.replace(/[\d.]+\)$/, `${this.opacity * 0.8})`);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

for (let i = 0; i < 35; i++) {
    particles.push(new Firefly());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* =============================================================
   KEYBOARD SHORTCUTS (bonus feature)
   ============================================================= */
document.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') document.getElementById('btn-theme').click();
    if (e.key === 'm' || e.key === 'M') document.getElementById('btn-clock-pos').click();
    if (e.key === 'p' || e.key === 'P') togglePanel('pomodoro');
    if (e.key === 's' || e.key === 'S') togglePanel('stopwatch');
    if (e.key === 'l' || e.key === 'L') togglePanel('music');
});
