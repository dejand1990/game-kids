// Position police car in current lane
function updateCarPosition() {
    const laneWidth = 84 / 5; // 5 lanes in 84% width
    const laneCenter = 8 + (currentLane * laneWidth) + (laneWidth / 2);
    policeCar.style.left = laneCenter + '%';
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

// Click/touch controls
document.addEventListener('click', (e) => {
    if (gameState !== 'highway') return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const canvasWidth = rect.width;
    const carPosition = (currentLane + 0.5) / 5;
    const clickPosition = clickX / canvasWidth;
    
    if (clickPosition < carPosition && currentLane > 0) {
        moveLeft();
    } else if (clickPosition > carPosition && currentLane < 4) {
        moveRight();
    }
});

// Touch controls (prevent double firing)
document.addEventListener('touchend', (e) => {
    if (gameState !== 'highway') return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const clickX = touch.clientX - rect.left;
    const canvasWidth = rect.width;
    const carPosition = (currentLane + 0.5) / 5;
    const clickPosition = clickX / canvasWidth;
    
    if (clickPosition < carPosition && currentLane > 0) {
        moveLeft();
    } else if (clickPosition > carPosition && currentLane < 4) {
        moveRight();
    }
    
    e.preventDefault();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameState !== 'highway') return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveRight();
    }
});let currentLane = 2; // Start in middle lane (0-4)
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
    canvas.width = rect.width * 0.84;
    canvas.height = rect.height;
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
    dashOffset += animationSpeed;
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
    
    animationSpeed = (speed / 60) * 4; // Slower lane lines
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
    const difficulty = Math.min(gameTime / 60000, 1); // Max difficulty after 1 minute (60 seconds)
    
    // Start with 5 second gaps, reduce to 1.2 seconds over 1 minute
    const minGap = 5000 - (difficulty * 3800);
    
    if (now - lastObstacleTime < minGap) return;
    
    // Choose random lane
    let lane = Math.floor(Math.random() * 5);
    
    // For first 10 seconds, avoid player's lane to be gentle
    if (gameTime < 10000 && lane === currentLane) {
        lane = (lane + 1) % 5;
    }
    
    // For first 5 seconds, also avoid adjacent lanes
    if (gameTime < 5000 && Math.abs(lane - currentLane) <= 1) {
        lane = (currentLane + 2) % 5;
    }
    
    // Faster obstacle type introduction over 1 minute
    let maxTypes = 1; // Start with just red cars
    if (difficulty > 0.15) maxTypes = 2; // Add SUVs after 9 seconds
    if (difficulty > 0.35) maxTypes = 3; // Add buses after 21 seconds
    if (difficulty > 0.60) maxTypes = 4; // Add taxis after 36 seconds
    if (difficulty > 0.80) maxTypes = 5; // Add trucks after 48 seconds
    
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
    const moveSpeed = 0.6 + (animationSpeed * 0.25); // Slower speed
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.y += moveSpeed;
        
        // Remove obstacles that are off screen
        if (obstacle.y > canvas.height + obstacle.type.size) {
            obstacles.splice(i, 1);
            // Add points for successfully avoiding obstacle
            score += obstacle.type.points;
            scoreDisplay.textContent = score;
        }
        
        // Check collision with player
        else if (checkCollision(obstacle)) {
            // Collision - increment counter and remove obstacle
            collisionCount++;
            collisionsDisplay.textContent = collisionCount;
            score = Math.max(0, score - obstacle.type.points);
            scoreDisplay.textContent = score;
            obstacles.splice(i, 1);
            
            // Check if repair is needed
            if (collisionCount >= 10) {
                gameState = 'repair';
                
                // Save current game time
                gameTimeAtRepair = gameTime;
                
                // Show repair shop and set up broken parts
                repairShop.style.display = 'flex';
                repairPartsCount.textContent = carPartsCount;
                
                // Randomly break 2-4 parts
                const carParts = document.querySelectorAll('.car-part');
                const numBroken = 2 + Math.floor(Math.random() * 3);
                const shuffled = Array.from(carParts).sort(() => 0.5 - Math.random());
                
                // Reset all parts to fixed first
                carParts.forEach(part => {
                    part.className = part.className.replace(/ broken| fixed/g, '') + ' fixed';
                });
                
                // Break random parts
                for (let i = 0; i < numBroken; i++) {
                    shuffled[i].className = shuffled[i].className.replace(/ fixed/g, '') + ' broken';
                }
                
                // Add click listeners to broken parts
                carParts.forEach(part => {
                    part.onclick = () => {
                        if (part.classList.contains('broken') && carPartsCount > 0) {
                            carPartsCount--;
                            carPartsDisplay.textContent = carPartsCount;
                            repairPartsCount.textContent = carPartsCount;
                            part.className = part.className.replace(' broken', '') + ' fixed';
                            
                            // Check if all parts are fixed
                            const brokenParts = document.querySelectorAll('.car-part.broken');
                            backToHighwayBtn.disabled = brokenParts.length > 0;
                        }
                    };
                });
                
                // Check initial state
                const brokenParts = document.querySelectorAll('.car-part.broken');
                backToHighwayBtn.disabled = brokenParts.length > 0;
                
                return;
            }
            
            // Flash effect for collision feedback
            policeCar.style.filter = 'brightness(0.5)';
            setTimeout(() => {
                policeCar.style.filter = 'brightness(1)';
            }, 200);
        }
    }
}

// Check collision between player and obstacle
function checkCollision(obstacle) {
    const laneWidth = canvas.width / 5;
    const playerX = currentLane * laneWidth + laneWidth / 2;
    const obstacleX = obstacle.lane * laneWidth + laneWidth / 2;
    
    // Simple collision detection - check if in same lane and close vertically
    const horizontalDistance = Math.abs(playerX - obstacleX);
    const verticalDistance = Math.abs(obstacle.y - (canvas.height * 0.8)); // Player position
    
    return horizontalDistance < 40 && verticalDistance < 50; // Adjusted for larger sizes
}

// Draw obstacles
function drawObstacles() {
    const laneWidth = canvas.width / 5;
    
    obstacles.forEach(obstacle => {
        const x = obstacle.lane * laneWidth + laneWidth / 2;
        const size = obstacle.type.size;
        const carWidth = size;
        const carHeight = size * 1.5; // Make cars longer like police car
        
        // Draw wheels FIRST (behind car body)
        ctx.fillStyle = '#333333';
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 2;
        
        // Position wheels like police car
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
        
        // Draw main car body (same style as police car)
        ctx.fillStyle = obstacle.type.color;
        ctx.beginPath();
        ctx.roundRect(x - carWidth/2, obstacle.y - carHeight/2, carWidth, carHeight, [25, 25, 8, 8]);
        ctx.fill();
        
        // Add roof section (lighter shade of the car color)
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
            // Taxi sign base
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.roundRect(x - carWidth * 0.15, obstacle.y - carHeight/2 - 8, carWidth * 0.3, carHeight * 0.12, 2);
            ctx.fill();
            
            // Taxi sign (yellow)
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.roundRect(x - carWidth * 0.12, obstacle.y - carHeight/2 - 6, carWidth * 0.24, carHeight * 0.08, 1);
            ctx.fill();
            
            // "TAXI" text
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
    
    // Create car part every 8-15 seconds
    const minGap = 8000 + Math.random() * 7000;
    
    if (now - lastCarPartTime < minGap) return;
    
    // Find available lanes (not occupied by obstacles)
    const availableLanes = [];
    for (let lane = 0; lane < 5; lane++) {
        let laneIsClear = true;
        
        // Check if any obstacle is in this lane and close to spawn position
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
    
    // Only spawn if there's at least one clear lane
    if (availableLanes.length === 0) return;
    
    // Choose random lane from available lanes
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
    const moveSpeed = 0.6 + (animationSpeed * 0.25); // Same speed as obstacles
    
    for (let i = carParts.length - 1; i >= 0; i--) {
        const carPart = carParts[i];
        carPart.y += moveSpeed;
        
        // Remove car parts that are off screen
        if (carPart.y > canvas.height + 30) {
            carParts.splice(i, 1);
        }
        
        // Check collision with player
        else if (checkCarPartCollision(carPart)) {
            // Collect car part
            carPartsCount++;
            carPartsDisplay.textContent = carPartsCount;
            carParts.splice(i, 1);
            
            // Flash effect for collection feedback
            policeCar.style.filter = 'brightness(1.5)';
            setTimeout(() => {
                policeCar.style.filter = 'brightness(1)';
            }, 200);
        }
    }
}

// Check collision between player and car part
function checkCarPartCollision(carPart) {
    const laneWidth = canvas.width / 5;
    const playerX = currentLane * laneWidth + laneWidth / 2;
    const carPartX = carPart.lane * laneWidth + laneWidth / 2;
    
    // Check if in same lane and close vertically
    const horizontalDistance = Math.abs(playerX - carPartX);
    const verticalDistance = Math.abs(carPart.y - (canvas.height * 0.8)); // Player position
    
    return horizontalDistance < 40 && verticalDistance < 50;
}

// Draw car parts (presents)
function drawCarParts() {
    const laneWidth = canvas.width / 5;
    
    carParts.forEach(carPart => {
        const x = carPart.lane * laneWidth + laneWidth / 2;
        const size = 25;
        
        // Draw present box
        ctx.fillStyle = '#ff6b6b'; // Red box
        ctx.beginPath();
        ctx.roundRect(x - size/2, carPart.y - size/2, size, size, 4);
        ctx.fill();
        
        // Draw ribbon (cross pattern)
        ctx.fillStyle = '#ffff99'; // Yellow ribbon
        ctx.fillRect(x - 2, carPart.y - size/2, 4, size); // Vertical ribbon
        ctx.fillRect(x - size/2, carPart.y - 2, size, 4); // Horizontal ribbon
        
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



// Repair shop button
backToHighwayBtn.addEventListener('click', () => {
    const brokenParts = document.querySelectorAll('.car-part.broken');
    if (brokenParts.length === 0) {
        repairShop.style.display = 'none';
        gameState = 'highway';
        collisionCount = 0;
        collisionsDisplay.textContent = collisionCount;
        
        // Clear obstacles and car parts
        obstacles = [];
        carParts = [];
        
        // Continue from where we left off - adjust startTime to preserve difficulty
        startTime = Date.now() - gameTimeAtRepair;
        lastObstacleTime = Date.now();
        lastCarPartTime = Date.now();
        
        // Restart animation
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
