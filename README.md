# Elemental Conquest - Multiplayer Strategy Game

A turn-based strategy game where players draft elemental champions and battle on an 8x8 tactical grid.

## Features

- **Character Draft**: 54 unique characters across 6 elemental types
- **Tactical Combat**: 8x8 grid with movement and attack mechanics
- **Real-time Multiplayer**: Hot-seat gameplay synchronized across players
- **Elemental System**: 6 elements with advantages and disadvantages

## Deployment Options

### Option 1: Render (Recommended - Free)

1. **Create a Render account** at [render.com](https://render.com)
2. **Connect your GitHub repository** (push your code to GitHub first)
3. **Create a new Web Service**:
   - **Name**: `elemental-conquest`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. **Deploy** and get your public URL

### Option 2: Railway (Free Tier)

1. **Create a Railway account** at [railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Create a new project** from your repository
4. **Deploy** and get your public URL

### Option 3: Heroku (Paid)

1. **Create a Heroku account** at [heroku.com](https://heroku.com)
2. **Install Heroku CLI** and run:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```
3. **Open your app**: `heroku open`

### Option 4: Vercel (Free)

1. **Create a Vercel account** at [vercel.com](https://vercel.com)
2. **Import your GitHub repository**
3. **Deploy** and get your public URL

## Local Development

```bash
# Install dependencies
npm install

# Start the server
npm start

# Open in browser
open http://localhost:3000
```

## How to Play

1. **Draft Phase**: Players take turns selecting 3 characters each
2. **Battle Phase**: Place champions on opposite sides of the 8x8 grid
3. **Turns**: Move and attack with your champions
4. **Victory**: Eliminate all enemy champions

## Game Mechanics

- **Movement**: Champions can move up to their movement value
- **Attacks**: Attack adjacent enemies after moving
- **Damage**: Attack - Defense, with elemental advantages
- **Turns**: All champions must move and attack before turn ends

## Elements

- **Pyros** (Fire): High attack, low defense
- **Aquos** (Water): Balanced stats, healing abilities
- **Ventos** (Wind): High mobility, evasion
- **Terros** (Earth): High defense, low mobility
- **Haos** (Light): Support and purification
- **Darkos** (Dark): High damage, status effects

## Technologies

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Real-time**: WebSocket connections for multiplayer 