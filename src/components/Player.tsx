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
   * Reset Position on Restart
   */
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
      (state) => state.phase,
      (newPhase) => {
        if (newPhase === 'READY') {
          body.current?.setTranslation({ x: 0, y: 5, z: 0 }, true);
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
        const impulseStrength = 0.8 * delta * 60; // Slightly increased impulse
        
        body.current.applyImpulse({ 
          x: moveVector.x * impulseStrength, 
          y: 0, 
          z: moveVector.z * impulseStrength 
        }, true);
      }

      // Jump: Added a small 'grace' check for grounding
      if (jump && isGrounded.current) {
        body.current.applyImpulse({ x: 0, y: 15, z: 0 }, true); // Increased jump power
        isGrounded.current = false;
      }

      /**
       * Score & Game Over
       */
      incrementScore(bodyPosition.y);
      
      if (bodyPosition.y < -10) {
        setGameOver();
      }
    }
  });

  const onCollisionEnter = ({ other, contact }: any) => {
    // Check if we hit a platform or floor
    const isFloorOrPlatform = other.rigidBodyObject?.name === 'platform' || other.rigidBodyObject?.name === 'floor';
    if (isFloorOrPlatform) {
      isGrounded.current = true;
    }
  };

  const onCollisionExit = ({ other }: any) => {
    if (other.rigidBodyObject?.name === 'platform' || other.rigidBodyObject?.name === 'floor') {
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
      linearDamping={0.5}
      angularDamping={0.5}
      gravityScale={2.5}
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