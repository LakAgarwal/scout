import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  Bot, 
  Swords, 
  ShoppingBag, 
  UploadCloud, 
  Database,
  Cpu
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Sidebar() {
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    // Poll db health status every 15 seconds
    const checkHealth = () => {
      fetch(`${API_URL}/health/db`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'ok' && data.db === 'connected') {
            setDbStatus('Connected');
            setDbConnected(true);
          } else {
            setDbStatus('Error');
            setDbConnected(false);
          }
        })
        .catch(() => {
          setDbStatus('Offline');
          setDbConnected(false);
        });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Market Explorer', path: '/explorer', icon: <Compass size={18} /> },
    { name: 'AI Analyst', path: '/analyst', icon: <Bot size={18} /> },
    { name: 'Competitor Intelligence', path: '/competitor', icon: <Swords size={18} /> },
    { name: 'Product Analysis', path: '/product', icon: <ShoppingBag size={18} /> },
    { name: 'Project Ingestion', path: '/ingestion', icon: <UploadCloud size={18} /> }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="gradient-text">🔍 Scout</span>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map(item => (
          <li key={item.name} className="sidebar-item">
            <NavLink 
              to={item.path} 
              className={({ isActive }) => isActive ? 'active' : ''}
              end={item.path === '/'}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-status">
        <h4 className="status-title">System Status</h4>
        
        <div className="status-item">
          <span className="status-label">
            <Database size={14} />
            Database
          </span>
          <span className="status-val-wrapper">
            <span 
              className="status-indicator" 
              style={{ 
                backgroundColor: dbConnected ? '#2ea043' : '#f85149',
                boxShadow: dbConnected ? '0 0 8px #2ea043' : '0 0 8px #f85149'
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: '500' }}>{dbStatus}</span>
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">
            <Cpu size={14} />
            AI Engine
          </span>
          <span className="status-val-wrapper">
            <span className="status-indicator" style={{ backgroundColor: '#2ea043', boxShadow: '0 0 8px #2ea043' }} />
            <span style={{ fontSize: '12px', fontWeight: '500' }}>Ready</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
