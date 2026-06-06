import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedRigidBodies, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';
import Flag from './Flag';
import DestructiblePlatform from './DestructiblePlatform';
import HiddenJumpPlatform from './HiddenJumpPlatform';
import HintSign from './HintSign';

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
  const movingPlatformsRef = useRef<Map<string, RapierRigidBody>>(new Map());
  
  // Stabilize pivotLevel - update every 50 levels (200m) instead of 20
  const pivotLevel = useGameStore((state) => Math.floor(state.currentLevel / 50) * 50);

  const { instances, movingPlatforms, destructiblePlatforms } = useMemo(() => {
    // Larger window: 300 platforms around the pivot
    const startLevel = Math.max(1, pivotLevel - 100); 
    const count = 300;
    
    const items = [];
    const moving = [];
    const destructible = [];
    
    for (let i = 0; i < count; i++) {
      const levelIndex = startLevel + i;
      const seed = levelIndex * 15485863;
      const angle = levelIndex * 0.5 + Math.sin(seed) * 0.3;
      const radius = 3 + (Math.abs(Math.sin(seed)) * 7);
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const position = [x, levelIndex * SPACING, z] as [number, number, number];
      
      // 1. Checkpoint (Priority 1)
      if (levelIndex > 0 && levelIndex % 15 === 0) {
        items.push({
          key: `platform-${levelIndex}`,
          name: 'checkpoint',
          position,
          rotation: [0, (seed % 100) / 100 * Math.PI, 0] as [number, number, number],
          scale: [8, 0.6, 8] as [number, number, number],
          color: GOLDEN_COLOR,
        });
      }
      // 2. Destructible Platform (Priority 2)
      else if (levelIndex > 150 && levelIndex % 3 === 0) {
        destructible.push({
          key: `destructible-${levelIndex}`,
          position
        });
      }
      // 3. Moving Platform (Priority 3)
      else if (levelIndex >= 75 && levelIndex % 3 === 0) {
        moving.push({
          key: `moving-${levelIndex}`,
          levelIndex: levelIndex,
          position: position,
        });
      }
      // 4. Normal Platform
      else {
        let scaleX, scaleZ, color, name = 'platform';

        if (levelIndex === ENDING_LEVEL) {
          scaleX = 40; scaleZ = 40; color = new THREE.Color('#ff0000'); name = 'ending';
        } else if (levelIndex <= 10) {
          scaleX = 6; scaleZ = 6; color = NEON_COLORS[0];
        } else {
          scaleX = 4 + Math.sin(seed * 2) * 1.5;
          scaleZ = 4 + Math.cos(seed * 2) * 1.5;
          
          // Difficulty increase: reduce size after 900m (level 225)
          if (levelIndex > 225) {
            scaleX *= 0.5;
            scaleZ *= 0.5;
          }
          
          const colorIndex = Math.abs(seed) % NEON_COLORS.length;
          color = NEON_COLORS[colorIndex];
        }

        items.push({
          key: `platform-${levelIndex}`,
          name: name,
          position: position,
          rotation: [0, (seed % 100) / 100 * Math.PI, 0] as [number, number, number],
          scale: [scaleX, 0.6, scaleZ] as [number, number, number],
          color: color || NEON_COLORS[0],
        });
      }
    }
    return { instances: items, movingPlatforms: moving, destructiblePlatforms: destructible };
  }, [pivotLevel]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Safety check: only update if refs exist and are valid
    movingPlatforms.forEach((platform) => {
      const body = movingPlatformsRef.current.get(platform.key);
      if (body) {
        try {
          const level = platform.levelIndex;
          const x = Math.sin(time * 0.5 + level) * 10;
          body.setNextKinematicTranslation({ x, y: level * SPACING, z: 0 });
        } catch (e) {
          // Ignore errors during body destruction/transition
        }
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

  const checkpointInteractables = useMemo(() => {
    return instances
      .filter((inst) => inst.name === 'checkpoint')
      .map((inst) => {
        const pos = inst.position as [number, number, number];
        // Shift jump platform further away
        const jumpPos: [number, number, number] = [pos[0] + 6, pos[1] + 1, pos[2]];
        
        return (
          <group key={`interactable-${inst.key}`}>
            <HiddenJumpPlatform
              position={jumpPos}
            />
            <HintSign
              position={[pos[0], pos[1] + 1, pos[2]]}
              text="더 빨리 올라갈 수 있는 방법이 없을까?"
              rotation={[0, Math.atan2(jumpPos[0] - pos[0], jumpPos[2] - pos[2]), 0]}
            />
          </group>
        );
      });
  }, [instances]);

  return (
    <>
      <InstancedRigidBodies instances={instances} type="fixed" colliders="cuboid">
        <instancedMesh ref={meshRef} args={[undefined, undefined, 500]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial toneMapped={false} emissive="#ffffff" emissiveIntensity={0.15} />
        </instancedMesh>
      </InstancedRigidBodies>

      {movingPlatforms.map((p) => (
        <RigidBody
          key={p.key}
          ref={(el) => {
            if (el) movingPlatformsRef.current.set(p.key, el);
            else movingPlatformsRef.current.delete(p.key);
          }}
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

      {destructiblePlatforms.map((p) => (
        <DestructiblePlatform key={p.key} position={p.position} />
      ))}

      {flags}
      {checkpointInteractables}
    </>
  );
}
