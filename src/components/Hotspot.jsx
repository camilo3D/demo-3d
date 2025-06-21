import { Html } from '@react-three/drei'
import { useState } from 'react'

export default function Hotspot({ position, text, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Html position={position}>
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          background: 'white',
          border: '2px solid #333',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          boxShadow: '0 0 5px rgba(0,0,0,0.5)',
        }}
      >
        •
        {hovered && (
          <div
            style={{
              position: 'absolute',
              bottom: '130%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#333',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              zIndex: 100,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              pointerEvents: 'none'
            }}
          >
            {text}
          </div>
        )}
      </div>
    </Html>
  )
}
