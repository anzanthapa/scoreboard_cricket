# Cricket Scoreboard System

A modern cricket scoring application with separate scorer and viewer roles, featuring local storage persistence and PDF export capabilities.

## 🚀 Features

- **Role-Based Access**: Separate passwords for scorers and viewers
- **Mobile Responsive**: Optimized for phones and tablets
- **Professional UI**: Clean, modern interface with cricket terminology
- **Data Persistence**: Local storage with automatic daily reset
- **Export Functionality**: Download match data as JSON or PDF reports
- **Auto-Refresh**: Viewers get live updates every 10 seconds
- **Password Security**: Secure access control for both scorer and viewer roles

## 🛠️ Setup Instructions

### Prerequisites
- Modern web browser with JavaScript enabled
- No server setup required - runs entirely in the browser

### Installation
1. Download all files to a web server or local directory
2. Open `index.html` in your web browser
3. No additional dependencies needed!

## 📱 Usage

### For Scorers:
1. Start at the landing page (`index.html`)
2. Click "Set up new match" to configure teams and passwords
3. Use the scorer interface to record runs, wickets, and extras
4. Export match data as JSON or PDF reports
5. End match when complete

### For Viewers:
1. Use the viewer password to access live match updates
2. Score refreshes automatically every 10 seconds
3. Manual refresh button available for immediate updates

## 📄 Export Features

- **JSON Export**: Complete match data including all scoring details
- **PDF Export**: Professional match reports including:
  - Match information and passwords
  - Current score and player details
  - Innings summaries
  - Final results
  - Recent commentary
  - Multi-page support for long matches

## 🔒 Security

- Separate passwords for scorer and viewer access
- Passwords included in PDF exports for record-keeping
- Automatic daily data reset for privacy
- No external data transmission

## 📱 Mobile Support

Fully responsive design works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🏏 Cricket Features

- Proper cricket terminology (Striker/Non-striker)
- Complete scoring system (runs, wickets, extras)
- Innings management
- Player selection dropdowns
- Live commentary
- Match result calculation

---

**Built with:** HTML5, CSS3, JavaScript ES6+
**Dependencies:** jsPDF (for PDF export)
**License:** © 2026 ANZAN

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   # or for development with auto-restart
   npm run dev
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

## 🎮 How to Use

### For Scorers:
1. Click "Start Match" on the home page
2. Set up teams, players, and passwords
3. Start scoring with the control buttons
4. Share the viewer password with spectators

### For Viewers:
1. Click "View Live Match" on the home page
2. Enter the viewer password provided by the scorer
3. Watch live updates in real-time

## 📁 Project Structure

```
cricket-scoreboard/
├── server.js              # Node.js server with Socket.io
├── package.json           # Dependencies
├── data.json              # Match data storage
├── index.html             # Home page
├── match_setup.html       # Match configuration
├── scorer_scoreboard.html # Scoring interface
├── viewer_scoreboard.html # Viewer interface
├── js/
│   ├── setup.js           # Match setup logic
│   ├── scoreboard.js      # Scoring functionality
│   └── summary.js         # Viewer logic
└── css/
    ├── style.css          # Main styles
    └── summary.css        # Viewer styles
```

## 🔧 API Endpoints

- `GET /api/data` - Get all match data
- `POST /api/setup` - Create new match
- `GET /api/match/:id` - Get specific match
- `POST /api/update/:id` - Update match state

## 🌐 Real-Time Features

- **WebSocket Connection**: Automatic real-time sync
- **Room-Based**: Each match has its own update channel
- **Fallback Polling**: 15-second auto-refresh if WebSocket fails
- **Cross-Device**: Works on phones, tablets, and computers

## 📱 Mobile Optimization

- Touch-friendly buttons (minimum 44px)
- Responsive design for all screen sizes
- Optimized input fields for mobile keyboards
- Fast loading and smooth interactions

## 🔒 Security

- Password-protected access for both roles
- Server-side data validation
- No sensitive data in client-side storage
- Daily automatic data reset

## 📊 Data Export

Scorers can export complete match data including:
- Match setup and configuration
- Complete scoring history
- Player information
- Timestamped export

## 🐛 Troubleshooting

**Server won't start:**
- Ensure Node.js is installed
- Check if port 3000 is available
- Run `npm install` to install dependencies

**Real-time updates not working:**
- Check browser console for WebSocket errors
- Ensure server is running
- Try refreshing the page

**Match data not saving:**
- Check server console for errors
- Verify data.json file permissions
- Ensure server has write access to project directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

© 2026 ANZAN. All rights reserved.

---

**Need Help?** Check the browser console for errors and ensure the server is running properly.