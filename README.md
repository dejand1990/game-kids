# Highway Police Car Game

A fun, kid-friendly driving game designed for a 3-year-old featuring a police car navigating highway traffic while collecting car parts and avoiding crashes.

## Features

🚗 **Police Car Driving**
- Control a realistic police car with flashing sirens
- Navigate between 5 highway lanes
- Smooth lane-changing animations

🛣️ **Highway Environment**
- Animated lane lines for realistic driving feel
- Grass borders on both sides
- Various colorful obstacle cars (sedans, SUVs, buses, taxis, trucks)

🎁 **Collectible Car Parts**
- Red present boxes with yellow ribbons
- Spawn every 8-15 seconds in available lanes
- Used for repairing the police car

🔧 **Repair Shop System**
- Triggered after 10 collisions
- Visual car repair interface
- Click on broken parts to fix them (1 car part each)
- Must fix all parts before returning to highway

🎮 **Kid-Friendly Design**
- Simple click/touch controls
- Gradual difficulty progression over 1 minute
- Bright, colorful graphics
- No "game over" - just repair and continue

## File Structure

```
game/
├── index.html          # Main HTML file
├── styles.css          # All styling and animations
├── script.js           # Game logic and controls
├── images/             # Image assets folder
│   └── police-car.jpg  # Police car image for repair shop
└── README.md           # This file
```

## Setup Instructions

1. **Download all files** to a folder on your computer
2. **Add the police car image**:
   - Save your police car image as `images/police-car.jpg`
   - Or update the CSS file to point to your image location
3. **Open index.html** in a web browser
4. **Play the game!**

## Controls

### Desktop
- **Arrow Keys** or **A/D Keys** - Move left/right
- **Mouse Click** - Click left/right of car to change lanes

### Mobile
- **Touch** - Tap left/right of car to change lanes

## Game Mechanics

### Difficulty Progression
- **0-5 seconds**: Very easy, obstacles avoid player lane
- **9 seconds**: SUVs start appearing
- **21 seconds**: Buses added
- **36 seconds**: Taxis with roof signs
- **48 seconds**: Large trucks
- **60 seconds**: Maximum difficulty reached

### Scoring
- Gain points for avoiding obstacles
- Lose points when hitting obstacles
- Collect car parts for repairs

### Repair System
- After 10 crashes, automatically enter repair shop
- 2-4 random parts need fixing
- Click on red blinking parts to repair (costs 1 car part each)
- All parts must be fixed to return to highway

## Customization

### Adding Your Police Car Image
Replace the placeholder in `styles.css`:
```css
.police-car-bg {
    background: url('images/police-car.jpg') no-repeat center;
    background-size: contain;
}
```

### Adjusting Difficulty
In `script.js`, modify these values:
- `minGap` - Time between obstacles
- `difficulty` timeline - When new car types appear
- `collisionCount >= 10` - Number of crashes before repair

### Changing Car Types
Edit the `obstacleTypes` array in `script.js` to add/modify vehicles.

## Browser Compatibility

Works in all modern browsers:
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires HTML5 Canvas support

## License

Free to use and modify for personal/educational purposes.
