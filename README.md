# Rhythmix Mobile

A modern rhythm game built with Expo React Native that challenges players to tap along with the beat of songs. Features dynamic note patterns, scoring system, and high score tracking.

## Features

- **Dynamic Gameplay**: Three-lane rhythm game with notes that fall in sync with the music
- **Scoring System**: Multiple scoring tiers (Perfect, Good, Mid, Bad, Miss) based on timing accuracy
- **Combo System**: Build up combos for higher scores
- **High Score Tracking**: Local storage of high scores for each song
- **Responsive Design**: Works on various screen sizes
- **Haptic Feedback**: Tactile response for successful note hits
- **Visual Feedback**: Dynamic animations and effects for gameplay events

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo Go app installed on your mobile device

## Installation

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

4. Scan the QR code with Expo Go (Android) or the Camera app (iOS)

## Game Controls

- **Tap Lanes**: Tap the bottom of each lane when a note aligns with the beat line
- **Pause**: Tap the pause button in the top-right corner
- **Resume/Quit**: Use the pause menu options to continue or exit the game

## Scoring System

- **Perfect**: ±50ms from perfect timing (1000 points)
- **Good**: ±100ms from perfect timing (700 points)
- **Mid**: ±150ms from perfect timing (400 points)
- **Bad**: ±200ms from perfect timing (100 points)
- **Miss**: >±200ms from perfect timing (0 points)

## Song Format

Songs are stored in JSON format with the following structure:

```json
{
  "success": true,
  "data": {
    "metadata": {
      "name": "song_name",
      "encoded_song": "base64_encoded_mp3_song",
      "bpm": 175.78125000001936,
      "difficulty": 0.3662109375000403,
      "duration": 239.57333333331547,
      "recommended_scroll_speed": 3.6621093750004032
    },
    "notes": [
      {
        "intensity": 0.9,
        "lane": 0,
        "timestamp": 0.3413333333333334,
        "type": "tap"
      }
    ],
    "sections": [
      {
        "start_time": 0.0,
        "end_time": 12.0,
        "intensity": 0.7326608538627625,
        "section_type": "Intro"
      }
    ]
  }
}
```

## Development

The project uses:
- Expo Router for navigation
- Expo AV for audio playback
- AsyncStorage for high score persistence
- React Native Reanimated for smooth animations
- TypeScript for type safety

## Project Structure

```
rhythmix-mobile/
├── app/                    # Main application screens
│   ├── _layout.tsx        # Root layout with navigation setup
│   ├── index.tsx          # Start screen
│   ├── songs.tsx          # Song selection screen
│   └── game.tsx           # Main gameplay screen
├── assets/                # Static assets (images, fonts, songs)
├── components/            # Reusable components
│   ├── game/             # Game-specific components
│   │   ├── NoteBlock.tsx # Falling note component
│   │   ├── BeatLine.tsx  # Target line component
│   │   └── ScoreDisplay.tsx # Score and combo display
│   └── ...               # Other shared components
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
