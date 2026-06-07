import { useRef, useState } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DestructiblePlatformProps {
  position: [number, number, number];
  scale?: [number, number, number];
}

const DESTRUCTIBLE_COLOR = new THREE.Color('#ff0000'); // Red for danger

export default function DestructiblePlatform({ position, scale = [5, 0.6, 5] }: DestructiblePlatformProps) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(0);
  const isBroken = useRef(false);

  const onCollisionEnter = () => {
    if (!isBroken.current) {
      isBroken.current = true;
      timerRef.current = 0; // Reset timer
    }
  };

  useFrame((_, delta) => {
    if (isBroken.current) {
      timerRef.current += delta;

      if (visible && timerRef.current >= 2.5) {
        setVisible(false);
      } else if (!visible && timerRef.current >= 4.5) { // 2.5s disappear + 2s = 4.5s total
        setVisible(true);
        isBroken.current = false;
        timerRef.current = 0;
      }
    }
  });

  return (
    <RigidBody
      name="platform"
      type="fixed"
      colliders={false} // Disable automatic colliders to use manual CuboidCollider
      position={position}
      onCollisionEnter={onCollisionEnter}
    >
      {/* Physically remove the collider when invisible so the player falls */}
      {visible && (
        <CuboidCollider args={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} />
      )}
      
      <mesh visible={visible} castShadow receiveShadow>
        <boxGeometry args={scale} />
        <meshStandardMaterial 
          color={isBroken.current ? "#550000" : DESTRUCTIBLE_COLOR} 
          emissive={isBroken.current ? "#550000" : DESTRUCTIBLE_COLOR}
          emissiveIntensity={1.5}
        />
      </mesh>
    </RigidBody>
  );
}
