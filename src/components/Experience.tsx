import { Stars, Environment, OrbitControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import Player from './Player';
import Platforms from './Platforms';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export default function Experience() {
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const playerRef = useRef<THREE.Group>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  
  // Pre-allocated objects for GC-free frame updates
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const lastPlayerPos = useRef(new THREE.Vector3(0, 5, 0));
  const deltaMovement = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (playerRef.current && orbitControlsRef.current) {
      // 1. Get current world position accurately
      playerRef.current.updateWorldMatrix(true, false);
      playerRef.current.getWorldPosition(tempVec);
      
      // 2. Calculate movement delta
      deltaMovement.subVectors(tempVec, lastPlayerPos.current);
      
      // 3. Move camera vertically with player
      orbitControlsRef.current.object.position.y += deltaMovement.y;
      
      // 4. Update the target to keep the player centered
      orbitControlsRef.current.target.copy(tempVec);
      
      // 5. Update state and force control update
      lastPlayerPos.current.copy(tempVec);
      orbitControlsRef.current.update();

      // 6. Move directional light with player for consistent shadows
      if (directionalLightRef.current) {
        directionalLightRef.current.position.set(tempVec.x + 10, tempVec.y + 50, tempVec.z + 20);
        directionalLightRef.current.target.position.copy(tempVec);
        directionalLightRef.current.target.updateMatrixWorld();
      }
    }
  });

  return (
    <>
      <OrbitControls 
        ref={orbitControlsRef}
        makeDefault 
        enablePan={false} 
        maxPolarAngle={Math.PI / 1.5} 
        minDistance={0.1} 
        maxDistance={1000} 
      />
      
      <color attach="background" args={['#0a0a1a']} />
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      <Physics debug={false}>
        <Player ref={playerRef} />
        <Platforms />
        
        <RigidBody type="fixed" position={[0, -0.5, 0]} name="floor">
          <mesh receiveShadow>
            <boxGeometry args={[50, 1, 50]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.8} />
          </mesh>
        </RigidBody>
      </Physics>

      <directionalLight
        ref={directionalLightRef}
        castShadow
        position={[10, 50, 20]}
        intensity={2.0}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={1.2} />
      <pointLight position={[-10, 20, -10]} intensity={1.5} color="#ff00ff" distance={100} />
      <pointLight position={[10, 20, 10]} intensity={1.5} color="#00f2ff" distance={100} />
      
      <fog attach="fog" args={['#0a0a1a', 60, 200]} />
    </>
  );
}
