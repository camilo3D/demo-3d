import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import Hotspot from './components/Hotspot'
import './App.css'

function Model({ onLoad, scale }) {
  const gltf = useGLTF('/DamagedHelmet.glb', true)

  useEffect(() => {
    if (gltf?.scene) onLoad?.(gltf.scene)
  }, [gltf])

  return (
    <primitive
      object={gltf.scene}
      scale={scale}
      position={[0, 0, 0]}
    />
  )
}

function CameraController({ target, tourActive }) {
  const { camera } = useThree()
  const vec = new THREE.Vector3()
  const [step, setStep] = useState(0)
  const tourPath = [
    new THREE.Vector3(0, 1, 5),
    new THREE.Vector3(-2, 2, 4),
    new THREE.Vector3(2, 2, -4),
    new THREE.Vector3(0, 1, -5)
  ]

  useFrame(() => {
    if (tourActive) {
      const next = tourPath[step % tourPath.length]
      camera.position.lerp(vec.copy(next), 0.02)
      camera.lookAt(0, 0, 0)
      if (camera.position.distanceTo(next) < 0.1) {
        setTimeout(() => setStep(s => s + 1), 1500)
      }
    } else if (target) {
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

async function handleScreenshot() {
  const canvas = document.querySelector('canvas')
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'screenshot.png',
      types: [{
        description: 'PNG Image',
        accept: { 'image/png': ['.png'] },
      }],
    })
    const writable = await handle.createWritable()
    await writable.write(blob)
    await writable.close()
    alert('Screenshot saved!')
  } catch (err) {
    console.error('Save cancelled or failed:', err)
  }
}

function App() {
  const [target, setTarget] = useState(VIEWS.Front)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelScale, setModelScale] = useState(0.003)
  const [scaleInput, setScaleInput] = useState('0.003')
  const [environment, setEnvironment] = useState('sunset')
  const [tourActive, setTourActive] = useState(false)

  const zoom = (factor) => {
    const dir = target.clone().normalize().multiplyScalar(factor)
    setTarget(dir)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
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
            style={{ padding: '5px 10px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            {view}
          </button>
        ))}
        <hr />
        <button onClick={() => zoom(1.5)}>Zoom In</button>
        <button onClick={() => zoom(3)}>Zoom Out</button>
        <hr />
        <label>Scale:
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={scaleInput}
            onChange={(e) => setScaleInput(e.target.value)}
            style={{ marginLeft: '5px', width: '60px' }}
          />
        </label>
        <button onClick={() => {
          const parsed = parseFloat(scaleInput)
          if (!isNaN(parsed) && parsed > 0) setModelScale(parsed)
        }}>Apply</button>
        <hr />
        <label>Environment:
          <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
            <option value="sunset">Sunset</option>
            <option value="night">Night</option>
            <option value="dawn">Dawn</option>
            <option value="city">City</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </label>
        <button onClick={() => setTourActive(!tourActive)}>
          {tourActive ? 'Stop Tour' : 'Start Tour'}
        </button>
        <button onClick={handleScreenshot}>Save Screenshot</button>
      </div>

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

      <Canvas
        camera={{ position: [0, 0.5, 2], fov: 50 }}
        style={{ backgroundColor: 'black' }}
      >
        <Environment preset={environment} background />
        <Model onLoad={() => setModelLoaded(true)} scale={modelScale} />
        {HOTSPOTS.map(h => (
          <Hotspot
            key={h.id}
            position={h.position}
            text={h.label}
            onClick={() => setTarget(VIEWS[h.id])}
          />
        ))}
        <CameraController target={target} tourActive={tourActive} />
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  )
}

export default App
