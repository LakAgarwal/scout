import React, { useState } from 'react';
import { Loader, Database, AlertTriangle, CheckCircle, ExternalLink, Cpu } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ProjectIngestion() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState(null);

  // Ingestion metrics
  const [stats, setStats] = useState({
    total_fetched: 0,
    new_ingested: 0,
    duplicates_skipped: 0,
    errors: 0
  });
  const [articles, setArticles] = useState([]);

  const handleIngest = (term) => {
    const qTerm = term || query;
    if (!qTerm.trim()) return;

    setLoading(true);
    setFinished(false);
    setError(null);
    setQuery(qTerm);

    fetch(`${API_URL}/api/articles/ingest-keyword?q=${encodeURIComponent(qTerm)}`, {
      method: 'POST'
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Server returned error status ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          setStats(data.stats);
          setArticles(data.articles || []);
          setFinished(true);
        } else {
          throw new Error(data.detail || 'Failed to complete ingestion pipeline.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to connect to ingestion server.');
        setLoading(false);
      });
  };

  const suggestions = [
    'solid state battery',
    'generative AI regulation',
    'hyperloop commercial trial',
    'vertical farming automated crop',
    'uav defense interception'
  ];

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '38px', marginBottom: '8px' }}>🚀 Project Ingestion Pipeline</h1>
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Search and ingest live articles on any topic or project directly into the database, running the full NLP models automatically.</p>
      </header>

      {/* Input panel */}
      <div className="glass-card" style={{ marginBottom: '40px' }}>
        <h3 style={{ fontFamily: 'Outfit', color: '#fff', fontSize: '18px', marginBottom: '15px' }}>Ingest a New Project</h3>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Type e.g., solid state battery, generative AI regulation, hyperloop..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleIngest()}
            style={{ padding: '12px 18px', fontSize: '15px' }}
            disabled={loading}
          />
          <button 
            onClick={() => handleIngest()}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 30px' }}
            disabled={loading}
          >
            {loading ? <Loader className="spin" size={16} /> : <Database size={16} />} Start Ingestion
          </button>
        </div>

        <div>
          <p style={{ color: '#8b949e', fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>Suggested Topics to Ingest</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {suggestions.map(s => (
              <button 
                key={s}
                onClick={() => handleIngest(s)}
                className="btn-secondary"
                style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px' }}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '60px 40px', borderLeft: '4px solid #f0883e' }}>
          <Loader className="spin" size={40} style={{ color: '#f0883e' }} />
          <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', color: '#fff' }}>Executing NLP & Clustering Models...</h3>
          <p style={{ color: '#c9d1d9', textAlign: 'center', maxWidth: '500px', fontSize: '14px', lineHeight: '1.5' }}>
            Currently downloading Google News search feeds, extracting full text body, classifying sectors, running <b>FinBERT</b> sentiment score models, and generating <b>KeyBERT</b> keyword maps.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(240, 136, 62, 0.1)', padding: '10px 18px', borderRadius: '6px', color: '#f0883e', fontSize: '13px' }}>
            <AlertTriangle size={16} />
            <span>This heavy operation takes 30-90 seconds. Please do not close or refresh this page.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '40px', borderLeft: '4px solid #f85149', marginBottom: '30px' }}>
          <AlertTriangle size={36} style={{ color: '#f85149' }} />
          <h4 style={{ fontFamily: 'Outfit', color: '#f85149', fontSize: '16px' }}>Ingestion Script Encountered an Error</h4>
          <p style={{ color: '#c9d1d9', fontSize: '13.5px', textAlign: 'center', maxWidth: '600px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '6px', overflowX: 'auto', width: '100%' }}>{error}</p>
        </div>
      )}

      {finished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Success Overlay */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #2ea043' }}>
            <CheckCircle size={32} style={{ color: '#2ea043' }} />
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', color: '#fff', marginBottom: '4px' }}>Pipeline execution finished successfully!</h3>
              <p style={{ color: '#8b949e', fontSize: '13px' }}>New articles have been ingested, mapped with vectors, and saved to the relational database.</p>
            </div>
          </div>

          {/* Stats KPIs */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div className="glass-card" style={{ textAlign: 'center', padding: '15px' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#58a6ff', fontFamily: 'Outfit' }}>{stats.total_fetched}</div>
              <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>Fetched</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: '15px', borderBottom: '2px solid #2ea043' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#2ea043', fontFamily: 'Outfit' }}>{stats.new_ingested}</div>
              <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>New Ingested</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: '15px' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#bb86fc', fontFamily: 'Outfit' }}>{stats.duplicates_skipped}</div>
              <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>Duplicates Skipped</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: '15px', borderBottom: stats.errors > 0 ? '2px solid #f85149' : 'none' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: stats.errors > 0 ? '#f85149' : '#8b949e', fontFamily: 'Outfit' }}>{stats.errors}</div>
              <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>Errors</div>
            </div>
          </section>

          {/* Ingested list */}
          <section>
            <h3 style={{ fontFamily: 'Outfit', color: '#fff', fontSize: '18px', marginBottom: '20px' }}>Ingested Records</h3>
            {articles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {articles.map(art => (
                  <div key={art.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '15px' }}>
                      <h4 style={{ color: '#58a6ff', fontFamily: 'Outfit', fontSize: '16px', margin: 0 }}>{art.title}</h4>
                      <span className={`badge badge-${art.sentiment}`}>{art.sentiment}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="badge badge-industry">{art.industry}</span>
                      {art.keywords.map(kw => (
                        <span key={kw} className="badge badge-source" style={{ textTransform: 'none', fontSize: '10.5px' }}>{kw}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '5px' }}>
                      <span style={{ color: '#8b949e' }}>Publisher: <b>{art.source}</b></span>
                      <a href={art.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                        Open URL <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#8b949e', textAlign: 'center' }}>No new articles inserted in this execution batch.</p>
            )}
          </section>

        </div>
      )}

      {!loading && !finished && !error && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#8b949e' }}>
          <Cpu size={48} style={{ marginBottom: '15px', color: '#8b949e', opacity: 0.6 }} />
          <h3 style={{ fontFamily: 'Outfit', color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Launch real-time ingestion</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '14px', lineHeight: '1.5' }}>
            Submit a custom project search keyword to let the python ingestion engine scrape, extract metadata, run FinBERT/KeyBERT models, and map vector embeds.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1.2s linear infinite; }
      `}</style>
    </div>
  );
}
