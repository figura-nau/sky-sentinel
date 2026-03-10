import { useState, useEffect } from "react";

export function AiRecommendations() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Anomalous motor vibration detected on ARM-3, leading to unexpected ESC desynchronization and spatial disorientation during high-speed turning maneuver.";

  // Simulated AI typing effect
  useEffect(() => {
    let currentLength = 0;
    const typingInterval = setInterval(() => {
      if (currentLength <= fullText.length) {
        setTypedText(fullText.slice(0, currentLength));
        currentLength += 2; // Adjust speed here
      } else {
        clearInterval(typingInterval);
      }
    }, 20);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="flex flex-col space-y-3 h-full">
      <h3 className="text-sm font-medium text-slate-300">AI Analysis Panel</h3>
      
      <div className="flex-1 border border-slate-800 rounded-lg overflow-hidden flex flex-col bg-slate-900/30">
        {/* Root Cause Section */}
        <div className="border-b border-rose-900/50 bg-rose-950/10 p-3">
          <h4 className="text-xs font-semibold text-rose-500 tracking-widest uppercase">
            Root Cause
          </h4>
        </div>
        
        {/* Explanation Section */}
        <div className="p-4 flex-1">
          <h5 className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-2">
            Explanation
          </h5>
          <p className="font-mono text-sm text-slate-300 leading-relaxed min-h-20">
            {typedText}
            <span className="inline-block w-2 h-4 ml-1 bg-slate-400 animate-pulse translate-y-1" />
          </p>
        </div>

        {/* Suggested Action Box */}
        <div className="p-4">
          <h5 className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-2">
            Suggested Action
          </h5>
          <div className="bg-amber-950/40 border border-amber-600/50 rounded p-3 text-sm text-amber-200/90 leading-relaxed shadow-[0_0_15px_rgba(217,119,6,0.1)]">
            Initiate immediate <strong className="text-amber-400 font-semibold">Return to Launch (RTL)</strong> protocol via Failsafe command. Log all flight data and ground vehicle for mechanical inspection of propulsion systems.
          </div>
        </div>
      </div>
    </div>
  );
}