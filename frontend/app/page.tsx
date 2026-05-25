'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ExternalLink, ArrowRight, Layers, HelpCircle, AlertCircle, FileText, X } from 'lucide-react';

interface Source {
  source: string;
  score: number;
  text: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

const STARTER_PROMPTS = [
  {
    title: 'Indian Super League',
    desc: 'What is the ISL and how does it work?',
    prompt: 'Tell me about the Indian Super League (ISL) history and format.',
  },
  {
    title: 'FIFA World Cup',
    desc: 'When did it start and who won most?',
    prompt: 'What is the history of the FIFA World Cup and who has been the most successful team?',
  },
  {
    title: 'Champions League',
    desc: 'How does the UCL tournament work?',
    prompt: 'Explain the tournament structure and history of the UEFA Champions League (UCL).',
  },
  {
    title: 'Football Rules',
    desc: 'What are the main rules of the sport?',
    prompt: 'What are the fundamental rules and history of Association Football?',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/health');
        if (res.ok) {
          setIsBackendConnected(true);
        } else {
          setIsBackendConnected(false);
        }
      } catch (err) {
        setIsBackendConnected(false);
      }
    };
    checkHealth();
    // Re-check every 15 seconds
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend }),
      });

      if (!res.ok) {
        throw new Error(`Server returned code ${res.status}`);
      }

      const data = await res.json();
      const botMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsBackendConnected(true);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ Failed to connect to the football AI knowledge base. Please check if your FastAPI backend server is running on port 8000.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceClick = (source: Source) => {
    setSelectedSource(source);
    setSidebarOpen(true);
  };

  const formatSourceTitle = (url: string) => {
    try {
      const parts = url.split('/');
      const pageName = decodeURIComponent(parts[parts.length - 1]);
      return pageName.replace(/_/g, ' ');
    } catch {
      return 'Wikipedia Reference';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="bg-gradient-mesh"></div>
      <div className="app-container">
        
        {/* Navigation Header */}
        <header className="app-header">
          <div className="logo-container">
            <Bot size={28} className="logo-icon" />
            <h1 className="logo-text">FootyMind RAG</h1>
          </div>
          
          <div className="status-badge">
            <span className={`status-dot ${isBackendConnected ? 'active' : ''}`}></span>
            <span>
              {isBackendConnected === null 
                ? 'Connecting...' 
                : isBackendConnected 
                  ? 'AI Engine Online' 
                  : 'AI Engine Offline'}
            </span>
          </div>
        </header>

        {/* Main Work Area */}
        <main className={`chat-wrapper ${sidebarOpen && selectedSource ? 'has-sources' : ''}`}>
          
          {/* Chat Panel */}
          <div className="chat-board">
            
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="welcome-container">
                <div className="avatar bot mb-4" style={{ width: '60px', height: '60px' }}>
                  <Sparkles size={32} className="logo-icon" />
                </div>
                <h2 className="welcome-title">Your Smart Football Assistant</h2>
                <p className="welcome-subtitle">
                  Ask me anything about Association Football, the FIFA World Cup, 
                  the UEFA Champions League, the I-League, or the Indian Super League (ISL). 
                  I ground my answers in curated Wiki datasets with real-time vector retrieval!
                </p>

                <div className="starter-grid">
                  {STARTER_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubmit(item.prompt)}
                      className="starter-card"
                    >
                      <span className="starter-card-title">{item.title}</span>
                      <span className="starter-card-desc">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Feed Screen */
              <div ref={feedRef} className="chat-feed">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message-item ${msg.role}`}>
                    <div className="avatar">
                      {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div className="message-content">
                      <div className="message-bubble">{msg.content}</div>
                      
                      {/* Source Citations */}
                      {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                        <div className="sources-container">
                          <span className="sources-header">Cited References</span>
                          <div className="sources-list">
                            {msg.sources.map((src, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => handleSourceClick(src)}
                                className="source-badge"
                              >
                                <FileText size={12} />
                                <span>{formatSourceTitle(src.source)}</span>
                                <span className="source-score">{(1 - src.score).toFixed(2)} Match</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isLoading && (
                  <div className="message-item bot">
                    <div className="avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-content">
                      <div className="message-bubble typing-bubble">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input Form */}
            <div className="chat-input-area">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(input);
                }} 
                className="chat-form"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about football leagues, rules, or cup histories..."
                  className="text-input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="send-button"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>

          </div>

          {/* Sources Detail Sidebar Panel */}
          {sidebarOpen && selectedSource && (
            <div className="sources-panel">
              <div className="sources-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="sources-panel-title" style={{ margin: 0 }}>
                  <Layers size={18} className="logo-icon" />
                  Citation Breakdown
                </h3>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="source-item-card">
                <div className="source-item-header">
                  <span className="source-item-score">{(1 - selectedSource.score).toFixed(2)} Vector Similarity</span>
                  <a 
                    href={selectedSource.source} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="source-item-url"
                    title={selectedSource.source}
                  >
                    Wikipedia <ExternalLink size={10} style={{ display: 'inline', marginLeft: '2px' }} />
                  </a>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, marginTop: '8px' }}>
                  {formatSourceTitle(selectedSource.source)}
                </div>
                <div className="source-item-text">
                  "{selectedSource.text}"
                </div>
              </div>

              <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <HelpCircle size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Matches indicate distance computed using the L2/Cosine space of sentence embeddings over raw scrapped chunks.
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
