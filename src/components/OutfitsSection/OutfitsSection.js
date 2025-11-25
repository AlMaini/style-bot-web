import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import './OutfitsSection.css';

function OutfitsSection() {
  const { outfits, outfitsLoading, outfitsError } = useDashboard();

  if (outfitsLoading) {
    return (
      <div className="outfits-section">
        <h2>My Outfits</h2>
        <p>Loading your outfits...</p>
      </div>
    );
  }

  if (outfitsError) {
    return (
      <div className="outfits-section">
        <h2>My Outfits</h2>
        <div className="error">{outfitsError}</div>
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <div className="outfits-section">
        <h2>My Outfits</h2>
        <p>No outfits yet. Try on some clothing items to see them here!</p>
      </div>
    );
  }

  return (
    <div className="outfits-section">
      <h2>My Outfits</h2>
      <div className="outfits-grid">
        {outfits.map((imageUrl, index) => (
          <div key={index} className="outfit-card">
            <img
              src={imageUrl}
              alt={`Outfit ${index + 1}`}
              onError={(e) => {
                console.error('Image failed to load:', imageUrl);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
              onLoad={() => console.log('Image loaded successfully:', imageUrl)}
            />
            <div className="image-placeholder" style={{ display: 'none' }}>
              Image failed to load
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OutfitsSection;
