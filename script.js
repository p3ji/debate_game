// --- Game Data ---
const topicsData = {
    silly: [
        "Are hotdogs a type of sandwich?",
        "Is cereal technically a soup?",
        "Would you rather fight 1 horse-sized duck or 100 duck-sized horses?",
        "Are cats secretly aliens?",
        "Is a thumb a finger?",
        "Should we replace all water with chocolate milk?",
        "Is a tomato a fruit or a vegetable?",
        "Would you rather have spaghetti for hair or sweat maple syrup?",
        "Is a hotdog a taco?",
        "Should it be legal to eat ice cream for breakfast?"
    ],
    school: [
        "Should homework be banned forever?",
        "Should kids have a 4-day school week?",
        "Is it important to learn cursive handwriting?",
        "Should school start later in the morning?",
        "Should students grade their teachers?",
        "Are uniforms better than regular clothes for school?",
        "Should physical education be required every day?",
        "Are recess and playtime more important than math?",
        "Should students be allowed to pick their own seats?",
        "Should all textbooks be replaced with tablets?"
    ],
    food: [
        "What is the best pizza topping?",
        "Is it better to eat at home or at a restaurant?",
        "Should everyone become a vegetarian?",
        "Is chocolate better than vanilla?",
        "Should soda be banned for kids?",
        "Are hamburgers better than hotdogs?",
        "Is breakfast really the most important meal of the day?",
        "Should junk food be sold in schools?",
        "Is it okay to eat dessert before dinner?",
        "Which is better: pancakes or waffles?"
    ],
    animals: [
        "Are dogs better pets than cats?",
        "Should zoo animals be released into the wild?",
        "Should people be allowed to keep exotic pets like tigers?",
        "Are insects the food of the future?",
        "Should we bring back extinct animals like dinosaurs?",
        "Which is a cooler superpower: talking to animals or flying?",
        "Are birds technically dinosaurs?",
        "Should testing cosmetics on animals be illegal?",
        "Is a shark scarier than a bear?",
        "Should everyone have a pet growing up?"
    ],
    tech: [
        "Should kids be allowed to have smartphones?",
        "Are video games good for your brain?",
        "Should robots do all of our chores?",
        "Is it better to read a physical book or an e-book?",
        "Will artificial intelligence take over the world?",
        "Should people travel to and live on Mars?",
        "Is screen time really bad for your eyes?",
        "Should kids learn to code before they learn a foreign language?",
        "Are self-driving cars safe?",
        "Should social media be restricted to people over 18?"
    ]
};

// --- Game State ---
let gameState = {
    team1Name: "Team 1",
    team2Name: "Team 2",
    topic: "",
    timerDurationSeconds: 60,
    currentTurn: 1, // 1 for Team 1, 2 for Team 2
    timerInterval: null,
    timeLeft: 0
};

// --- Sound System (Web Audio API) ---
let audioCtx;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playClick() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
}

function playTick() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
}

function playBuzzer() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1);
}

function playCheer() {
    const ctx = getAudioCtx();
    const freqs = [440, 554.37, 659.25, 880]; // A major arpeggio
    freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.1 + 0.1);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.1 + 1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 1);
    });
}

// --- DOM Elements ---
const screens = document.querySelectorAll('.screen');

// Setup Screen Elements
const t1NameInput = document.getElementById('team1-name');
const t2NameInput = document.getElementById('team2-name');
const topicTypeSelect = document.getElementById('topic-type');
const timerInput = document.getElementById('timer-duration');

// Topic Screen Elements
const topicText = document.getElementById('topic-text');

// Pass Device Screen Elements
const passDeviceText = document.getElementById('pass-device-text');

// Debate Timer Screen Elements
const currentSpeakerText = document.getElementById('current-speaker');
const topicReminderText = document.getElementById('topic-reminder-text');
const timerDisplay = document.getElementById('timer-display');

// Judge Screen Elements
const rubricT1Name = document.getElementById('rubric-team1-name');
const rubricT2Name = document.getElementById('rubric-team2-name');

// Winner Screen Elements
const winnerNameText = document.getElementById('winner-name');
const scoreT1Name = document.getElementById('score-t1-name');
const scoreT2Name = document.getElementById('score-t2-name');
const scoreT1Val = document.getElementById('score-t1-val');
const scoreT2Val = document.getElementById('score-t2-val');

// --- Navigation Functions ---
function showScreen(screenId) {
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// --- Settings Logic ---
function toggleAllThemes(checkbox) {
    const themeChecks = document.querySelectorAll('.theme-check');
    themeChecks.forEach(cb => cb.checked = checkbox.checked);
}

function checkThemeSelection() {
    const themeChecks = document.querySelectorAll('.theme-check');
    const allChecked = Array.from(themeChecks).every(cb => cb.checked);
    document.getElementById('theme-all').checked = allChecked;
}

// --- Game Flow Functions ---
function startGame() {
    playClick();
    // 1. Get Settings
    gameState.team1Name = t1NameInput.value.trim() || "Team 1";
    gameState.team2Name = t2NameInput.value.trim() || "Team 2";
    
    let minutes = parseFloat(timerInput.value);
    if (isNaN(minutes) || minutes < 0.5) minutes = 1;
    gameState.timerDurationSeconds = Math.floor(minutes * 60);

    // 2. Select Topic
    const selectedThemes = Array.from(document.querySelectorAll('.theme-check'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);
        
    if (selectedThemes.length === 0) {
        alert("Please select at least one topic theme!");
        return;
    }
    
    let aggregatedTopics = [];
    selectedThemes.forEach(theme => {
        aggregatedTopics = aggregatedTopics.concat(topicsData[theme]);
    });
    
    gameState.topic = aggregatedTopics[Math.floor(Math.random() * aggregatedTopics.length)];

    // 3. Update UI
    topicText.textContent = gameState.topic;
    rubricT1Name.textContent = gameState.team1Name;
    rubricT2Name.textContent = gameState.team2Name;
    scoreT1Name.textContent = gameState.team1Name;
    scoreT2Name.textContent = gameState.team2Name;
    
    // 4. Go to Topic Screen
    showScreen('screen-topic');
}

function startDebatePhase() {
    playClick();
    gameState.currentTurn = 1;
    showPassDeviceScreen();
}

function showPassDeviceScreen() {
    const speakerName = gameState.currentTurn === 1 ? gameState.team1Name : gameState.team2Name;
    passDeviceText.textContent = `Pass the device to ${speakerName}!`;
    showScreen('screen-pass-device');
}

function startTimer() {
    playClick();
    // Setup Debate Screen
    const speakerName = gameState.currentTurn === 1 ? gameState.team1Name : gameState.team2Name;
    currentSpeakerText.textContent = `${speakerName}'s Turn`;
    topicReminderText.textContent = `Topic: "${gameState.topic}"`;
    
    gameState.timeLeft = gameState.timerDurationSeconds;
    updateTimerDisplay();
    
    showScreen('screen-debate');

    // Start countdown
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            playBuzzer();
            handleTurnEnd();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(gameState.timeLeft / 60);
    const secs = gameState.timeLeft % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    if (gameState.timeLeft <= 10 && gameState.timeLeft > 0) {
        playTick();
        timerDisplay.style.color = '#FF4757';
        timerDisplay.style.transform = 'scale(1.1)';
    } else {
        timerDisplay.style.color = 'var(--light)';
        timerDisplay.style.transform = 'scale(1)';
    }
}

function skipTimer() {
    playClick();
    clearInterval(gameState.timerInterval);
    handleTurnEnd();
}

function handleTurnEnd() {
    if (gameState.currentTurn === 1) {
        gameState.currentTurn = 2;
        showPassDeviceScreen();
    } else {
        // Both turns done, go to judge
        showScreen('screen-judge');
    }
}

// --- Judging Functions ---
function updateSliderVal(elementId, value) {
    document.getElementById(elementId).textContent = value;
}

function calculateScore(teamPrefix) {
    let score = 0;
    // Objective Checks (1 pt each)
    const checks = document.querySelectorAll(`.${teamPrefix}-check`);
    checks.forEach(check => {
        if (check.checked) score += 1;
    });
    
    // Subjective slider
    const slider = document.querySelector(`.${teamPrefix}-slider`);
    score += parseInt(slider.value);
    
    return score;
}

function calculateWinner() {
    playCheer();
    const t1Score = calculateScore('t1');
    const t2Score = calculateScore('t2');
    
    scoreT1Val.textContent = t1Score;
    scoreT2Val.textContent = t2Score;
    
    if (t1Score > t2Score) {
        winnerNameText.textContent = `${gameState.team1Name} Wins!`;
        winnerNameText.style.color = 'var(--dark)';
    } else if (t2Score > t1Score) {
        winnerNameText.textContent = `${gameState.team2Name} Wins!`;
        winnerNameText.style.color = 'var(--dark)';
    } else {
        winnerNameText.textContent = "It's a Tie!";
        winnerNameText.style.color = 'var(--dark)';
    }
    
    showScreen('screen-winner');
    shootConfetti();
}

function resetGame() {
    playClick();
    // Reset inputs in rubric
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    document.querySelectorAll('input[type="range"]').forEach(r => { r.value = 0; r.dispatchEvent(new Event('input')); });
    
    // Clear confetti
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    showScreen('screen-setup');
}

// --- Confetti Animation ---
function shootConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    const particles = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FFD700', '#FF8C00'];
    
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height + 10,
            r: Math.random() * 6 + 4,
            dx: Math.random() * 10 - 5,
            dy: Math.random() * -15 - 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleInc: (Math.random() * 0.07) + 0.05,
            tiltAngle: 0
        });
    }
    
    let animationId;
    function render() {
        requestAnimationFrame(render);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.tiltAngle += p.tiltAngleInc;
            p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle) * 2;
            p.dy += 0.2; // gravity
            p.y += p.dy;
            
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
        });
    }
    render();
    
    // Stop after 5 seconds
    setTimeout(() => {
        canvas.width = 0; // quick clear
    }, 5000);
}

// Handle window resize for confetti
window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas.width > 0) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
