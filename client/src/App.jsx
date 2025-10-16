import React, { useEffect, useState } from 'react'

export default function App() {
  const [health, setHealth] = useState(null)
  const [warranties, setWarranties] = useState([])

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setHealth).catch(() => setHealth({ status: 'unreachable' }))

    fetch('/api/warranties')
      .then(r => r.json())
      .then(setWarranties)
      .catch(() => setWarranties([]))
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <h1>WarrantyWarden</h1>
      <p>API status: {health ? health.status : 'loading...'}</p>

      <h2>Warranties</h2>
      {warranties.length === 0 ? (
        <p>No warranties (or failed to fetch)</p>
      ) : (
        <ul>
          {warranties.map(w => (
            <li key={w._id}>{w.title} — {new Date(w.purchaseDate).toLocaleDateString()}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
