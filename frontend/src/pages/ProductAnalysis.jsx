import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell,
  Legend
} from 'recharts';
import { Loader, ShoppingBag, ExternalLink, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Simple parser to render basic markdown elements, tables, and alerts in styled HTML
function MarkdownRenderer({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  let inTable = false;
  let tableRows = [];
  const renderedElements = [];

  const parseInline = (str) => {
    let formatted = str;
    const boldRegex = /\*\*(.*?)\*\*/g;
    formatted = formatted.replace(boldRegex, '<strong>$1</strong>');
    
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    formatted = formatted.replace(linkRegex, '<a href="$2" target="_blank" rel="noreferrer" class="citation-link">$1 <span style="font-size: 9px;">↗</span></a>');

    const codeRegex = /`(.*?)`/g;
    formatted = formatted.replace(codeRegex, '<code class="inline-code">$1</code>');
    
    return formatted;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('|')) {
      inTable = true;
      if (line.includes(':---') || line.includes('---:')) {
        continue;
      }
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableRows.push(cells);
      continue;
    } else if (inTable) {
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

    if (line.startsWith('> [!NOTE]') || line.startsWith('> [!IMPORTANT]')) {
      const nextLine = lines[i+1] ? lines[i+1].replace(/^>\s*/, '').trim() : '';
      renderedElements.push(
        <div key={`alert-${i}`} style={{ background: 'rgba(88, 166, 255, 0.08)', borderLeft: '4px solid #58a6ff', padding: '15px', borderRadius: '6px', margin: '15px 0', fontSize: '13.5px', color: '#c9d1d9' }} dangerouslySetInnerHTML={{ __html: parseInline(nextLine) }} />
      );
      i++;
      continue;
    }

    if (line.startsWith('# ')) {
      renderedElements.push(<h1 key={i} style={{ fontFamily: 'Outfit', fontSize: '24px', color: '#fff', margin: '20px 0 10px 0' }} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(2)) }} />);
    } else if (line.startsWith('## ')) {
      renderedElements.push(<h2 key={i} style={{ fontFamily: 'Outfit', fontSize: '20px', color: '#58a6ff', margin: '18px 0 10px 0' }} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(3)) }} />);
    } else if (line.startsWith('### ')) {
      renderedElements.push(<h3 key={i} style={{ fontFamily: 'Outfit', fontSize: '16px', color: '#bb86fc', margin: '15px 0 8px 0' }} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(4)) }} />);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      renderedElements.push(
        <ul key={i} style={{ paddingLeft: '20px', margin: '5px 0', color: '#c9d1d9' }}>
          <li style={{ marginBottom: '4px', fontSize: '14px' }} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(2)) }} />
        </ul>
      );
    } else if (line.length > 0) {
      renderedElements.push(<p key={i} style={{ margin: '10px 0', fontSize: '14px', lineHeight: '1.6', color: '#c9d1d9' }} dangerouslySetInnerHTML={{ __html: parseInline(line) }} />);
    }
  }

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

export default function ProductAnalysis() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({});
  const [report, setReport] = useState('');

  const handleSearch = (term) => {
    const qTerm = term || query;
    if (!qTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    setQuery(qTerm);

    fetch(`${API_URL}/api/articles/fetch-internet?q=${encodeURIComponent(qTerm)}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setStats(data.stats || {});
        setReport(data.report || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const suggestions = [
    { name: '📱 Mobile Phones', term: 'mobile' },
    { name: '💻 Laptops & PCs', term: 'laptop' },
    { name: '🔋 Electric Vehicles', term: 'electric vehicle' },
    { name: '☀️ Solar Panels', term: 'solar panel' }
  ];

  // Map stats for Recharts bar
  const shareOfVoiceData = Object.entries(stats)
    .map(([brand, item]) => ({
      brand,
      mentions: item.mentions
    }))
    .sort((a, b) => a.mentions - b.mentions);

  // Map stats for Recharts stacked sentiment
  const stackedSentimentData = Object.entries(stats)
    .map(([brand, item]) => ({
      brand,
      Positive: item.positive,
      Negative: item.negative,
      Neutral: item.neutral
    }));

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '38px', marginBottom: '8px' }}>🛍️ Product Intelligence & Market Analysis</h1>
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Search any product class to scrape live internet feeds, detect active manufacturers, and generate SWOT metrics.</p>
      </header>

      {/* Input panel & Suggestions */}
      <div className="glass-card" style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Type e.g., mobile, laptop, solar panel..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ padding: '12px 18px', fontSize: '15px' }}
          />
          <button 
            onClick={() => handleSearch()}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 30px' }}
            disabled={loading}
          >
            {loading ? <Loader className="spin" size={16} /> : <ShoppingBag size={16} />} Analyze
          </button>
        </div>

        <div>
          <p style={{ color: '#8b949e', fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>Quick Product Suggestions</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {suggestions.map(s => (
              <button 
                key={s.term}
                onClick={() => handleSearch(s.term)}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '12.5px' }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '15px' }}>
          <Loader className="spin" size={40} style={{ color: '#58a6ff' }} />
          <p style={{ color: '#8b949e', fontFamily: 'Outfit' }}>Fetching live articles from Google News RSS feeds, parsing brand mentions, and synthesizing SWOT...</p>
        </div>
      ) : searched ? (
        <div>
          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', alignItems: 'start', marginBottom: '40px' }}>
            
            {/* Left column: Charts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Share of voice bar chart */}
              <div className="glass-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'Outfit', color: '#58a6ff', fontSize: '15px', marginBottom: '20px' }}>Brand Share of Voice</h3>
                {shareOfVoiceData.length > 0 ? (
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shareOfVoiceData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#21262d" />
                        <XAxis type="number" stroke="#8b949e" style={{ fontSize: '11px' }} />
                        <YAxis dataKey="brand" type="category" stroke="#c9d1d9" style={{ fontSize: '11px', width: 90 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#121620', border: '1px solid rgba(88, 166, 255, 0.15)', borderRadius: '8px' }}
                          itemStyle={{ color: '#bb86fc' }}
                        />
                        <Bar dataKey="mentions" name="Articles Count" fill="#bb86fc" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ color: '#8b949e', textAlign: 'center', margin: 'auto' }}>No brand mentions detected in feed.</p>
                )}
              </div>

              {/* Stacked Sentiment Chart */}
              <div className="glass-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'Outfit', color: '#58a6ff', fontSize: '15px', marginBottom: '20px' }}>Sentiment Splits per Brand</h3>
                {stackedSentimentData.length > 0 ? (
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stackedSentimentData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#21262d" />
                        <XAxis dataKey="brand" stroke="#8b949e" style={{ fontSize: '11px' }} />
                        <YAxis stroke="#8b949e" style={{ fontSize: '11px' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#121620', border: '1px solid rgba(88, 166, 255, 0.15)', borderRadius: '8px' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        <Bar dataKey="Positive" stackId="a" fill="#2ea043" />
                        <Bar dataKey="Neutral" stackId="a" fill="#8b949e" />
                        <Bar dataKey="Negative" stackId="a" fill="#f85149" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ color: '#8b949e', textAlign: 'center', margin: 'auto' }}>No sentiment data mapped.</p>
                )}
              </div>

            </div>

            {/* Right column: SWOT report */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '730px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#bb86fc' }}>
                <Sparkles size={20} />
                <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', margin: 0 }}>Market Landscape & SWOT</h3>
              </div>
              <MarkdownRenderer text={report} />
            </div>

          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(88, 166, 255, 0.15)', margin: '40px 0' }} />

          {/* Live Articles Feed */}
          <section>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '22px', color: '#fff', marginBottom: '20px' }}>
              📰 Live Product Feed: '{query.charAt(0).toUpperCase() + query.slice(1)}'
            </h2>

            {articles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {articles.map((art, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '15px' }}>
                      <h4 style={{ color: '#58a6ff', fontFamily: 'Outfit', fontSize: '16px', margin: 0 }}>{art.title}</h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`badge badge-${art.sentiment}`}>{art.sentiment}</span>
                        <span style={{ fontSize: '11px', color: '#8b949e' }}>{art.published_date}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#c9d1d9' }}>{art.summary}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {art.brands.map(b => (
                          <span key={b} className="badge badge-topic" style={{ fontSize: '10px', padding: '2px 8px' }}>{b}</span>
                        ))}
                        <span style={{ fontSize: '12px', color: '#8b949e', marginLeft: '10px' }}>Source: <b>{art.source}</b></span>
                      </div>
                      
                      <a href={art.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '13px', fontWeight: '600' }}>
                        Read original article <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#8b949e', textAlign: 'center' }}>No live articles retrieved.</p>
            )}
          </section>

        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#8b949e' }}>
          <ShoppingBag size={48} style={{ marginBottom: '15px', color: '#8b949e', opacity: 0.6 }} />
          <h3 style={{ fontFamily: 'Outfit', color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Perform live SWOT Analysis</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '14px', lineHeight: '1.5' }}>
            Enter a search term in the panel above (e.g. mobile, laptop, solar panel) and click analyze to fetch live data from the internet.
          </p>
        </div>
      )}
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
