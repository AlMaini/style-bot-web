import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import './ProfileSection.css';

function ProfileSection() {
  const { profile, profileLoading, profileError } = useDashboard();

  if (profileLoading) {
    return (
      <div className="profile-section">
        <h2>Profile</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="profile-section">
        <h2>Profile</h2>
        <div className="error">Failed to load profile: {profileError}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-section">
        <h2>Profile</h2>
        <p>Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <h2>Profile</h2>
      <div className="profile-info">
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Subscription Plan:</strong> {profile.subscription_plan}
        </p>
        <p>
          <strong>Usage:</strong> {profile.image_usage} / {profile.image_limit}
        </p>
      </div>
    </div>
  );
}

export default ProfileSection;
