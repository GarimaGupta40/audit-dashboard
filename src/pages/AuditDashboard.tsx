import { useState, useEffect } from "react";
import Auth from "../components/Auth";
import Dashboard from "../components/Dashboard";
import UsageIndicator from "../components/UsageIndicator";
import PaywallModal from "../components/PaywallModal";
import { UserData } from "../types";

const LIMIT = 10;

export default function AuditDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  useEffect(() => {
    // Check for logged in user on mount
    try {
      const loggedInEmail = localStorage.getItem("audit_logged_in_user");
      if (loggedInEmail) {
        const usersMapStr = localStorage.getItem("audit_users");
        if (usersMapStr) {
          const usersMap = JSON.parse(usersMapStr);
          if (usersMap[loggedInEmail]) {
            setUser(usersMap[loggedInEmail]);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }
  }, []);

  const handleLogin = (email: string) => {
    try {
      const usersMapStr = localStorage.getItem("audit_users");
      const usersMap = usersMapStr ? JSON.parse(usersMapStr) : {};
      
      const userData = usersMap[email];
      if (!userData) {
        return { success: false, error: "User not found, please sign up." };
      }
      
      localStorage.setItem("audit_logged_in_user", email);
      setUser(userData);
      return { success: true };
    } catch (e) {
      console.error("Local storage error on login", e);
      return { success: false, error: "System error during login." };
    }
  };

  const handleSignup = (email: string) => {
    try {
      const usersMapStr = localStorage.getItem("audit_users");
      const usersMap = usersMapStr ? JSON.parse(usersMapStr) : {};
      
      if (usersMap[email]) {
        return { success: false, error: "User already exists. Please log in." };
      }
      
      const newUserData = { email, reports_used: 0 };
      usersMap[email] = newUserData;
      localStorage.setItem("audit_users", JSON.stringify(usersMap));
      localStorage.setItem("audit_logged_in_user", email);
      
      setUser(newUserData);
      return { success: true };
    } catch (e) {
      console.error("Local storage error on signup", e);
      return { success: false, error: "System error during signup." };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("audit_logged_in_user");
    setUser(null);
  };

  const handleGenerateStart = (): boolean => {
    if (!user) return false;
    
    if (user.reports_used >= LIMIT) {
      setIsPaywallOpen(true);
      return false;
    }
    
    return true;
  };

  const handleGenerateSuccess = () => {
    if (!user) return;
    
    const newReportsUsed = user.reports_used + 1;
    const updatedUser = { ...user, reports_used: newReportsUsed };
    setUser(updatedUser);
    
    try {
      const usersMapStr = localStorage.getItem("audit_users");
      if (usersMapStr) {
        const usersMap = JSON.parse(usersMapStr);
        usersMap[user.email] = updatedUser;
        localStorage.setItem("audit_users", JSON.stringify(usersMap));
      }
    } catch (e) {
      console.error("Failed to save local storage on success", e);
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <>
      <UsageIndicator 
        reportsUsed={user.reports_used} 
        limit={LIMIT} 
        email={user.email} 
      />
      <Dashboard 
        onGenerateStart={handleGenerateStart} 
        onGenerateSuccess={handleGenerateSuccess} 
        onLogout={handleLogout}
      />
      <PaywallModal 
        isOpen={isPaywallOpen} 
        onClose={() => setIsPaywallOpen(false)} 
      />
    </>
  );
}
