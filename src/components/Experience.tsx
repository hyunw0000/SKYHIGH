import { Stars, Environment, OrbitControls, ContactShadows } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Player from './Player';
import Platforms from './Platforms';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';

export default function Experience() {
  const orbitControlsRef = useRef<any>(null);
  const phase = useGameStore((state) => state.phase);

  useFrame((state) => {
    // Find player in scene to follow
    const player = state.scene.getObjectByName('player');
    if (player && orbitControlsRef.current) {
      const playerPos = new THREE.Vector3();
      player.getWorldPosition(playerPos);
      
      // Smoothly update orbit controls target
      orbitControlsRef.current.target.lerp(playerPos, 0.1);
    }
  });

  return (
    <>
      <OrbitControls 
        ref={orbitControlsRef}
        makeDefault 
        enablePan={false} 
        maxPolarAngle={Math.PI / 1.5} 
        minDistance={5} 
        maxDistance={25} 
      />
      
      <color attach="background" args={['#050505']} />
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" />

      <Physics debug={false}>
        <Player />
        <Platforms />
        
        {/* Initial floor/starting zone */}
        <RigidBody type="fixed" position={[0, -0.5, 0]} name="floor">
          <mesh receiveShadow>
            <boxGeometry args={[30, 1, 30]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.8} />
          </mesh>
        </RigidBody>
      </Physics>

      {/* Lighting - Neon Vibe */}
      <directionalLight
        castShadow
        position={[10, 20, 10]}
        intensity={0.5}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.2} />
      
      {/* Subtle fog for depth */}
      <fog attach="fog" args={['#050505', 30, 100]} />
    </>
  );
}
