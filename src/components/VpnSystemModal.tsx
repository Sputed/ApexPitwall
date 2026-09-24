import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Radio,
  ExternalLink,
  Power,
  Zap,
  Lock,
  Wifi,
  Server,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { VpnServer, VpnState } from '../types/f1';

export const VPN_SERVERS: VpnServer[] = [
  {
    id: 'uk-lon-1',
    name: 'United Kingdom - London #1',
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    city: 'London',
    pingMs: 14,
    ip: '185.220.101.42',
    loadPercent: 28,
    protocol: 'WireGuard Turbo',
    optimizedFor: 'Channel 4 F1 & Sky Sports UK (Ultra Low-Latency)',
    isUk: true,
  },
  {
    id: 'uk-man-1',
    name: 'United Kingdom - Manchester #2',
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    city: 'Manchester',
    pingMs: 19,
    ip: '185.220.103.88',
    loadPercent: 35,
    protocol: 'WireGuard Turbo',
    optimizedFor: 'Channel 4 All 4 Free-to-Air Streaming',
    isUk: true,
  },
  {
    id: 'nl-ams-1',
    name: 'Netherlands - Amsterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    flag: '🇳🇱',
    city: 'Amsterdam',
    pingMs: 24,
    ip: '194.165.16.12',
    loadPercent: 42,
    protocol: 'WireGuard Turbo',
    optimizedFor: 'F1 International Clean Feeds & Jolpica API',
    isUk: false,
  },
  {
    id: 'de-fra-1',
    name: 'Germany - Frankfurt',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    city: 'Frankfurt',
    pingMs: 31,
    ip: '45.83.220.10',
    loadPercent: 39,
    protocol: 'WireGuard Turbo',
    optimizedFor: 'Central European Grand Prix Telemetry Mirrors',
    isUk: false,
  },
  {
    id: 'us-mia-1',
    name: 'United States - Miami',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    city: 'Miami',
    pingMs: 84,
    ip: '167.99.145.20',
    loadPercent: 54,
    protocol: 'WireGuard Turbo',
    optimizedFor: 'ESPN & North America Broadcast Mirrors',
    isUk: false,
  },
];

interface VpnSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  vpnState: VpnState;
  onToggleConnect: () => void;
  onSelectServer: (server: VpnServer) => void;
  onToggleKillSwitch: () => void;
  onToggleDnsLeak: () => void;
}

export const VpnSystemModal: React.FC<VpnSystemModalProps> = ({
  isOpen,
  onClose,
  vpnState,
  onToggleConnect,
  onSelectServer,
  onToggleKillSwitch,
  onToggleDnsLeak,
}) => {
  const [dataTicker, setDataTicker] = useState({ down: 142.4, up: 18.2 });

  useEffect(() => {
    if (!vpnState.isConnected) return;
    const timer = setInterval(() => {
      setDataTicker((prev) => ({
        down: +(prev.down + 0.15 + Math.random() * 0.1).toFixed(2),
        up: +(prev.up + 0.02 + Math.random() * 0.01).toFixed(2),
      }));
    }, 1200);
    return () => clearInterval(timer);
  }, [vpnState.isConnected]);

  if (!isOpen) return null;

  const currentServer = vpnState.currentServer;
  const isUkConnected = vpnState.isConnected && currentServer.isUk;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0e111a] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141824] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                vpnState.isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-white/5 text-neutral-400 border border-white/10'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-f1 font-black text-white text-base tracking-wide uppercase">
                  Apex PitWall VPN Tunnel
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-mono font-bold">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Secure Low-Latency Geo-Routing for Live F1 Broadcasts &amp; Telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Main Status & Quick Connect Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              vpnState.isConnected
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-black/40 border-white/10'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Big Power Button */}
                <button
                  onClick={onToggleConnect}
                  disabled={vpnState.isConnecting}
                  className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg ${
                    vpnState.isConnecting
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse'
                      : vpnState.isConnected
                      ? 'bg-emerald-500 text-black shadow-emerald-500/30 hover:bg-emerald-400'
                      : 'bg-white/10 text-neutral-400 hover:text-white hover:bg-white/15 border border-white/10'
                  }`}
                  title={vpnState.isConnected ? 'Disconnect VPN' : 'Connect VPN'}
                >
                  {vpnState.isConnecting ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Power className="w-7 h-7" />
                  )}
                  <span className="text-[9px] font-black uppercase font-mono mt-1">
                    {vpnState.isConnecting ? 'LINKING' : vpnState.isConnected ? 'ON' : 'OFF'}
                  </span>
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentServer.flag}</span>
                    <span className="text-base font-bold text-white font-f1">
                      {currentServer.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-400 font-mono">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        vpnState.isConnected ? 'text-emerald-400' : 'text-neutral-500'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          vpnState.isConnected
                            ? 'bg-emerald-500 animate-ping'
                            : 'bg-neutral-600'
                        }`}
                      />
                      {vpnState.isConnecting
                        ? 'Negotiating WireGuard Handshake...'
                        : vpnState.isConnected
                        ? 'VPN TUNNEL CONNECTED'
                        : 'VPN DISCONNECTED'}
                    </span>
                    <span>·</span>
                    <span>IP: {vpnState.isConnected ? currentServer.ip : 'Protected (Hidden)'}</span>
                    <span>·</span>
                    <span className="text-sky-400 font-bold">{currentServer.pingMs}ms</span>
                  </div>
                </div>
              </div>

              {/* Protocol Badge */}
              <div className="text-right">
                <span className="text-[11px] font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-neutral-300">
                  {currentServer.protocol}
                </span>
                <div className="text-[10px] text-neutral-500 mt-1 font-mono">
                  AES-256-GCM / Poly1305
                </div>
              </div>
            </div>

            {/* Live Data Throughput Counters */}
            {vpnState.isConnected && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10 text-xs font-mono">
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <div className="text-neutral-500 text-[10px] flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-emerald-400" /> DOWNLOADED
                  </div>
                  <div className="text-white font-bold text-sm mt-0.5">{dataTicker.down} MB</div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <div className="text-neutral-500 text-[10px] flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-sky-400" /> UPLOADED
                  </div>
                  <div className="text-white font-bold text-sm mt-0.5">{dataTicker.up} MB</div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <div className="text-neutral-500 text-[10px]">SERVER LOAD</div>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {currentServer.loadPercent}%
                  </div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <div className="text-neutral-500 text-[10px]">ENCRYPTION</div>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">ChaCha20</div>
                </div>
              </div>
            )}
          </div>

          {/* CHANNEL 4 (UK) OFFICIAL PORTAL GEO-STATUS BANNER */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isUkConnected
                ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.2 bg-[#00E5FF] text-black font-black text-[10px] rounded font-mono">
                  CHANNEL 4 F1
                </span>
                <span className="font-bold text-white text-xs">
                  {isUkConnected
                    ? 'UK Geolocation Verified: Channel 4 Stream Ready'
                    : 'Channel 4 Requires a UK Connection'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                {isUkConnected
                  ? `Connected via ${currentServer.name} (${currentServer.ip}). Full access to Channel 4 F1 coverage.`
                  : 'Connect to UK - London or UK - Manchester to unlock the official Channel 4 F1 broadcast.'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isUkConnected ? (
                <button
                  onClick={() => {
                    const ukServer = VPN_SERVERS.find((s) => s.isUk) || VPN_SERVERS[0];
                    onSelectServer(ukServer);
                    if (!vpnState.isConnected) onToggleConnect();
                  }}
                  className="w-full sm:w-auto px-3.5 py-1.5 bg-[#00E5FF] hover:bg-[#00cbe2] text-black font-black text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#00E5FF]/20 whitespace-nowrap"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Connect to UK (Channel 4)</span>
                </button>
              ) : (
                <a
                  href="https://www.channel4.com/programmes/formula-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-3.5 py-1.5 bg-[#00E5FF] hover:bg-[#00cbe2] text-black font-black text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#00E5FF]/20 whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Channel 4 F1 Portal</span>
                </a>
              )}
            </div>
          </div>

          {/* Available VPN Servers List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-neutral-300" />
                Select High-Speed Streaming Location
              </h4>
              <span className="text-[10px] text-neutral-500 font-mono">
                {VPN_SERVERS.length} Global Nodes Active
              </span>
            </div>

            <div className="space-y-2">
              {VPN_SERVERS.map((server) => {
                const isSelected = currentServer.id === server.id;
                return (
                  <div
                    key={server.id}
                    onClick={() => onSelectServer(server)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                      isSelected
                        ? 'bg-white/10 border-red-500/60 shadow-md'
                        : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{server.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-f1">{server.name}</span>
                          {server.isUk && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-mono font-bold">
                              C4 &amp; Sky UK
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          {server.optimizedFor}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-mono">
                      <div className="text-right hidden sm:block">
                        <div className="text-neutral-400 text-[10px]">PING</div>
                        <div
                          className={`font-bold ${
                            server.pingMs < 30 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {server.pingMs} ms
                        </div>
                      </div>

                      <div className="text-right hidden md:block">
                        <div className="text-neutral-400 text-[10px]">LOAD</div>
                        <div className="text-neutral-200 font-bold">{server.loadPercent}%</div>
                      </div>

                      <button
                        className={`px-3 py-1 rounded font-bold transition-all text-xs ${
                          isSelected && vpnState.isConnected
                            ? 'bg-emerald-500 text-black'
                            : isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/15'
                        }`}
                      >
                        {isSelected && vpnState.isConnected ? 'Connected' : isSelected ? 'Selected' : 'Switch'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security & Tunnel Options */}
          <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-3">
            <h5 className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              Advanced Security &amp; Bypass Settings
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                onClick={onToggleKillSwitch}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">Tunnel Kill Switch</div>
                  <div className="text-[10px] text-neutral-400">Block telemetry on disconnect</div>
                </div>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                    vpnState.killSwitchActive
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white/10 text-neutral-500'
                  }`}
                >
                  {vpnState.killSwitchActive ? '✓' : ''}
                </span>
              </div>

              <div
                onClick={onToggleDnsLeak}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">DNS Leak Shield</div>
                  <div className="text-[10px] text-neutral-400">Enforce 1.1.1.1 encrypted DNS</div>
                </div>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                    vpnState.dnsLeakProtection
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white/10 text-neutral-500'
                  }`}
                >
                  {vpnState.dnsLeakProtection ? '✓' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Channel 4 Link */}
        <div className="px-6 py-3.5 bg-[#141824] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
            <span>Official Channel 4:</span>
            <a
              href="https://www.channel4.com/programmes/formula-1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00E5FF] hover:underline flex items-center gap-1 font-bold"
            >
              <span>channel4.com/programmes/formula-1</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
