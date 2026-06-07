import { Text } from '@react-three/drei';

interface HintSignProps {
  position: [number, number, number];
  text: string;
  rotation?: [number, number, number];
}

export default function HintSign({ position, text, rotation = [0, 0, 0] }: HintSignProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Pole */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 6]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Board */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[2, 1.4, 0.1]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      {/* Text */}
      <Text
        position={[0, 2.7, 0.06]}
        fontSize={0.15}
        color="yellow"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {text}
      </Text>
      {/* Directional Arrow */}
      <mesh position={[0, 2.1, 0.06]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.4, 4]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
}
