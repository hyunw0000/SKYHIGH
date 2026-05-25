import { Stars, Sky, Environment, OrbitControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import Player from './Player';
import Platforms from './Platforms';
import { useGameStore } from '../stores/useGameStore';

export default function Experience() {
  const phase = useGameStore((state) => state.phase);

  return (
    <>
      <OrbitControls 
        makeDefault 
        enablePan={false} 
        maxPolarAngle={Math.PI / 1.5} 
        minDistance={6} 
        maxDistance={20} 
      />
      <Sky sunPosition={[100, 20, 100]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" />

      <Physics debug={false}>
        <Player />
        <Platforms />
        
        {/* Initial floor/starting zone */}
        <RigidBody type="fixed" position={[0, -0.5, 0]} name="floor">
          <mesh receiveShadow>
            <boxGeometry args={[20, 1, 20]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
        </RigidBody>
      </Physics>

      {/* Lighting - Optimized Shadows */}
      <directionalLight
        castShadow
        position={[4, 15, 1]}
        intensity={1.5}
        shadow-mapSize={[512, 512]}
        shadow-camera-far={60}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <ambientLight intensity={0.4} />
    </>
  );
}
