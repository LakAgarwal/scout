import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Loader, Send, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Simple parser to render basic markdown elements, tables, and alerts in styled HTML
function MarkdownRenderer({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  let inTable = false;
  let tableRows = [];
  const renderedElements = [];

  const parseInline = (str) => {
    // Bold parsing **text**
    let formatted = str;
    const boldRegex = /\*\*(.*?)\*\*/g;
    formatted = formatted.replace(boldRegex, '<strong>$1</strong>');
    
    // Link parsing [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    formatted = formatted.replace(linkRegex, '<a href="$2" target="_blank" rel="noreferrer" class="citation-link">$1 <span style="font-size: 9px;">↗</span></a>');

    // Code inline `code`
    const codeRegex = /`(.*?)`/g;
    formatted = formatted.replace(codeRegex, '<code class="inline-code">$1</code>');
    
    return formatted;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 1. Table parsing
    if (line.startsWith('|')) {
      inTable = true;
      // Skip alignment rows | :--- | :--- |
      if (line.includes(':---') || line.includes('---:')) {
        continue;
      }
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      // Flush table
      if (tableRows.length > 0) {
        const rows = [...tableRows];
        renderedElements.push(
          <div key={`table-${i}`} className="citation-table-wrapper" style={{ margin: '15px 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: 'rgba(22, 27, 34, 0.4)', border: '1px solid rgba(88, 166, 255, 0.1)' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', textAlign: 'left' }}>
                  {rows[0].map((cell, idx) => (
                    <th key={`th-${idx}`} style={{ padding: '10px', border: '1px solid rgba(88, 166, 255, 0.1)', fontWeight: '600' }} dangerouslySetInnerHTML={{ __html: parseInline(cell) }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, rIdx) => (
                  <tr key={`tr-${rIdx}`} style={{ borderBottom: '1px solid rgba(88, 166, 255, 0.05)' }}>
                    {row.map((cell, cIdx) => (
                      <td key={`td-${cIdx}`} style={{ padding: '8px 10px', border: '1px solid rgba(88, 166, 255, 0.05)', color: '#c9d1d9' }} dangerouslySetInnerHTML={{ __html: parseInline(cell) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    }

    // 2. Alert boxes
    if (line.startsWith('> [!NOTE]') || line.startsWith('> [!IMPORTANT]')) {
      const nextLine = lines[i+1] ? lines[i+1].replace(/^>\s*/, '').trim() : '';
      renderedElements.push(
        <div key={`alert-${i}`} style={{ background: 'rgba(88, 166, 255, 0.08)', borderLeft: '4px solid #58a6ff', padding: '15px', borderRadius: '6px', margin: '15px 0', fontSize: '13.5px', color: '#c9d1d9' }} dangerouslySetInnerHTML={{ __html: parseInline(nextLine) }} />
      );
      i++; // Skip next line
      continue;
    }

    // 3. Headers
    if (line.startsWith('# ')) {
      renderedElements.push(<h1 key={i} style={{ fontFamily: 'Outfit', fontSize: '24px', color: '#fff', margin: '20px 0 10px 0' }} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(2)) }} />);
    } else if (line.startsWith('## ')) {
      renderedElements.push(<h2 key={i} style={{ fontFamily: 'Outfit', fontSize: '20px', color: '#58a6ff', margin: '18px 0 10px 0' }} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(3)) }} />);
    } else if (line.startsWith('### ')) {
      renderedElements.push(<h3 key={i} style={{ fontFamily: 'Outfit', fontSize: '16px', color: '#bb86fc', margin: '15px 0 8px 0' }} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(4)) }} />);
    } 
    // 4. Bullet lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      renderedElements.push(
        <ul key={i} style={{ paddingLeft: '20px', margin: '5px 0', color: '#c9d1d9' }}>
          <li style={{ marginBottom: '4px', fontSize: '14px' }} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(2)) }} />
        </ul>
      );
    } 
    // 5. Normal text paragraphs
    else if (line.length > 0) {
      renderedElements.push(<p key={i} style={{ margin: '10px 0', fontSize: '14px', lineHeight: '1.6', color: '#c9d1d9' }} dangerouslySetInnerHTML={{ __html: parseInline(line) }} />);
    }
  }

  // Final flush for table if text ended in table
  if (tableRows.length > 0) {
    renderedElements.push(
      <div key={`table-end`} className="citation-table-wrapper" style={{ margin: '15px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: 'rgba(22, 27, 34, 0.4)', border: '1px solid rgba(88, 166, 255, 0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', textAlign: 'left' }}>
              {tableRows[0].map((cell, idx) => (
                <th key={`th-${idx}`} style={{ padding: '10px', border: '1px solid rgba(88, 166, 255, 0.1)' }} dangerouslySetInnerHTML={{ __html: parseInline(cell) }} />
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, rIdx) => (
              <tr key={`tr-${rIdx}`} style={{ borderBottom: '1px solid rgba(88, 166, 255, 0.05)' }}>
                {row.map((cell, cIdx) => (
                  <td key={`td-${cIdx}`} style={{ padding: '8px 10px', border: '1px solid rgba(88, 166, 255, 0.05)', color: '#c9d1d9' }} dangerouslySetInnerHTML={{ __html: parseInline(cell) }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <div>{renderedElements}</div>;
}

export default function AIAnalyst() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    // Add user message
    const userMsg = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    fetch(`${API_URL}/api/analytics/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
      .then(res => res.json())
      .then(data => {
        const assistantMsg = { 
          role: 'assistant', 
          content: data.response,
          articles: data.articles // contains citations
        };
        setMessages(prev => [...prev, assistantMsg]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        const errorMsg = {
          role: 'assistant',
          content: '⚠️ Failed to connect to the Scout intelligence server. Please verify Spring Boot is running on port 8000.'
        };
        setMessages(prev => [...prev, errorMsg]);
        setLoading(false);
      });
  };

  const suggestions = [
    { title: '📈 EV Competitor Trends', prompt: 'Summarize recent EV competitor trends (Tesla, BYD)' },
    { title: '⚔️ BYD SWOT Analysis', prompt: 'Generate a SWOT analysis for BYD' },
    { title: '🛡️ Defense Sector Overview', prompt: 'What are the latest developments in the defense industry?' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 className="gradient-text" style={{ fontSize: '38px', marginBottom: '8px' }}>🤖 AI Analyst Report Generator</h1>
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Enter research topics, industry questions, or request SWOT reports built from gathered intelligence.</p>
      </header>

      {/* Messages Window */}
      <div className="glass-card" style={{ flex: 1, overflowY: 'auto', padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px', color: '#8b949e', padding: '40px' }}>
            <Sparkles size={48} style={{ color: '#bb86fc', opacity: 0.8 }} />
            <h3 style={{ fontFamily: 'Outfit', color: '#fff', fontSize: '20px' }}>Ask Scout Anything</h3>
            <p style={{ textAlign: 'center', maxWidth: '400px', fontSize: '14px', lineHeight: '1.5' }}>
              Scout searches local relational databases, connects text snippets, and calls Google Gemini API to synthesize reports with citations.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                gap: '15px', 
                background: msg.role === 'user' ? 'rgba(88, 166, 255, 0.03)' : 'rgba(187, 134, 252, 0.03)',
                padding: '18px',
                borderRadius: '10px',
                border: `1px solid ${msg.role === 'user' ? 'rgba(88, 166, 255, 0.08)' : 'rgba(187, 134, 252, 0.08)'}`
              }}
            >
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: msg.role === 'user' ? 'rgba(88, 166, 255, 0.15)' : 'rgba(187, 134, 252, 0.15)',
                  color: msg.role === 'user' ? '#58a6ff' : '#bb86fc',
                  flexShrink: 0
                }}
              >
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <MarkdownRenderer text={msg.content} />

                {/* Citations Footer */}
                {msg.articles && msg.articles.length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(88, 166, 255, 0.1)' }}>
                    <h4 style={{ fontFamily: 'Outfit', fontSize: '13px', color: '#8b949e', marginBottom: '10px', fontWeight: '600' }}>Cited Database Articles:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {msg.articles.map((art, aIdx) => (
                        <div key={art.id} style={{ display: 'flex', alignItems: 'center', justify: 'between', fontSize: '12.5px', background: 'rgba(22, 27, 34, 0.3)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <span style={{ color: '#58a6ff', fontWeight: '600', marginRight: '8px' }}>[{aIdx + 1}]</span>
                          <span style={{ color: '#c9d1d9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{art.title}</span>
                          <span style={{ color: '#8b949e', fontSize: '11px', margin: '0 15px' }}>{art.source}</span>
                          <a href={art.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#bb86fc' }}>
                            View <ExternalLink size={10} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '15px', background: 'rgba(187, 134, 252, 0.03)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(187, 134, 252, 0.08)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', background: 'rgba(187, 134, 252, 0.15)', color: '#bb86fc' }}>
              <Loader className="spin" size={20} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8b949e', fontSize: '14px' }}>
              <span>Scout is retrieving local context articles and generating report...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div style={{ marginBottom: '15px' }}>
          <p style={{ color: '#8b949e', fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><HelpCircle size={14} /> Quick Suggestions</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {suggestions.map(s => (
              <button 
                key={s.title}
                onClick={() => handleSend(s.prompt)}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '12.5px' }}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <input 
          type="text" 
          placeholder="Ask Scout a research question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ padding: '14px 20px', fontSize: '15px' }}
          disabled={loading}
        />
        <button 
          onClick={() => handleSend()} 
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 25px' }}
          disabled={loading}
        >
          <Send size={16} /> Send
        </button>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1.2s linear infinite; }
        .citation-link {
          color: #58a6ff;
          text-decoration: underline;
        }
        .inline-code {
          background-color: rgba(88, 166, 255, 0.1);
          color: #bb86fc;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
