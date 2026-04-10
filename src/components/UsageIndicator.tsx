interface UsageIndicatorProps {
  reportsUsed: number;
  limit: number;
  email: string;
}

export default function UsageIndicator({ reportsUsed, limit, email }: UsageIndicatorProps) {
  const percentage = Math.min((reportsUsed / limit) * 100, 100);
  
  return (
    <div className="usage-indicator">
      <div className="usage-info">
        <div className="usage-user" style={{ marginBottom: '4px' }}>
           {email}
        </div>
        <span className="usage-text">
          Reports used: <strong style={{ color: reportsUsed >= limit ? '#ef4444' : '#fff' }}>{reportsUsed}</strong> / {limit}
        </span>
      </div>
      <div className="usage-bar-bg">
        <div 
          className="usage-bar-fill" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: reportsUsed >= limit ? '#ef4444' : '#C9A84C'
          }} 
        />
      </div>
    </div>
  );
}
