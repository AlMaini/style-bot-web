import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cancel.css';

function Cancel() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="cancel-container">
      <div className="cancel-box">
        <div className="cancel-icon">✕</div>
        <h1>Payment Canceled or Failed</h1>
        <p>Your payment was not completed. You will be redirected to the dashboard shortly.</p>
        <button onClick={() => navigate('/dashboard')} className="return-btn">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Cancel;
