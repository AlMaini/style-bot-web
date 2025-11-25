import React from "react";
import { useNavigate } from "react-router-dom";
import "./SubscriptionInfo.css";

function SubscriptionInfo({ profile, onUpgradeClick }) {
  const navigate = useNavigate();

  if (!profile) {
    return null;
  }

  const isPremium =
    profile.subscription_plan &&
    profile.subscription_plan.toLowerCase() === "premium";

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // Default behavior: navigate to subscription tab
      navigate("/dashboard?tab=subscription");
    }
  };

  return (
    <div className="subscription-info">
      <div className="subscription-content">
        <div className="subscription-details">
          <div className="plan-badge">
            <span className={`plan-name ${isPremium ? "premium" : "free"}`}>
              {profile.subscription_plan || "Free"}
            </span>
          </div>
          {!isPremium && (
            <div className="usage-info">
              <span className="usage-count">
                {profile.image_usage} / {profile.image_limit}
              </span>
              <span className="usage-label">Outfits tried-on</span>
            </div>
          )}
        </div>
        {!isPremium && (
          <button className="upgrade-btn" onClick={handleUpgradeClick}>
            Upgrade to Premium
          </button>
        )}
      </div>
    </div>
  );
}

export default SubscriptionInfo;
