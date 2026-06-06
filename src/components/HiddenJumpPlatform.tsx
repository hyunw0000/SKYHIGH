import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useRef } from 'react';

interface HiddenJumpPlatformProps {
  position: [number, number, number];
}

export default function HiddenJumpPlatform({ position }: HiddenJumpPlatformProps) {
  const body = useRef<RapierRigidBody>(null);

  const onCollisionEnter = ({ other }: any) => {
    if (other.rigidBodyObject?.name === 'player') {
      // Apply strong upward impulse directly to the player's rigidBody
      other.rigidBody.applyImpulse({ x: 0, y: 50, z: 0 }, true);
    }
  };

  return (
    <RigidBody
      ref={body}
      type="fixed"
      position={position}
      colliders="cuboid"
      onCollisionEnter={onCollisionEnter}
      name="hidden-jump-platform"
    >
      <mesh>
        <boxGeometry args={[2, 0.2, 2]} />
        {/* Invisible jump pad */}
        <meshStandardMaterial color="#00ff00" transparent opacity={1} />
      </mesh>
    </RigidBody>
  );
}
