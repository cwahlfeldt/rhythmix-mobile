# RhythMix Mobile

A modern rhythm game built with React Native and Expo where players tap notes in sync with music. Features dynamic note patterns, scoring system, and high score tracking.

## Features

- 🎵 Synchronized music and gameplay
- 🎮 3-lane rhythm-based gameplay
- 💯 Scoring system with combos
- 🏆 High score tracking
- ⏯️ Pause and resume functionality
- 🎨 Clean, modern UI design

## Technical Stack

- React Native with Expo
- TypeScript for type safety
- Expo AV for audio handling
- React Navigation for routing
- AsyncStorage for local data persistence
- Reanimated for smooth animations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rhythmix-mobile.git
cd rhythmix-mobile
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Follow the Expo CLI instructions to run on your desired platform (iOS/Android)

## Gameplay

- Tap the lanes when notes reach the beat line at the bottom
- Perfect timing yields maximum points and increases your combo
- Missing notes breaks your combo and deducts points
- Try to achieve the highest score possible!

### Controls

- Tap the lanes to hit notes
- Pause button in top-right corner
- Resume or quit from pause menu

### Scoring System

The game features a precise timing-based scoring system:

| Rating  | Timing Window | Points |
|---------|--------------|--------|
| PERFECT | ±50ms        | 1000   |
| GOOD    | ±100ms       | 700    |
| MID     | ±150ms       | 400    |
| BAD     | ±200ms       | 100    |
| MISS    | >±200ms      | 0      |

- Hitting notes within these timing windows awards the corresponding points
- Missing notes breaks your combo
- Maintain high accuracy for the best scores!

## Project Structure

```
rhythmix-mobile/
├── app/                    # Main application screens
├── assets/                 # Images, fonts, and audio files
├── components/            
│   ├── game/              # Game-specific components
│   └── ui/                # Reusable UI components
├── constants/             # Global constants and themes
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Development

data schema that is used to create the gameplay.

```json
{
  "_object_with_fields": {
    "success": "boolean",
    "data": {
      "_object_with_fields": {
        "metadata": {
          "_object_with_fields": {
            "bpm": "number",
            "difficulty": "number",
            "duration": "number",
            "name": "string",
            "recommended_scroll_speed": "number"
          }
        },
        "notes": {
          "_array_of": [
            {
              "_object_with_fields": {
                "intensity": "number",
                "lane": "number",
                "timestamp": "number",
                "type": "string"
              }
            }
          ]
        },
        "sections": {
          "_array_of": [
            "empty"
          ]
        }
      }
    }
  }
}
```

### Adding New Songs

Songs are defined using the following structure:

```typescript
interface SongMetadata {
    name: string;
    bpm: number;
    difficulty: number;
    duration: number;
    recommended_scroll_speed: number;
}
```

Place song files in the `assets/` directory and update the song data accordingly.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Uses [React Native](https://reactnative.dev/)
- Sound handling with [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
