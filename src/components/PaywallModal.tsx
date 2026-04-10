export default function PaywallModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="paywall-overlay">
      <div className="paywall-modal">
        <div className="paywall-icon">🔒</div>
        <h2 className="paywall-title">Upgrade Required</h2>
        <p className="paywall-description">
          You have reached your free limit of 10 reports.
        </p>
        <p className="paywall-description" style={{ marginBottom: '2rem' }}>
          Please upgrade your account to continue generating premium digital intelligence reports.
        </p>
        
        <button 
          className="btn-generate w-full margin-bottom" 
          onClick={() => alert("Payment flow coming soon!")}
          style={{ marginBottom: '1rem' }}
        >
          UPGRADE FOR $20
        </button>
        
        <button className="btn-cancel w-full" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
