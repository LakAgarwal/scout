import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { AlertCircle, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentimentData, setSentimentData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [keywordData, setKeywordData] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/analytics/sentiment`).then(res => res.json()),
      fetch(`${API_URL}/api/analytics/sentiment-trend?days=30`).then(res => res.json()),
      fetch(`${API_URL}/api/analytics/keywords?days=7`).then(res => res.json())
    ])
      .then(([sentiment, trend, keywords]) => {
        setSentimentData(sentiment);
        setTrendData(trend);
        // Take top 10 keywords and reverse for horizontal bar chart
        setKeywordData(keywords.slice(0, 10).reverse());
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Unable to fetch market metrics from the backend Scout API.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '15px' }}>
        <Loader className="spin" size={40} style={{ color: '#58a6ff' }} />
        <p style={{ color: '#8b949e', fontFamily: 'Outfit', fontSize: '18px' }}>Retrieving market analytics intelligence...</p>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .spin { animation: spin 1.2s linear infinite; }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }} className="glass-card">
        <AlertCircle size={48} style={{ color: '#f85149' }} />
        <h3 style={{ color: '#f85149', fontFamily: 'Outfit', fontSize: '24px' }}>API Connection Error</h3>
        <p style={{ color: '#c9d1d9', textAlign: 'center', maxWidth: '500px' }}>{error}</p>
        <p style={{ color: '#8b949e', fontSize: '13px' }}>Please ensure the Spring Boot server is running on port 8000.</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Try Reconnecting</button>
      </div>
    );
  }

  // Calculate KPIs
  const totalArticles = sentimentData.reduce((sum, item) => sum + item.count, 0);
  const posItem = sentimentData.find(item => item.sentiment === 'positive');
  const negItem = sentimentData.find(item => item.sentiment === 'negative');
  const posPct = posItem ? posItem.percentage : 0;
  const negPct = negItem ? negItem.percentage : 0;

  // Pie colors
  const RADIAN = Math.PI / 180;
  const sentimentColors = {
    positive: '#2ea043',
    negative: '#f85149',
    neutral: '#8b949e'
  };

  const pieData = sentimentData.map(item => ({
    name: item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1),
    value: item.count,
    color: sentimentColors[item.sentiment] || '#8b949e'
  }));

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '38px', marginBottom: '8px' }}>📊 Market Analytics Dashboard</h1>
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Overview of macro-market trends, public sentiment shifts, and emerging industry keywords.</p>
      </header>

      {/* KPI Cards Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Outfit', color: '#58a6ff' }}>{totalArticles}</span>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#8b949e', letterSpacing: '1px' }}>Total Articles</span>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Outfit', color: '#bb86fc' }}>4</span>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#8b949e', letterSpacing: '1px' }}>Sectors Tracked</span>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #2ea043' }}>
          <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Outfit', color: '#2ea043' }}>{posPct.toFixed(1)}%</span>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#8b949e', letterSpacing: '1px' }}>Positive Sentiment</span>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #f85149' }}>
          <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Outfit', color: '#f85149' }}>{negPct.toFixed(1)}%</span>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#8b949e', letterSpacing: '1px' }}>Negative Sentiment</span>
        </div>
      </section>

      {/* Row 2 Charts */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        {/* Pie Chart Card */}
        <div className="glass-card" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '20px', color: '#58a6ff' }}>📊 Sentiment Distribution</h3>
          {pieData.length > 0 ? (
            <div style={{ flex: 1, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121620', border: '1px solid rgba(88, 166, 255, 0.15)', borderRadius: '8px', color: '#c9d1d9' }}
                    itemStyle={{ color: '#c9d1d9' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: '#8b949e', textAlign: 'center', margin: 'auto' }}>No sentiment data available.</p>
          )}
        </div>

        {/* Line Chart Card */}
        <div className="glass-card" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '20px', color: '#58a6ff' }}>📈 Sentiment Over Time (30 Days)</h3>
          {trendData.length > 0 ? (
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="date" stroke="#8b949e" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#8b949e" style={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121620', border: '1px solid rgba(88, 166, 255, 0.15)', borderRadius: '8px' }}
                    labelStyle={{ color: '#8b949e' }}
                  />
                  <Legend iconType="plainline" />
                  <Line type="monotone" dataKey="positive" name="Positive" stroke="#2ea043" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="negative" name="Negative" stroke="#f85149" strokeWidth={3} />
                  <Line type="monotone" dataKey="neutral" name="Neutral" stroke="#8b949e" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: '#8b949e', textAlign: 'center', margin: 'auto' }}>No sentiment timeline data available.</p>
          )}
        </div>
      </section>

      {/* Row 3 Keywords Chart */}
      <section className="glass-card" style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: 'Outfit', marginBottom: '20px', color: '#58a6ff' }}>🔥 Top Trending Keywords (Last 7 Days)</h3>
        {keywordData.length > 0 ? (
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={keywordData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#21262d" />
                <XAxis type="number" stroke="#8b949e" style={{ fontSize: '11px' }} />
                <YAxis dataKey="keyword" type="category" stroke="#c9d1d9" style={{ fontSize: '12px', fontWeight: '500' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121620', border: '1px solid rgba(88, 166, 255, 0.15)', borderRadius: '8px' }}
                  itemStyle={{ color: '#58a6ff' }}
                />
                <Bar dataKey="score" name="Importance Score" fill="#58a6ff" radius={[0, 4, 4, 0]}>
                  {keywordData.map((entry, index) => {
                    // Magma scale color interpolation mock: fade from blue to purple
                    const ratio = index / Math.max(keywordData.length - 1, 1);
                    const color = ratio > 0.5 ? '#bb86fc' : '#58a6ff';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ color: '#8b949e', textAlign: 'center', margin: 'auto' }}>No trending keyword data available yet.</p>
        )}
      </section>
    </div>
  );
}
