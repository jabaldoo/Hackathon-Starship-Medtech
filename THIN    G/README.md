# Medical Chatbot Mobile App

A React Native mobile application that integrates with local LLM servers to provide medical information and assistance. The app prioritizes privacy by processing queries locally on the device.

## Features

- **Local LLM Integration**: Works with Ollama and other local LLM servers
- **Privacy-Focused**: All processing happens locally unless explicitly configured otherwise
- **Medical Disclaimer**: Comprehensive disclaimer system to ensure safe usage
- **Chat Interface**: Modern, intuitive chat interface using Gifted Chat
- **Configurable Settings**: Easy configuration of LLM endpoints and parameters
- **Cross-Platform**: Works on both iOS and Android

## Prerequisites

1. **Node.js** (v16 or higher)
2. **React Native CLI**
3. **Local LLM Server** (Ollama recommended)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Local LLM Server (Ollama)

#### For Windows:
```bash
# Install Ollama
# Download from https://ollama.ai/

# Start Ollama server
ollama serve

# Download a medical-friendly model
ollama pull llama2
# or for better medical responses
ollama pull mistral
```

#### For Mac/Linux:
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama server
ollama serve

# Download a model
ollama pull llama2
```

### 3. Run the App

#### For Android:
```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android
```

#### For iOS:
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS simulator/device
npm run ios
```

## Configuration

1. Open the app and accept the medical disclaimer
2. Go to Settings (gear icon in chat screen)
3. Configure your LLM server settings:
   - **Endpoint**: `http://localhost:11434` (default for Ollama)
   - **Model**: `llama2` or whatever model you downloaded
   - **Temperature**: 0.7 (recommended for balanced responses)
   - **Max Tokens**: 1000 (recommended length)

4. Test the connection using the "Test Connection" button

## Alternative LLM Servers

The app supports any local LLM server with OpenAI-compatible API:

### LM Studio
1. Download and install LM Studio
2. Load a model
3. Start the local server
4. Use endpoint: `http://localhost:1234/v1`
5. Model name: whatever model you loaded

### Custom Server
Configure with your server's endpoint and model name in settings.

## Safety Features

- **Medical Disclaimer**: Users must accept disclaimer before using
- **No Diagnoses**: AI is programmed to avoid providing specific medical diagnoses
- **Emergency Guidance**: Automatically suggests emergency care for serious symptoms
- **Professional Referral**: Always recommends consulting healthcare professionals
- **Local Processing**: Data stays on device by default for maximum privacy

## File Structure

```
src/
├── App.js                 # Main app component
├── screens/
│   ├── ChatScreen.js      # Chat interface
│   ├── SettingsScreen.js  # Configuration screen
│   └── DisclaimerScreen.js # Medical disclaimer
├── services/
│   └── LLMService.js      # LLM integration service
└── assets/               # App assets
```

## Troubleshooting

### Connection Issues
1. Ensure your LLM server is running
2. Check the endpoint URL in settings
3. Verify the model name matches what you downloaded
4. Test connection in settings screen

### Model Not Found
1. List available models: `ollama list`
2. Download a model: `ollama pull <model-name>`
3. Update model name in app settings

### Performance Issues
1. Reduce max tokens in settings
2. Lower temperature for faster responses
3. Use smaller models if available

## Privacy

This app is designed with privacy in mind:
- All medical queries are processed locally by default
- No data is sent to external servers unless explicitly configured
- Chat history is stored locally on the device
- No analytics or tracking included

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Important Medical Disclaimer

This application provides AI-generated medical information for educational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns.
