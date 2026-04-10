import { useState } from 'react';

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthProps {
  onLogin: (email: string) => AuthResponse;
  onSignup: (email: string) => AuthResponse;
}

export default function Auth({ onLogin, onSignup }: AuthProps) {
  const [email, setEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email to continue.");
      return;
    }
    
    const result = isLogin ? onLogin(email.trim()) : onSignup(email.trim());
    
    if (!result.success) {
      setErrorMsg(result.error || "An error occurred.");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setEmail('');
  };

  return (
    <div className="auth-container screen" style={{ display: "flex", opacity: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '2rem' }}>
      <div className="form-card auth-card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="logo">
            <span className="logo-audit">AUDIT</span>
            <span className="logo-ai"> AI</span>
          </div>
        </div>
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 600 }}>
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p style={{ textAlign: 'center', color: '#a1a1aa', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {isLogin ? 'Sign in to access your digital intelligence reports.' : 'Register to start generating premium reports.'}
        </p>
        
        {errorMsg && (
          <div className="mb-6 p-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', textAlign: 'center', fontSize: '13px', marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">EMAIL ADDRESS</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="btn-generate w-full btn-hover-effect" style={{ marginTop: '0.5rem', padding: '14px' }}>
            {isLogin ? 'LOG IN →' : 'SIGN UP →'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#a1a1aa', fontSize: '0.875rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={toggleMode}
            style={{ color: '#C9A84C', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none', fontWeight: 600 }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
