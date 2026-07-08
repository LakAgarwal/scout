import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
} from 'recharts';
import { Loader, Search, RefreshCw, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function MarketExplorer() {
  const [loading, setLoading] = useState(true);
  const [fetchingArticles, setFetchingArticles] = useState(false);
  const [topics, setTopics] = useState([]);
  const [velocity, setVelocity] = useState([]);
  const [articles, setArticles] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');
  const [topic, setTopic] = useState('All');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/analytics/topics?limit=20`).then(res => res.json()),
      fetch(`${API_URL}/api/analytics/topics/velocity?days=7`).then(res => res.json())
    ])
      .then(([topicsData, velocityData]) => {
        setTopics(topicsData);
        setVelocity(velocityData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fetch articles on filter changes
  useEffect(() => {
    setFetchingArticles(true);
    const params = new URLSearchParams();
    params.append('limit', '50');
    if (search) params.append('search', search);
    if (industry && industry !== 'All') params.append('industry', industry);
    if (topic && topic !== 'All') params.append('topic', topic);

    fetch(`${API_URL}/api/articles?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setFetchingArticles(false);
      })
      .catch(err => {
        console.error(err);
        setFetchingArticles(false);
      });
  }, [search, industry, topic]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '15px' }}>
        <Loader className="spin" size={40} style={{ color: '#58a6ff' }} />
        <p style={{ color: '#8b949e', fontFamily: 'Outfit' }}>Analyzing topic velocities and loading explorer...</p>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .spin { animation: spin 1.2s linear infinite; }
        `}</style>
      </div>
    );
  }

  // Format topics for charting (top 10)
  const chartTopics = [...topics].slice(0, 10).reverse();

  const industries = ['All', 'logistics', 'pharma', 'agriculture', 'defense'];

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '38px', marginBottom: '8px' }}>🧭 Market Explorer & Trend Intelligence</h1>
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Analyze dynamic topic clusters, track growth velocity, and search key intelligence feed.</p>
      </header>

      {/* Filter and Metrics Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px', alignItems: 'start', marginBottom: '40px' }}>
        {/* Left Filter Column */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' }}>
          <h4 style={{ fontFamily: 'Outfit', color: '#58a6ff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} /> Filters & Search
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#8b949e', fontWeight: '600' }}>Search Keywords</label>
            <input 
              type="text" 
              placeholder="e.g. AI, solar, drone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#8b949e', fontWeight: '600' }}>Filter by Sector</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind.charAt(0).toUpperCase() + ind.slice(1)}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#8b949e', fontWeight: '600' }}>Filter by Topic Cluster</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="All">All Topics</option>
              {topics.map(t => (
                <option key={t.topic_name} value={t.topic_name}>{t.topic_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Charts and Table Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            
            {/* Velocity Table */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '350px' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '16px', color: '#58a6ff', marginBottom: '4px' }}>📈 Topic Growth Velocity (Last 7 Days)</h3>
              <p style={{ color: '#8b949e', fontSize: '11px', marginBottom: '15px' }}>Shift in frequency (last 7 days vs previous 7 days).</p>
              
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {velocity.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(88, 166, 255, 0.15)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 4px', color: '#8b949e', fontWeight: '600' }}>Topic Cluster Name</th>
                        <th style={{ padding: '8px 4px', color: '#8b949e', fontWeight: '600', textAlign: 'right' }}>Count</th>
                        <th style={{ padding: '8px 4px', color: '#8b949e', fontWeight: '600', textAlign: 'right' }}>Velocity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {velocity.map(v => {
                        const isPos = v.velocity_pct > 0;
                        const isNeg = v.velocity_pct < 0;
                        const color = isPos ? '#2ea043' : (isNeg ? '#f85149' : '#8b949e');
                        return (
                          <tr key={v.topic_name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '8px 4px', color: '#c9d1d9', fontWeight: '500' }}>{v.topic_name}</td>
                            <td style={{ padding: '8px 4px', textAlign: 'right', color: '#8b949e' }}>{v.current_count}</td>
                            <td style={{ padding: '8px 4px', textAlign: 'right', color, fontWeight: 'bold' }}>
                              {isPos ? '+' : ''}{v.velocity_pct.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#8b949e', textAlign: 'center', padding: '40px' }}>No topic velocity stats available.</p>
                )}
              </div>
            </div>

            {/* Topic Frequency Bar Chart */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '350px' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '16px', color: '#58a6ff', marginBottom: '20px' }}>📊 Top Topic Frequency</h3>
              {chartTopics.length > 0 ? (
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartTopics} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#21262d" />
                      <XAxis type="number" stroke="#8b949e" style={{ fontSize: '11px' }} />
                      <YAxis dataKey="topic_name" type="category" stroke="#c9d1d9" style={{ fontSize: '11px', width: 90 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#121620', border: '1px solid rgba(88, 166, 255, 0.15)', borderRadius: '8px' }}
                        itemStyle={{ color: '#bb86fc' }}
                      />
                      <Bar dataKey="frequency" name="Articles Count" fill="#bb86fc" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p style={{ color: '#8b949e', textAlign: 'center', margin: 'auto' }}>No topic clusters mapped.</p>
              )}
            </div>

          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(88, 166, 255, 0.15)', margin: '40px 0' }} />

      {/* Feed Cards Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '25px' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '22px', color: '#fff' }}>📰 Article Intelligence Feed</h2>
          {fetchingArticles && <RefreshCw className="spin" size={16} style={{ color: '#58a6ff', marginLeft: '10px' }} />}
        </div>

        {articles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {articles.map(art => {
              const dateStr = new Date(art.publishedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              return (
                <article key={art.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '15px' }}>
                    <h3 style={{ color: '#58a6ff', fontFamily: 'Outfit', fontSize: '18px', fontWeight: '600', margin: 0 }}>{art.title}</h3>
                    <span style={{ fontSize: '12px', color: '#8b949e', whiteSpace: 'nowrap' }}>{dateStr}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-industry">{art.industry}</span>
                    <span className="badge badge-topic">{art.topicName || 'Unassigned'}</span>
                    <span className="badge badge-source">{art.source}</span>
                    {art.sentimentScore && (
                      <span className={`badge badge-${art.sentimentScore.sentiment}`}>
                        {art.sentimentScore.sentiment}
                      </span>
                    )}
                  </div>

                  <p style={{ color: '#c9d1d9', fontSize: '14.5px', lineHeight: '1.6' }}>{art.summary}</p>
                  
                  <a href={art.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', alignSelf: 'flex-start', fontWeight: '600' }}>
                    Read original article <ExternalLink size={12} />
                  </a>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
            No articles found matching the current search criteria or filters.
          </div>
        )}
      </section>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1.2s linear infinite; }
      `}</style>
    </div>
  );
}
