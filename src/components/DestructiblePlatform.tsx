import { useRef, useState, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DestructiblePlatformProps {
  position: [number, number, number];
}

const DESTRUCTIBLE_COLOR = new THREE.Color('#ff0000'); // Red for danger

export default function DestructiblePlatform({ position }: DestructiblePlatformProps) {
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

      if (visible && timerRef.current >= 3) {
        setVisible(false);
      } else if (!visible && timerRef.current >= 5) { // 3s disappear + 2s = 5s total
        setVisible(true);
        isBroken.current = false;
        timerRef.current = 0;
      }
    }
  });

  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      position={position}
      onCollisionEnter={onCollisionEnter}
      sensor={!visible} // Make it non-collidable when invisible
    >
      <mesh visible={visible} castShadow receiveShadow>
        <boxGeometry args={[5, 0.6, 5]} />
        <meshStandardMaterial 
          color={isBroken.current ? "#550000" : DESTRUCTIBLE_COLOR} 
          emissive={isBroken.current ? "#550000" : DESTRUCTIBLE_COLOR}
          emissiveIntensity={0.5}
        />
      </mesh>
    </RigidBody>
  );
}
