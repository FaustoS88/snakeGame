import { setMusic, playDeathSound } from './music.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const musicToggle = document.getElementById('musicToggle');
const scoreElement = document.getElementById('score');

canvas.width = 400;
canvas.height = 400;
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let musicEnabled = false;
let gameStarted = false;
let gameOver = false;
let gameLoop;

const HIGH_SCORES_KEY = 'snakeHighScores';
let highScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '[]');

function updateMusicDisplay(element) {
  element.textContent = musicEnabled ? '🔊 Music' : '🔇 Music';
}

function createOverlay(content) {
  const existing = document.querySelector('.overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = content;
  document.querySelector('.game-container').appendChild(overlay);
  return overlay;
}

function showStartScreen() {
  const startContent = `
    <div class="rules">
      <h2>How to Play</h2>
      <ul>
        <li>→ Use arrow keys to move</li>
        <li>→ Collect red food to grow</li>
      </ul>
    </div>
    <canvas id="startAnimation" width="200" height="100"></canvas>
    <button id="startButton">Play Game</button>
    <button id="startMusicToggle">🔇 Music</button>
  `;
  const overlay = createOverlay(startContent);
  
  const startCanvas = document.getElementById('startAnimation');
  const startCtx = startCanvas.getContext('2d');
  let animX = 0;
  
  function animateSnake() {
    startCtx.clearRect(0, 0, startCanvas.width, startCanvas.height);
    startCtx.fillStyle = '#00ff00';
    startCtx.fillRect(animX, 40, 20, 20);
    startCtx.fillRect(animX - 25, 40, 20, 20);
    startCtx.fillRect(animX - 50, 40, 20, 20);
    
    animX = (animX + 2) % (startCanvas.width + 50);
    if (!gameStarted) requestAnimationFrame(animateSnake);
  }
  animateSnake();

  const startMusicToggle = document.getElementById('startMusicToggle');
  updateMusicDisplay(startMusicToggle);

  document.getElementById('startButton').addEventListener('click', () => {
    gameStarted = true;
    overlay.remove();
    if (musicEnabled) {
      setMusic(true);
    }
    startGame();
  });

  document.getElementById('startMusicToggle').addEventListener('click', (e) => {
    musicEnabled = !musicEnabled;
    updateMusicDisplay(e.target);
    updateMusicDisplay(musicToggle);
    setMusic(musicEnabled && gameStarted);
  });
}

function updateHighScores(newScore) {
  highScores.push(newScore);
  highScores.sort((a, b) => b - a);
  highScores = highScores.slice(0, 10);
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
}

function showGameOver() {
  updateHighScores(score);
  const highScoresList = highScores
    .map((score, index) => `<li>${score}</li>`)
    .join('');

  const gameOverContent = `
    <div class="game-over">GAME OVER</div>
    <div class="final-score">Final Score: ${score}</div>
    <div class="high-scores">
      <h2>High Scores</h2>
      <ol>${highScoresList}</ol>
    </div>
    <button id="restartButton">Play Again</button>
  `;
  
  const overlay = createOverlay(gameOverContent);
  
  document.getElementById('restartButton').addEventListener('click', () => {
    overlay.remove();
    resetGame();
    if (musicEnabled) {
      setMusic(true);
    }
    startGame();
  });
}

function drawGame() {
  clearCanvas();
  moveSnake();
  if (checkCollision()) {
    endGame();
    return;
  }
  drawFood();
  drawSnake();
  updateScore();
}

function clearCanvas() {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  ctx.fillStyle = '#00ff00';
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });
}

function drawFood() {
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  
  head.x = (head.x + tileCount) % tileCount;
  head.y = (head.y + tileCount) % tileCount;
  
  snake.unshift(head);
  
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    generateFood();
  } else {
    snake.pop();
  }
}

function checkCollision() {
  const head = snake[0];
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  return false;
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
  
  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    generateFood();
  }
}

function updateScore() {
  scoreElement.textContent = `Score: ${score}`;
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  dx = 0;
  dy = 0;
  score = 0;
  gameOver = false;
  generateFood();
}

function endGame() {
  gameOver = true;
  clearInterval(gameLoop);
  setMusic(false);
  playDeathSound();
  showGameOver();
}

function startGame() {
  resetGame();
  gameLoop = setInterval(drawGame, 100);
}

document.addEventListener('keydown', (e) => {
  if (!gameStarted || gameOver) return;
  
  switch (e.key) {
    case 'ArrowUp':
      if (dy === 0) { dx = 0; dy = -1; }
      break;
    case 'ArrowDown':
      if (dy === 0) { dx = 0; dy = 1; }
      break;
    case 'ArrowLeft':
      if (dx === 0) { dx = -1; dy = 0; }
      break;
    case 'ArrowRight':
      if (dx === 0) { dx = 1; dy = 0; }
      break;
  }
});

updateMusicDisplay(musicToggle);

musicToggle.addEventListener('click', () => {
  musicEnabled = !musicEnabled;
  setMusic(musicEnabled && gameStarted);
  updateMusicDisplay(musicToggle);
});

showStartScreen();
