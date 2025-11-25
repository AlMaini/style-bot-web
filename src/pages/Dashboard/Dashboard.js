import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DashboardProvider, useDashboard } from "../../context/DashboardContext";
import FittingRoom from "../../components/FittingRoom/FittingRoom";
import ProfileSection from "../../components/ProfileSection/ProfileSection";
import OutfitsSection from "../../components/OutfitsSection/OutfitsSection";
import { API_URL } from "../../config";
import "./Dashboard.css";

function DashboardContent() {
  const { token, logout } = useAuth();
  const { profile, onTryOnComplete } = useDashboard();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

  // Subscription state
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleUpgradeToPremium = async () => {
    const PREMIUM_PRICE_ID = "price_1SSP76D3jnIHaMl8jWtDOh2s";
    setSubscriptionLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ price_id: PREMIUM_PRICE_ID }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      alert(error.message);
      setSubscriptionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <span className="mobile-logo">Style-Bot</span>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Style-Bot</h2>
          <button className="close-sidebar" onClick={toggleSidebar}>✕</button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => handleTabChange("profile")}
          >
            Profile
          </button>
          <button
            className={`nav-item ${activeTab === "tryon" ? "active" : ""}`}
            onClick={() => handleTabChange("tryon")}
          >
            Fitting Room
          </button>
          <button
            className={`nav-item ${activeTab === "outfits" ? "active" : ""}`}
            onClick={() => handleTabChange("outfits")}
          >
            My Wardrobe
          </button>
          <button
            className={`nav-item ${activeTab === "subscription" ? "active" : ""}`}
            onClick={() => handleTabChange("subscription")}
          >
            Membership
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout-sidebar">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <div className="content-wrapper">
          {activeTab === "profile" && <ProfileSection />}

          {activeTab === "tryon" && (
            <FittingRoom
              profile={profile}
              onTryOnComplete={onTryOnComplete}
              onUpgradeClick={handleUpgradeToPremium}
            />
          )}

          {activeTab === "subscription" && (
            <div className="subscription-section">
              <div className="premium-card">
                <h2>Style-Bot Premium</h2>
                <p className="premium-desc">Unlock the full potential of your virtual wardrobe.</p>
                <div className="benefits-list">
                  <div className="benefit-item">
                    <span className="icon">✨</span>
                    <span>Unlimited Try-Ons</span>
                  </div>
                  <div className="benefit-item">
                    <span className="icon">🎨</span>
                    <span>Exclusive Styles</span>
                  </div>
                  <div className="benefit-item">
                    <span className="icon">⚡</span>
                    <span>Priority Processing</span>
                  </div>
                </div>
                <button
                  className="btn-primary full-width"
                  onClick={handleUpgradeToPremium}
                  disabled={subscriptionLoading}
                >
                  {subscriptionLoading ? "Processing..." : "Upgrade Now"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "outfits" && <OutfitsSection />}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </div>
  );
}

function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default Dashboard;
