ApexPitwall: Live Data Dashboard & Broadcast Sync 🏎️📺

ApexPitwall is an open-source, high-performance web application designed to supercharge your Formula 1 viewing experience. It decodes raw live telemetry feeds and fuses them with your TV stream, allowing you to turn your monitor into a fully customized, professional engineering pit wall. 

Whether you are watching a race live or catching up on a delayed broadcast, F1 Pitwall keeps data and video perfectly in sync. 

### ✨ Features

* **⏱️ Live Timing Tower:** Real-time updates on lap times, intervals, sector colors (purple/green/yellow), pit stop durations, and tire compound/age tracking.
* **🗺️ Interactive Track Map:** Fully interactive SVG/Canvas-rendered circuit layout running at 60fps with real-time driver coordinate interpolation.
* **🎮 Broadcast Delay Sync:** Built-in adjustable delay buffer (up to 5 minutes) to artificially pause the incoming telemetry stream, matching it perfectly with your cable TV or streaming broadcast delay.
* **📊 Advanced Telemetry & Analytics:** Toggle individual driver telemetry charts to analyze speeds, RPM, throttle percentage, gear shifts, and braking zones side-by-side.
* **📻 Team Radio & Race Control:** Streams live transcribed driver radios alongside immediate official FIA Race Control event messages (DRS status, yellow/red flags, safety cars).

### 🏗️ Architecture & Stack

The project is structured as a light, scalable monorepo designed to parse high-frequency data streams efficiently: 

* **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, HTML5 Canvas.
* **Backend:** Python 3.11+ (FastAPI), WebSockets for real-time state streaming, and file-based JSON caching.
* **Data Pipelines:** Integrated with the community-driven OpenF1 API and official live data streams using linear interpolation for coordinate calculation.

### 🚀 Getting Started

### Prerequisites

* Node.js (v18.x or later)
* Python (v3.11 or later)
* pnpm or npm

### Installation

1. **Clone the repository:** 

bash

git clone https://github.com/yourusername/f1-pitwall.git
cd f1-pitwall

Use code with caution.
2. **Set up the backend:** 

bash

cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt

Use code with caution.
3. **Set up the frontend:** 

bash

cd ../frontend
pnpm install  # or npm install

Use code with caution.

### Running the Application

1. **Start the backend server:** 

bash

cd backend
uvicorn main:app --reload --port 8000

Use code with caution.
2. **Start the frontend application:** 

bash

cd frontend
pnpm dev  # Runs the client on http://localhost:3000

Use code with caution.

### 🛠️ Configuration & Customization

You can tweak the core application settings by modifying the environment file variables inside your root folder. Create a .env file based on .env.example: 

env

# Server Config
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Broadcast sync buffer defaults (in seconds)
DEFAULT_STREAM_DELAY=15

Use code with caution.

### Syncing with Live TV

1. Launch your preferred official TV stream or video provider layout on one monitor.
2. Open **F1 Pitwall** on your secondary screen or layout grid.
3. Use the **Delay Slider** in the bottom control bar to add or remove seconds until the visual race events (e.g., a car crossing the finish line or a yellow flag triggering) perfectly mirror the telemetry numbers.

### 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. 

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

### 📜 Disclaimer

This project is an unofficial open-source utility and is **not associated or affiliated in any way** with the Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX, and related marks are trademarks of Formula One Licensing B.V.
