import { useState, useEffect, useRef } from 'react'
import AIAvatar, { EyeEmotion } from './components/AIAvatar'
import './App.css'

// Sample text for demonstration
const sampleText = "Start typing here and I will speak in real-time!";

function App() {
  const [eyeEmotion, setEyeEmotion] = useState<EyeEmotion>('neutral')
  const [color, setColor] = useState('#000000')
  const [textChunks, setTextChunks] = useState<string[]>([])
  const [inputText, setInputText] = useState(sampleText)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [streamingSpeed, setStreamingSpeed] = useState(100) // ms per token
  
  // Refs for streaming simulation
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentTokenRef = useRef<number>(0);
  const tokensToStreamRef = useRef<string[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypedTextRef = useRef<string>("");
  
  console.log('App render:', { 
    textChunks, 
    isSpeaking, 
    currentToken: currentTokenRef.current,
    totalTokens: tokensToStreamRef.current.length 
  });

  // Process text into chunks for viseme animation
  const processText = (text: string) => {
    // Only process the new characters that were added
    const newTextPortion = text.slice(lastTypedTextRef.current.length);
    console.log('Processing new text:', { newTextPortion });
    
    if (newTextPortion.length > 0) {
      // Split new text portion into individual characters
      const newChunks = newTextPortion.split('');
      tokensToStreamRef.current = [...tokensToStreamRef.current, ...newChunks];
      lastTypedTextRef.current = text;
      
      if (!isSpeaking) {
        setIsSpeaking(true);
      }
    }
  }

  // Handle streaming of tokens
  const streamNextToken = () => {
    console.log('Stream next token called:', { 
      isSpeaking, 
      currentToken: currentTokenRef.current,
      totalTokens: tokensToStreamRef.current.length 
    });
    
    if (!isSpeaking) return;
    
    if (currentTokenRef.current < tokensToStreamRef.current.length) {
      // Add the next token to the displayed chunks
      const newToken = tokensToStreamRef.current[currentTokenRef.current];
      console.log('Adding new token:', newToken);
      
      setTextChunks(prev => {
        // Limit the number of chunks to prevent memory issues
        const maxChunks = 20; // Keep fewer chunks for real-time typing
        const updatedChunks = [...prev, newToken];
        
        if (updatedChunks.length > maxChunks) {
          return updatedChunks.slice(-maxChunks);
        }
        
        return updatedChunks;
      });
      
      // Advance to next token
      currentTokenRef.current++;
      
      // Schedule the next token with a consistent speed
      streamTimerRef.current = setTimeout(streamNextToken, streamingSpeed);
    } else if (tokensToStreamRef.current.length > 0) {
      // If we've processed all tokens but user is still typing (new tokens might come)
      // Just wait for more input instead of stopping speaking
      streamTimerRef.current = setTimeout(streamNextToken, streamingSpeed);
    } else {
      // No tokens to stream and no typing activity
      setIsSpeaking(false);
    }
  };

  // Handle text input - now processes text in real-time
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    
    // Reset typing timeout (used to detect when user stops typing)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a timeout to detect when user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      console.log('User stopped typing');
      // If there are no more tokens to process, stop speaking
      if (currentTokenRef.current >= tokensToStreamRef.current.length) {
        setIsSpeaking(false);
      }
    }, 1500); // 1.5 seconds of inactivity is considered "stopped typing"
    
    // Process the new text
    processText(newText);
  }

  // Handle emotion button clicks
  const handleEmotionChange = (emotion: EyeEmotion) => {
    setEyeEmotion(emotion);
  }

  // Handle streaming speed changes
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStreamingSpeed(Number(e.target.value));
  }

  // Reset everything
  const handleReset = () => {
    if (streamTimerRef.current) {
      clearTimeout(streamTimerRef.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setIsSpeaking(false);
    setInputText("");
    setTextChunks([]);
    tokensToStreamRef.current = [];
    currentTokenRef.current = 0;
    lastTypedTextRef.current = "";
  }

  // Effect to start streaming when speaking state changes
  useEffect(() => {
    console.log('isSpeaking effect triggered:', isSpeaking);
    if (isSpeaking) {
      console.log('Starting token streaming');
      streamNextToken();
    }
    
    return () => {
      if (streamTimerRef.current) {
        clearTimeout(streamTimerRef.current);
      }
    };
  }, [isSpeaking]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="App">
      <h1>Real-time AI Avatar</h1>
      
      {/* Avatar with selected emotion and color */}
      <div 
        style={{ 
          marginBottom: '30px',
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <AIAvatar 
          eyeEmotion={eyeEmotion} 
          size={200} 
          color={color}
          textChunks={textChunks}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* Speaking status */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{
          display: 'inline-block',
          padding: '5px 10px',
          borderRadius: '5px',
          background: isSpeaking ? '#4CAF50' : '#f44336',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {isSpeaking ? 'Speaking...' : 'Silent'}
        </span>
      </div>

      {/* Emotion controls */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Eye Emotions</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleEmotionChange('neutral')}
            style={{ 
              background: eyeEmotion === 'neutral' ? '#ddd' : '#fff',
              fontWeight: eyeEmotion === 'neutral' ? 'bold' : 'normal'
            }}
          >
            Neutral
          </button>
          <button 
            onClick={() => handleEmotionChange('happy')}
            style={{ 
              background: eyeEmotion === 'happy' ? '#ddd' : '#fff',
              fontWeight: eyeEmotion === 'happy' ? 'bold' : 'normal'
            }}
          >
            Happy
          </button>
          <button 
            onClick={() => handleEmotionChange('sad')}
            style={{ 
              background: eyeEmotion === 'sad' ? '#ddd' : '#fff',
              fontWeight: eyeEmotion === 'sad' ? 'bold' : 'normal'
            }}
          >
            Sad
          </button>
          <button 
            onClick={() => handleEmotionChange('angry')}
            style={{ 
              background: eyeEmotion === 'angry' ? '#ddd' : '#fff',
              fontWeight: eyeEmotion === 'angry' ? 'bold' : 'normal'
            }}
          >
            Angry
          </button>
          <button 
            onClick={() => handleEmotionChange('surprised')}
            style={{ 
              background: eyeEmotion === 'surprised' ? '#ddd' : '#fff',
              fontWeight: eyeEmotion === 'surprised' ? 'bold' : 'normal'
            }}
          >
            Surprised
          </button>
        </div>
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Color</h3>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ width: '50px', height: '30px' }}
        />
      </div>

      {/* Text input */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Type to Speak</h3>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <textarea
            value={inputText}
            onChange={handleTextChange}
            placeholder="Type here and I'll speak in real-time!"
            rows={4}
            cols={40}
            style={{ 
              padding: '12px', 
              fontFamily: 'inherit',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid #ccc'
            }}
          />
          
          {/* Streaming speed control */}
          <div style={{ width: '100%', maxWidth: '320px', margin: '10px 0' }}>
            <label htmlFor="speed">Speaking Speed: {streamingSpeed}ms per token</label>
            <input
              id="speed"
              type="range"
              min="50"
              max="300"
              step="10"
              value={streamingSpeed}
              onChange={handleSpeedChange}
              style={{ width: '100%' }}
            />
          </div>
          
          {/* Reset button */}
          <button 
            onClick={handleReset} 
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Clear & Reset
          </button>
        </div>
      </div>

      {/* Viseme explanation */}
      <div style={{ fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
        <h3>How it works:</h3>
        <p>
          Simply start typing in the text box above, and the avatar will speak as you type.
          When you stop typing for 1.5 seconds, the avatar will stop speaking.
          The avatar's mouth shapes (visemes) are determined by the letters you type.
        </p>
      </div>
    </div>
  )
}

export default App
