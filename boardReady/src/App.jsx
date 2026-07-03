import { useEffect, useRef, useState } from "react";

const WS_URL = "ws://localhost:8000";

function App() {
  const [scores, setScores] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "leaderboard_update") {
        setScores(payload.data);
      }
    };

    return () => socket.close();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
          <span className="flex items-center gap-2 text-xs text-neutral-400">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-emerald-500" : "bg-neutral-600"
              }`}
            />
            {connected ? "Live" : "Disconnected"}
          </span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
          {scores.length === 0 ? (
            <div className="py-16 text-center text-sm text-neutral-500">
              No scores yet
            </div>
          ) : (
            <ol>
              {scores.map((entry, i) => (
                <li
                  key={entry.name}
                  className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-sm text-neutral-500 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{entry.name}</span>
                  </div>
                  <span className="text-sm text-neutral-300 tabular-nums">
                    {entry.score}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;