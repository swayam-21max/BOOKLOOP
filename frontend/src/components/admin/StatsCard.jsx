import React from 'react';

const StatsCard = ({ label, value, icon, color }) => {
  return (
    <div className="stats-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stats-label">{label}</div>
        <div style={{ fontSize: '20px', opacity: 0.8 }}>{icon}</div>
      </div>
      <div className="stats-value" style={{ color: color }}>{value}</div>
    </div>
  );
};

export default StatsCard;
