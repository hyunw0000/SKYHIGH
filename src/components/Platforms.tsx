import { useMemo, useRef } from 'react';
import { InstancedRigidBodies, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';

const PLATFORM_COUNT = 30; // Slightly reduced for better performance
const VISIBLE_RANGE = 15;

export default function Platforms() {
  const score = useGameStore((state) => state.score);

  const instances = useMemo(() => {
    const currentLevel = Math.floor(score / 4);
    const startLevel = Math.max(0, currentLevel - VISIBLE_RANGE);
    const endLevel = startLevel + PLATFORM_COUNT;
    
    const items = [];
    for (let i = startLevel; i < endLevel; i++) {
      const seed = i * 15485863;
      const x = Math.sin(seed) * 8;
      const z = Math.cos(seed) * 8;
      
      items.push({
        key: `platform-${i}`,
        position: [x, i * 4, z],
        rotation: [0, 0, 0],
      });
    }
    return items;
  }, [score]);

  return (
    <InstancedRigidBodies
      instances={instances}
      type="fixed"
      colliders="cuboid"
      name="platform"
    >
      <instancedMesh args={[undefined, undefined, PLATFORM_COUNT]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.5, 3]} />
        <meshStandardMaterial color="#2ecc71" />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
