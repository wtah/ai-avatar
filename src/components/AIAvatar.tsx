import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
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
  const [chunkIndex, setChunkIndex] = useState(0);
  
  // Refs for animation timers
  const blinkIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visemeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const eyeOffsetX = 15;
  const eyeOffsetY = 0;
  const mouthOffsetY = 25;
  const eyeSize = 10;
  const eyeBlinkHeight = 1;

  // Get mouth path based on viseme
  const getMouthPath = (viseme: Viseme): string => {
    const mouthWidth = 40;
    const halfWidth = mouthWidth / 2;
    const y = mouthOffsetY;
    
    switch (viseme) {
      case 'A': // Open mouth
        return `M -${halfWidth} ${y} Q 0 ${y + 10} ${halfWidth} ${y} Q 0 ${y - 10} -${halfWidth} ${y} Z`;
      case 'B': // Closed mouth
        return `M -${halfWidth} ${y} H ${halfWidth}`;
      case 'C': // Slightly open mouth
        return `M -${halfWidth} ${y} Q 0 ${y + 5} ${halfWidth} ${y} Q 0 ${y - 5} -${halfWidth} ${y} Z`;
      case 'D': // Wide open mouth
        return `M -${halfWidth} ${y} Q 0 ${y + 15} ${halfWidth} ${y} Q 0 ${y - 15} -${halfWidth} ${y} Z`;
      case 'E': // Smile shape
        return `M -${halfWidth} ${y} Q 0 ${y + 15} ${halfWidth} ${y}`;
      case 'F': // Bottom lip touching upper teeth
        return `M -${halfWidth} ${y} Q 0 ${y + 3} ${halfWidth} ${y} Q 0 ${y + 8} -${halfWidth} ${y} Z`;
      case 'G': // Teeth slightly showing
        return `M -${halfWidth} ${y} Q 0 ${y + 2} ${halfWidth} ${y} Q 0 ${y - 8} -${halfWidth} ${y} Z`;
      case 'H': // Rounded lips
        return `M -${halfWidth/1.5} ${y} Q 0 ${y + 8} ${halfWidth/1.5} ${y} Q 0 ${y - 8} -${halfWidth/1.5} ${y} Z`;
      case 'X': // Rest position
      default:
        return `M -${halfWidth} ${y} Q 0 ${y + 3} ${halfWidth} ${y}`;
    }
  };

  // Get eye path based on emotion and blinking state
  const getEyePath = (emotion: EyeEmotion, isLeft: boolean, isBlinking: boolean): string => {
    const x = isLeft ? -eyeOffsetX : eyeOffsetX;
    const y = eyeOffsetY;
    const r = eyeSize;
    
    if (isBlinking) {
      return `M ${x - r} ${y} H ${x + r}`; // Simple line for blinking
    }
    
    switch (emotion) {
      case 'happy':
        return `M ${x - r} ${y} Q ${x} ${y - r * 0.5} ${x + r} ${y}`; // Happy curve
      case 'sad':
        return `M ${x - r} ${y} Q ${x} ${y + r * 0.5} ${x + r} ${y}`; // Sad curve
      case 'angry':
        return `M ${x - r} ${y} Q ${x} ${y + r * 0.3} ${x + r} ${y}`;
      case 'surprised':
        return `M ${x} ${y} m -${r * 1.2}, 0 a ${r * 1.2},${r * 1.2} 0 1,0 ${r * 2.4},0 a ${r * 1.2},${r * 1.2} 0 1,0 -${r * 2.4},0`; // Larger circle
      case 'neutral':
      default:
        return `M ${x} ${y} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`; // Circle
    }
  };

  // Animation variants
  const mouthVariants: Variants = {
    A: { d: getMouthPath('A'), transition: { duration: 0.15, ease: "easeInOut" } },
    B: { d: getMouthPath('B'), transition: { duration: 0.15, ease: "easeInOut" } },
    C: { d: getMouthPath('C'), transition: { duration: 0.15, ease: "easeInOut" } },
    D: { d: getMouthPath('D'), transition: { duration: 0.15, ease: "easeInOut" } },
    E: { d: getMouthPath('E'), transition: { duration: 0.15, ease: "easeInOut" } },
    F: { d: getMouthPath('F'), transition: { duration: 0.15, ease: "easeInOut" } },
    G: { d: getMouthPath('G'), transition: { duration: 0.15, ease: "easeInOut" } },
    H: { d: getMouthPath('H'), transition: { duration: 0.15, ease: "easeInOut" } },
    X: { d: getMouthPath('X'), transition: { duration: 0.15, ease: "easeInOut" } },
  };

  // Log the variants to make sure they match the viseme
  console.log('Mouth variants keys:', Object.keys(mouthVariants));
  console.log('Current viseme to animate:', currentViseme);

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

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-${viewBoxSize / 2} -${viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}`}
      xmlns="http://www.w3.org/2000/svg"
      className={styles.avatar}
    >
      {/* Eyes */}
      <motion.path
        className={styles.eye}
        variants={leftEyeVariants}
        animate={isBlinking ? 'blinking' : 'normal'}
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
      <motion.path
        className={styles.eye}
        variants={rightEyeVariants}
        animate={isBlinking ? 'blinking' : 'normal'}
        stroke={color}
        strokeWidth={2}
        fill="none"
      />

      {/* Mouth */}
      <motion.path
        className={styles.mouth}
        variants={mouthVariants}
        animate={currentViseme}
        stroke={color}
        strokeWidth={2}
        fill="none"
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