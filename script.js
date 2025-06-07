let currentLane = 2; // Start in middle lane (0-4)
let speed = 60;
let animationSpeed = 1;
let dashOffset = 0;
let obstacles = [];
let carParts = [];
let gameTime = 0;
let score = 0;
let carPartsCount = 0;
let collisionCount = 0;
let lastObstacleTime = 0;
let lastCarPartTime = 0;
let gameState = 'highway'; // 'highway' or 'repair'
let gameTimeAtRepair = 0;

const canvas = document.getElementById('highway');
const ctx = canvas.getContext('2d');
const policeCar = document.getElementById('policeCar');
const speedDisplay = document.getElementById('speed');
const scoreDisplay = document.getElementById('score');
const carPartsDisplay = document.getElementById('carParts');
const collisionsDisplay = document.getElementById('collisions');
const repairShop = document.getElementById('repairShop');
const repairPartsCount = document.getElementById('repairPartsCount');
const backToHighwayBtn = document.getElementById('backToHighway');

// Obstacle types - colorful and fun for kids
const obstacleTypes = [
    { color: '#ff6b6b', size: 45, points: 10, emoji: '🚗' }, // Red car
    { color: '#4ecdc4', size: 40, points: 15, emoji: '🚙' }, // Teal SUV
    { color: '#45b7d1', size: 50, points: 20, emoji: '🚌' }, // Blue bus
    { color: '#f9ca24', size: 35, points: 25, emoji: '🚕' }, // Yellow taxi
    { color: '#f0932b', size: 55, points: 30, emoji: '🚛' }  // Orange truck
];

// Set canvas size to match container
function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Ensure canvas never exceeds container bounds
    const maxWidth = Math.floor(rect.width * 0.84);
    const maxHeight = Math.floor(rect.height);
    
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    
    // Ensure canvas stays within bounds
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = maxHeight + 'px';
}

// Draw lane lines with smooth animation
function drawLaneLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const laneWidth = canvas.width / 5;
    const dashLength = 20;
    const gapLength = 20;
    const totalPattern = dashLength + gapLength;

    // Draw 4 lane divider lines
    for (let lane = 1; lane < 5; lane++) {
        const x = lane * laneWidth;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([dashLength, gapLength]);
        ctx.lineDashOffset = -dashOffset; // Negative for downward movement

        ctx.beginPath();
        ctx.moveTo(x, -totalPattern);
        ctx.lineTo(x, canvas.height + totalPattern);
        ctx.stroke();
    }

    // Reset line dash for other drawing
    ctx.setLineDash([]);

    // Update dash offset for smooth animation (moving down)
    dashOffset += animationSpeed * 1.5;
    if (dashOffset >= totalPattern) {
        dashOffset = 0;
    }
}

// Position police car in current lane
function updateCarPosition() {
    const laneWidth = 84 / 5; // 5 lanes in 84% width
    const laneCenter = 8 + (currentLane * laneWidth) + (laneWidth / 2);
    policeCar.style.left = laneCenter + '%';
}

// Update animation speed based on game speed
function updateSpeed() {
    speed = Math.min(120, speed + Math.random() * 10 - 5);
    speed = Math.max(40, speed);
    speedDisplay.textContent = Math.round(speed);

    animationSpeed = (speed / 60) * 2;
}

// Move car left
function moveLeft() {
    if (currentLane > 0) {
        currentLane--;
        updateCarPosition();
    }
}

// Move car right
function moveRight() {
    if (currentLane < 4) {
        currentLane++;
        updateCarPosition();
    }
}

// Create a new obstacle
function createObstacle() {
    const now = Date.now();

    // Score-based difficulty - more challenging from start
    const difficulty = Math.min(score / 400, 1);

    // Start with 4 second gaps, reduce to 2 seconds at max difficulty
    const minGap = 4000 - (difficulty * 2000);

    if (now - lastObstacleTime < minGap) return;

    // Choose random lane
    let lane = Math.floor(Math.random() * 5);

    // For first 30 points, avoid player's lane
    if (score < 30 && lane === currentLane) {
        lane = (lane + 1) % 5;
    }

    // For first 15 points, also avoid adjacent lanes
    if (score < 15 && Math.abs(lane - currentLane) <= 1) {
        lane = (currentLane + 2) % 5;
    }

    // Faster car type introduction based on score
    let maxTypes = 1; // Start with just red cars
    if (score >= 25) maxTypes = 2;   // Add SUVs after 25 points
    if (score >= 75) maxTypes = 3;   // Add buses after 75 points
    if (score >= 150) maxTypes = 4;  // Add taxis after 150 points
    if (score >= 250) maxTypes = 5;  // Add trucks after 250 points

    const typeIndex = Math.floor(Math.random() * maxTypes);
    const type = obstacleTypes[typeIndex];

    obstacles.push({
        lane: lane,
        y: -type.size,
        type: type,
        id: Math.random()
    });

    lastObstacleTime = now;
}

// Update obstacles
function updateObstacles() {
    const baseSpeed = 1.5;
    const moveSpeed = baseSpeed + (animationSpeed * 0.4);

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.y += moveSpeed;

        // Remove obstacles that are off screen
        if (obstacle.y > canvas.height + obstacle.type.size) {
            obstacles.splice(i, 1);
            score += obstacle.type.points;
            scoreDisplay.textContent = score;
        }
    }
}



// Draw obstacles
function drawObstacles() {
    const laneWidth = canvas.width / 5;

    obstacles.forEach(obstacle => {
        const x = obstacle.lane * laneWidth + laneWidth / 2;
        const size = obstacle.type.size;
        const carWidth = size;
        const carHeight = size * 1.5;

        // Draw wheels FIRST (behind car body)
        ctx.fillStyle = '#333333';
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 2;

        const wheelSize = 8;
        // Front wheels
        ctx.beginPath();
        ctx.arc(x - carWidth/2 + 1, obstacle.y - carHeight/2 + 18, wheelSize/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x + carWidth/2 - 1, obstacle.y - carHeight/2 + 18, wheelSize/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rear wheels
        ctx.beginPath();
        ctx.arc(x - carWidth/2 + 1, obstacle.y + carHeight/2 - 18, wheelSize/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x + carWidth/2 - 1, obstacle.y + carHeight/2 - 18, wheelSize/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw main car body
        ctx.fillStyle = obstacle.type.color;
        ctx.beginPath();
        ctx.roundRect(x - carWidth/2, obstacle.y - carHeight/2, carWidth, carHeight, [25, 25, 8, 8]);
        ctx.fill();

        // Add roof section
        const roofColor = obstacle.type.color === '#ff6b6b' ? '#ffaaaa' :
                         obstacle.type.color === '#4ecdc4' ? '#88e5de' :
                         obstacle.type.color === '#45b7d1' ? '#7dc9e8' :
                         obstacle.type.color === '#f9ca24' ? '#fde68a' : '#f4a261';

        ctx.fillStyle = roofColor;
        ctx.beginPath();
        ctx.roundRect(x - carWidth * 0.375, obstacle.y - carHeight/2 + 15, carWidth * 0.75, carHeight * 0.47, [15, 15, 3, 3]);
        ctx.fill();

        // Add rear window
        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.beginPath();
        ctx.roundRect(x - carWidth * 0.3, obstacle.y - carHeight/2 + 20, carWidth * 0.6, carHeight * 0.17, [3, 3, 0, 0]);
        ctx.fill();

        // Add taillights
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.roundRect(x - carWidth * 0.35, obstacle.y + carHeight/2 - 8, carWidth * 0.12, carHeight * 0.08, 2);
        ctx.roundRect(x + carWidth * 0.23, obstacle.y + carHeight/2 - 8, carWidth * 0.12, carHeight * 0.08, 2);
        ctx.fill();

        // Add taxi sign for yellow taxis
        if (obstacle.type.color === '#f9ca24') {
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.roundRect(x - carWidth * 0.15, obstacle.y - carHeight/2 - 8, carWidth * 0.3, carHeight * 0.12, 2);
            ctx.fill();

            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.roundRect(x - carWidth * 0.12, obstacle.y - carHeight/2 - 6, carWidth * 0.24, carHeight * 0.08, 1);
            ctx.fill();

            ctx.fillStyle = '#333333';
            ctx.font = '6px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('TAXI', x, obstacle.y - carHeight/2 - 2);
        }
    });
}

// Create car parts (presents)
function createCarPart() {
    const now = Date.now();
    const minGap = 8000 + Math.random() * 7000;

    if (now - lastCarPartTime < minGap) return;

    // Find available lanes
    const availableLanes = [];
    for (let lane = 0; lane < 5; lane++) {
        let laneIsClear = true;

        for (let obstacle of obstacles) {
            if (obstacle.lane === lane && obstacle.y < 200 && obstacle.y > -100) {
                laneIsClear = false;
                break;
            }
        }

        if (laneIsClear) {
            availableLanes.push(lane);
        }
    }

    if (availableLanes.length === 0) return;

    const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];

    carParts.push({
        lane: lane,
        y: -30,
        id: Math.random()
    });

    lastCarPartTime = now;
}

// Update car parts
function updateCarParts() {
    const baseSpeed = 1.5;
    const moveSpeed = baseSpeed + (animationSpeed * 0.4);

    for (let i = carParts.length - 1; i >= 0; i--) {
        const carPart = carParts[i];
        carPart.y += moveSpeed;

        if (carPart.y > canvas.height + 30) {
            carParts.splice(i, 1);
        }
    }
}



// Draw car parts (presents)
function drawCarParts() {
    const laneWidth = canvas.width / 5;

    carParts.forEach(carPart => {
        const x = carPart.lane * laneWidth + laneWidth / 2;
        const size = 25;

        // Draw present box
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.roundRect(x - size/2, carPart.y - size/2, size, size, 4);
        ctx.fill();

        // Draw ribbon
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(x - 2, carPart.y - size/2, 4, size);
        ctx.fillRect(x - size/2, carPart.y - 2, size, 4);

        // Draw bow on top
        ctx.fillStyle = '#ffff99';
        ctx.beginPath();
        ctx.arc(x - 4, carPart.y - size/2 - 2, 3, 0, Math.PI * 2);
        ctx.arc(x + 4, carPart.y - size/2 - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Animation loop
function animate() {
    if (gameState !== 'highway') return;

    gameTime = Date.now() - startTime;

    drawLaneLines();
    createObstacle();
    updateObstacles();
    drawObstacles();
    createCarPart();
    updateCarParts();
    drawCarParts();

    requestAnimationFrame(animate);
}

// TOUCH CONTROLS ONLY - NO KEYBOARD
document.addEventListener('touchstart', (e) => {
    if (gameState !== 'highway') return;
    
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const clickX = touch.clientX - rect.left;
    const canvasWidth = rect.width;
    const carPosition = (currentLane + 0.5) / 5;
    const clickPosition = clickX / canvasWidth;

    if (clickPosition < carPosition && currentLane > 0) {
        moveLeft();
    } else if (clickPosition > carPosition && currentLane < 4) {
        moveRight();
    }
});

// Check for game over condition in repair shop
function checkGameOverCondition() {
    const brokenParts = document.querySelectorAll('.car-part.broken');
    
    if (brokenParts.length > 0 && carPartsCount === 0) {
        document.querySelector('.repair-title').innerHTML = '💥 GAME OVER 💥<br>No more parts to fix your car!';
        document.querySelector('.repair-title').style.color = '#ff4444';
        
        backToHighwayBtn.style.display = 'none';
        
        let restartBtn = document.getElementById('restartBtn');
        if (!restartBtn) {
            restartBtn = document.createElement('button');
            restartBtn.id = 'restartBtn';
            restartBtn.className = 'back-to-highway';
            restartBtn.style.background = '#ff6b6b';
            restartBtn.textContent = 'Restart Game';
            restartBtn.onclick = restartGame;
            backToHighwayBtn.parentNode.appendChild(restartBtn);
        }
        restartBtn.style.display = 'block';
    }
}

// Restart the entire game
function restartGame() {
    currentLane = 2;
    speed = 60;
    animationSpeed = 1;
    dashOffset = 0;
    obstacles = [];
    carParts = [];
    gameTime = 0;
    score = 0;
    carPartsCount = 0;
    collisionCount = 0;
    lastObstacleTime = 0;
    lastCarPartTime = 0;
    gameState = 'highway';
    gameTimeAtRepair = 0;
    
    scoreDisplay.textContent = score;
    carPartsDisplay.textContent = carPartsCount;
    collisionsDisplay.textContent = collisionCount;
    speedDisplay.textContent = Math.round(speed);
    
    document.querySelector('.repair-title').innerHTML = '🔧 REPAIR SHOP 🔧<br>Click on broken parts to fix them!';
    document.querySelector('.repair-title').style.color = '#fff';
    
    repairShop.style.display = 'none';
    
    backToHighwayBtn.style.display = 'block';
    backToHighwayBtn.disabled = false;
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.style.display = 'none';
    }
    
    updateCarPosition();
    
    startTime = Date.now();
    lastObstacleTime = Date.now();
    lastCarPartTime = Date.now();
    
    animate();
}

backToHighwayBtn.addEventListener('click', () => {
    const brokenParts = document.querySelectorAll('.car-part.broken');
    if (brokenParts.length === 0) {
        repairShop.style.display = 'none';
        gameState = 'highway';
        collisionCount = 0;
        collisionsDisplay.textContent = collisionCount;

        obstacles = [];
        carParts = [];

        startTime = Date.now() - gameTimeAtRepair;
        lastObstacleTime = Date.now();
        lastCarPartTime = Date.now();

        animate();
    }
});

// Prevent scrolling on mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

let startTime;
// Initialize game
startTime = Date.now();
resizeCanvas();
updateCarPosition();
animate();

// Update speed periodically
setInterval(updateSpeed, 2000);

// Initial speed update
updateSpeed();

// Handle window resize
window.addEventListener('resize', resizeCanvas);
