document.addEventListener('DOMContentLoaded', function() {
    // Update current time
    function updateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        document.getElementById('current-time').textContent = 
            `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        document.getElementById('current-date').textContent = 
            `${year}-${month}-${day}`;
    }
    
    updateTime();
    setInterval(updateTime, 1000);

    // Theme handling
    const moodButtons = document.querySelectorAll('.mood');
    moodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mood = this.dataset.mood;
            document.body.className = '';
            document.body.classList.add(`${mood}-theme`);
            
            // Update current mood in footer
            document.getElementById('current-mood').textContent = 
                mood.charAt(0).toUpperCase() + mood.slice(1);
            
            // Show a message
            showNotification(`${mood.charAt(0).toUpperCase() + mood.slice(1)} mode activated`);
        });
    });

    // Emotional Journal
    const feelingText = document.getElementById('feeling-text');
    const saveFeeling = document.getElementById('save-feeling');
    const feelingsList = document.getElementById('feelings-list');
    let feelings = JSON.parse(localStorage.getItem('feelings')) || [];
    
    function renderFeelings() {
        feelingsList.innerHTML = '';
        feelings.slice(0, 5).forEach(feeling => {
            const entry = document.createElement('div');
            entry.classList.add('feeling-entry');
            entry.innerHTML = `
                <div class="feeling-date">${feeling.date}</div>
                <div class="feeling-content">${feeling.content}</div>
            `;
            feelingsList.appendChild(entry);
        });
    }
    
    renderFeelings();
    
    saveFeeling.addEventListener('click', function() {
        if (feelingText.value.trim() !== '') {
            const now = new Date();
            const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
            feelings.unshift({
                date: formattedDate,
                content: feelingText.value
            });
            
            if (feelings.length > 10) feelings.pop();
            localStorage.setItem('feelings', JSON.stringify(feelings));
            
            feelingText.value = '';
            renderFeelings();
            showNotification('Feeling saved');
        }
    });

    // Breathing exercise
    const breathingTypes = {
        'box': {
            phases: ['Inhale', 'Hold', 'Exhale', 'Hold'],
            durations: [4, 4, 4, 4]
        },
        '4-7-8': {
            phases: ['Inhale', 'Hold', 'Exhale'],
            durations: [4, 7, 8]
        },
        'deep': {
            phases: ['Inhale slowly', 'Exhale slowly'],
            durations: [5, 5]
        }
    };
    
    let currentBreathingType = 'box';
    const breathingCircle = document.querySelector('.breathing-circle');
    const breathingInstruction = document.querySelector('.breathing-instruction');
    const breathingTypeButtons = document.querySelectorAll('.breathing-type');
    const sessionCount = document.getElementById('session-count');
    
    let isBreathing = false;
    let breathingInterval;
    let breathingPhase = 0;
    let sessions = parseInt(localStorage.getItem('breathingSessions')) || 0;
    
    sessionCount.textContent = sessions;
    
    breathingTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            breathingTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentBreathingType = this.dataset.type;
            
            if (isBreathing) {
                stopBreathingExercise();
                startBreathingExercise();
            }
        });
    });

    breathingCircle.addEventListener('click', function() {
        if (!isBreathing) {
            startBreathingExercise();
        } else {
            stopBreathingExercise();
        }
    });

    function startBreathingExercise() {
        isBreathing = true;
        breathingPhase = 0;
        breathingCycle();
    }

    function stopBreathingExercise() {
        isBreathing = false;
        clearTimeout(breathingInterval);
        breathingCircle.classList.remove('inhale', 'hold', 'exhale');
        breathingInstruction.textContent = 'Click to begin';
    }

    function breathingCycle() {
        const breathing = breathingTypes[currentBreathingType];
        const phase = breathing.phases[breathingPhase];
        const duration = breathing.durations[breathingPhase] * 1000;
        
        breathingCircle.classList.remove('inhale', 'hold', 'exhale');
        
        if (phase.includes('Inhale')) {
            breathingCircle.classList.add('inhale');
        } else if (phase.includes('Hold')) {
            breathingCircle.classList.add('hold');
        } else if (phase.includes('Exhale')) {
            breathingCircle.classList.add('exhale');
        }
        
        breathingInstruction.textContent = phase + '...';
        
        breathingPhase = (breathingPhase + 1) % breathing.phases.length;
        
        if (breathingPhase === 0 && isBreathing) {
            // Completed one full cycle
            sessions++;
            sessionCount.textContent = sessions;
            localStorage.setItem('breathingSessions', sessions);
        }
        
        if (isBreathing) {
            breathingInterval = setTimeout(breathingCycle, duration);
        }
    }

    // Zen Garden
    const canvas = document.getElementById('zen-garden-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let brushSize = 15;
    let patternType = 'circle';
    
    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        // Fill with initial sand color
        ctx.fillStyle = document.getElementById('sand-color').value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup');
        canvas.dispatchEvent(mouseEvent);
    });

    document.getElementById('brush-size').addEventListener('input', function() {
        brushSize = parseInt(this.value);
    });
    
    document.getElementById('pattern-type').addEventListener('change', function() {
        patternType = this.value;
    });

    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.fillStyle = document.getElementById('sand-color').value;
        
        if (patternType === 'circle') {
            ctx.beginPath();
            ctx.arc(x, y, brushSize, 0, Math.PI * 2);
            ctx.fill();
        } else if (patternType === 'square') {
            ctx.fillRect(x - brushSize/2, y - brushSize/2, brushSize, brushSize);
        } else if (patternType === 'star') {
            drawStar(x, y, 5, brushSize/2, brushSize/4);
        }
    }
    
    function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    document.getElementById('clear-garden').addEventListener('click', function() {
        ctx.fillStyle = document.getElementById('sand-color').value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    
    document.getElementById('save-garden').addEventListener('click', function() {
        // Create a thumbnail
        const thumbnailCanvas = document.createElement('canvas');
        thumbnailCanvas.width = 100;
        thumbnailCanvas.height = 70;
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        
        thumbnailCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 
                              0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        
        const thumbnail = document.createElement('img');
        thumbnail.src = thumbnailCanvas.toDataURL();
        thumbnail.classList.add('saved-creation');
        thumbnail.title = 'Click to load this creation';
        
        thumbnail.addEventListener('click', function() {
            ctx.drawImage(this, 0, 0, this.width, this.height, 
                         0, 0, canvas.width, canvas.height);
        });
        
        const savedCreations = document.getElementById('saved-creations');
        
        // Keep max 6 thumbnails
        if (savedCreations.children.length >= 6) {
            savedCreations.removeChild(savedCreations.firstChild);
        }
        
        savedCreations.appendChild(thumbnail);
        showNotification('Creation saved');
    });

    // YouTube Rain Sound
    let player;
    const playRainSoundBtn = document.getElementById('play-rain-sound');
    const videoContainer = document.getElementById('video-container');
    
    // This function will be called when the YouTube API is ready
    window.onYouTubeIframeAPIReady = function() {
        // Create a YouTube player but don't show it yet
        player = new YT.Player('video-container', {
            videoId: 'mPZkdNFkNps', // The YouTube video ID
            playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
                rel: 0,
                start: 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    };
    
    function onPlayerReady(event) {
        // Player is ready, but we'll keep it hidden until the button is clicked
        playRainSoundBtn.addEventListener('click', toggleRainSound);
    }
    
    function onPlayerStateChange(event) {
        // If the video ends, update the play button
        if (event.data === YT.PlayerState.ENDED) {
            playRainSoundBtn.innerHTML = '<i class="fas fa-play"></i> Play Rain Sounds';
            videoContainer.style.display = 'none';
        }
    }
    
    function toggleRainSound() {
        if (player && typeof player.getPlayerState === 'function') {
            const playerState = player.getPlayerState();
            
            if (playerState === YT.PlayerState.PLAYING) {
                // If playing, pause the video
                player.pauseVideo();
                playRainSoundBtn.innerHTML = '<i class="fas fa-play"></i> Play Rain Sounds';
                videoContainer.style.display = 'none';
            } else {
                // If paused or stopped, play the video
                videoContainer.style.display = 'block';
                player.playVideo();
                playRainSoundBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Rain Sounds';
            }
        }
    }

    // Mini Games with auto-expand functionality
    const gameButtons = document.querySelectorAll('.start-game');
    const gameArea = document.getElementById('game-area');
    const gameContent = document.getElementById('game-content');
    const closeGame = document.getElementById('close-game');
    const fullscreenGame = document.getElementById('fullscreen-game');
    
    // Keep track of current game
    let currentGame = null;
    let isGameFullscreen = false;
    
    gameButtons.forEach(button => {
        button.addEventListener('click', function() {
            const game = this.dataset.game;
            currentGame = game;
            
            // Automatically show game in expanded mode
            gameArea.style.display = 'block';
            gameArea.classList.add('expanded');
            
            // Load the game with expanded size
            if (game === 'memory') {
                loadMemoryGame(true);
            } else if (game === 'puzzle') {
                loadPuzzleGame(true);
            }
        });
    });
    
    closeGame.addEventListener('click', function() {
        gameArea.style.display = 'none';
        gameContent.innerHTML = '';
        gameArea.classList.remove('expanded');
        gameArea.classList.remove('fullscreen');
        document.body.style.overflow = 'auto';
        fullscreenGame.innerHTML = '<i class="fas fa-expand"></i>';
        currentGame = null;
        isGameFullscreen = false;
    });
    
    fullscreenGame.addEventListener('click', function() {
        if (isGameFullscreen) {
            // Exit fullscreen mode but keep expanded
            gameArea.classList.remove('fullscreen');
            gameArea.classList.add('expanded');
            document.body.style.overflow = 'auto';
            fullscreenGame.innerHTML = '<i class="fas fa-expand"></i>';
            isGameFullscreen = false;
        } else {
            // Enter fullscreen mode
            gameArea.classList.remove('expanded');
            gameArea.classList.add('fullscreen');
            document.body.style.overflow = 'hidden';
            fullscreenGame.innerHTML = '<i class="fas fa-compress"></i>';
            isGameFullscreen = true;
        }
        
        // Reload the game with appropriate size
        if (currentGame === 'memory') {
            loadMemoryGame(isGameFullscreen);
        } else if (currentGame === 'puzzle') {
            loadPuzzleGame(isGameFullscreen);
        }
    });
    
    function loadMemoryGame(isLarge) {
        // Simple memory matching game
        const pairs = 8; // 8 pairs = 16 cards
        const emojis = ['🌸', '🌺', '🌻', '🌼', '🌷', '🍀', '🌿', '🌱', '🌲', '🌵', '🍄', '🐚'];
        const gameEmojis = [...emojis.slice(0, pairs), ...emojis.slice(0, pairs)];
        
        // Shuffle
        gameEmojis.sort(() => Math.random() - 0.5);
        
        // Determine card size based on size
        const cardHeight = isLarge ? '120px' : '90px';
        const fontSize = isLarge ? '3rem' : '2.2rem';
        const maxWidth = isLarge ? '800px' : '600px';
        
        const memoryHTML = `
            <div class="memory-game">
                <div class="game-info">
                    <span class="matches">Pairs: 0/${pairs}</span>
                    <span class="moves">Moves: 0</span>
                </div>
                <div class="cards-container">
                    ${gameEmojis.map((emoji, index) => `
                        <div class="card" data-card="${index}" data-value="${emoji}">
                            <div class="card-back">?</div>
                            <div class="card-front">${emoji}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <style>
                .memory-game {
                    width: 100%;
                    max-width: ${maxWidth};
                }
                .game-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    font-size: 1.2rem;
                }
                .cards-container {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                }
                .card {
                    height: ${cardHeight};
                    background-color: #f5f5f5;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    position: relative;
                    transform-style: preserve-3d;
                    transition: transform 0.5s;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                .card-front, .card-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backface-visibility: hidden;
                    font-size: ${fontSize};
                    border-radius: 8px;
                }
                .card-back {
                    background-color: #e8b4b8;
                    color: white;
                    font-weight: bold;
                }
                .card-front {
                    transform: rotateY(180deg);
                    background-color: white;
                }
                .card.flipped {
                    transform: rotateY(180deg);
                }
                .card.matched {
                    background-color: #d4edda;
                }
            </style>
        `;
        
        gameContent.innerHTML = memoryHTML;
        
        // Memory game logic
        const cards = document.querySelectorAll('.card');
        let hasFlippedCard = false;
        let lockBoard = false;
        let firstCard, secondCard;
        let moves = 0;
        let matches = 0;
        
        function flipCard() {
            if (lockBoard) return;
            if (this === firstCard) return;
            
            this.classList.add('flipped');
            
            if (!hasFlippedCard) {
                // First card flipped
                hasFlippedCard = true;
                firstCard = this;
                return;
            }
            
            // Second card flipped
            secondCard = this;
            checkForMatch();
        }
        
        function checkForMatch() {
            moves++;
            document.querySelector('.moves').textContent = `Moves: ${moves}`;
            
            let isMatch = firstCard.dataset.value === secondCard.dataset.value;
            
            if (isMatch) {
                // It's a match
                disableCards();
                matches++;
                document.querySelector('.matches').textContent = `Pairs: ${matches}/${pairs}`;
                
                if (matches === pairs) {
                    setTimeout(() => {
                        showNotification(`Congratulations! You found all pairs in ${moves} moves!`);
                    }, 500);
                }
            } else {
                // Not a match
                unflipCards();
            }
        }
        
        function disableCards() {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);
            
            resetBoard();
        }
        
        function unflipCards() {
            lockBoard = true;
            
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                
                resetBoard();
            }, 1000);
        }
        
        function resetBoard() {
            [hasFlippedCard, lockBoard] = [false, false];
            [firstCard, secondCard] = [null, null];
        }
        
        cards.forEach(card => card.addEventListener('click', flipCard));
    }
    
    function loadPuzzleGame(isLarge) {
        // Simple sliding puzzle game
        const gridSize = isLarge ? '500px' : '350px';
        const fontSize = isLarge ? '2.5rem' : '1.8rem';
        const maxWidth = isLarge ? '600px' : '450px';
        const gap = isLarge ? '10px' : '8px';
        
        const puzzleHTML = `
            <div class="puzzle-game">
                <div class="game-info">
                    <span class="moves">Moves: 0</span>
                    <button id="shuffle-puzzle">Shuffle</button>
                </div>
                <div class="puzzle-container">
                    <div class="puzzle-grid">
                        ${Array(15).fill().map((_, i) => 
                            `<div class="puzzle-piece" data-index="${i+1}">${i+1}</div>`
                        ).join('')}
                        <div class="puzzle-piece empty" data-index="16"></div>
                    </div>
                </div>
            </div>
            <style>
                .puzzle-game {
                    width: 100%;
                    max-width: ${maxWidth};
                }
                .game-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    font-size: 1.2rem;
                }
                .puzzle-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    grid-template-rows: repeat(4, 1fr);
                    gap: ${gap};
                    width: ${gridSize};
                    height: ${gridSize};
                    margin: 0 auto;
                    background-color: #e8b4b8;
                    padding: 8px;
                    border-radius: 8px;
                }
                .puzzle-piece {
                    background-color: #f5f5f5;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${fontSize};
                    cursor: pointer;
                    user-select: none;
                    transition: all 0.2s;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    background-image: linear-gradient(to bottom right, #ffffff, #f1e3e6);
                }
                .puzzle-piece:hover:not(.empty) {
                    transform: scale(0.95);
                }
                .puzzle-piece.empty {
                    background-color: transparent;
                    box-shadow: none;
                    cursor: default;
                }
                #shuffle-puzzle {
                    font-size: 0.9rem;
                    padding: 8px 15px;
                    background-color: #ac8daf;
                }
            </style>
        `;
        
        gameContent.innerHTML = puzzleHTML;
        
        // Puzzle logic
        const puzzleGrid = document.querySelector('.puzzle-grid');
        const pieces = document.querySelectorAll('.puzzle-piece:not(.empty)');
        const emptyPiece = document.querySelector('.empty');
        const movesDisplay = document.querySelector('.puzzle-game .moves');
        let moves = 0;
        
        // Initialize positions
        let index = 0;
        for (let row = 1; row <= 4; row++) {
            for (let col = 1; col <= 4; col++) {
                if (index < pieces.length) {
                    pieces[index].style.gridRowStart = row;
                    pieces[index].style.gridColumnStart = col;
                    index++;
                } else {
                    emptyPiece.style.gridRowStart = row;
                    emptyPiece.style.gridColumnStart = col;
                }
            }
        }
        
        // Initial shuffle
        shufflePuzzle(20);
        
        document.getElementById('shuffle-puzzle').addEventListener('click', function() {
            shufflePuzzle(50);
            moves = 0;
            movesDisplay.textContent = `Moves: ${moves}`;
        });
        
        pieces.forEach(piece => {
            piece.addEventListener('click', function() {
                if (isAdjacent(this, emptyPiece)) {
                    swapPieces(this, emptyPiece);
                    moves++;
                    movesDisplay.textContent = `Moves: ${moves}`;
                    
                    if (isPuzzleSolved()) {
                        setTimeout(() => {
                            showNotification(`Congratulations! You solved the puzzle in ${moves} moves!`);
                        }, 500);
                    }
                }
            });
        });
        
        function getPosition(element) {
            const style = window.getComputedStyle(element);
            return {
                row: parseInt(style.gridRowStart),
                col: parseInt(style.gridColumnStart)
            };
        }
        
        function setPosition(element, row, col) {
            element.style.gridRowStart = row;
            element.style.gridColumnStart = col;
        }
        
        function isAdjacent(piece1, piece2) {
            const pos1 = getPosition(piece1);
            const pos2 = getPosition(piece2);
            
            return (
                (Math.abs(pos1.row - pos2.row) === 1 && pos1.col === pos2.col) ||
                (Math.abs(pos1.col - pos2.col) === 1 && pos1.row === pos2.row)
            );
        }
        
        function swapPieces(piece1, piece2) {
            const pos1 = getPosition(piece1);
            const pos2 = getPosition(piece2);
            
            setPosition(piece1, pos2.row, pos2.col);
            setPosition(piece2, pos1.row, pos1.col);
        }
        
        function getAdjacentPieces(piece) {
            const pos = getPosition(piece);
            const adjacent = [];
            
            pieces.forEach(p => {
                const pPos = getPosition(p);
                if (
                    (Math.abs(pos.row - pPos.row) === 1 && pos.col === pPos.col) ||
                    (Math.abs(pos.col - pPos.col) === 1 && pos.row === pPos.row)
                ) {
                    adjacent.push(p);
                }
            });
            
            return adjacent;
        }
        
        function shufflePuzzle(moves) {
            // Make random valid moves
            for (let i = 0; i < moves; i++) {
                const adjacent = getAdjacentPieces(emptyPiece);
                const randomPiece = adjacent[Math.floor(Math.random() * adjacent.length)];
                swapPieces(randomPiece, emptyPiece);
            }
        }
        
        function isPuzzleSolved() {
            let solved = true;
            
            pieces.forEach(piece => {
                const index = parseInt(piece.dataset.index);
                const row = Math.ceil(index / 4);
                const col = ((index - 1) % 4) + 1;
                const pos = getPosition(piece);
                
                if (pos.row !== row || pos.col !== col) {
                    solved = false;
                }
            });
            
            return solved;
        }
    }

    // Quote System
    const quotes = {
        mindfulness: [
            {text: "Breathe in peace, breathe out stress.", author: "Anonymous"},
            {text: "The present moment is a gift; that's why it's called 'present'.", author: "Eleanor Roosevelt"},
            {text: "Mindfulness isn't difficult, we just need to remember to do it.", author: "Sharon Salzberg"},
            {text: "Be where you are, not where you think you should be.", author: "Unknown"}
        ],
        peace: [
            {text: "Peace comes from within. Do not seek it without.", author: "Buddha"},
            {text: "In the midst of movement and chaos, keep stillness inside of you.", author: "Deepak Chopra"},
            {text: "When you do things from your soul, you feel a river moving in you, a joy.", author: "Rumi"},
            {text: "Quiet the mind, and the soul will speak.", author: "Ma Jaya Sati Bhagavati"}
        ],
        happiness: [
            {text: "The only way out is through.", author: "Robert Frost"},
            {text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama"},
            {text: "The most wasted of days is one without laughter.", author: "E. E. Cummings"},
            {text: "Happiness is letting go of what you think your life is supposed to look like.", author: "Unknown"}
        ],
        nature: [
            {text: "You are the sky. Everything else is just the weather.", author: "Pema Chödrön"},
            {text: "In nature, nothing is perfect and everything is perfect.", author: "Alice Walker"},
            {text: "Look deep into nature, and then you will understand everything better.", author: "Albert Einstein"},
            {text: "The clearest way into the Universe is through a forest wilderness.", author: "John Muir"}
        ]
    };
    
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const newQuoteBtn = document.getElementById('new-quote');
    const quoteCategory = document.getElementById('quote-category');
    const autoQuote = document.getElementById('auto-quote');
    
    let quoteInterval;
    
    function displayRandomQuote() {
        const category = quoteCategory.value;
        const categoryQuotes = quotes[category];
        const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
        const quote = categoryQuotes[randomIndex];
        
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `- ${quote.author}`;
        
        // Add a subtle animation
        quoteText.classList.remove('pulse');
        void quoteText.offsetWidth; // Force a DOM reflow
        quoteText.classList.add('pulse');
    }
    
    newQuoteBtn.addEventListener('click', displayRandomQuote);
    
    quoteCategory.addEventListener('change', displayRandomQuote);
    
    autoQuote.addEventListener('change', function() {
        if (this.checked) {
            // Change quote every 30 seconds
            quoteInterval = setInterval(displayRandomQuote, 30000);
        } else {
            clearInterval(quoteInterval);
        }
    });
    
    // Display initial quote
    displayRandomQuote();

    // Guided Meditation
    const meditationLength = document.getElementById('meditation-length');
    const meditationType = document.getElementById('meditation-type');
    const startMeditation = document.getElementById('start-meditation');
    const meditationStatus = document.getElementById('meditation-status');
    const meditationProgressBar = document.getElementById('meditation-progress-bar');
    
    let meditationTimer;
    let meditationProgress = 0;
    let meditationDuration = 0;
    
    const meditations = {
        'body-scan': [
            "Find a comfortable position and close your eyes.",
            "Take a few deep breaths to center yourself.",
            "Focus on your toes, feeling any sensations present.",
            "Slowly move your attention up to your feet and ankles.",
            "Continue to your calves and knees, noticing any tension.",
            "Bring awareness to your thighs and hips.",
            "Feel the sensations in your abdomen and lower back.",
            "Notice your chest rising and falling with each breath.",
            "Relax your shoulders, letting go of any tension.",
            "Bring attention to your arms and hands.",
            "Focus on your neck and throat, softening this area.",
            "Feel your facial muscles relax completely.",
            "Now be aware of your entire body as one whole.",
            "Rest in this full awareness for a few moments."
        ],
        'loving-kindness': [
            "Find a comfortable seated position and close your eyes.",
            "Take several deep breaths, centering yourself.",
            "Bring to mind someone you care deeply about.",
            "Silently repeat: May you be happy, may you be healthy.",
            "May you be safe, may you live with ease.",
            "Now direct these wishes to yourself.",
            "May I be happy, may I be healthy.",
            "May I be safe, may I live with ease.",
            "Extend these wishes to someone you feel neutral about.",
            "May they be happy, healthy, safe, and live with ease.",
            "Now think of someone with whom you have difficulty.",
            "Wish them happiness, health, safety and ease.",
            "Finally, extend these wishes to all beings everywhere.",
            "May all beings be happy and free from suffering."
        ],
        'mindfulness': [
            "Sit comfortably and close your eyes.",
            "Bring your attention to your breath.",
            "Notice the sensation of air entering your nostrils.",
            "Feel your chest and belly rise and fall.",
            "When your mind wanders, gently bring it back to your breath.",
            "There's no need to judge yourself when this happens.",
            "Simply notice thoughts and let them pass like clouds.",
            "Return to the anchor of your breath.",
            "Now expand your awareness to include body sensations.",
            "Notice any areas of tension or comfort.",
            "Include sounds in your awareness.",
            "Finally, be aware of your thoughts and emotions.",
            "Hold everything in a spacious awareness.",
            "Just being present with whatever arises."
        ]
    };
    
    startMeditation.addEventListener('click', function() {
        if (meditationTimer) {
            // Stop current meditation
            clearInterval(meditationTimer);
            meditationTimer = null;
            meditationStatus.textContent = 'Meditation paused';
            startMeditation.innerHTML = '<i class="fas fa-play"></i> Resume';
            return;
        }
        
        // Get duration
        let duration;
        switch (meditationLength.value) {
            case 'short': duration = 3 * 60; break; // 3 minutes
            case 'medium': duration = 5 * 60; break; // 5 minutes
            case 'long': duration = 10 * 60; break; // 10 minutes
            default: duration = 3 * 60;
        }
        
        if (meditationProgress === 0) {
            // Starting new meditation
            meditationDuration = duration;
            const meditationSteps = meditations[meditationType.value];
            meditationStatus.textContent = meditationSteps[0];
            meditationProgressBar.style.width = '0%';
        }
        
        startMeditation.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        meditationTimer = setInterval(() => {
            meditationProgress++;
            
            // Update progress bar
            const percent = (meditationProgress / meditationDuration) * 100;
            meditationProgressBar.style.width = `${percent}%`;
            
            // Update instruction based on progress
            const meditationSteps = meditations[meditationType.value];
            const stepIndex = Math.floor((meditationProgress / meditationDuration) * meditationSteps.length);
            if (stepIndex < meditationSteps.length) {
                meditationStatus.textContent = meditationSteps[stepIndex];
            }
            
            if (meditationProgress >= meditationDuration) {
                // Meditation complete
                clearInterval(meditationTimer);
                meditationTimer = null;
                meditationProgress = 0;
                meditationStatus.textContent = 'Meditation complete. Well done.';
                startMeditation.innerHTML = '<i class="fas fa-play"></i> Begin';
                showNotification('Meditation complete. Take a moment to notice how you feel.');
            }
        }, 1000);
    });

    // Notification function
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.classList.add('notification');
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Set the username in the footer
    document.querySelector('.user-name').textContent = 'litance';
});