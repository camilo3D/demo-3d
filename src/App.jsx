import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import Hotspot from './components/Hotspot'
import './App.css'

function Model({ onLoad, scale }) {
  const gltf = useGLTF('/DamagedHelmet.glb', true)

  useEffect(() => {
    if (gltf?.scene) {
      onLoad?.(gltf.scene)
    } else {
      console.error('Failed to load model')
    }
  }, [gltf])

  return (
    <primitive
      object={gltf.scene}
      scale={scale}
      position={[0, 0, 0]}
    />
  )
}

function CameraController({ target }) {
  const { camera } = useThree()
  const vec = new THREE.Vector3()

  useFrame(() => {
    if (target) {
      camera.position.lerp(vec.copy(target), 0.05)
      camera.lookAt(0, 0, 0)
    }
  })

  return null
}

const VIEWS = {
  Front: new THREE.Vector3(0, 0.5, 2),
  Back: new THREE.Vector3(0, 0.5, -2),
  Left: new THREE.Vector3(-2, 0.5, 0),
  Right: new THREE.Vector3(2, 0.5, 0),
  Top: new THREE.Vector3(0, 2, 0.001),
}

const HOTSPOTS = [
  { id: 'Front', position: [0, 0.05, 0.6], label: 'Front View' },
  { id: 'Back', position: [0, 0.05, -0.6], label: 'Back View' },
  { id: 'Left', position: [-0.6, 0.05, 0], label: 'Left Side' },
  { id: 'Right', position: [0.6, 0.05, 0], label: 'Right Side' },
  { id: 'Top', position: [0, 0.6, 0], label: 'Top View' },
]

function App() {
  const [target, setTarget] = useState(VIEWS.Front)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelScale, setModelScale] = useState(0.003)
  const [scaleInput, setScaleInput] = useState('0.003')

  const zoom = (factor) => {
    const dir = target.clone().normalize().multiplyScalar(factor)
    setTarget(dir)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        left: 20,
        top: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 10,
        background: '#ffffffaa',
        padding: '10px',
        borderRadius: '8px'
      }}>
        <h4 style={{ margin: 0 }}>View</h4>
        {Object.keys(VIEWS).map(view => (
          <button
            key={view}
            onClick={() => setTarget(VIEWS[view])}
            style={{
              padding: '5px 10px',
              cursor: 'pointer',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          >
            {view}
          </button>
        ))}
        <hr />
        <button onClick={() => zoom(1.5)}>Zoom In</button>
        <button onClick={() => zoom(3)}>Zoom Out</button>
        <hr />
        <label>
          Scale:
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={scaleInput}
            onChange={(e) => setScaleInput(e.target.value)}
            style={{ marginLeft: '5px', width: '60px' }}
          />
        </label>
        <button
          onClick={() => {
            const parsed = parseFloat(scaleInput)
            if (!isNaN(parsed) && parsed > 0) {
              setModelScale(parsed)
            }
          }}
        >
          Apply
        </button>
      </div>

      {/* Loading Indicator */}
      {!modelLoaded && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: '#222',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '8px',
          zIndex: 100
        }}>
          ⏳ Loading model...
        </div>
      )}

      {/* Canvas 3D */}
      <Canvas
        camera={{ position: [0, 0.5, 2], fov: 50 }}
        style={{ backgroundColor: 'black' }}
      >
        {/* HDRI */}
        <Environment preset="sunset" />
        <Model onLoad={() => setModelLoaded(true)} scale={modelScale} />
        {HOTSPOTS.map(h => (
          <Hotspot
            key={h.id}
            position={h.position}
            text={h.label}
            onClick={() => setTarget(VIEWS[h.id])}
          />
        ))}
        <CameraController target={target} />
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  )
}

export default App
