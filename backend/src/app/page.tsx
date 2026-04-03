export default function Home() {
  return (
    <main
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f8f9fa',
        margin: 0,
      }}
    >
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#9889;</div>
        <h1 style={{ fontSize: 28, color: '#111', margin: '0 0 8px' }}>
          AfriStore API is running
        </h1>
        <p style={{ fontSize: 16, color: '#666', margin: '0 0 24px' }}>
          All systems operational
        </p>
        <code
          style={{
            display: 'inline-block',
            background: '#e9ecef',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 14,
            color: '#333',
          }}
        >
          GET /api/health
        </code>
      </div>
    </main>
  );
}
