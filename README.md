# AI Avatar

A responsive, interactive React component that creates an animated SVG avatar with real-time speech visualization and customizable emotions.

![AI Avatar Demo](public/ai-avatar-demo.png)

## Features

- **Real-time Speech Visualization**: Maps text characters to mouth shapes (visemes) to simulate speech
- **Expressive Eyes**: Includes natural blinking, random eye movements, and 5 emotional states (neutral, happy, sad, angry, surprised)
- **Natural Behavior**: Random eye distraction and occasional smiling when in neutral state for a more lifelike appearance
- **Stylish Mouth Shapes**: Smooth, geometric mouth animations with appropriate shapes for different phonemes
- **Fully Customizable**: Control size, color, and animation speed
- **Lightweight SVG**: Built with Framer Motion for smooth animations
- **Simple Integration**: Easy to implement in any React project

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-avatar.git

# Navigate to the project folder
cd ai-avatar

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

```jsx
import AIAvatar from './components/AIAvatar';

function YourComponent() {
  return (
    <AIAvatar 
      textChunks={["H", "e", "l", "l", "o"]} 
      isSpeaking={true}
      eyeEmotion="happy"
      size={200}
      color="#000000"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| textChunks | string[] | [] | Array of text characters to animate |
| isSpeaking | boolean | false | Whether the avatar is speaking |
| eyeEmotion | 'neutral' \| 'happy' \| 'sad' \| 'angry' \| 'surprised' | 'neutral' | Emotion to display in the avatar's eyes |
| size | number | 200 | Size of the avatar in pixels |
| color | string | '#000000' | Color of the avatar's features |

## How It Works

The avatar maps each character to a specific mouth shape (viseme) to create a natural speaking animation:

- **Vowels** (a, e, i, o, u): Different degrees of open mouth
- **Plosives** (b, p, m): Closed lips
- **Fricatives** (f, v): Bottom lip touching upper teeth
- **Other consonants**: Various appropriate mouth shapes
- **Punctuation**: Rest position or specific expressions

The eyes feature several natural behaviors:
- Random blinking at natural intervals
- Occasional glancing to the side (eye distraction effect)
- When in neutral emotion and not speaking, random subtle smiles to appear friendly
- Five emotional states affecting eye shape and eyebrow position

All animations use smooth transitions with cubic Bézier curves for a polished appearance.

## Demo

The included demo application allows you to:

1. Type in real-time and see the avatar speak your words
2. Change the avatar's eye emotion
3. Adjust speaking speed
4. Change the avatar's color

## Technologies

- React
- TypeScript
- Framer Motion
- CSS Modules

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
