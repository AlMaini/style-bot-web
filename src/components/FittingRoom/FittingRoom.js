import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import SubscriptionInfo from "../SubscriptionInfo/SubscriptionInfo";
import { API_URL } from "../../config";
import "./FittingRoom.css";

const MAX_CLOTHING_ITEMS = 5; // Increased for rack effect

const FittingRoom = ({ profile, onTryOnComplete, onUpgradeClick }) => {
  const { token } = useAuth();

  // State management
  const [personFile, setPersonFile] = useState(null);
  const [personPreview, setPersonPreview] = useState(null);
  const [clothingFiles, setClothingFiles] = useState([]);
  const [clothingPreviews, setClothingPreviews] = useState([]);

  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [curtainsClosed, setCurtainsClosed] = useState(false);

  // Mobile Interaction State
  const [selectedRackItemIndex, setSelectedRackItemIndex] = useState(null);

  // Drag state
  const [mirrorDragOver, setMirrorDragOver] = useState(false);
  const [rackDragOver, setRackDragOver] = useState(false);

  // File input refs
  const mirrorInputRef = useRef(null);
  const rackInputRef = useRef(null);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (personPreview) URL.revokeObjectURL(personPreview);
      clothingPreviews.forEach((url) => URL.revokeObjectURL(url));
      if (resultImage) URL.revokeObjectURL(resultImage);
    };
  }, []);

  // Poll job status
  useEffect(() => {
    let interval;
    if (jobId && jobStatus !== "completed" && jobStatus !== "failed") {
      interval = setInterval(() => {
        checkJobStatus();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  const checkJobStatus = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/status/progress/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to check job status");

      const data = await response.json();
      setJobStatus(data.status);

      if (data.status === "completed") {
        await fetchResult();
      } else if (data.status === "failed") {
        setError("Try-on processing failed. Please try again.");
        setIsProcessing(false);
        setCurtainsClosed(false); // Open curtains on failure
      }
    } catch (err) {
      setError("Error checking job status");
      setIsProcessing(false);
      setCurtainsClosed(false); // Open curtains on error
    }
  };

  const fetchResult = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/status/result/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch result");

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      // Set result image
      setResultImage(imageUrl);

      // Notify parent that try-on completed
      if (onTryOnComplete) {
        onTryOnComplete();
      }

      // Stop processing animation
      setIsProcessing(false);

      // Open curtains to reveal result
      setTimeout(() => {
        setCurtainsClosed(false);
      }, 500);

      // Clear clothing items from rack after result is shown
      // clothingPreviews.forEach((url) => URL.revokeObjectURL(url));
      // setClothingFiles([]);
      // setClothingPreviews([]);
    } catch (err) {
      setError("Error fetching result image");
      setIsProcessing(false);
      setCurtainsClosed(false);
    }
  };

  const handleTryOnSubmit = async () => {
    if (!personFile) {
      setError("Please add your image to the mirror");
      return;
    }
    if (clothingFiles.length === 0) {
      setError("Please add at least one clothing item to the rack");
      return;
    }

    setError("");
    setIsProcessing(true);
    setCurtainsClosed(true); // Close curtains immediately
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append("person_file", personFile);
      clothingFiles.forEach((file) => {
        formData.append("clothing_files", file);
      });

      const response = await fetch(
        `${API_URL}/api/try-on/single-outfit`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit try-on job");
      }

      const data = await response.json();
      setJobId(data.job_id);
      setJobStatus(data.status);
    } catch (err) {
      setError(err.message || "Error submitting try-on");
      setIsProcessing(false);
      setCurtainsClosed(false);
    }
  };

  // Mirror drag and drop handlers
  const handleMirrorDragOver = (e) => {
    e.preventDefault();
    setMirrorDragOver(true);
  };

  const handleMirrorDragLeave = (e) => {
    e.preventDefault();
    setMirrorDragOver(false);
  };

  const handleMirrorDrop = (e) => {
    e.preventDefault();
    setMirrorDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handlePersonImageChange(files[0]);
    }
  };

  const handleMirrorClick = () => {
    if (!resultImage) {
      mirrorInputRef.current?.click();
    }
  };

  const handlePersonImageChange = (file) => {
    if (personPreview) {
      URL.revokeObjectURL(personPreview);
    }
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    setResultImage(null); // Clear previous result
  };

  const handlePersonFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePersonImageChange(file);
    }
  };

  const removePerson = () => {
    if (personPreview) {
      URL.revokeObjectURL(personPreview);
    }
    setPersonFile(null);
    setPersonPreview(null);
    setResultImage(null);
  };

  // Rack drag and drop handlers
  const handleRackDragOver = (e) => {
    e.preventDefault();
    if (clothingFiles.length < MAX_CLOTHING_ITEMS) {
      setRackDragOver(true);
    }
  };

  const handleRackDragLeave = (e) => {
    e.preventDefault();
    setRackDragOver(false);
  };

  const handleRackDrop = (e) => {
    e.preventDefault();
    setRackDragOver(false);

    if (clothingFiles.length >= MAX_CLOTHING_ITEMS) {
      setError(`Maximum ${MAX_CLOTHING_ITEMS} clothing items allowed`);
      return;
    }

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    const availableSlots = MAX_CLOTHING_ITEMS - clothingFiles.length;
    const filesToAdd = files.slice(0, availableSlots);

    if (filesToAdd.length > 0) {
      handleClothingImagesChange(filesToAdd);
    }
  };

  const handleRackClick = () => {
    if (clothingFiles.length < MAX_CLOTHING_ITEMS) {
      rackInputRef.current?.click();
    } else {
      setError(`Maximum ${MAX_CLOTHING_ITEMS} clothing items allowed`);
    }
  };

  const handleClothingImagesChange = (newFiles) => {
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setClothingFiles([...clothingFiles, ...newFiles]);
    setClothingPreviews([...clothingPreviews, ...previews]);
    setError("");
  };

  const handleClothingFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    const availableSlots = MAX_CLOTHING_ITEMS - clothingFiles.length;
    const filesToAdd = files.slice(0, availableSlots);

    if (filesToAdd.length > 0) {
      handleClothingImagesChange(filesToAdd);
    }
  };

  const removeClothingItem = (index) => {
    URL.revokeObjectURL(clothingPreviews[index]);
    setClothingFiles(clothingFiles.filter((_, i) => i !== index));
    setClothingPreviews(clothingPreviews.filter((_, i) => i !== index));
    if (selectedRackItemIndex === index) setSelectedRackItemIndex(null);
  };

  // Mobile: Tap to select clothing item
  const handleRackItemClick = (e, index) => {
    e.stopPropagation(); // Prevent triggering rack click (upload)
    if (selectedRackItemIndex === index) {
      setSelectedRackItemIndex(null); // Deselect
    } else {
      setSelectedRackItemIndex(index);
    }
  };

  const handleStartOver = () => {
    if (resultImage) {
      URL.revokeObjectURL(resultImage);
    }
    setResultImage(null);
    setJobId(null);
    setJobStatus(null);
    setIsProcessing(false);
    setCurtainsClosed(false);
  };

  return (
    <div className="fitting-room">
      <div className="fitting-room-header">
        <h2 className="section-title">Virtual Fitting Room</h2>
        <p className="section-subtitle">Step inside and try on your new look.</p>
      </div>

      <div className="fitting-room-container">
        {/* Mirror Section */}
        <div className="mirror-section">
          <div className="mirror-frame-outer">
            <div className="mirror-frame-inner">
              <div
                className={`mirror ${mirrorDragOver ? "drag-over" : ""} ${personPreview || resultImage ? "has-image" : ""}`}
                onDragOver={handleMirrorDragOver}
                onDragLeave={handleMirrorDragLeave}
                onDrop={handleMirrorDrop}
                onClick={handleMirrorClick}
              >
                {resultImage ? (
                  <div className="mirror-content">
                    <img
                      src={resultImage}
                      alt="Try-on result"
                      className="mirror-image"
                    />
                    <div className="mirror-actions">
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartOver();
                        }}
                        title="Start Over"
                      >
                        ↺
                      </button>
                      <a
                        href={resultImage}
                        download="style-bot-look.png"
                        className="btn-icon"
                        onClick={(e) => e.stopPropagation()}
                        title="Download"
                      >
                        ⬇
                      </a>
                    </div>
                  </div>
                ) : personPreview ? (
                  <div className="mirror-content">
                    <img
                      src={personPreview}
                      alt="Your image"
                      className="mirror-image"
                    />
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePerson();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="mirror-placeholder">
                    <div className="placeholder-icon">👤</div>
                    <p>Tap mirror to upload photo</p>
                  </div>
                )}

                {/* Curtains */}
                <div className={`curtain curtain-left ${curtainsClosed ? "closed" : ""}`}></div>
                <div className={`curtain curtain-right ${curtainsClosed ? "closed" : ""}`}></div>
                <div className={`curtain-message ${curtainsClosed ? "visible" : ""}`}>
                  Trying on outfit...
                </div>

              </div>
            </div>
          </div>
          <input
            ref={mirrorInputRef}
            type="file"
            accept="image/*"
            onChange={handlePersonFileInput}
            style={{ display: "none" }}
          />
        </div>

        {/* Clothing Rack Section */}
        <div className="rack-section">
          <div className="rack-header">
            <h3>Clothing Rack</h3>
            <span className="item-count">{clothingFiles.length}/{MAX_CLOTHING_ITEMS}</span>
          </div>

          <div
            className={`clothing-rack-container ${rackDragOver ? "drag-over" : ""}`}
            onDragOver={handleRackDragOver}
            onDragLeave={handleRackDragLeave}
            onDrop={handleRackDrop}
          >
            <div className="rack-items-vertical">
              {clothingPreviews.map((preview, index) => (
                <div
                  key={index}
                  className={`rack-hanger-item ${selectedRackItemIndex === index ? "selected" : ""}`}
                  onClick={(e) => handleRackItemClick(e, index)}
                >
                  <div className="hanger-hook"></div>
                  <div className="hanger-body">
                    <img
                      src={preview}
                      alt={`Clothing ${index + 1}`}
                      className="clothing-image-hanger"
                    />
                    <button
                      className="remove-btn-mini"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeClothingItem(index);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {clothingFiles.length < MAX_CLOTHING_ITEMS && (
                <div className="rack-hanger-item add-new-hanger" onClick={handleRackClick}>
                  <div className="hanger-hook"></div>
                  <div className="hanger-body add-body">
                    <div className="add-icon">+</div>
                    <span className="add-text">Add Item</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <input
            ref={rackInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleClothingFileInput}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Try-On Button */}
      <div className="action-section">
        <button
          className="btn-primary try-on-btn"
          onClick={handleTryOnSubmit}
          disabled={isProcessing || !personFile || clothingFiles.length === 0}
        >
          {isProcessing ? "Fitting in progress..." : "Try On Look"}
        </button>
      </div>
    </div>
  );
};

export default FittingRoom;
