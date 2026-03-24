import React from "react";

export default function Index() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#2563eb", // Blue color
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <h1
        style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "10px" }}
      >
        FACELOOK IS ALIVE! 🚀
      </h1>
      <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
        Agar aapko ye screen dikh rahi hai, toh iska matlab hai ki:
      </p>
      <ul style={{ marginTop: "20px", textAlign: "left", lineHeight: "2" }}>
        <li>✅ React sahi se kaam kar raha hai.</li>
        <li>✅ Replit ka server chal raha hai.</li>
        <li>❌ Problem aapke purane Database ya Auth logic mein thi.</li>
      </ul>

      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          backgroundColor: "white",
          color: "#2563eb",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Refresh Page
      </button>

      <div
        style={{
          marginTop: "40px",
          border: "2px dashed white",
          padding: "20px",
          borderRadius: "15px",
        }}
      >
        <p>Testing Image from Unsplash:</p>
        <img
          src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400"
          alt="Success"
          style={{ width: "300px", borderRadius: "10px", marginTop: "10px" }}
        />
      </div>
    </div>
  );
}
