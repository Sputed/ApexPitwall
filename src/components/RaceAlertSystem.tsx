import React, { useState, useEffect } from 'react';
import { RaceAlert, RaceAlertConfig, DriverTiming } from '../types/f1';
import { soundEffects } from '../services/soundEffects';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Settings,
  X,
  Flag,
  RotateCcw,
  Zap,
  CheckCircle,
  AlertTriangle,
  Play,
  Trophy,
} from 'lucide-react';

interface RaceAlertSystemProps {
  alerts: RaceAlert[];
  onDismissAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  config: RaceAlertConfig;
  onUpdateConfig: (newConfig: RaceAlertConfig) => void;
  drivers: DriverTiming[];
  onTriggerTestAlert: (type: RaceAlert['type']) => void;
}

export const RaceAlertSystem: React.FC<RaceAlertSystemProps> = ({
  alerts,
  onDismissAlert,
  onClearAllAlerts,
  config,
  onUpdateConfig,
  drivers,
  onTriggerTestAlert,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  const unreadCount = alerts.filter((a) => !a.read).length;

  const getAlertIcon = (type: RaceAlert['type']) => {
    switch (type) {
      case 'OVERTAKE':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'PIT_STOP':
        return <RotateCcw className="w-4 h-4 text-sky-400" />;
      case 'SAFETY_CAR':
        return <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'LEADER_CHANGE':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'FAVORITE_TOP_3':
        return <CheckCircle className="w-4 h-4 text-purple-400" />;
      case 'FASTEST_LAP':
        return <Zap className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-300" />;
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'ALL') return true;
    return a.type === filterType;
  });

  return (
    <>
      {/* Alert Bell Button in Header/Bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
        title="Customizable Race Alerts"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-red-500 animate-bounce" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#e10600] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Active Alerts Toast Stack (top-right of screen) */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className="pointer-events-auto bg-[#131722]/95 backdrop-blur-md border border-white/20 rounded-xl p-3.5 shadow-2xl transition-all animate-in slide-in-from-right flex items-start gap-3"
            style={{ borderLeftColor: alert.teamColor || '#e10600', borderLeftWidth: '4px' }}
          >
            <div className="p-2 rounded-lg bg-white/5 shrink-0 mt-0.5">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                  LAP {alert.lap} · {alert.type.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono text-neutral-500">{alert.timestamp}</span>
              </div>
              <h4 className="text-xs font-bold text-white font-f1 tracking-wide truncate">
                {alert.title}
              </h4>
              <p className="text-[11px] text-neutral-300 mt-0.5 leading-snug">
                {alert.message}
              </p>
            </div>
            <button
              onClick={() => onDismissAlert(alert.id)}
              className="text-neutral-500 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal / Flyout Drawer for Alert Configuration & History */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f121a] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Header */}
            <div className="p-4 bg-[#141824] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/20 text-red-500 rounded-lg">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase font-f1 tracking-wide">
                    Customizable Race Alert Engine
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Real-time triggers based on live F1 timing data &amp; telemetry
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Settings on Top, Feed on Bottom */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Event Subscriptions Toggles */}
              <div className="bg-[#141824] p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase font-f1 tracking-wider">
                    Alert Event Triggers
                  </span>
                  <div className="flex items-center gap-3">
                    {/* Audio Sound Toggle */}
                    <button
                      onClick={() =>
                        onUpdateConfig({ ...config, soundEnabled: !config.soundEnabled })
                      }
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                        config.soundEnabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {config.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{config.soundEnabled ? 'Radio Audio ON' : 'Audio Muted'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Overtake */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:border-white/15 transition-all">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Driver Overtake</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">Position swaps on track</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.overtake}
                      onChange={(e) => onUpdateConfig({ ...config, overtake: e.target.checked })}
                      className="accent-[#e10600] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Pit Stop */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:border-white/15 transition-all">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                        <span>Pit Stop In / Out</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">Box entries, tire change &amp; durations</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.pitStop}
                      onChange={(e) => onUpdateConfig({ ...config, pitStop: e.target.checked })}
                      className="accent-[#e10600] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Safety Car */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:border-white/15 transition-all">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Safety Car / VSC Deployed</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">Neutralized race conditions</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.safetyCar}
                      onChange={(e) => onUpdateConfig({ ...config, safetyCar: e.target.checked })}
                      className="accent-[#e10600] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Leader Change */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:border-white/15 transition-all">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Race Leader Change</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">New driver assumes P1</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.leaderChange}
                      onChange={(e) => onUpdateConfig({ ...config, leaderChange: e.target.checked })}
                      className="accent-[#e10600] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Favorite Driver in Top 3 */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:border-white/15 transition-all">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                        <span>Favorite Driver in Top 3</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">Podium position alert</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.favoriteTop3}
                      onChange={(e) => onUpdateConfig({ ...config, favoriteTop3: e.target.checked })}
                      className="accent-[#e10600] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Fastest Lap */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:border-white/15 transition-all">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                        <span>Fastest Lap Set</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">Overall purple session lap</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.fastestLap}
                      onChange={(e) => onUpdateConfig({ ...config, fastestLap: e.target.checked })}
                      className="accent-[#e10600] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Favorite Driver Selector */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-neutral-300 font-medium">
                    Favorite Driver for Priority Alerts:
                  </div>
                  <select
                    value={config.favoriteDriverCode}
                    onChange={(e) =>
                      onUpdateConfig({ ...config, favoriteDriverCode: e.target.value })
                    }
                    className="bg-black/60 border border-white/15 rounded-lg px-3 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {drivers.map((d) => (
                      <option key={d.driverCode} value={d.driverCode}>
                        {d.driverCode} - {d.driverName} ({d.teamName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instant Simulator / Test Trigger Buttons */}
              <div className="bg-[#141824] p-3.5 rounded-xl border border-white/5">
                <div className="text-xs font-bold text-neutral-400 uppercase font-mono mb-2 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-red-500" />
                  <span>Instant Alert Triggers (Live Test)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onTriggerTestAlert('OVERTAKE')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-neutral-300 hover:text-emerald-400 text-xs font-mono font-medium border border-white/10 transition-colors"
                  >
                    + Test Overtake
                  </button>
                  <button
                    onClick={() => onTriggerTestAlert('PIT_STOP')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-sky-500/20 text-neutral-300 hover:text-sky-400 text-xs font-mono font-medium border border-white/10 transition-colors"
                  >
                    + Test Pit Stop
                  </button>
                  <button
                    onClick={() => onTriggerTestAlert('SAFETY_CAR')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-400 text-xs font-mono font-medium border border-white/10 transition-colors"
                  >
                    + Test Safety Car
                  </button>
                  <button
                    onClick={() => onTriggerTestAlert('LEADER_CHANGE')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-yellow-500/20 text-neutral-300 hover:text-yellow-400 text-xs font-mono font-medium border border-white/10 transition-colors"
                  >
                    + Test Leader Change
                  </button>
                  <button
                    onClick={() => onTriggerTestAlert('FAVORITE_TOP_3')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-neutral-300 hover:text-purple-400 text-xs font-mono font-medium border border-white/10 transition-colors"
                  >
                    + Test Favorite in Top 3
                  </button>
                </div>
              </div>

              {/* Alert History Feed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase font-f1 tracking-wider">
                    Alert History ({alerts.length})
                  </span>
                  {alerts.length > 0 && (
                    <button
                      onClick={onClearAllAlerts}
                      className="text-[11px] text-neutral-400 hover:text-red-400 transition-colors underline"
                    >
                      Clear Log
                    </button>
                  )}
                </div>

                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500 bg-[#141824] rounded-xl border border-white/5">
                    No alerts received yet. Alerts will trigger automatically as live F1 timing data updates or click the test buttons above.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {filteredAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3 bg-[#141824] border border-white/5 rounded-lg flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                          <div>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                              <span className="font-bold text-white">{alert.timestamp}</span>
                              <span>·</span>
                              <span>LAP {alert.lap}</span>
                              <span>·</span>
                              <span className="text-neutral-400">{alert.type}</span>
                            </div>
                            <div className="font-bold text-white mt-0.5">{alert.title}</div>
                            <div className="text-neutral-300 text-[11px] mt-0.5">{alert.message}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => onDismissAlert(alert.id)}
                          className="text-neutral-500 hover:text-white p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#141824] border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono text-[11px]">
                Powered by F1 Live Telemetry Engine
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-[#e10600] hover:bg-[#c30500] text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
