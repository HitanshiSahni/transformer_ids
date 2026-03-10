import React from 'react';

const ProjectOverview = () => {
  return (
    <div className="panel panel-blue">
      <h2 className="panel-title">SYSTEM OVERVIEW</h2>
      <div className="overview-content">
        <h3 style={{color: "var(--brand-neon-blue)", textTransform: "uppercase", fontSize: "1.4rem", marginTop: 0}}>
          Transformer-Based Real-Time Network Anomaly Detection for High-Speed Traffic Streams
        </h3>
        <p style={{color: "#ccc", lineHeight: "1.6", fontSize: "1.1rem"}}>
          This dashboard interfaces with a deep learning Intrusion Detection System (IDS) built specifically to detect network anomaly signatures. 
          By projecting 78-dimensional network flow vectors (CICIDS architecture) into a self-attention matrix, the core Transformer Encoder model can rapidly 
          classify both normal benign traffic and suspicious attack vectors in real-time.
        </p>
      </div>
    </div>
  );
};

export default ProjectOverview;
