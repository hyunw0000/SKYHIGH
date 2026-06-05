import { useRef, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

const Player = forwardRef<THREE.Group>((_, ref) => {
  const body = useRef<RapierRigidBody>(null);
  const [, getKeys] = useKeyboardControls();
  const { phase, setGameOver, incrementScore } = useGameStore();
  
  const isGrounded = useRef(false);

  // Reusable vectors to avoid GC
  const cameraForward = useRef(new THREE.Vector3()).current;
  const cameraRight = useRef(new THREE.Vector3()).current;
  const moveVector = useRef(new THREE.Vector3()).current;

  /**
   * Input & Events
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useGameStore.getState().togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Reset Position on Restart
   */
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
      (state) => state.phase,
      (newPhase) => {
        if (newPhase === 'READY') {
          const checkpoint = useGameStore.getState().checkpointPosition;
          if (checkpoint) {
            body.current?.setTranslation({ x: checkpoint[0], y: checkpoint[1] + 2, z: checkpoint[2] }, true);
          } else {
            body.current?.setTranslation({ x: 0, y: 5, z: 0 }, true);
          }
          body.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
          body.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
      }
    );
    return unsubscribe;
  }, []);

  useFrame((state, delta) => {
    if (!body.current) return;

    const bodyPosition = body.current.translation();
    const { forward: keyF, backward: keyB, left: keyL, right: keyR, jump } = getKeys();

    // Auto-start game if any key is pressed
    if (phase === 'READY' && (keyF || keyB || keyL || keyR || jump)) {
      useGameStore.getState().start();
    }

    if (phase === 'PLAYING') {
      /**
       * Controls / Movement (Camera-Relative)
       */
      state.camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0)).normalize();
      
      cameraForward.y = 0;
      cameraForward.normalize();

      moveVector.set(0, 0, 0);
      
      if (keyF) moveVector.add(cameraForward);
      if (keyB) moveVector.sub(cameraForward);
      if (keyL) moveVector.sub(cameraRight);
      if (keyR) moveVector.add(cameraRight);

      if (moveVector.length() > 0) {
        moveVector.normalize();
        const impulseStrength = 0.4 * delta * 60; // Reduced from 0.8 to 0.4 for slower movement
        
        body.current.applyImpulse({ 
          x: moveVector.x * impulseStrength, 
          y: 0, 
          z: moveVector.z * impulseStrength 
        }, true);
      }

      // Jump: Added a small 'grace' check for grounding
      if (jump && isGrounded.current) {
        body.current.applyImpulse({ x: 0, y: 16, z: 0 }, true); // Increased from 12 to 16
        isGrounded.current = false;
      }

      /**
       * Score & Game Over
       */
      const currentHeight = bodyPosition.y;
      const currentLevel = Math.floor(currentHeight / 4); // 4 is the SPACING
      
      if (currentHeight > useGameStore.getState().score) {
        incrementScore(currentHeight);
      }

      useGameStore.getState().setCurrentLevel(currentLevel);
      
      if (currentHeight < -10) {
        setGameOver();
      }
    }
  });

  const onCollisionEnter = ({ other }: any) => {
    const name = other.rigidBodyObject?.name;
    
    // Check if we hit a platform or floor
    if (name === 'platform' || name === 'floor' || name === 'checkpoint' || name === 'ending') {
      isGrounded.current = true;
    }

    // Save Checkpoint
    if (name === 'checkpoint') {
      const pos = other.rigidBodyObject.position;
      useGameStore.getState().setCheckpoint([pos.x, pos.y, pos.z]);
    }

    // Win Game
    if (name === 'ending') {
      useGameStore.getState().setWin();
    }
  };

  const onCollisionExit = ({ other }: any) => {
    const name = other.rigidBodyObject?.name;
    if (name === 'platform' || name === 'floor' || name === 'checkpoint' || name === 'ending') {
      isGrounded.current = false;
    }
  };

  return (
    <RigidBody
      ref={body}
      colliders={false}
      canSleep={false}
      position={[0, 5, 0]}
      friction={1}
      restitution={0.2}
      linearDamping={1.0}
      angularDamping={1.0}
      gravityScale={2.5}
      ccd={true} // Enable Continuous Collision Detection
      onCollisionEnter={onCollisionEnter}
      onCollisionExit={onCollisionExit}
      name="player"
    >
      <group ref={ref}>
        <BallCollider args={[0.5]} />
        <mesh castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={2} 
            roughness={0} 
            metalness={1} 
          />
        </mesh>
        
        {/* Inner glow effect */}
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.2} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Point light attached to player for neon effect */}
        <pointLight position={[0, 0, 0]} intensity={2} color="#ff0000" distance={5} />
      </group>
    </RigidBody>
  );
});

export default Player;