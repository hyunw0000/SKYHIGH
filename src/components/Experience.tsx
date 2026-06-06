import { Stars, Environment, OrbitControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import Player from './Player';
import Platforms from './Platforms';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGameStore } from '../stores/useGameStore';

export default function Experience() {
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const playerRef = useRef<THREE.Group>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  
  // Pre-allocated objects for GC-free frame updates
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const lastPlayerPos = useRef(new THREE.Vector3(0, 5, 0));

  const shiftVec = useMemo(() => new THREE.Vector3(), []);

  const lastLightUpdatePos = useRef(new THREE.Vector3(0, 0, 0));

  const pointLight1Ref = useRef<THREE.PointLight>(null);
  const pointLight2Ref = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (playerRef.current && orbitControlsRef.current) {
      // 1. Get current world position
      playerRef.current.updateWorldMatrix(true, false);
      playerRef.current.getWorldPosition(tempVec);
      
      // 2. Failsafe: If the camera is stuck at or very near [0,0,0]
      if (state.camera.position.lengthSq() < 1) {
        state.camera.position.set(tempVec.x + 20, tempVec.y + 20, tempVec.z + 20);
        orbitControlsRef.current.target.copy(tempVec);
        lastPlayerPos.current.copy(tempVec);
      }

      // 3. Move camera position relative to the player
      shiftVec.subVectors(tempVec, lastPlayerPos.current);
      state.camera.position.add(shiftVec);
      
      // 4. Set OrbitControls target to the player
      orbitControlsRef.current.target.copy(tempVec);
      
      // 5. Update state for next frame
      lastPlayerPos.current.copy(tempVec);
      orbitControlsRef.current.update();

      // 6. Light tracking - STABILIZED: Only update if player moved more than 10m (was 5m)
      if (directionalLightRef.current && tempVec.distanceTo(lastLightUpdatePos.current) > 10) {
        directionalLightRef.current.position.set(tempVec.x + 10, tempVec.y + 50, tempVec.z + 20);
        directionalLightRef.current.target.position.copy(tempVec);
        directionalLightRef.current.target.updateMatrixWorld();
        lastLightUpdatePos.current.copy(tempVec);
      }

      // 7. Point lights tracking - Maintain neon vibe at all heights
      if (pointLight1Ref.current) {
        pointLight1Ref.current.position.set(tempVec.x - 15, tempVec.y + 10, tempVec.z - 15);
      }
      if (pointLight2Ref.current) {
        pointLight2Ref.current.position.set(tempVec.x + 15, tempVec.y + 10, tempVec.z + 15);
      }
    }
  });

  const phase = useGameStore((state) => state.phase);

  return (
    <>
      <OrbitControls 
        ref={orbitControlsRef}
        makeDefault 
        enablePan={false} 
        maxPolarAngle={Math.PI / 1.5} 
        minDistance={5}  // Increased min distance to prevent being too close
        maxDistance={50} // Increased max distance for wider view
      />
      
      <color attach="background" args={['#0a0a1a']} />
      <Stars radius={5000} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      <Physics debug={false} gravity={[0, -20, 0]} paused={phase === 'PAUSED'}>
        <Player ref={playerRef} />
        <Platforms />
        
        <RigidBody type="fixed" position={[0, -0.5, 0]} name="floor" colliders="cuboid">
          <mesh receiveShadow>
            <boxGeometry args={[100, 1, 100]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.8} />
          </mesh>
        </RigidBody>
      </Physics>

      <directionalLight
        ref={directionalLightRef}
        castShadow
        position={[10, 50, 20]}
        intensity={2.0}
        shadow-mapSize={[512, 512]} // Restored to 512 for better quality
        shadow-camera-left={-30} // Expanded area
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-far={150} // Increased from 80 to 150
      />
      <ambientLight intensity={1.2} />
      <pointLight ref={pointLight1Ref} position={[-10, 20, -10]} intensity={2.5} color="#ff00ff" distance={150} decay={2} />
      <pointLight ref={pointLight2Ref} position={[10, 20, 10]} intensity={2.5} color="#00f2ff" distance={150} decay={2} />
      
      <fog attach="fog" args={['#0a0a1a', 100, 1500]} />
    </>
  );
}
