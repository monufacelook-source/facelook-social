import React from "react";

export default function Index() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f0f2f5",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          height: "60px",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            color: "#1877f2",
            fontWeight: "black",
            fontSize: "24px",
            fontStyle: "italic",
          }}
        >
          FACELOOK
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "#ddd",
            }}
          ></div>
          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "#ddd",
            }}
          ></div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1877f2",
            padding: "40px",
            borderRadius: "20px",
            color: "white",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(24, 119, 242, 0.3)",
            maxWidth: "400px",
          }}
        >
          <h2 style={{ fontSize: "28px", marginBottom: "15px" }}>
            SITE IS READY! 🚀
          </h2>
          <p style={{ opacity: 0.9, lineHeight: "1.6" }}>
            Bhai, agar tujhe ye dikh raha hai toh matlab tera **Replit** aur
            **Vite** ekdum sahi kaam kar rahe hain.
          </p>
          <div
            style={{
              marginTop: "20px",
              background: "rgba(255,255,255,0.1)",
              padding: "15px",
              borderRadius: "10px",
            }}
          >
            <p style={{ fontSize: "14px" }}>
              Ab hum ek-ek karke tere purane Chat aur Profile components wapas
              la sakte hain.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "25px",
              padding: "12px 24px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: "white",
              color: "#1877f2",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Refresh Test
          </button>
        </div>
      </main>
    </div>
  );
}
