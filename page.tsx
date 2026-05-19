"use client";
import { useState } from "react";

interface Message {
  role: "user" | "agent";
  content: string;
  trace?: unknown[];
  provider?: unknown;
  price?: unknown;
}

interface Provider {
  name: string;
  location: string;
  rating: number;
  on_time_score: number;
}

interface Price {
  total: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: "Assalam o Alaikum! Main aapka service booking agent hoon. Aap mujhe batayein kya service chahiye, kahan, aur kab? Example: Mujhe kal subah G-13 mein AC technician chahiye",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [currentTrace, setCurrentTrace] = useState<unknown[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: data.reply,
          trace: data.trace,
          provider: data.provider,
          price: data.price,
        },
      ]);
      if (data.trace) setCurrentTrace(data.trace);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Error occurred. Please try again." },
      ]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      fontFamily: "Segoe UI, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "800px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        overflow: "hidden"
      }}>
        <div style={{
          padding: "20px",
          background: "rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "22px" }}>Ustaad AI</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: "13px" }}>
              Pakistan Agentic Service Booking System
            </p>
          </div>
          <button
            onClick={() => setShowTrace(!showTrace)}
            style={{
              background: "rgba(99,102,241,0.3)",
              border: "1px solid rgba(99,102,241,0.5)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            {showTrace ? "Hide" : "Show"} Agent Trace
          </button>
        </div>

        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, padding: "20px", maxHeight: "500px", overflowY: "auto" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
              }}>
                <div style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  {msg.content}
                  {(msg.provider as Provider) && (
                    <div style={{
                      marginTop: "10px",
                      padding: "10px",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}>
                      <div>Provider: {(msg.provider as Provider).name}</div>
                      <div>Location: {(msg.provider as Provider).location}</div>
                      <div>Rating: {(msg.provider as Provider).rating}/5</div>
                      <div>On-time: {(msg.provider as Provider).on_time_score}%</div>
                      {(msg.price as Price) && <div>Total: Rs.{(msg.price as Price).total}</div>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                Agent is thinking...
              </div>
            )}
          </div>

          {showTrace && currentTrace.length > 0 && (
            <div style={{
              width: "280px",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              padding: "16px",
              maxHeight: "500px",
              overflowY: "auto",
              background: "rgba(0,0,0,0.2)"
            }}>
              <h3 style={{ color: "#a78bfa", margin: "0 0 12px", fontSize: "14px" }}>
                Agent Reasoning Trace
              </h3>
              {currentTrace.map((step, i) => (
                <div key={i} style={{
                  marginBottom: "12px",
                  padding: "8px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  borderLeft: "3px solid #6366f1"
                }}>
                  <div style={{ color: "#a78bfa", fontSize: "11px", marginBottom: "4px" }}>
                    Step {i + 1}: {(step as {step: string}).step}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>
                    {JSON.stringify((step as {result: unknown}).result, null, 2).toString().slice(0, 150)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          gap: "10px"
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type in Urdu, Roman Urdu, or English..."
            style={{
              flex: 1,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "14px",
              outline: "none"
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}