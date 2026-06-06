import { useMemo } from 'react';
import HiddenJumpPlatform from './HiddenJumpPlatform';
import HintSign from './HintSign';

export default function EasterEggManager({ instances }: { instances: any[] }) {
  return useMemo(() => {
    const checkpoints = instances.filter((inst) => inst.name === 'checkpoint');
    // Exclude first checkpoint (index 0)
    const validCheckpoints = checkpoints.slice(1);
    
    // Select every 3rd checkpoint
    const selected = validCheckpoints.filter((_, index) => (index + 1) % 3 === 0);
    
    return selected.flatMap((inst) => [
      <HiddenJumpPlatform 
        key={`easter-jump-${inst.key}`} 
        position={[inst.position[0], inst.position[1] + 0.5, inst.position[2]] as [number, number, number]} 
      />,
      <HintSign 
        key={`easter-sign-${inst.key}`}
        position={[inst.position[0], inst.position[1] + 0.5, inst.position[2] + 2] as [number, number, number]}
        text="더 빠르게 올라갈 수 있는 방법이 없을까?"
      />
    ]);
  }, [instances]);
}
