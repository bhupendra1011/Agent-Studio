import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    id: "welcome",
    number: 0,
    title: "Welcome to your studio",
    subtitle: "Let's get your first AI agent live in under 10 minutes.",
    icon: "wand",
  },
  {
    id: "credentials",
    number: 1,
    title: "Connect your AI providers",
    subtitle: "Add API keys for the LLM, speech recognition, and voice synthesis services your agents will use.",
    icon: "key",
  },
  {
    id: "agent",
    number: 2,
    title: "Create your first agent",
    subtitle: "Pick a template and customize the personality, voice, and behavior.",
    icon: "bot",
  },
  {
    id: "phone",
    number: 3,
    title: "Import a phone number",
    subtitle: "Connect a number from your SIP trunk provider so your agent can make and receive calls.",
    icon: "phone",
  },
  {
    id: "test",
    number: 4,
    title: "Make a test call",
    subtitle: "Call your agent to hear it in action before going live.",
    icon: "zap",
  },
  {
    id: "done",
    number: 5,
    title: "You're all set",
    subtitle: "Your studio is ready. Launch campaigns, monitor calls, and optimize performance.",
    icon: "check",
  },
];

const TEMPLATES = [
  { id: "sales", name: "Sales qualifier", desc: "Qualify inbound leads and book meetings", color: "#2DD4A8" },
  { id: "support", name: "Customer support", desc: "Answer questions and resolve issues", color: "#60A5FA" },
  { id: "reminder", name: "Appointment reminder", desc: "Confirm or reschedule appointments", color: "#F59E0B" },
  { id: "survey", name: "NPS survey", desc: "Collect customer satisfaction scores", color: "#A78BFA" },
  { id: "blank", name: "Blank template", desc: "Start from scratch with full control", color: "#94A3B8" },
];

const PROVIDERS = [
  { id: "twilio", name: "Twilio", color: "#F22F46" },
  { id: "telnyx", name: "Telnyx", color: "#00C08B" },
  { id: "exotel", name: "Exotel", color: "#4F46E5" },
  { id: "other", name: "Other SIP", color: "#64748B" },
];

const IconWand = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 4V2m0 2v2m0-2h2m-2 0h-2"/>
    <path d="M8.5 8.5L3 21l12.5-5.5"/>
    <path d="M8.5 8.5l4.5-2 2 4.5"/>
    <path d="M19 10v2m-1-1h2"/>
    <path d="M10 2v1m-1-.5h2"/>
  </svg>
);

const IconKey = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const IconBot = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V5"/><circle cx="12" cy="3" r="2"/><path d="M9 15h0m6 0h0"/><path d="M9 18c1 1 5 1 6 0"/>
  </svg>
);

const IconPhone = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconZap = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3l5 5-5 5"/>
  </svg>
);

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ICON_MAP = { wand: IconWand, key: IconKey, bot: IconBot, phone: IconPhone, zap: IconZap, check: IconCheck };

function PasswordInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: "100%", padding: "10px 40px 10px 14px", fontSize: "13px",
          border: "1px solid #2a2a2e", borderRadius: "8px", background: "#18181b",
          color: "#e4e4e7", outline: "none", boxSizing: "border-box",
          fontFamily: "'DM Mono', monospace",
        }}
      />
      <button
        onClick={() => setShow(!show)}
        style={{
          position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", color: "#71717a", cursor: "pointer", padding: "4px",
        }}
      >
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}

function StepCredentials({ data, setData }) {
  const sections = [
    { key: "llm", label: "LLM provider", providers: ["OpenAI", "Anthropic", "Google Gemini", "Custom"], keyPlaceholder: "sk-..." },
    { key: "asr", label: "Speech recognition (ASR)", providers: ["Deepgram", "Google STT", "Azure STT", "Custom"], keyPlaceholder: "API key..." },
    { key: "tts", label: "Voice synthesis (TTS)", providers: ["ElevenLabs", "Azure TTS", "Google TTS", "Custom"], keyPlaceholder: "API key..." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {sections.map((s) => (
        <div key={s.key} style={{
          background: "#111113", border: "1px solid #27272a", borderRadius: "12px", padding: "18px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#d4d4d8", marginBottom: "12px" }}>{s.label}</div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
            {s.providers.map((p) => (
              <button
                key={p}
                onClick={() => setData({ ...data, [s.key + "Provider"]: p })}
                style={{
                  padding: "6px 14px", fontSize: "12px", borderRadius: "6px", cursor: "pointer",
                  border: data[s.key + "Provider"] === p ? "1px solid #2DD4A8" : "1px solid #27272a",
                  background: data[s.key + "Provider"] === p ? "rgba(45,212,168,0.08)" : "#18181b",
                  color: data[s.key + "Provider"] === p ? "#2DD4A8" : "#a1a1aa",
                  transition: "all 0.15s",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <PasswordInput
            placeholder={s.keyPlaceholder}
            value={data[s.key + "Key"] || ""}
            onChange={(e) => setData({ ...data, [s.key + "Key"]: e.target.value })}
          />
          {data[s.key + "Key"] && (
            <div style={{
              marginTop: "8px", fontSize: "11px", color: "#2DD4A8",
              display: "flex", alignItems: "center", gap: "4px",
              animation: "fadeIn 0.3s ease",
            }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#2DD4A8" strokeWidth="2" strokeLinecap="round"><path d="M13 4L6 12L3 9"/></svg>
              Key saved
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StepAgent({ data, setData }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setData({ ...data, template: t.id })}
            style={{
              textAlign: "left", padding: "16px", borderRadius: "10px", cursor: "pointer",
              border: data.template === t.id ? `1.5px solid ${t.color}` : "1px solid #27272a",
              background: data.template === t.id ? `${t.color}08` : "#111113",
              transition: "all 0.15s",
            }}
          >
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%", background: t.color,
              marginBottom: "10px", boxShadow: data.template === t.id ? `0 0 12px ${t.color}60` : "none",
              transition: "box-shadow 0.3s",
            }} />
            <div style={{ fontSize: "13px", fontWeight: 500, color: "#e4e4e7", marginBottom: "3px" }}>{t.name}</div>
            <div style={{ fontSize: "11px", color: "#71717a" }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {data.template && (
        <div style={{
          background: "#111113", border: "1px solid #27272a", borderRadius: "12px", padding: "18px",
          animation: "slideUp 0.3s ease",
        }}>
          <div style={{ fontSize: "12px", color: "#71717a", marginBottom: "8px" }}>Agent name</div>
          <input
            type="text"
            placeholder="e.g. Sales qualifier v1"
            value={data.agentName || ""}
            onChange={(e) => setData({ ...data, agentName: e.target.value })}
            style={{
              width: "100%", padding: "10px 14px", fontSize: "13px",
              border: "1px solid #2a2a2e", borderRadius: "8px", background: "#18181b",
              color: "#e4e4e7", outline: "none", boxSizing: "border-box",
              marginBottom: "14px",
            }}
          />
          <div style={{ fontSize: "12px", color: "#71717a", marginBottom: "8px" }}>System prompt</div>
          <textarea
            placeholder="You are a friendly sales assistant for Acme Corp..."
            value={data.systemPrompt || ""}
            onChange={(e) => setData({ ...data, systemPrompt: e.target.value })}
            rows={4}
            style={{
              width: "100%", padding: "10px 14px", fontSize: "13px",
              border: "1px solid #2a2a2e", borderRadius: "8px", background: "#18181b",
              color: "#e4e4e7", outline: "none", resize: "vertical", boxSizing: "border-box",
              fontFamily: "inherit", lineHeight: "1.5",
            }}
          />
          <div style={{ fontSize: "11px", color: "#52525b", marginTop: "6px" }}>
            You can refine this later in the agent editor.
          </div>
        </div>
      )}
    </div>
  );
}

function StepPhone({ data, setData }) {
  return (
    <div>
      <div style={{ fontSize: "13px", color: "#a1a1aa", marginBottom: "16px", lineHeight: "1.6" }}>
        Select your SIP trunk provider. We'll auto-fill the connection settings and walk you through the rest.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setData({ ...data, sipProvider: p.id })}
            style={{
              textAlign: "left", padding: "16px", borderRadius: "10px", cursor: "pointer",
              border: data.sipProvider === p.id ? `1.5px solid ${p.color}` : "1px solid #27272a",
              background: data.sipProvider === p.id ? `${p.color}08` : "#111113",
              display: "flex", alignItems: "center", gap: "12px", transition: "all 0.15s",
            }}
          >
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: `${p.color}18`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", fontWeight: 600, color: p.color,
            }}>
              {p.name[0]}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "#e4e4e7" }}>{p.name}</div>
          </button>
        ))}
      </div>

      {data.sipProvider && (
        <div style={{
          background: "#111113", border: "1px solid #27272a", borderRadius: "12px", padding: "18px",
          animation: "slideUp 0.3s ease",
        }}>
          {data.sipProvider !== "other" && (
            <div style={{
              background: "rgba(45,212,168,0.06)", border: "1px solid rgba(45,212,168,0.15)",
              borderRadius: "8px", padding: "12px 14px", marginBottom: "16px",
              fontSize: "12px", color: "#2DD4A8", lineHeight: "1.5",
            }}>
              SIP trunk address auto-filled for {PROVIDERS.find(p => p.id === data.sipProvider)?.name}. Just enter your phone number and credentials below.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#71717a", marginBottom: "6px" }}>Phone number</div>
              <input
                type="text"
                placeholder="+1234567890"
                value={data.phoneNumber || ""}
                onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                style={{
                  width: "100%", padding: "10px 14px", fontSize: "13px",
                  border: "1px solid #2a2a2e", borderRadius: "8px", background: "#18181b",
                  color: "#e4e4e7", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#71717a", marginBottom: "6px" }}>Display name</div>
              <input
                type="text"
                placeholder="Main line"
                value={data.displayName || ""}
                onChange={(e) => setData({ ...data, displayName: e.target.value })}
                style={{
                  width: "100%", padding: "10px 14px", fontSize: "13px",
                  border: "1px solid #2a2a2e", borderRadius: "8px", background: "#18181b",
                  color: "#e4e4e7", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <details style={{ marginTop: "16px" }}>
            <summary style={{
              fontSize: "12px", color: "#52525b", cursor: "pointer", userSelect: "none",
              listStyle: "none", display: "flex", alignItems: "center", gap: "4px",
            }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 6l4 4 4-4"/>
              </svg>
              Advanced SIP settings
            </summary>
            <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#71717a", marginBottom: "6px" }}>SIP trunk address</div>
                <input
                  type="text"
                  placeholder="sip.twilio.com"
                  value={data.sipAddress || (data.sipProvider === "twilio" ? "sip.twilio.com" : "")}
                  readOnly={data.sipProvider !== "other"}
                  style={{
                    width: "100%", padding: "10px 14px", fontSize: "13px",
                    border: "1px solid #2a2a2e", borderRadius: "8px",
                    background: data.sipProvider !== "other" ? "#0f0f11" : "#18181b",
                    color: "#a1a1aa", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#71717a", marginBottom: "6px" }}>Transport</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["UDP", "TCP", "TLS"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setData({ ...data, transport: t })}
                      style={{
                        flex: 1, padding: "8px", fontSize: "12px", borderRadius: "6px", cursor: "pointer",
                        border: (data.transport || "UDP") === t ? "1px solid #2DD4A8" : "1px solid #27272a",
                        background: (data.transport || "UDP") === t ? "rgba(45,212,168,0.08)" : "#18181b",
                        color: (data.transport || "UDP") === t ? "#2DD4A8" : "#71717a",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#71717a", marginBottom: "6px" }}>SIP username</div>
                <input type="text" placeholder="Optional" style={{
                  width: "100%", padding: "10px 14px", fontSize: "13px",
                  border: "1px solid #2a2a2e", borderRadius: "8px", background: "#18181b",
                  color: "#e4e4e7", outline: "none", boxSizing: "border-box",
                }} />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#71717a", marginBottom: "6px" }}>SIP password</div>
                <PasswordInput placeholder="Optional" value="" onChange={() => {}} />
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function StepTest({ data }) {
  const [callState, setCallState] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const intervalRef = useRef(null);

  const DEMO_TRANSCRIPT = [
    { time: 1, speaker: "agent", text: "Hello! Thanks for calling. How can I help you today?" },
    { time: 4, speaker: "user", text: "Hi, I'd like to learn more about your pricing plans." },
    { time: 7, speaker: "agent", text: "Of course! We have three tiers. Would you like me to walk you through each one?" },
    { time: 11, speaker: "user", text: "Yes please, start with the basic plan." },
    { time: 14, speaker: "agent", text: "Our Starter plan is $29 per month and includes up to 500 minutes of AI calls..." },
  ];

  const startCall = () => {
    setCallState("ringing");
    setElapsed(0);
    setTranscript([]);
    setTimeout(() => {
      setCallState("connected");
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }, 2000);
  };

  useEffect(() => {
    if (callState === "connected") {
      DEMO_TRANSCRIPT.forEach((t) => {
        setTimeout(() => {
          setTranscript((prev) => [...prev, t]);
        }, t.time * 1000);
      });
      setTimeout(() => {
        setCallState("ended");
        clearInterval(intervalRef.current);
      }, 18000);
    }
    return () => clearInterval(intervalRef.current);
  }, [callState]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div>
      <div style={{
        background: "#111113", border: "1px solid #27272a", borderRadius: "16px",
        padding: "28px", textAlign: "center",
      }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 20px",
          background: callState === "connected" ? "rgba(45,212,168,0.1)" : callState === "ringing" ? "rgba(245,158,11,0.1)" : "#18181b",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: callState === "connected" ? "2px solid #2DD4A8" : callState === "ringing" ? "2px solid #F59E0B" : "1px solid #27272a",
          transition: "all 0.3s",
          animation: callState === "ringing" ? "pulse 1s ease-in-out infinite" : "none",
        }}>
          {callState === "connected" ? (
            <div style={{ width: "24px", display: "flex", alignItems: "flex-end", gap: "3px", height: "20px" }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  width: "4px", borderRadius: "2px", background: "#2DD4A8",
                  animation: `wave 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                }} />
              ))}
            </div>
          ) : callState === "ended" ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2DD4A8" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          ) : (
            <IconPhone />
          )}
        </div>
        <div style={{ color: "#e4e4e7", fontSize: "15px", fontWeight: 500, marginBottom: "4px" }}>
          {callState === "idle" ? "Ready to test" : callState === "ringing" ? "Ringing..." : callState === "connected" ? "Connected" : "Call complete"}
        </div>
        <div style={{ color: "#52525b", fontSize: "13px", marginBottom: "20px" }}>
          {callState === "idle"
            ? `Calling your agent "${data.agentName || "My Agent"}"`
            : callState === "ringing"
            ? "Connecting to agent..."
            : callState === "connected"
            ? formatTime(elapsed)
            : `Duration: ${formatTime(elapsed)}`}
        </div>

        {callState === "idle" && (
          <button
            onClick={startCall}
            style={{
              padding: "12px 32px", fontSize: "14px", fontWeight: 500,
              borderRadius: "10px", cursor: "pointer", border: "none",
              background: "#2DD4A8", color: "#0a0a0b",
              transition: "transform 0.1s",
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Start test call
          </button>
        )}
        {callState === "ended" && (
          <div style={{
            background: "rgba(45,212,168,0.06)", border: "1px solid rgba(45,212,168,0.15)",
            borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#2DD4A8",
            lineHeight: "1.5", marginTop: "4px",
          }}>
            Agent responded correctly. Voice quality normal. Average latency 180ms.
          </div>
        )}
      </div>

      {transcript.length > 0 && (
        <div style={{
          marginTop: "16px", background: "#111113", border: "1px solid #27272a",
          borderRadius: "12px", padding: "16px",
        }}>
          <div style={{ fontSize: "12px", color: "#52525b", marginBottom: "12px", fontWeight: 500 }}>
            Live transcript
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {transcript.map((t, i) => (
              <div key={i} style={{
                display: "flex", gap: "10px", alignItems: "flex-start",
                animation: "fadeIn 0.3s ease",
              }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%", marginTop: "6px", flexShrink: 0,
                  background: t.speaker === "agent" ? "#2DD4A8" : "#60A5FA",
                }} />
                <div>
                  <div style={{ fontSize: "11px", color: "#52525b", marginBottom: "2px" }}>
                    {t.speaker === "agent" ? "Agent" : "Caller"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#d4d4d8", lineHeight: "1.4" }}>{t.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRail({ currentStep }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0", marginBottom: "32px",
      padding: "0 4px",
    }}>
      {STEPS.filter(s => s.number > 0 && s.number < 5).map((s, i) => {
        const isActive = currentStep === s.number;
        const isDone = currentStep > s.number;
        const Icon = ICON_MAP[s.icon];
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isDone ? "#2DD4A8" : isActive ? "rgba(45,212,168,0.12)" : "#18181b",
              border: isActive ? "1.5px solid #2DD4A8" : isDone ? "none" : "1px solid #27272a",
              color: isDone ? "#0a0a0b" : isActive ? "#2DD4A8" : "#52525b",
              transition: "all 0.3s",
            }}>
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 4L6 12L3 9"/></svg>
              ) : (
                <div style={{ width: "16px", height: "16px" }}><Icon /></div>
              )}
            </div>
            {i < 3 && (
              <div style={{
                flex: 1, height: "1.5px", margin: "0 6px",
                background: currentStep > s.number + 1 ? "#2DD4A8" : currentStep > s.number ? "linear-gradient(to right, #2DD4A8, #27272a)" : "#27272a",
                transition: "background 0.5s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SetupWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [transitioning, setTransitioning] = useState(false);

  const goTo = (n) => {
    setTransitioning(true);
    setTimeout(() => {
      setStep(n);
      setTransitioning(false);
    }, 200);
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return data.llmProvider && data.llmKey;
    if (step === 2) return data.template && data.agentName;
    if (step === 3) return data.sipProvider && data.phoneNumber;
    if (step === 4) return true;
    return true;
  };

  const currentStepData = STEPS[step];
  const Icon = ICON_MAP[currentStepData.icon];

  return (
    <div style={{
      maxWidth: "560px", margin: "0 auto", padding: "40px 24px",
      fontFamily: "'DM Sans', system-ui, sans-serif", color: "#e4e4e7",
      background: "#0a0a0b", minHeight: "100vh", boxSizing: "border-box",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.04); opacity: 0.85; } }
        @keyframes wave { from { height: 4px; } to { height: 18px; } }
        input:focus, textarea:focus { border-color: #2DD4A8 !important; box-shadow: 0 0 0 1px rgba(45,212,168,0.15); }
        details[open] summary svg { transform: rotate(180deg); }
        summary svg { transition: transform 0.2s; }
      `}</style>

      {step > 0 && step < 5 && <ProgressRail currentStep={step} />}

      <div style={{
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? "translateY(8px)" : "translateY(0)",
        transition: "all 0.2s ease",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px",
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: step === 5 ? "rgba(45,212,168,0.12)" : "rgba(45,212,168,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#2DD4A8", flexShrink: 0,
          }}>
            <Icon />
          </div>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 600, margin: 0, color: "#fafafa" }}>
              {currentStepData.title}
            </h1>
          </div>
        </div>
        <p style={{
          fontSize: "14px", color: "#71717a", lineHeight: "1.6",
          margin: "0 0 28px 54px",
        }}>
          {currentStepData.subtitle}
        </p>

        {step === 0 && (
          <div style={{ marginLeft: "54px" }}>
            <div style={{
              display: "flex", flexDirection: "column", gap: "1px", marginBottom: "28px",
              background: "#27272a", borderRadius: "10px", overflow: "hidden",
            }}>
              {STEPS.filter(s => s.number > 0 && s.number < 5).map((s) => {
                const SIcon = ICON_MAP[s.icon];
                return (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 16px", background: "#111113",
                  }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "8px", background: "#18181b",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#52525b", flexShrink: 0,
                    }}>
                      <div style={{ width: "16px", height: "16px" }}><SIcon /></div>
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#d4d4d8" }}>{s.title}</div>
                      <div style={{ fontSize: "11px", color: "#52525b" }}>Step {s.number} of 4</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && <StepCredentials data={data} setData={setData} />}
        {step === 2 && <StepAgent data={data} setData={setData} />}
        {step === 3 && <StepPhone data={data} setData={setData} />}
        {step === 4 && <StepTest data={data} />}

        {step === 5 && (
          <div style={{ marginLeft: "54px" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px",
            }}>
              {[
                { label: "Launch a campaign", desc: "Start outbound calling", action: "Go to campaigns" },
                { label: "Edit your agent", desc: "Refine prompts and voice", action: "Open editor" },
                { label: "View analytics", desc: "Monitor call performance", action: "Open analytics" },
                { label: "Import more numbers", desc: "Add numbers for scale", action: "Phone numbers" },
              ].map((c, i) => (
                <div key={i} style={{
                  background: "#111113", border: "1px solid #27272a", borderRadius: "10px",
                  padding: "16px", cursor: "pointer", transition: "border-color 0.15s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "#3f3f46"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "#27272a"}
                >
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#e4e4e7", marginBottom: "3px" }}>{c.label}</div>
                  <div style={{ fontSize: "11px", color: "#52525b", marginBottom: "10px" }}>{c.desc}</div>
                  <div style={{ fontSize: "11px", color: "#2DD4A8", display: "flex", alignItems: "center", gap: "4px" }}>
                    {c.action} <IconChevron />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: "flex", justifyContent: step === 0 ? "flex-start" : "space-between",
          marginTop: "32px", marginLeft: step === 0 || step === 5 ? "54px" : 0,
        }}>
          {step > 0 && step < 5 && (
            <button
              onClick={() => goTo(step - 1)}
              style={{
                padding: "10px 20px", fontSize: "13px", fontWeight: 500,
                borderRadius: "8px", cursor: "pointer",
                border: "1px solid #27272a", background: "transparent", color: "#a1a1aa",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3f3f46"; e.currentTarget.style.color = "#d4d4d8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#27272a"; e.currentTarget.style.color = "#a1a1aa"; }}
            >
              Back
            </button>
          )}
          {step < 5 && (
            <button
              onClick={() => goTo(step + 1)}
              disabled={!canProceed()}
              style={{
                padding: "10px 24px", fontSize: "13px", fontWeight: 500,
                borderRadius: "8px", cursor: canProceed() ? "pointer" : "not-allowed",
                border: "none",
                background: canProceed() ? "#2DD4A8" : "#27272a",
                color: canProceed() ? "#0a0a0b" : "#52525b",
                display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.15s",
              }}
            >
              {step === 0 ? "Get started" : step === 4 ? "Finish setup" : "Continue"}
              <IconChevron />
            </button>
          )}
        </div>

        {step > 0 && step < 5 && (
          <button
            onClick={() => goTo(5)}
            style={{
              marginTop: "16px", padding: "0", fontSize: "12px",
              background: "none", border: "none", color: "#3f3f46",
              cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px",
            }}
          >
            Skip setup — I'll configure later
          </button>
        )}
      </div>
    </div>
  );
}
