export default function App() {
  return (
    <div style={styles.container}>
      {/* Floating animated background blobs */}
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />

      <div style={styles.header}>
        <div style={styles.leafWrapper}>
          <div style={styles.leafGlow} />
          <div style={styles.icon}>🌿</div>
        </div>

        <h1 style={styles.title}>Welcome to HerbTrace</h1>
        <p style={styles.subtitle}>Select your role to continue</p>
      </div>

      <div style={styles.grid}>
        <RoleCard
          title="Consumer"
          desc="Trace your herbal products"
          color="linear-gradient(135deg, #ECFDF5, #D1FAE5)"
          onClick={() => window.location.href = "http://localhost:5173/"}
        />

        <RoleCard
          title="Farmer"
          desc="Manage your herb batches"
          color="linear-gradient(135deg, #FFFBEB, #FEF3C7)"
          onClick={() => window.location.href = "http://localhost:3001"}
        />

        <RoleCard
          title="Lab Tester"
          desc="Test and certify products"
          color="linear-gradient(135deg, #EFF6FF, #DBEAFE)"
          onClick={() => window.location.href = "http://localhost:5000"}
        />
      </div>
    </div>
  );
}

function RoleCard({ title, desc, onClick, color }) {
  return (
    <div
      onClick={onClick}
      style={{ ...styles.card, background: color }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-10px) scale(1.05)";
        e.currentTarget.style.boxShadow =
          "0 25px 60px rgba(0,0,0,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow =
          "0 15px 40px rgba(0,0,0,0.1)";
      }}
    >
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardDesc}>{desc}</p>
      <p style={styles.continue}>Continue →</p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: "40px",
    background: "linear-gradient(135deg, #ECFEFF, #F0FDF4)",
    overflow: "hidden",
    position: "relative"
  },

  header: {
    marginBottom: "50px",
    animation: "fadeDown 0.8s ease forwards"
  },

  leafWrapper: {
    position: "relative",
    marginBottom: "18px"
  },

  icon: {
    fontSize: "52px",
    background: "linear-gradient(135deg, #DCFCE7, #BBF7D0)",
    width: "100px",
    height: "100px",
    borderRadius: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    animation: "leafFloat 3s ease-in-out infinite",
    position: "relative",
    zIndex: 2
  },

  leafGlow: {
    position: "absolute",
    width: "110px",
    height: "110px",
    borderRadius: "30px",
    background: "rgba(34,197,94,0.35)",
    filter: "blur(22px)",
    animation: "pulseGlow 2.5s infinite"
  },

  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#065F46"
  },

  subtitle: {
    color: "#4B5563",
    marginTop: "10px",
    fontSize: "16px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
    maxWidth: "960px",
    width: "100%",
    animation: "fadeUp 0.9s ease forwards"
  },

  card: {
    padding: "38px",
    borderRadius: "24px",
    cursor: "pointer",
    boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.6)"
  },

  cardTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827"
  },

  cardDesc: {
    color: "#4B5563",
    marginTop: "14px",
    fontSize: "15px"
  },

  continue: {
    marginTop: "24px",
    color: "#16A34A",
    fontWeight: "700",
    letterSpacing: "0.4px"
  },

  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    opacity: 0.45
  },

  blob1: {
    width: "320px",
    height: "320px",
    background: "#A7F3D0",
    top: "-100px",
    left: "-100px"
  },

  blob2: {
    width: "340px",
    height: "340px",
    background: "#67E8F9",
    bottom: "-120px",
    right: "-120px"
  }
};


