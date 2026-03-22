
/* =============================================================
   WELCOME SCREEN
   ============================================================= */
const welcomeOverlay = document.getElementById('welcome-overlay');
const alreadyVisited = sessionStorage.getItem('fw-visited');

if (alreadyVisited) {
    welcomeOverlay.classList.add('hidden');
    welcomeOverlay.addEventListener('transitionend', () => {
        welcomeOverlay.style.display = 'none';
    }, { once: true });
} else {
    // Auto-dismiss welcome screen after 3 seconds
    setTimeout(() => {
        sessionStorage.setItem('fw-visited', '1');
        welcomeOverlay.classList.add('hidden');
        setTimeout(() => { welcomeOverlay.style.display = 'none'; }, 900);
    }, 3000);
}


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

function closeAllPanels() {
    Object.values(panels).forEach(p => p.classList.remove('visible'));
    document.querySelectorAll('.toolbar-btn').forEach(b => b.classList.remove('active'));
    document.body.classList.remove('panel-open');
}

function togglePanel(name) {
    const panel = panels[name];
    const btn = document.getElementById(`btn-${name === 'music' ? 'music' : name}`);
    const isVisible = panel.classList.contains('visible');

    // Close all panels
    closeAllPanels();

    if (!isVisible) {
        panel.classList.add('visible');
        btn.classList.add('active');
        document.body.classList.add('panel-open');
    }
}

document.getElementById('btn-pomodoro').addEventListener('click', () => togglePanel('pomodoro'));
document.getElementById('btn-stopwatch').addEventListener('click', () => togglePanel('stopwatch'));
document.getElementById('btn-music').addEventListener('click', () => togglePanel('music'));

/* --- Close panels on tap outside / tap overlay --- */
document.addEventListener('click', (e) => {
    // Don't close if the click was inside a panel, toolbar, or bottom-right controls
    if (e.target.closest('.panel') || e.target.closest('.toolbar-btn') ||
        e.target.closest('.toolbar') || e.target.closest('.bottom-right-controls')) return;
    closeAllPanels();
});

/* =============================================================
   SWIPE-DOWN-TO-DISMISS (mobile bottom-sheet panels)
   ============================================================= */
(function () {
    let startY = 0;
    let currentY = 0;
    let panelEl = null;
    let isDragging = false;
    const THRESHOLD = 80; // px to trigger dismiss

    function getVisiblePanel() {
        return document.querySelector('.panel.visible');
    }

    document.addEventListener('touchstart', (e) => {
        // Only on mobile-width screens
        if (window.innerWidth > 480) return;
        const panel = getVisiblePanel();
        if (!panel) return;

        // Only start drag if touch is on the panel itself (not on interactive children deep inside)
        const touch = e.touches[0];
        const target = e.target;

        // Allow drag from the panel drag-handle area (top ~40px) or panel background
        const panelRect = panel.getBoundingClientRect();
        const touchYInPanel = touch.clientY - panelRect.top;

        // Only initiate swipe from the top handle region or non-interactive areas
        if (touchYInPanel <= 40 || (!target.closest('button, input, a, .ost-progress-bar, .volume-slider'))) {
            startY = touch.clientY;
            currentY = startY;
            panelEl = panel;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!panelEl) return;
        const touch = e.touches[0];
        currentY = touch.clientY;
        const dy = currentY - startY;

        // Only allow downward drag
        if (dy > 5) {
            if (!isDragging) {
                isDragging = true;
                panelEl.classList.add('swiping');
            }
            // Translate the panel down, with slight resistance
            const dampened = dy * 0.85;
            panelEl.style.transform = `translateY(${dampened}px)`;
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!panelEl) return;
        const dy = currentY - startY;

        panelEl.classList.remove('swiping');

        if (isDragging && dy > THRESHOLD) {
            // Dismiss — animate out then close
            panelEl.style.transition = 'transform 0.3s cubic-bezier(.4,0,.2,1)';
            panelEl.style.transform = 'translateY(100%)';
            setTimeout(() => {
                closeAllPanels();
                panelEl.style.transition = '';
                panelEl.style.transform = '';
                panelEl = null;
            }, 300);
        } else {
            // Snap back
            panelEl.style.transition = 'transform 0.25s cubic-bezier(.4,0,.2,1)';
            panelEl.style.transform = '';
            setTimeout(() => {
                if (panelEl) {
                    panelEl.style.transition = '';
                    panelEl = null;
                }
            }, 250);
        }

        isDragging = false;
        startY = 0;
        currentY = 0;
    })
})();

/* =============================================================
   POMODORO TIMER
   ============================================================= */
let POMO_FOCUS = 25 * 60;
let POMO_BREAK = 5 * 60;
let POMO_LONG_BREAK = 15 * 60;
let pomoTime = POMO_FOCUS;
let pomoRunning = false;
let pomoInterval = null;
let pomoIsFocus = true;
let pomoSessions = 0;
let pomoSoundOn = true;
const pomoDisplay = document.getElementById('pomo-display');
const pomoLabel = document.getElementById('pomo-label');
const pomoRing = document.getElementById('pomo-ring-fill');
const pomoCircumference = 2 * Math.PI * 42;

pomoRing.style.strokeDasharray = pomoCircumference;

/* --- Web Audio chime (no external file needed) --- */
function playPomoChime() {
    if (!pomoSoundOn) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 — major chord
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
            gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.18 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.18);
            osc.stop(ctx.currentTime + i * 0.18 + 0.8);
        });
        // Cleanup after sound finishes
        setTimeout(() => ctx.close(), 2000);
    } catch (e) {
        console.warn('Audio chime error:', e);
    }
}

/* --- Sound toggle --- */
const pomoSoundBtn = document.getElementById('pomo-sound-toggle');
const SOUND_ON_SVG = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />';
const SOUND_OFF_SVG = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />';

pomoSoundBtn.addEventListener('click', () => {
    pomoSoundOn = !pomoSoundOn;
    pomoSoundBtn.querySelector('svg').innerHTML = pomoSoundOn ? SOUND_ON_SVG : SOUND_OFF_SVG;
    pomoSoundBtn.title = pomoSoundOn ? 'Sound On' : 'Sound Off';
    pomoSoundBtn.classList.toggle('muted', !pomoSoundOn);
});

/* --- Settings panel toggle --- */
const pomoSettingsToggle = document.getElementById('pomo-settings-toggle');
const pomoCustomSettings = document.getElementById('pomo-custom-settings');
let pomoSettingsOpen = false;

pomoSettingsToggle.addEventListener('click', () => {
    pomoSettingsOpen = !pomoSettingsOpen;
    pomoCustomSettings.classList.toggle('open', pomoSettingsOpen);
    pomoSettingsToggle.classList.toggle('active', pomoSettingsOpen);
});

/* --- Stepper buttons (+/-) --- */
document.querySelectorAll('.pomo-stepper').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        const dir = parseInt(btn.dataset.dir);
        let val = parseInt(input.value) + dir;
        val = Math.max(parseInt(input.min), Math.min(parseInt(input.max), val));
        input.value = val;
    });
});

/* --- Presets --- */
function applyPomoTimes(focusMin, shortMin, longMin) {
    if (pomoRunning) return; // don't change while running
    POMO_FOCUS = focusMin * 60;
    POMO_BREAK = shortMin * 60;
    POMO_LONG_BREAK = longMin * 60;
    pomoIsFocus = true;
    pomoTime = POMO_FOCUS;
    pomoSessions = 0;
    pomoLabel.textContent = 'Focus Session';
    document.getElementById('pomo-start').textContent = 'Start';
    updatePomoDisplay();
    updatePomoDots();
    // Update custom inputs to reflect preset values
    document.getElementById('pomo-custom-focus').value = focusMin;
    document.getElementById('pomo-custom-short').value = shortMin;
    document.getElementById('pomo-custom-long').value = longMin;
}

document.querySelectorAll('.pomo-preset').forEach(btn => {
    btn.addEventListener('click', () => {
        if (pomoRunning) return;
        document.querySelectorAll('.pomo-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyPomoTimes(
            parseInt(btn.dataset.focus),
            parseInt(btn.dataset.short),
            parseInt(btn.dataset.long)
        );
    });
});

/* --- Apply custom --- */
document.getElementById('pomo-apply-custom').addEventListener('click', () => {
    if (pomoRunning) return;
    const focusMin = parseInt(document.getElementById('pomo-custom-focus').value) || 25;
    const shortMin = parseInt(document.getElementById('pomo-custom-short').value) || 5;
    const longMin = parseInt(document.getElementById('pomo-custom-long').value) || 15;
    // Deselect presets
    document.querySelectorAll('.pomo-preset').forEach(b => b.classList.remove('active'));
    applyPomoTimes(focusMin, shortMin, longMin);
    // Close settings
    pomoSettingsOpen = false;
    pomoCustomSettings.classList.remove('open');
    pomoSettingsToggle.classList.remove('active');
});

/* --- Display update --- */
function updatePomoDisplay() {
    const m = Math.floor(pomoTime / 60);
    const s = pomoTime % 60;
    pomoDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    const total = pomoIsFocus ? POMO_FOCUS : (pomoSessions % 4 === 0 && pomoSessions > 0 ? POMO_LONG_BREAK : POMO_BREAK);
    const progress = 1 - (pomoTime / total);
    pomoRing.style.strokeDashoffset = pomoCircumference * (1 - progress);
}

updatePomoDisplay();

/* --- Start / Pause --- */
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
                playPomoChime();

                // Flash the ring for visual feedback
                pomoRing.style.stroke = '#fff';
                setTimeout(() => { pomoRing.style.stroke = ''; }, 600);

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

/* --- Reset --- */
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
   FIREWATCH OST PLAYER
   ============================================================= */
const OST_TRACKS = [
    { file: 'ost/01. Prologue.mp3', title: 'Prologue' },
    { file: 'ost/02. Stay in Your Tower and Watch.mp3', title: 'Stay in Your Tower and Watch' },
    { file: 'ost/03. Something\'s Wrong.mp3', title: "Something's Wrong" },
    { file: 'ost/04. Beartooth Point.mp3', title: 'Beartooth Point' },
    { file: 'ost/05. North Backcountry.mp3', title: 'North Backcountry' },
    { file: 'ost/06. Camp Approach.mp3', title: 'Camp Approach' },
    { file: 'ost/07. Canyon Sunset.mp3', title: 'Canyon Sunset' },
    { file: 'ost/08. Calm After the Storm.mp3', title: 'Calm After the Storm' },
    { file: 'ost/09. Conversation, Interrupted.mp3', title: 'Conversation, Interrupted' },
    { file: 'ost/10. Cottonwood Hike.mp3', title: 'Cottonwood Hike' },
    { file: 'ost/11. New Equipment.mp3', title: 'New Equipment' },
    { file: 'ost/12. Infiltration.mp3', title: 'Infiltration' },
    { file: 'ost/13. Exfiltration.mp3', title: 'Exfiltration' },
    { file: 'ost/14. Hidden Away.mp3', title: 'Hidden Away' },
    { file: 'ost/15. An Unfortunate Discovery.mp3', title: 'An Unfortunate Discovery' },
    { file: 'ost/16. Shoshone Overlook.mp3', title: 'Shoshone Overlook' },
    { file: 'ost/17. Thorofare Hike.mp3', title: 'Thorofare Hike' },
    { file: 'ost/18. Catching Up.mp3', title: 'Catching Up' },
    { file: 'ost/19. Ol\' Shoshone.mp3', title: "Ol' Shoshone" },
    { file: 'ost/Firewatch (2016) End Credits - I\'d Rather Go Blind by Etta James.mp3', title: "I'd Rather Go Blind — Etta James" },
];

const ostAudio = new Audio();
let ostCurrentIndex = 0;
let ostIsPlaying = false;
let ostShuffleOn = false;
let ostRepeatMode = 0; // 0 = off, 1 = all, 2 = one
let ostShuffleQueue = [];
let ostShufflePos = -1;

// DOM refs
const ostPlayBtn = document.getElementById('ost-play');
const ostPlayIcon = document.getElementById('ost-play-icon');
const ostPrevBtn = document.getElementById('ost-prev');
const ostNextBtn = document.getElementById('ost-next');
const ostShuffleBtn = document.getElementById('ost-shuffle');
const ostRepeatBtn = document.getElementById('ost-repeat');
const ostTrackName = document.getElementById('ost-track-name');
const ostTrackNumber = document.getElementById('ost-track-number');
const ostTimeCurrent = document.getElementById('ost-time-current');
const ostTimeTotal = document.getElementById('ost-time-total');
const ostProgressBar = document.getElementById('ost-progress-bar');
const ostProgressFill = document.getElementById('ost-progress-fill');
const ostProgressThumb = document.getElementById('ost-progress-thumb');
const ostVisualizer = document.getElementById('ost-visualizer');
const volumeSlider = document.getElementById('volume-slider');
const ostMusicBars = ostVisualizer.querySelectorAll('.music-bar');
const ostTracklistToggle = document.getElementById('ost-tracklist-toggle');
const tracklistToggleText = document.getElementById('tracklist-toggle-text');
const ostTracklist = document.getElementById('ost-tracklist');
const lofiTracklist = document.getElementById('lofi-tracklist');

const PLAY_SVG = '<polygon points="6,3 20,12 6,21" />';
const PAUSE_SVG = '<rect x="5" y="3" width="5" height="18" rx="1" /><rect x="14" y="3" width="5" height="18" rx="1" />';

// --- Build track list UI ---
OST_TRACKS.forEach((track, idx) => {
    const item = document.createElement('div');
    item.className = 'ost-tracklist-item';
    item.dataset.index = idx;
    item.innerHTML = `<span class="ost-tl-num">${String(idx + 1).padStart(2, '0')}</span><span class="ost-tl-title">${track.title}</span>`;
    item.addEventListener('click', () => { loadTrack(idx); playTrack(); });
    ostTracklist.appendChild(item);
});

// --- Tracklist toggle ---
let tracklistOpen = false;
ostTracklistToggle.addEventListener('click', () => {
    tracklistOpen = !tracklistOpen;
    ostTracklist.classList.toggle('open', tracklistOpen);
    lofiTracklist.classList.toggle('open', tracklistOpen);
    ostTracklistToggle.classList.toggle('open', tracklistOpen);
});

// --- Helpers ---
function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

function highlightTracklistItem() {
    ostTracklist.querySelectorAll('.ost-tracklist-item').forEach((el, i) => {
        el.classList.toggle('active', i === ostCurrentIndex);
    });
}

function generateShuffleQueue() {
    ostShuffleQueue = [...Array(OST_TRACKS.length).keys()];
    // Fisher-Yates shuffle
    for (let i = ostShuffleQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ostShuffleQueue[i], ostShuffleQueue[j]] = [ostShuffleQueue[j], ostShuffleQueue[i]];
    }
    // Place current track at front
    const curIdx = ostShuffleQueue.indexOf(ostCurrentIndex);
    if (curIdx > 0) {
        [ostShuffleQueue[0], ostShuffleQueue[curIdx]] = [ostShuffleQueue[curIdx], ostShuffleQueue[0]];
    }
    ostShufflePos = 0;
}

// --- Load & Play ---
function loadTrack(index) {
    ostCurrentIndex = index;
    const track = OST_TRACKS[index];
    ostAudio.src = track.file;
    ostTrackName.textContent = track.title;
    ostTrackNumber.textContent = `${index + 1} / ${OST_TRACKS.length}`;
    highlightTracklistItem();

    // Sync top-left widget if in OST mode
    if (musicMode === 'ost') {
        lofiStatusText.textContent = "Now Playing";
        updateTrackNameDisplay(track.title);
    }
}

function playTrack() {
    ostAudio.play().then(() => {
        ostIsPlaying = true;
        ostPlayIcon.innerHTML = PAUSE_SVG;
        ostMusicBars.forEach(b => b.classList.add('playing'));

        // Sync top-left widget
        if (musicMode === 'ost') {
            lofiStatusText.textContent = "Now Playing";
            lofiWidget.classList.add('playing');
        }
    }).catch(e => console.warn('Audio play error:', e));
}

function pauseTrack() {
    ostAudio.pause();
    ostIsPlaying = false;
    ostPlayIcon.innerHTML = PLAY_SVG;
    ostMusicBars.forEach(b => b.classList.remove('playing'));

    // Sync top-left widget
    if (musicMode === 'ost') {
        lofiStatusText.textContent = "Paused";
        lofiWidget.classList.remove('playing');
    }
}

function nextTrack() {
    if (musicMode === 'lofi') {
        let nextIdx = lofiCurrentIndex + 1;
        if (nextIdx >= LOFI_STATIONS.length) nextIdx = 0;
        loadLofiStation(nextIdx);
        if (lofiIsPlaying) playLofi();
        return;
    }

    let nextIdx;
    if (ostShuffleOn) {
        ostShufflePos++;
        if (ostShufflePos >= ostShuffleQueue.length) {
            if (ostRepeatMode >= 1) {
                generateShuffleQueue();
                ostShufflePos = 0;
            } else {
                pauseTrack();
                return;
            }
        }
        nextIdx = ostShuffleQueue[ostShufflePos];
    } else {
        nextIdx = ostCurrentIndex + 1;
        if (nextIdx >= OST_TRACKS.length) {
            if (ostRepeatMode >= 1) {
                nextIdx = 0;
            } else {
                pauseTrack();
                return;
            }
        }
    }
    loadTrack(nextIdx);
    playTrack();
}

function prevTrack() {
    if (musicMode === 'lofi') {
        let prevIdx = lofiCurrentIndex - 1;
        if (prevIdx < 0) prevIdx = LOFI_STATIONS.length - 1;
        loadLofiStation(prevIdx);
        if (lofiIsPlaying) playLofi();
        return;
    }

    // If more than 3 seconds in, restart current track
    if (ostAudio.currentTime > 3) {
        ostAudio.currentTime = 0;
        return;
    }
    let prevIdx;
    if (ostShuffleOn) {
        ostShufflePos--;
        if (ostShufflePos < 0) ostShufflePos = 0;
        prevIdx = ostShuffleQueue[ostShufflePos];
    } else {
        prevIdx = ostCurrentIndex - 1;
        if (prevIdx < 0) prevIdx = OST_TRACKS.length - 1;
    }
    loadTrack(prevIdx);
    playTrack();
}

// --- Event Listeners ---
// ostPlayBtn listener moved to dual-mode handler below

ostNextBtn.addEventListener('click', nextTrack);
ostPrevBtn.addEventListener('click', prevTrack);

// Shuffle toggle
ostShuffleBtn.addEventListener('click', () => {
    ostShuffleOn = !ostShuffleOn;
    ostShuffleBtn.classList.toggle('active', ostShuffleOn);
    if (ostShuffleOn) generateShuffleQueue();
});

// Repeat toggle: off → all → one → off
ostRepeatBtn.addEventListener('click', () => {
    ostRepeatMode = (ostRepeatMode + 1) % 3;
    ostRepeatBtn.classList.toggle('active', ostRepeatMode > 0);
    ostRepeatBtn.classList.toggle('repeat-one', ostRepeatMode === 2);
    // Visual feedback
    if (ostRepeatMode === 0) ostRepeatBtn.title = 'Repeat: Off';
    else if (ostRepeatMode === 1) ostRepeatBtn.title = 'Repeat: All';
    else ostRepeatBtn.title = 'Repeat: One';
});

// Track ended — auto-advance
ostAudio.addEventListener('ended', () => {
    if (ostRepeatMode === 2) {
        ostAudio.currentTime = 0;
        playTrack();
    } else {
        nextTrack();
    }
});

// Progress update
ostAudio.addEventListener('timeupdate', () => {
    if (!ostAudio.duration) return;
    const pct = (ostAudio.currentTime / ostAudio.duration) * 100;
    ostProgressFill.style.width = `${pct}%`;
    ostProgressThumb.style.left = `${pct}%`;
    ostTimeCurrent.textContent = formatTime(ostAudio.currentTime);
});

ostAudio.addEventListener('loadedmetadata', () => {
    ostTimeTotal.textContent = formatTime(ostAudio.duration);
});

// Seeking via progress bar
let ostSeeking = false;
function seekFromEvent(e) {
    const rect = ostProgressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (ostAudio.duration) {
        ostAudio.currentTime = pct * ostAudio.duration;
    }
}
ostProgressBar.addEventListener('mousedown', (e) => {
    ostSeeking = true;
    seekFromEvent(e);
});
window.addEventListener('mousemove', (e) => { if (ostSeeking) seekFromEvent(e); });
window.addEventListener('mouseup', () => { ostSeeking = false; });

// Volume
ostAudio.volume = parseInt(volumeSlider.value) / 100;
volumeSlider.addEventListener('input', () => {
    const vol = parseInt(volumeSlider.value) / 100;
    ostAudio.volume = vol;
    if (typeof lofiAudio !== 'undefined') {
        lofiAudio.volume = vol;
    }
});

/* =============================================================
   LOFI RADIO (Direct HTML5 Audio Stream)
   ============================================================= */
const LOFI_STATIONS = [
    { title: "Lofi Girl (Community Relay)", file: "https://play.streamafrica.net/lofiradio" },
    { title: "Laut.FM | Lofi 24/7", file: "https://lofi.stream.laut.fm/lofi" },
    { title: "Zeno FM | Study Lofi", file: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
    { title: "Zeno FM | Chill Beats", file: "https://stream.zeno.fm/0r0xa792kwzuv" },
    { title: "Zeno FM | Lofi Hip Hop", file: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
    { title: "Zeno FM | Box Lofi", file: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
    { title: "Zeno FM | The Bootleg Boy", file: "https://stream.zeno.fm/0r0xa792kwzuv" },
    { title: "Fastcast4u | Chill Lofi", file: "http://usa9.fastcast4u.com/proxy/jamz?mp=/1" },
    { title: "FluxFM | Chillhop", file: "https://channels.fluxfm.de/chillhop/externalembedflxhp/stream.mp3" },
    { title: "Nightride FM | Chillsynth (Hi-Res AAC)", file: "https://stream.nightride.fm/chillsynth.m4a" },
    { title: "SomaFM | Secret Agent", file: "https://ice1.somafm.com/secretagent-128-aac" },
    { title: "SomaFM | Deep Space One (Deep Ambient)", file: "https://ice1.somafm.com/deepspaceone-128-aac" },
    { title: "SomaFM | Groove Salad", file: "https://ice1.somafm.com/groovesalad-256-mp3" },
    { title: "SomaFM | Drone Zone", file: "https://ice1.somafm.com/dronezone-256-mp3" },
    { title: "SomaFM | DEF CON Radio", file: "https://ice1.somafm.com/defcon-128-aac" },
    { title: "SomaFM | Space Station", file: "https://ice1.somafm.com/spacestation-128-aac" },
    { title: "SomaFM | Vaporwaves", file: "https://ice1.somafm.com/vaporwaves-128-aac" },
    { title: "SomaFM | Synphaera", file: "https://ice1.somafm.com/synphaera-128-aac" },
    { title: "Intense Radio | Chillout (Lossless OGG)", file: "http://secure.live-streams.nl/flac.ogg" },
    { title: "Radio Paradise | Mellow Mix (FLAC Lossless)", file: "http://stream.radioparadise.com/mellow-flac" }
];

let lofiCurrentIndex = 0;
const lofiAudio = new Audio(LOFI_STATIONS[lofiCurrentIndex].file);
lofiAudio.crossOrigin = "anonymous";
let lofiIsPlaying = false;
let musicMode = 'ost'; // 'ost' or 'lofi'

// DOM Elements
const modeOstBtn = document.getElementById('mode-ost');
const modeLofiBtn = document.getElementById('mode-lofi');
const lofiWidget = document.getElementById('lofi-widget');
const lofiStatusText = document.getElementById('lofi-status');
const lofiTrackName = document.getElementById('lofi-track-name');
const lofiTrackNameDup = document.getElementById('lofi-track-name-dup'); // The duplicate span for looping
const musicPanelTitle = document.getElementById('music-panel-title');

// Helper to update both spans for the seamless marquee
function updateTrackNameDisplay(text) {
    if (lofiTrackName) lofiTrackName.textContent = text;
    if (lofiTrackNameDup) lofiTrackNameDup.textContent = text;
}

// --- Build Lofi track list UI ---
LOFI_STATIONS.forEach((station, idx) => {
    const item = document.createElement('div');
    item.className = 'ost-tracklist-item'; // Reuse class for styling
    item.dataset.index = idx;
    item.innerHTML = `<span class="ost-tl-num">${String(idx + 1).padStart(2, '0')}</span><span class="ost-tl-title">${station.title}</span>`;
    item.addEventListener('click', () => {
        if (musicMode !== 'lofi') return;
        loadLofiStation(idx);
        playLofi();
    });
    lofiTracklist.appendChild(item);
});

function highlightLofiItem() {
    lofiTracklist.querySelectorAll('.ost-tracklist-item').forEach((el, i) => {
        el.classList.toggle('active', i === lofiCurrentIndex);
    });
}
// Init highlight
highlightLofiItem();

function loadLofiStation(index) {
    lofiCurrentIndex = index;
    const station = LOFI_STATIONS[index];
    lofiAudio.src = station.file;
    highlightLofiItem();

    if (musicMode === 'lofi') {
        lofiStatusText.textContent = lofiIsPlaying ? "Live Now" : "Radio Ready";
        updateTrackNameDisplay(station.title);
    }
}

function playLofi() {
    lofiStatusText.textContent = "Connecting...";
    lofiAudio.play().then(() => {
        lofiIsPlaying = true;
        lofiStatusText.textContent = "Live Now";
        lofiWidget.classList.add('playing');
        ostPlayIcon.innerHTML = PAUSE_SVG;
        ostMusicBars.forEach(b => b.classList.add('playing'));
    }).catch(e => {
        console.warn("Lofi Stream Error: ", e);
        lofiStatusText.textContent = "Stream Offline";
        updateTrackNameDisplay("Connection failed. Please try again later.");
    });
}

function pauseLofi() {
    lofiAudio.pause();
    lofiIsPlaying = false;
    lofiStatusText.textContent = "Paused";
    lofiWidget.classList.remove('playing');
    ostPlayIcon.innerHTML = PLAY_SVG;
    ostMusicBars.forEach(b => b.classList.remove('playing'));
}

// Mode Switching Logic
modeOstBtn.addEventListener('click', () => {
    if (musicMode === 'ost') return;
    musicMode = 'ost';
    modeOstBtn.classList.add('active');
    modeLofiBtn.classList.remove('active');
    musicPanelTitle.textContent = "Firewatch OST";
    document.getElementById('music-panel').classList.remove('lofi-mode');

    // Update Tracklist Toggle Button
    if (tracklistToggleText) {
        tracklistToggleText.textContent = "Track List";
    }

    // Stop Lofi if playing
    if (lofiIsPlaying) {
        pauseLofi();
    }

    // Sync UI based on OST state
    ostPlayIcon.innerHTML = ostIsPlaying ? PAUSE_SVG : PLAY_SVG;
    ostMusicBars.forEach(b => b.classList.toggle('playing', ostIsPlaying));

    // Update top-left widget
    lofiStatusText.textContent = ostIsPlaying ? "Now Playing" : "Paused";
    if (OST_TRACKS[ostCurrentIndex]) {
        updateTrackNameDisplay(OST_TRACKS[ostCurrentIndex].title);
    }
    lofiWidget.classList.toggle('playing', ostIsPlaying);
});

modeLofiBtn.addEventListener('click', () => {
    if (musicMode === 'lofi') return;
    musicMode = 'lofi';
    modeLofiBtn.classList.add('active');
    modeOstBtn.classList.remove('active');
    musicPanelTitle.textContent = "Lofi Live Radio";
    document.getElementById('music-panel').classList.add('lofi-mode');

    // Update Tracklist Toggle Button
    if (tracklistToggleText) {
        tracklistToggleText.textContent = "Station List";
    }

    // Stop OST if playing
    if (ostIsPlaying) {
        pauseTrack();
    }

    // Sync UI based on Lofi state
    ostPlayIcon.innerHTML = lofiIsPlaying ? PAUSE_SVG : PLAY_SVG;
    ostMusicBars.forEach(b => b.classList.toggle('playing', lofiIsPlaying));

    // Update top-left widget
    lofiStatusText.textContent = lofiIsPlaying ? "Live Now" : "Radio Ready";
    updateTrackNameDisplay(LOFI_STATIONS[lofiCurrentIndex].title);
    lofiWidget.classList.toggle('playing', lofiIsPlaying);
});

// Overriding main play button for dual mode
ostPlayBtn.addEventListener('click', () => {
    if (musicMode === 'ost') {
        // Handle OST Play/Pause (Existing logic moved here for clarity)
        if (!ostAudio.src || ostAudio.src === window.location.href) {
            loadTrack(0);
            if (ostShuffleOn) generateShuffleQueue();
            playTrack();
        } else if (ostIsPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    } else {
        // Handle Lofi Play/Pause (Direct Audio)
        if (lofiIsPlaying) {
            pauseLofi();
        } else {
            playLofi();
        }
    }
});

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
    if (e.key === 'o' || e.key === 'O') togglePanel('music');
    if (e.key === 'f' || e.key === 'F') document.getElementById('btn-fullscreen').click();
    // Spacebar toggles play/pause (only if no input is focused)
    if (e.key === ' ' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        ostPlayBtn.click();
    }
});

/* =============================================================
   FULLSCREEN TOGGLE
   ============================================================= */
const fullscreenBtn = document.getElementById('btn-fullscreen');
const fullscreenIcon = document.getElementById('fullscreen-icon');

const FS_EXPAND_SVG = '<polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />';
const FS_CONTRACT_SVG = '<polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />';

function updateFullscreenIcon() {
    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    fullscreenIcon.innerHTML = isFS ? FS_CONTRACT_SVG : FS_EXPAND_SVG;
    fullscreenBtn.title = isFS ? 'Exit Fullscreen' : 'Fullscreen';
}

fullscreenBtn.addEventListener('click', () => {
    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (!isFS) {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }
});

document.addEventListener('fullscreenchange', updateFullscreenIcon);
document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
document.addEventListener('mozfullscreenchange', updateFullscreenIcon);
document.addEventListener('MSFullscreenChange', updateFullscreenIcon);
