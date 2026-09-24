<svg xmlns="http://w3.org" viewBox="0 0 1280 640" width="100%" height="100%">
  <defs>
    <!-- Dark Mode Carbon Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0E17"/>
      <stop offset="100%" stop-color="#161B26"/>
    </linearGradient>
    
    <!-- Neon Accent Glows -->
    <linearGradient id="apexGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00FF88"/>
      <stop offset="100%" stop-color="#00E5FF"/>
    </linearGradient>
    
    <!-- Telemetry Grid Pattern -->
    <pattern id="pitwallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#222B3D" stroke-width="0.7" opacity="0.4"/>
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1280" height="640" fill="url(#bgGrad)"/>
  <rect width="1280" height="640" fill="url(#pitwallGrid)"/>

  <!-- Racing Line Graphic / Decorative Wave -->
  <path d="M-100 450 Q 300 200, 700 500 T 1380 250" fill="none" stroke="url(#apexGrad)" stroke-width="4" opacity="0.35"/>
  <path d="M-100 460 Q 300 210, 700 510 T 1380 260" fill="none" stroke="#FF3E3E" stroke-width="1.5" opacity="0.2"/>

  <!-- Pitwall Telemetry Accent Boxes -->
  <g opacity="0.2" transform="translate(900, 80)">
    <rect x="0" y="0" width="280" height="180" rx="6" fill="none" stroke="#ffffff" stroke-width="1"/>
    <line x1="20" y1="40" x2="260" y2="40" stroke="#ffffff" stroke-width="1"/>
    <line x1="20" y1="80" x2="200" y2="80" stroke="#00FF88" stroke-width="2"/>
    <line x1="20" y1="110" x2="160" y2="110" stroke="#ffffff" stroke-width="1"/>
    <circle cx="240" cy="110" r="8" fill="#FF3E3E"/>
  </g>

  <!-- Branding Text & Logo Core -->
  <!-- "APEX" Modern Monospace -->
  <text x="120" y="300" font-family="system-ui, -apple-system, monospace" font-size="96" font-weight="900" letter-spacing="8" fill="url(#apexGrad)">
    APEX
  </text>
  
  <!-- "PITWALL" Outline/Solid Combo Block -->
  <text x="120" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="88" font-weight="800" letter-spacing="4" fill="#FFFFFF">
    PITWALL
  </text>

  <!-- Subtle Subtitle / Tagline -->
  <text x="125" y="450" font-family="monospace" font-size="20" font-weight="400" letter-spacing="3" fill="#8B9BB4">
    // LIVE RACING TELEMETRY &amp; DATA ENGINE
  </text>

  <!-- Bottom Decorative Status Bar (Simulating Live Track Session UI) -->
  <g transform="translate(0, 600)">
    <rect width="1280" height="40" fill="#0D1117"/>
    <!-- Status Pill -->
    <rect x="120" y="12" width="90" height="18" rx="9" fill="#FF3E3E"/>
    <text x="165" y="25" font-family="monospace" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">LIVE DATA</text>
    
    <text x="230" y="25" font-family="monospace" font-size="12" fill="#5865F2">SESSION: P1</text>
    <text x="370" y="25" font-family="monospace" font-size="12" fill="#8B9BB4">LAP 44/44</text>
    <text x="1100" y="25" font-family="monospace" font-size="12" fill="#00FF88">STATUS: NOMINAL</text>
  </g>

  <!-- Top Decorative Chevrons (Pit lane exit vibes) -->
  <g transform="translate(120, 80)" fill="url(#apexGrad)">
    <polygon points="0,0 20,0 10,20 0,20" opacity="0.8"/>
    <polygon points="25,0 45,0 35,20 25,20" opacity="0.6"/>
    <polygon points="50,0 70,0 60,20 50,20" opacity="0.4"/>
  </g>
</svg>

  <h1>Built with AI Studio</h2>
