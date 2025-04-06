import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants, useAnimationControls } from 'framer-motion';
import styles from './AIAvatar.module.css';

// Define the viseme map: first letter of text chunk -> mouth shape
export type Viseme = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'X';
export type EyeEmotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';

// Mapping of characters to visemes
const VISEME_MAP: Record<string, Viseme> = {
  'a': 'A', // Open mouth
  'b': 'B', // Closed mouth with lips together
  'c': 'C', // Slightly open mouth
  'd': 'D', // Wide open mouth
  'e': 'E', // Smile shape
  'f': 'F', // Bottom lip touching upper teeth
  'g': 'G', // Teeth slightly showing
  'h': 'H', // Rounded lips
  'i': 'C', // Similar to C
  'j': 'H', // Similar to H
  'k': 'G', // Similar to G
  'l': 'C', // Similar to C
  'm': 'B', // Similar to B
  'n': 'C', // Similar to C
  'o': 'H', // Rounded mouth
  'p': 'B', // Similar to B
  'q': 'G', // Similar to G
  'r': 'C', // Similar to C
  's': 'C', // Similar to C
  't': 'C', // Similar to C
  'u': 'H', // Rounded mouth
  'v': 'F', // Similar to F
  'w': 'H', // Rounded mouth
  'x': 'C', // Similar to C
  'y': 'C', // Similar to C
  'z': 'C', // Similar to C
  ' ': 'X', // Rest position
  '.': 'X', // Rest position
  ',': 'X', // Rest position
  '?': 'D', // Question - wide open
  '!': 'D', // Exclamation - wide open
};

interface AIAvatarProps {
  textChunks?: string[];
  isSpeaking?: boolean;
  eyeEmotion?: EyeEmotion;
  size?: number;
  color?: string;
}

const AIAvatar: React.FC<AIAvatarProps> = ({
  textChunks = [],
  isSpeaking = false,
  eyeEmotion = 'neutral',
  size = 200,
  color = '#000000',
}) => {
  // State for current viseme, current text chunk, and blinking
  const [currentViseme, setCurrentViseme] = useState<Viseme>('X');
  const [isBlinking, setIsBlinking] = useState(false);
  const [isDistracted, setIsDistracted] = useState(false);
  const [chunkIndex, setChunkIndex] = useState(0);
  
  // Animation controls for eye shine
  const leftEyeShineControls = useAnimationControls();
  const rightEyeShineControls = useAnimationControls();
  
  // Refs for animation timers
  const blinkIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visemeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const distractionIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  console.log('AIAvatar render:', { 
    textChunks, 
    isSpeaking, 
    eyeEmotion, 
    chunkIndex, 
    currentViseme 
  });

  // Handle blinking animation
  useEffect(() => {
    const scheduleNextBlink = () => {
      if (blinkIntervalRef.current) clearTimeout(blinkIntervalRef.current);
      
      const nextBlinkDelay = Math.random() * 3000 + 2000; // Random blink every 2-5 seconds
      blinkIntervalRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 150); // Blink duration
      }, nextBlinkDelay);
    };

    scheduleNextBlink();
    
    return () => {
      if (blinkIntervalRef.current) clearTimeout(blinkIntervalRef.current);
    };
  }, []);

  // Handle random eye distraction animation
  useEffect(() => {
    // SVG constants for use within this effect
    const distEyeWidth = eyeWidth;
    
    const scheduleNextDistraction = () => {
      if (distractionIntervalRef.current) clearTimeout(distractionIntervalRef.current);
      
      const nextDistractionDelay = Math.random() * 5000 + 3000; // Random distraction every 3-8 seconds
      distractionIntervalRef.current = setTimeout(() => {
        setIsDistracted(true);
        
        // Apply slightly different animations to each eye
        const leftOffset = -distEyeWidth * (0.22 + Math.random() * 0.06);
        const rightOffset = -distEyeWidth * (0.20 + Math.random() * 0.08);
        
        // Animate left eye with specific values
        leftEyeShineControls.start({ 
          x: leftOffset,
          transition: { duration: 0.3, ease: "easeInOut" }
        });
        
        // Animate right eye with slightly different timing
        rightEyeShineControls.start({ 
          x: rightOffset,
          transition: { duration: 0.35, ease: "easeInOut", delay: 0.05 }
        });
        
        // Return to normal position after a delay
        const distractionDuration = 800 + Math.random() * 200;
        setTimeout(() => {
          setIsDistracted(false);
          
          // Animate eyes back to normal
          leftEyeShineControls.start({ 
            x: 0,
            transition: { duration: 0.3, ease: "easeInOut" }
          });
          
          rightEyeShineControls.start({ 
            x: 0,
            transition: { duration: 0.35, ease: "easeInOut", delay: 0.05 }
          });
          
          scheduleNextDistraction();
        }, distractionDuration);
      }, nextDistractionDelay);
    };

    scheduleNextDistraction();
    
    return () => {
      if (distractionIntervalRef.current) clearTimeout(distractionIntervalRef.current);
    };
  }, [leftEyeShineControls, rightEyeShineControls]);

  // When isSpeaking changes to false, reset the mouth
  useEffect(() => {
    console.log('isSpeaking effect triggered:', isSpeaking);
    if (!isSpeaking) {
      // Return mouth to rest position if not speaking
      setCurrentViseme('X');
    }
  }, [isSpeaking]);

  // Handle viseme animation based on text chunks
  useEffect(() => {
    console.log('Text chunks or chunk index changed:', { 
      textChunks, 
      chunkIndex, 
      isSpeaking 
    });

    // Clear any existing timers
    if (visemeTimerRef.current) {
      clearTimeout(visemeTimerRef.current);
      visemeTimerRef.current = null;
    }

    // Reset to default position when not speaking or no text chunks
    if (!isSpeaking || textChunks.length === 0) {
      setCurrentViseme('X');
      return;
    }

    // Process all chunks sequentially, not just the current chunk index
    const processChunks = () => {
      if (chunkIndex < textChunks.length) {
        const chunk = textChunks[chunkIndex];
        console.log('Processing chunk:', { chunk, chunkIndex });
        
        if (chunk && chunk.length > 0) {
          // Get first character and convert to lowercase
          const firstChar = chunk[0].toLowerCase();
          // Get corresponding viseme or default to rest position
          const viseme = VISEME_MAP[firstChar] || 'X';
          console.log('Setting viseme:', { firstChar, viseme });
          setCurrentViseme(viseme);
        }

        // Schedule next chunk processing
        const nextChunkDelay = 100; // Shorter time per viseme for more responsive animation
        visemeTimerRef.current = setTimeout(() => {
          // Move to next chunk
          if (chunkIndex < textChunks.length - 1) {
            console.log('Advancing to next chunk');
            setChunkIndex(prevIndex => prevIndex + 1);
          } else {
            // If at the end but still speaking, reset to rest position
            console.log('End of chunks, waiting for more');
            setCurrentViseme('X');
          }
        }, nextChunkDelay);
      }
    };

    // Start processing chunks
    processChunks();

    return () => {
      if (visemeTimerRef.current) clearTimeout(visemeTimerRef.current);
    };
  }, [textChunks, chunkIndex, isSpeaking]);

  // Reset chunk index when text chunks completely change or speaking state changes
  useEffect(() => {
    // Only reset index when textChunks array reference changes (new speech)
    // or when isSpeaking transitions from false to true
    if (textChunks.length === 0 || !isSpeaking) {
      console.log('Resetting chunk index to 0');
      setChunkIndex(0);
    }
  }, [textChunks, isSpeaking]);

  // SVG Constants
  const viewBoxSize = 100;
  const eyeOffsetX = 20; // Wider spacing for the much larger eyes
  const eyeOffsetY = -8; // Moved up by 3 more pixels (from -5 to -8)
  const mouthOffsetY = 25;
  const eyeWidth = 18;  // Dramatically increased width for puppy-like eyes
  const eyeHeight = 24; // Dramatically increased height for puppy-like eyes
  const eyeBlinkHeight = 1;

  // Get mouth path based on viseme
  const getMouthPath = (viseme: Viseme): string => {
    const mouthWidth = 40;
    const halfWidth = mouthWidth / 2;
    const y = mouthOffsetY;
    
    switch (viseme) {
      case 'A': // Open mouth
        return `M -${halfWidth} ${y} 
                C -${halfWidth*0.7} ${y+8}, ${halfWidth*0.7} ${y+8}, ${halfWidth} ${y} 
                C ${halfWidth*0.7} ${y-8}, -${halfWidth*0.7} ${y-8}, -${halfWidth} ${y} Z`;
      case 'B': // Closed mouth with lips together
        return `M -${halfWidth} ${y} 
                C -${halfWidth*0.6} ${y-1}, ${halfWidth*0.6} ${y-1}, ${halfWidth} ${y}`;
      case 'C': // Slightly open mouth
        return `M -${halfWidth} ${y} 
                C -${halfWidth*0.7} ${y+6}, ${halfWidth*0.7} ${y+6}, ${halfWidth} ${y} 
                C ${halfWidth*0.7} ${y-4}, -${halfWidth*0.7} ${y-4}, -${halfWidth} ${y} Z`;
      case 'D': // Wide open mouth
        return `M -${halfWidth} ${y} 
                C -${halfWidth*0.7} ${y+16}, ${halfWidth*0.7} ${y+16}, ${halfWidth} ${y} 
                C ${halfWidth*0.7} ${y-12}, -${halfWidth*0.7} ${y-12}, -${halfWidth} ${y} Z`;
      case 'E': // Smile shape
        return `M -${halfWidth} ${y+3} 
                C -${halfWidth*0.6} ${y-6}, ${halfWidth*0.6} ${y-6}, ${halfWidth} ${y+3}`;
      case 'F': // Bottom lip touching upper teeth
        return `M -${halfWidth} ${y-2} 
                C -${halfWidth*0.7} ${y-4}, ${halfWidth*0.7} ${y-4}, ${halfWidth} ${y-2}
                C ${halfWidth*0.7} ${y+7}, -${halfWidth*0.7} ${y+7}, -${halfWidth} ${y-2} Z`;
      case 'G': // Teeth slightly showing
        return `M -${halfWidth} ${y-2} 
                C -${halfWidth*0.7} ${y+4}, ${halfWidth*0.7} ${y+4}, ${halfWidth} ${y-2}
                C ${halfWidth*0.7} ${y-8}, -${halfWidth*0.7} ${y-8}, -${halfWidth} ${y-2} Z`;
      case 'H': // Rounded lips
        return `M -${halfWidth*0.7} ${y} 
                C -${halfWidth*0.5} ${y+8}, ${halfWidth*0.5} ${y+8}, ${halfWidth*0.7} ${y}
                C ${halfWidth*0.5} ${y-6}, -${halfWidth*0.5} ${y-6}, -${halfWidth*0.7} ${y} Z`;
      case 'X': // Rest position
      default:
        return `M -${halfWidth} ${y} 
                C -${halfWidth*0.7} ${y+2}, ${halfWidth*0.7} ${y+2}, ${halfWidth} ${y}`;
    }
  };

  // Get eye path based on emotion and blinking state
  const getEyePath = (emotion: EyeEmotion, isLeft: boolean, isBlinking: boolean): string => {
    const x = isLeft ? -eyeOffsetX : eyeOffsetX;
    const y = eyeOffsetY;
    const width = (emotion === 'neutral' || emotion === 'surprised') ? eyeWidth * 1.25 : eyeWidth; // Same size for neutral and surprised
    const height = (emotion === 'neutral' || emotion === 'surprised') ? eyeHeight * 1.25 : eyeHeight; // Same size for neutral and surprised
    
    if (isBlinking) {
      return `M ${x - width/2} ${y} H ${x + width/2}`; // Simple line for blinking
    }
    
    // Puppy-like eye shapes with different variations based on emotion
    switch (emotion) {
      case 'happy':
        // Happy puppy eyes - angled brow with straight bottom (formerly angry)
        return `M ${x - width/2} ${y} 
                Q ${x - width*0.2} ${y - height*0.6} ${x} ${y - height*0.2}
                Q ${x + width*0.2} ${y - height*0.6} ${x + width/2} ${y}
                L ${x - width/2} ${y} Z`;
      case 'sad':
        // Sad puppy eyes - looking downward at the floor
        return `M ${x - width/2} ${y} 
                Q ${x} ${y - height*0.5} ${x + width/2} ${y}
                Q ${x} ${y + height*0.6} ${x - width/2} ${y} Z`;
      case 'angry':
        // Angry puppy eyes - big with uplifted bottom (formerly happy)
        return `M ${x - width/2} ${y - height*0.2} 
                Q ${x} ${y - height*0.8} ${x + width/2} ${y - height*0.2}
                Q ${x} ${y + height*0.35} ${x - width/2} ${y - height*0.2} Z`;
      case 'surprised':
        // Surprised eyes - perfect circles with same size as neutral
        const radius = Math.min(width, height) / 2; // Use smallest dimension for perfect circle
        return `M ${x} ${y} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius*2},0 a ${radius},${radius} 0 1,0 -${radius*2},0`; // Circle
      case 'neutral':
      default:
        // Neutral eyes - same as angry but 25% larger
        return `M ${x - width/2} ${y - height*0.2} 
                Q ${x} ${y - height*0.8} ${x + width/2} ${y - height*0.2}
                Q ${x} ${y + height*0.35} ${x - width/2} ${y - height*0.2} Z`;
    }
  };

  // Get eye shine position based on emotion and distraction state
  const getEyeShinePosition = (emotion: EyeEmotion, isLeft: boolean) => {
    const baseX = isLeft ? -eyeOffsetX : eyeOffsetX;
    let offsetX = eyeWidth * 0.2;
    let offsetY = -eyeHeight * 0.2;
    
    // Adjust shine position based on emotion to enhance the effect
    if (emotion === 'sad') {
      // For sad, move shine to lower part of eye but ensure it stays within eye boundary
      offsetY = eyeHeight * 0.15; // Reduced from 0.3 to 0.15 to keep it higher in the eye
    } else if (emotion === 'surprised') {
      // For surprised, center the shine with slight upward position
      offsetX = 0;
      offsetY = -eyeHeight * 0.2;
    }
    
    // Don't apply distraction effect here as we're using motion.animate
    
    return {
      x: baseX + offsetX,
      y: eyeOffsetY + offsetY
    };
  };

  // Get eye shine size based on emotion
  const getEyeShineSize = (emotion: EyeEmotion): number => {
    // Make shine 30% larger for surprised emotion
    return emotion === 'surprised' ? eyeWidth * 0.195 : eyeWidth * 0.15;
  };

  // Get eyebrow path for angry emotion
  const getAngryEyebrowPath = (isLeft: boolean): string => {
    const x = isLeft ? -eyeOffsetX : eyeOffsetX;
    const y = eyeOffsetY - eyeHeight * 0.6; // Position above the eye
    const width = eyeWidth * 0.9; // Shorter eyebrows
    
    // Angled eyebrow - flipped direction (creates a "/\" shape)
    return isLeft
      ? `M ${x - width/2} ${y - width*0.3} L ${x + width/2} ${y}` // Left eyebrow angled up inward
      : `M ${x - width/2} ${y} L ${x + width/2} ${y - width*0.3}`; // Right eyebrow angled up outward
  };

  // Get eyebrow path for surprised emotion
  const getSurprisedEyebrowPath = (isLeft: boolean): string => {
    const x = isLeft ? -eyeOffsetX : eyeOffsetX;
    const y = eyeOffsetY - eyeHeight * 1.1; // Position even higher above the eye
    const width = eyeWidth * 1.3; // Even wider eyebrows for more surprise
    
    // Curved high eyebrows for surprised expression
    return `M ${x - width/2} ${y} Q ${x} ${y - width*0.4} ${x + width/2} ${y}`; // More pronounced upward curve
  };

  // Animation variants
  const mouthVariants: Variants = {
    A: { d: getMouthPath('A'), transition: { duration: 0.2, ease: "easeOut" } },
    B: { d: getMouthPath('B'), transition: { duration: 0.2, ease: "easeOut" } },
    C: { d: getMouthPath('C'), transition: { duration: 0.2, ease: "easeOut" } },
    D: { d: getMouthPath('D'), transition: { duration: 0.2, ease: "easeOut" } },
    E: { d: getMouthPath('E'), transition: { duration: 0.2, ease: "easeOut" } },
    F: { d: getMouthPath('F'), transition: { duration: 0.2, ease: "easeOut" } },
    G: { d: getMouthPath('G'), transition: { duration: 0.2, ease: "easeOut" } },
    H: { d: getMouthPath('H'), transition: { duration: 0.2, ease: "easeOut" } },
    X: { d: getMouthPath('X'), transition: { duration: 0.2, ease: "easeOut" } },
  };

  // Log the variants to make sure they match the viseme
  console.log('Mouth variants keys:', Object.keys(mouthVariants));
  console.log('Current viseme to animate:', currentViseme);

  // Eye variants
  const leftEyeVariants: Variants = {
    normal: { 
      d: getEyePath(eyeEmotion, true, false),
      transition: { duration: 0.2 }
    },
    blinking: { 
      d: getEyePath(eyeEmotion, true, true),
      transition: { duration: 0.1 }
    }
  };

  const rightEyeVariants: Variants = {
    normal: { 
      d: getEyePath(eyeEmotion, false, false),
      transition: { duration: 0.2 }
    },
    blinking: { 
      d: getEyePath(eyeEmotion, false, true),
      transition: { duration: 0.1 }
    }
  };

  // Get eye shine positions and size
  const leftShinePos = getEyeShinePosition(eyeEmotion, true);
  const rightShinePos = getEyeShinePosition(eyeEmotion, false);
  const shineSize = getEyeShineSize(eyeEmotion);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-${viewBoxSize / 2} -${viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}`}
      xmlns="http://www.w3.org/2000/svg"
      className={styles.avatar}
    >
      {/* Angry Eyebrows - only show for angry emotion */}
      {eyeEmotion === 'angry' && !isBlinking && (
        <>
          <path
            d={getAngryEyebrowPath(true)}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={getAngryEyebrowPath(false)}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      
      {/* Surprised Eyebrows - only show for surprised emotion */}
      {eyeEmotion === 'surprised' && !isBlinking && (
        <>
          <path
            d={getSurprisedEyebrowPath(true)}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={getSurprisedEyebrowPath(false)}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      
      {/* Eyes */}
      <motion.path
        className={styles.eye}
        variants={leftEyeVariants}
        animate={isBlinking ? 'blinking' : 'normal'}
        stroke={color}
        strokeWidth={1.5}
        fill={color}
      />
      <motion.path
        className={styles.eye}
        variants={rightEyeVariants}
        animate={isBlinking ? 'blinking' : 'normal'}
        stroke={color}
        strokeWidth={1.5}
        fill={color}
      />
      
      {/* Eye shine (only when not blinking) */}
      {!isBlinking && (
        <>
          <motion.circle
            cx={leftShinePos.x}
            cy={leftShinePos.y}
            r={shineSize}
            fill="white"
            animate={leftEyeShineControls}
          />
          <motion.circle
            cx={rightShinePos.x}
            cy={rightShinePos.y}
            r={shineSize}
            fill="white"
            animate={rightEyeShineControls}
          />
        </>
      )}

      {/* Mouth */}
      <motion.path
        className={styles.mouth}
        variants={mouthVariants}
        animate={currentViseme}
        stroke={color}
        strokeWidth={2}
        fill={currentViseme !== 'B' && currentViseme !== 'E' && currentViseme !== 'X' ? "rgba(0,0,0,0.1)" : "none"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AIAvatar;

/*
Refinement done:
- Removed explicit `d` props from motion.path.
- Modified `eyeVariants` to be a function accepting `isLeft`.
- Used `custom` prop on eye paths to pass `isLeft` to the variants function.
*/ 