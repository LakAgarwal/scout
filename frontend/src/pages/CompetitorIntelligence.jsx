import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Loader, Swords, Shield, Heart, Target, Sparkles, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CompetitorIntelligence() {
  const [loading, setLoading] = useState(true);
  const [competitors, setCompetitors] = useState([]);
  const [selectedComp, setSelectedComp] = useState('');
  const [compMentions, setCompMentions] = useState([]);
  const [fetchingMentions, setFetchingMentions] = useState(false);

  // Side by Side comparison state
  const [compA, setCompA] = useState('');
  const [compB, setCompB] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/analytics/competitors`)
      .then(res => res.json())
      .then(data => {
        setCompetitors(data);
        if (data.length > 0) {
          setSelectedComp(data[0].company_name);
          setCompA(data[0].company_name);
          setCompB(data[Math.min(1, data.length - 1)].company_name);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fetch deep-dive mentions when selected competitor changes
  useEffect(() => {
    if (!selectedComp) return;
    setFetchingMentions(true);
    fetch(`${API_URL}/api/analytics/competitors/${selectedComp}`)
      .then(res => res.json())
      .then(data => {
        setCompMentions(data);
        setFetchingMentions(false);
      })
      .catch(err => {
        console.error(err);
        setFetchingMentions(false);
      });
  }, [selectedComp]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '15px' }}>
        <Loader className="spin" size={40} style={{ color: '#58a6ff' }} />
        <p style={{ color: '#8b949e', fontFamily: 'Outfit' }}>Compiling competitor share of voice and profiles...</p>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .spin { animation: spin 1.2s linear infinite; }
        `}</style>
      </div>
    );
  }

  if (competitors.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#8b949e' }}>
        <Swords size={48} style={{ marginBottom: '15px' }} />
        <p>No competitor mention data available.</p>
        <p style={{ fontSize: '13px', marginTop: '10px' }}>Make sure to run the project ingestion pipeline to detect competitor mentions.</p>
      </div>
    );
  }

  // Reverse list for horizontal chart
  const shareOfVoiceData = [...competitors].reverse();

  // Find selected competitor summary row
  const selectedRow = competitors.find(c => c.company_name === selectedComp) || competitors[0];
  
  // Calculate Primary Industry
  const indBreakdown = selectedRow.industry_breakdown || {};
  let primaryIndustry = 'N/A';
  let maxIndCount = 0;
  Object.entries(indBreakdown).forEach(([ind, count]) => {
    if (count > maxIndCount) {
      maxIndCount = count;
      primaryIndustry = ind;
    }
  });

  // Sentiment ratio
  const sentBreakdown = selectedRow.sentiment_breakdown || {};
  const totalCompMentions = selectedRow.total_mentions || 1;
  const posCount = sentBreakdown.positive || 0;
  const posPct = ((posCount / totalCompMentions) * 100).toFixed(1);

  // Donut chart data
  const donutColors = {
    positive: '#2ea043',
    negative: '#f85149',
    neutral: '#8b949e'
  };
  const pieData = Object.entries(sentBreakdown).map(([sentiment, count]) => ({
    name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
    value: count,
    color: donutColors[sentiment] || '#8b949e'
  }));

  // Setup Side by Side Compare
  const rowA = competitors.find(c => c.company_name === compA) || competitors[0];
  const rowB = competitors.find(c => c.company_name === compB) || competitors[0];

  const compareRows = [
    { label: 'Total Mentions', a: rowA.total_mentions, b: rowB.total_mentions },
    { label: 'Positive Mentions', a: rowA.sentiment_breakdown?.positive || 0, b: rowB.sentiment_breakdown?.positive || 0 },
    { label: 'Negative Mentions', a: rowA.sentiment_breakdown?.negative || 0, b: rowB.sentiment_breakdown?.negative || 0 },
    { label: 'Neutral Mentions', a: rowA.sentiment_breakdown?.neutral || 0, b: rowB.sentiment_breakdown?.neutral || 0 }
  ];

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '38px', marginBottom: '8px' }}>⚔️ Competitor Intelligence Portal</h1>
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Analyze competitor brand presence, sentiment splits, and comparative SWOT analytics.</p>
      </header>

      {/* Main Two Column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', alignItems: 'start', marginBottom: '40px' }}>
        
        {/* Left Column: Share of voice & Side-by-Side compare */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Share of voice bar chart */}
          <div className="glass-card" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: 'Outfit', color: '#58a6ff', fontSize: '16px', marginBottom: '20px' }}>📊 Competitor Share of Voice</h3>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shareOfVoiceData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#21262d" />
                  <XAxis type="number" stroke="#8b949e" style={{ fontSize: '11px' }} />
                  <YAxis dataKey="company_name" type="category" stroke="#c9d1d9" style={{ fontSize: '12px', fontWeight: '500' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121620', border: '1px solid rgba(88, 166, 255, 0.15)', borderRadius: '8px' }}
                    itemStyle={{ color: '#2ea043' }}
                  />
                  <Bar dataKey="total_mentions" name="Mention Count" fill="#2ea043" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Outfit', color: '#58a6ff', fontSize: '16px', marginBottom: '15px' }}>⚔️ Side-by-Side Comparison</h3>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#8b949e', fontWeight: '600' }}>Competitor A</label>
                <select value={compA} onChange={(e) => setCompA(e.target.value)}>
                  {competitors.map(c => <option key={c.company_name} value={c.company_name}>{c.company_name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#8b949e', fontWeight: '600' }}>Competitor B</label>
                <select value={compB} onChange={(e) => setCompB(e.target.value)}>
                  {competitors.map(c => <option key={c.company_name} value={c.company_name}>{c.company_name}</option>)}
                </select>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(88, 166, 255, 0.15)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 4px', color: '#8b949e', fontWeight: '600' }}>Metric</th>
                  <th style={{ padding: '8px 4px', color: '#58a6ff', fontWeight: '600' }}>{compA}</th>
                  <th style={{ padding: '8px 4px', color: '#bb86fc', fontWeight: '600' }}>{compB}</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map(row => (
                  <tr key={row.label} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '10px 4px', color: '#c9d1d9', fontWeight: '500' }}>{row.label}</td>
                    <td style={{ padding: '10px 4px', color: '#58a6ff', fontWeight: '600' }}>{row.a}</td>
                    <td style={{ padding: '10px 4px', color: '#bb86fc', fontWeight: '600' }}>{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column: Deep-dive profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ fontFamily: 'Outfit', color: '#58a6ff', fontSize: '18px', margin: 0 }}>🔍 Competitor Profile Deep-Dive</h3>
              <select 
                value={selectedComp} 
                onChange={(e) => setSelectedComp(e.target.value)}
                style={{ width: '180px' }}
              >
                {competitors.map(c => <option key={c.company_name} value={c.company_name}>{c.company_name}</option>)}
              </select>
            </div>

            {/* Profile KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: 'rgba(22, 27, 34, 0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#58a6ff', fontFamily: 'Outfit' }}>{selectedRow.total_mentions}</div>
                <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>Total Mentions</div>
              </div>
              <div style={{ background: 'rgba(22, 27, 34, 0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2ea043', fontFamily: 'Outfit' }}>{posPct}%</div>
                <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>Positive Ratio</div>
              </div>
              <div style={{ background: 'rgba(22, 27, 34, 0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#bb86fc', fontFamily: 'Outfit', padding: '4px 0' }}>{primaryIndustry.charAt(0).toUpperCase() + primaryIndustry.slice(1)}</div>
                <div style={{ fontSize: '10px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>Primary Sector</div>
              </div>
            </div>

            {/* Sentiment Distribution Donut Chart */}
            <h4 style={{ fontFamily: 'Outfit', color: '#c9d1d9', fontSize: '14px', marginBottom: '15px', fontWeight: '600' }}>Sentiment Distribution</h4>
            <div style={{ height: '200px', marginBottom: '25px' }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#121620', border: '1px solid rgba(88, 166, 255, 0.15)', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: '#8b949e', textAlign: 'center', paddingTop: '40px' }}>No sentiment splits mapped.</p>
              )}
            </div>

            {/* SWOT Matrix Grid */}
            <h4 style={{ fontFamily: 'Outfit', color: '#c9d1d9', fontSize: '14px', marginBottom: '10px', fontWeight: '600' }}>SWOT Intelligence</h4>
            <div className="swot-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="swot-box" style={{ borderLeft: '3px solid #2ea043', padding: '12px' }}>
                <div className="swot-title" style={{ color: '#2ea043', fontSize: '13px' }}>🟢 Strengths</div>
                <span style={{ fontSize: '11px', color: '#c9d1d9', lineHeight: '1.4', display: 'block' }}>
                  • Sector scale leadership.<br />• High volume mention rates.<br />• Frequent product launches.
                </span>
              </div>
              <div className="swot-box" style={{ borderLeft: '3px solid #f85149', padding: '12px' }}>
                <div className="swot-title" style={{ color: '#f85149', fontSize: '13px' }}>🔴 Weaknesses</div>
                <span style={{ fontSize: '11px', color: '#c9d1d9', lineHeight: '1.4', display: 'block' }}>
                  • High public media debate.<br />• Exposed to pricing wars.<br />• Supply dependency.
                </span>
              </div>
              <div className="swot-box" style={{ borderLeft: '3px solid #58a6ff', padding: '12px' }}>
                <div className="swot-title" style={{ color: '#58a6ff', fontSize: '13px' }}>🔵 Opportunities</div>
                <span style={{ fontSize: '11px', color: '#c9d1d9', lineHeight: '1.4', display: 'block' }}>
                  • AI software workflow integration.<br />• Multi-regional supplier hedging.
                </span>
              </div>
              <div className="swot-box" style={{ borderLeft: '3px solid #8b949e', padding: '12px' }}>
                <div className="swot-title" style={{ color: '#8b949e', fontSize: '13px' }}>⚠️ Threats</div>
                <span style={{ fontSize: '11px', color: '#c9d1d9', lineHeight: '1.4', display: 'block' }}>
                  • Shifting compliance rules.<br />• Price pressures from lower cost rivals.
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(88, 166, 255, 0.15)', margin: '40px 0' }} />

      {/* Competitor mention feed */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '25px' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '22px', color: '#fff' }}>⚔️ Mention Ingestion Feed for {selectedComp}</h2>
        </div>

        {fetchingMentions ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader className="spin" size={24} style={{ color: '#58a6ff' }} />
          </div>
        ) : compMentions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {compMentions.map((m, idx) => {
              const dateStr = new Date(m.published_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              return (
                <div key={idx} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '15px' }}>
                    <h4 style={{ color: '#58a6ff', fontFamily: 'Outfit', fontSize: '16px', margin: 0 }}>{m.article_title}</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge badge-${m.sentiment}`}>{m.sentiment}</span>
                      <span style={{ fontSize: '11px', color: '#8b949e' }}>{dateStr}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13.5px', fontStyle: 'italic', color: '#c9d1d9', borderLeft: '3px solid #30363d', paddingLeft: '10px', margin: '5px 0' }}>
                    "...{m.context_snippet}..."
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: '#8b949e', fontWeight: '500' }}>Mentions in article: <b style={{ color: '#58a6ff' }}>{m.mention_count}</b></span>
                    <a href={m.article_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                      View source <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
            No detailed mentions events mapped for this competitor.
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
