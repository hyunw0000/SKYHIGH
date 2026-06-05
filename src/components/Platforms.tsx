import { useMemo, useRef, useEffect } from 'react';
import { InstancedRigidBodies } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';
import Flag from './Flag';

const PLATFORM_COUNT = 70; // Increased count to cover wider range
const SPACING = 4;

const NEON_COLORS = [
  new THREE.Color('#ffffff'),
  new THREE.Color('#00ffff'),
  new THREE.Color('#ff00ff'),
  new THREE.Color('#00ff00'),
  new THREE.Color('#ffff00'),
];

const GOLDEN_COLOR = new THREE.Color('#ffd700');
const ENDING_LEVEL = 250; // 250 * 4 = 1000m

export default function Platforms() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const currentLevel = useGameStore((state) => state.currentLevel);

  // Lazy update: Only re-generate when player moves 10 levels away from the pivot
  const pivotLevel = Math.floor(currentLevel / 10) * 10;

  const instances = useMemo(() => {
    const startLevel = Math.max(1, pivotLevel - 20); 
    
    const items = [];
    for (let i = 0; i < PLATFORM_COUNT; i++) {
      const levelIndex = startLevel + i;
      const seed = levelIndex * 15485863;
      
      let x, z, scaleX, scaleZ, color, name;

      name = 'platform';

      if (levelIndex === ENDING_LEVEL) {
        // Massive Ending Platform
        x = 0;
        z = 0;
        scaleX = 40;
        scaleZ = 40;
        color = new THREE.Color('#ff0000');
        name = 'ending';
      } else if (levelIndex > 0 && levelIndex % 15 === 0) {
        // Golden Checkpoint Platform (Every 15 levels * 4m = 60m)
        const angle = levelIndex * 0.5;
        const radius = 5;
        x = Math.sin(angle) * radius;
        z = Math.cos(angle) * radius;
        scaleX = 8;
        scaleZ = 8;
        color = GOLDEN_COLOR;
        name = 'checkpoint';
      } else if (levelIndex <= 10) {
        const angle = levelIndex * 0.8;
        const radius = 5;
        x = Math.sin(angle) * radius;
        z = Math.cos(angle) * radius;
        scaleX = 6;
        scaleZ = 6;
        color = NEON_COLORS[0];
      } else {
        const angle = levelIndex * 0.5 + Math.sin(seed) * 0.3;
        const radius = 3 + (Math.abs(Math.sin(seed)) * 7);
        x = Math.sin(angle) * radius;
        z = Math.cos(angle) * radius;
        scaleX = 4 + Math.sin(seed * 2) * 1.5;
        scaleZ = 4 + Math.cos(seed * 2) * 1.5;
        
        const colorIndex = Math.abs(seed) % NEON_COLORS.length;
        color = NEON_COLORS[colorIndex];
      }

      items.push({
        key: `platform-${levelIndex}`,
        name: name, // This is essential for collision detection
        position: [x, levelIndex * SPACING, z],
        rotation: [0, (seed % 100) / 100 * Math.PI, 0],
        scale: [scaleX, 0.6, scaleZ],
        color: color || NEON_COLORS[0], // Fallback to white if undefined
      });
    }
    return items;
  }, [pivotLevel]);

  const checkpointPosition = useGameStore((state) => state.checkpointPosition);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.frustumCulled = false;
      
      instances.forEach((instance, i) => {
        let color = instance.color;
        
        // Dynamic color for active checkpoint
        if (instance.name === 'checkpoint' && checkpointPosition) {
          const isAtCheckpoint = Math.abs(instance.position[1] - checkpointPosition[1]) < 0.1;
          if (isAtCheckpoint) {
            color = new THREE.Color('#00ff00'); // Neon Green for active
          }
        }
        
        if (color) {
          meshRef.current?.setColorAt(i, color);
        }
      });
      
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }

      // Crucial: compute bounding volumes for instanced meshes
      meshRef.current.computeBoundingBox();
      meshRef.current.computeBoundingSphere();
    }
  }, [instances, checkpointPosition]);

  return (
    <>
      <InstancedRigidBodies
        instances={instances}
        type="fixed"
        colliders="cuboid"
      >
        <instancedMesh 
          ref={meshRef} 
          args={[undefined, undefined, PLATFORM_COUNT]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            toneMapped={false}
            emissive="#ffffff"
            emissiveIntensity={0.5} // Increased visibility
          />
        </instancedMesh>
      </InstancedRigidBodies>

      {/* Render flags for checkpoints */}
      {instances.map((instance) => {
        if (instance.name === 'checkpoint') {
          const level = parseInt(instance.key.split('-')[1]);
          return (
            <Flag 
              key={`flag-${instance.key}`} 
              position={instance.position as [number, number, number]} 
              level={level} 
            />
          );
        }
        return null;
      })}
    </>
  );
}
