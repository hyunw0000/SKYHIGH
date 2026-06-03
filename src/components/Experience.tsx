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
      
      <color attach="background" args={['#0a0a1a']} />
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      <Physics debug={false}>
        <Player />
        <Platforms />
        
        {/* Initial floor/starting zone */}
        <RigidBody type="fixed" position={[0, -0.5, 0]} name="floor">
          <mesh receiveShadow>
            <boxGeometry args={[50, 1, 50]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.8} />
          </mesh>
        </RigidBody>
      </Physics>

      {/* Lighting - Brightened Neon Vibe */}
      <directionalLight
        castShadow
        position={[10, 50, 20]}
        intensity={2.0}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={1.2} />
      <pointLight position={[-10, 20, -10]} intensity={1.5} color="#ff00ff" distance={100} />
      <pointLight position={[10, 20, 10]} intensity={1.5} color="#00f2ff" distance={100} />
      
      {/* Subtle fog for depth - Very light to ensure clear visibility */}
      <fog attach="fog" args={['#0a0a1a', 60, 200]} />
    </>
  );
}
