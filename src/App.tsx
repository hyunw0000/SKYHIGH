import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import Experience from './components/Experience';
import Interface from './components/Interface';

function App() {
  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
      ]}
    >
      <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
        <Canvas
          shadows
          camera={{
            fov: 45,
            near: 0.1,
            far: 200,
            position: [10, 10, 10],
          }}
        >
          <Experience />
        </Canvas>
        <Interface />
      </div>
    </KeyboardControls>
  );
}

export default App;
