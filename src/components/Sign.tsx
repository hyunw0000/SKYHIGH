import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface SignProps {
  position: [number, number, number];
}

export default function Sign({ position }: SignProps) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 6]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Board */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[2, 1, 0.1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Text */}
      <Text
        position={[0, 2.5, 0.06]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        용기 있는 자에게 보상을
      </Text>
      {/* Arrow pointing away */}
      <mesh position={[0, 2.5, 0.07]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.4, 6]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    </group>
  );
}
