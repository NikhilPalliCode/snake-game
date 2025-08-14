// Game constants
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const FPS = 10;

// Game state
let snake = [{x: 200, y: 200}];
let food = generateFood();
let dx = GRID_SIZE;
let dy = 0;
let score = 0;
let gameOver = false;
let gameInterval;

// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restart');

// Initialize game
function init() {
    document.addEventListener('keydown', changeDirection);
    restartButton.addEventListener('click', resetGame);
    gameInterval = setInterval(gameLoop, 1000 / FPS);
}

// Main game loop
function gameLoop() {
    if (gameOver) return;
    
    moveSnake();
    checkCollision();
    drawGame();
}

// Move the snake
function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        food = generateFood();
    } else {
        snake.pop();
    }
}

// Generate random food position
function generateFood() {
    const position = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE,
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE
    };
    
    // Make sure food doesn't spawn on snake
    while (snake.some(segment => segment.x === position.x && segment.y === position.y)) {
        position.x = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
        position.y = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
    }
    
    return position;
}

// Check for collisions
function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE) {
        endGame();
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
        }
    }
}

// Handle keyboard input
function changeDirection(event) {
    const key = event.keyCode;
    
    // Prevent reverse direction
    if (key === 37 && dx === 0) { // Left
        dx = -GRID_SIZE;
        dy = 0;
    } else if (key === 38 && dy === 0) { // Up
        dx = 0;
        dy = -GRID_SIZE;
    } else if (key === 39 && dx === 0) { // Right
        dx = GRID_SIZE;
        dy = 0;
    } else if (key === 40 && dy === 0) { // Down
        dx = 0;
        dy = GRID_SIZE;
    }
}

// Draw game elements
function drawGame() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A'; // Head darker than body
        ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    });
    
    // Draw food
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
}

// End game
function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
}

// Reset game
function resetGame() {
    snake = [{x: 200, y: 200}];
    food = generateFood();
    dx = GRID_SIZE;
    dy = 0;
    score = 0;
    gameOver = false;
    scoreDisplay.textContent = `Score: ${score}`;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 1000 / FPS);
}

// Start the game
init();