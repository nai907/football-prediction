Football prediction game
A full-stack web application that allows users to guess the scores of past English Premier League season 2025/2026 football matches.
Built with Vue.js (frontend) and Node.js/Express (backend).

Features:
- Random matchday selection
- Submit match score predictions
- Simple leaderboard system
- API integration with football data provider
- Responsive User Interface

Tech Stack:
Frontend
- Vue.js
- HTML/CSS
- JavaScript

Backend
- Node.js
- Express.js
- Fetch API

Others
- MySQL
- Socket.io

Installation & Setup
1. Clone the repository
2. Backend setup
   - cd football-prediction
   - npm install
   - install database.sql
   - register at https://api.football-data.org and get api token
   - replace api token in index.js
   - run node index.js
3. Frontend setup
   - Open index.html in browser
