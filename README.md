# Her - Visual Assistant for the Visually Impaired

![Her Logo](assets/icon.png)

Her is an innovative assistive application designed to empower visually impaired individuals by providing real-time environmental awareness and memory capture capabilities. Built with accessibility at its core, Her uses advanced AI and computer vision technologies to narrate surroundings and help users understand their environment.

## 🌟 Features

### Core Features

- 📸 Real-time camera access with video recording and photo capture
- 🎥 Customizable video recording with adjustable frame counts (1-10 frames)
- 📱 Intuitive, accessibility-first user interface
- ✋ Haptic feedback for enhanced user interaction
- 💾 Memory storage and review system

### Technical Features

- Built with Expo and React Native for cross-platform compatibility
- Real-time camera processing using Expo Camera
- Haptic feedback integration using Expo Haptics
- Tab-based navigation system
- Modal interactions for settings and preferences

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for development)
- Physical device for testing camera features

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/her.git
cd her
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

4. Run on your device:

- Scan the QR code with Expo Go (Android) or Camera app (iOS)
- Press 'i' for iOS simulator
- Press 'a' for Android emulator

## 🏗️ Project Structure

```
her/
├── app/                    # Main application code
│   ├── _layout.tsx        # Root layout component
│   ├── index.tsx          # Entry point
│   ├── video.tsx          # Video recording screen
│   ├── photo.tsx          # Photo capture screen
│   └── memories.tsx       # Memories review screen
├── assets/                # Static assets
│   ├── images/           # Image assets
│   └── fonts/            # Font files
├── components/           # Reusable components
│   ├── Camera.tsx        # Camera component
│   ├── FrameCounter.tsx  # Frame counter component
│   └── MemoryCard.tsx    # Memory display component
├── hooks/               # Custom React hooks
├── utils/              # Utility functions
├── constants/          # App constants
└── types/             # TypeScript type definitions
```

## 🔧 Technical Implementation

### Camera Integration

- Uses Expo Camera for device camera access
- Implements frame-by-frame video recording
- Handles camera permissions and error states

### Accessibility Features

- Large, high-contrast UI elements
- Haptic feedback for all interactions
- Voice-over compatible interface
- Screen reader optimization

### State Management

- React Context for global state
- Local storage for memory persistence
- Camera state management

## 🎯 Future Development

### Planned Features

- Real-time AI-powered narration
- Object recognition and description
- Voice command integration
- Offline mode support
- Smart glasses compatibility
- Pocket pin camera support

### Technical Roadmap

1. **Phase 1 (Current)**

   - MVP implementation
   - Basic camera functionality
   - Core accessibility features

2. **Phase 2 (Next 3-6 months)**

   - AI integration
   - Basic narration system
   - Enhanced memory management

3. **Phase 3 (6-12 months)**
   - Advanced AI features
   - Voice command system
   - Expanded device support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Expo team for the amazing framework
- React Native community
- All our beta testers and contributors

## 📞 Support

For support, please:

- Open an issue in the GitHub repository
- Contact the development team at support@her-app.com
- Join our community Discord server

## 🔄 Updates

Stay updated with our latest changes by:

- Following our GitHub repository
- Subscribing to our newsletter
- Following our social media channels

---

Built with ❤️ for the visually impaired community
