import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

interface FlagProps {
  position: [number, number, number];
}

export default function Flag({ position }: FlagProps) {
  const bannerRef = useRef<THREE.Mesh>(null);
  const checkpointPosition = useGameStore((state) => state.checkpointPosition);
  
  // Check if this specific checkpoint is the active one
  // We compare by height (y position) as it's unique for each checkpoint level
  const isActive = checkpointPosition && Math.abs(checkpointPosition[1] - position[1]) < 0.1;

  useFrame((state) => {
    if (bannerRef.current) {
      // Wave animation
      const time = state.clock.getElapsedTime();
      bannerRef.current.rotation.y = Math.sin(time * 2) * 0.2;
      
      // Floating animation for the flag part
      bannerRef.current.position.y = 2.5 + Math.sin(time * 3) * 0.1;
    }
  });

  return (
    <group position={[position[0] + 3, position[1], position[2] + 3]}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3, 6]} /> {/* Reduced segments from 8 to 6 */}
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Flag Banner */}
      <mesh ref={bannerRef} position={[0.4, 2.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial 
          color={isActive ? "#00ff00" : "#ff0000"} 
          emissive={isActive ? "#00ff00" : "#ff0000"}
          emissiveIntensity={isActive ? 2 : 0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Point light for active checkpoint - optimized to only render if truly active */}
      {isActive && (
        <pointLight position={[0, 3, 0]} intensity={3} color="#00ff00" distance={8} decay={2} />
      )}
    </group>
  );
}
