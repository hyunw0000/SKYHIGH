import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedRigidBodies, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';
import Flag from './Flag';

const PLATFORM_COUNT = 70; 
const SPACING = 4;

const NEON_COLORS = [
  new THREE.Color('#ffffff'),
  new THREE.Color('#00ffff'),
  new THREE.Color('#ff00ff'),
  new THREE.Color('#00ff00'),
  new THREE.Color('#ffff00'),
];

const GOLDEN_COLOR = new THREE.Color('#ffd700');
const MOVING_COLOR = new THREE.Color('#ffaa00');
const ENDING_LEVEL = 250; 

export default function Platforms() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const movingPlatformsRef = useRef<(RapierRigidBody | null)[]>([]);
  
  const pivotLevel = useGameStore((state) => Math.floor(state.currentLevel / 20) * 20);

  const { instances, movingPlatforms } = useMemo(() => {
    const startLevel = Math.max(1, pivotLevel - 40); 
    const count = 100;
    
    const items = [];
    const moving = [];
    
    for (let i = 0; i < count; i++) {
      const levelIndex = startLevel + i;
      const seed = levelIndex * 15485863;
      
      if (levelIndex > 75 && levelIndex % 5 === 0) {
        moving.push({
          key: `moving-${levelIndex}`,
          levelIndex: levelIndex,
          initialX: 0,
          z: 0,
        });
      } else {
        let x, z, scaleX, scaleZ, color, name = 'platform';

        if (levelIndex === ENDING_LEVEL) {
          x = 0; z = 0; scaleX = 40; scaleZ = 40; color = new THREE.Color('#ff0000'); name = 'ending';
        } else if (levelIndex > 0 && levelIndex % 15 === 0) {
          const angle = levelIndex * 0.5;
          const radius = 5;
          x = Math.sin(angle) * radius;
          z = Math.cos(angle) * radius;
          scaleX = 8; scaleZ = 8; color = GOLDEN_COLOR; name = 'checkpoint';
        } else if (levelIndex <= 10) {
          const angle = levelIndex * 0.8;
          const radius = 5;
          x = Math.sin(angle) * radius;
          z = Math.cos(angle) * radius;
          scaleX = 6; scaleZ = 6; color = NEON_COLORS[0];
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
          name: name,
          position: [x, levelIndex * SPACING, z] as [number, number, number],
          rotation: [0, (seed % 100) / 100 * Math.PI, 0] as [number, number, number],
          scale: [scaleX, 0.6, scaleZ] as [number, number, number],
          color: color || NEON_COLORS[0],
        });
      }
    }
    return { instances: items, movingPlatforms: moving };
  }, [pivotLevel]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    movingPlatformsRef.current.forEach((body, i) => {
      if (body) {
        const level = movingPlatforms[i].levelIndex;
        const x = Math.sin(time * 0.5 + level) * 10;
        body.setNextKinematicTranslation({ x, y: level * SPACING, z: 0 });
      }
    });
  });

  const checkpointPosition = useGameStore((state) => state.checkpointPosition);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.frustumCulled = false;
    }
  }, [instances]);

  useEffect(() => {
    if (meshRef.current) {
      instances.forEach((instance, i) => {
        let color = instance.color;
        if (instance.name === 'checkpoint' && checkpointPosition) {
          const isAtCheckpoint = Math.abs(instance.position[1] - checkpointPosition[1]) < 0.1;
          if (isAtCheckpoint) color = new THREE.Color('#00ff00');
        }
        if (color) meshRef.current?.setColorAt(i, color);
      });
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [instances, checkpointPosition]);

  const flags = useMemo(() => {
    return instances
      .filter((inst) => inst.name === 'checkpoint')
      .map((inst) => (
        <Flag 
          key={`flag-${inst.key}`} 
          position={inst.position as [number, number, number]} 
        />
      ));
  }, [instances]);

  return (
    <>
      <InstancedRigidBodies instances={instances} type="fixed" colliders="cuboid">
        <instancedMesh ref={meshRef} args={[undefined, undefined, 100]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial toneMapped={false} emissive="#ffffff" emissiveIntensity={0.15} />
        </instancedMesh>
      </InstancedRigidBodies>

      {movingPlatforms.map((p, i) => (
        <RigidBody
          key={p.key}
          ref={(el) => (movingPlatformsRef.current[i] = el)}
          type="kinematicPosition"
          colliders="cuboid"
          name="platform"
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6, 0.6, 6]} />
            <meshStandardMaterial color={MOVING_COLOR} emissive={MOVING_COLOR} emissiveIntensity={0.5} />
          </mesh>
        </RigidBody>
      ))}

      {flags}
    </>
  );
}
