# Bello

Bello is a **real-time messaging and video conferencing platform** that combines seamless messaging, high-quality video conferencing, and productivity-enhancing tools. It includes AI-powered features such as **real-time translation, message summarization, speech-to-text, text-to-speech, and AI-generated images**.

##  Features

- **Real-Time Messaging**: Send and receive instant messages with rich text formatting.
- **Video & Voice Calls**: High-quality video and voice calls using ZegoCloud SDK.
- **AI-Powered Features**:
  - **Multi Language Translation** 
  - **Message  Note Summarization**
  - **Text-to-Speech (WebSpeech)**
  - **AI Personal Assistant  (Gemini API)**
- **Decentralized Message Backup & Restore**:
  - Messages backed up to **IPFS**, with CIDs stored on the **blockchain** (Ethereum).
  - Restore messages using CID stored on the blockchain.
- **User Authentication Backup**:
  - Encrypted user emails stored on **IPFS**.
  - CID stored on blockchain for recovery.
- **Spotify Integration**: Listen to and share music directly in the chat.

## Tech Stack

### **Frontend**
- **React.js** 
- Tailwind CSS

### **Backend**
- **Node.js** + **Express.js**
- **MongoDB** 
- **WebRTC** 
- **ZegoCloud SDK** (Voice/Video Calls)
- **Ethereum  (Blockchain Backup)
- **Pinata** (IPFS Backup)
- **Google Translate API** (Translation)
- **OpenAI APIs** (AI Features)
- **Spotify Web API** (Music Integration)

## 🔧 Installation & Setup

### **Backend Setup**
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/bello.git
   cd bello/backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables in `.env`:
   ```sh
   PORT=5001
   MONGODB_URI=
   JWT_SECRET=

   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=

   ZEGO_APP_ID=
   ZEGO_SERVER_SECRET=
   VITE_GEMINI_API_KEY=

   SPOTIFY_CLIENT_ID=
   SPOTIFY_CLIENT_SECRET=
   SPOTIFY_REDIRECT_URI=http://localhost:5001/auth/spotify/callback
   NODE_ENV=development

   ```
4. Start the backend server:
   ```sh
   npm run dev
   ```

### **Frontend Setup**
1. Navigate to the frontend directory:
   ```sh
   cd ../frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend server:
   ```sh
   npm run dev
   ```

##  Usage
- **Sign up or log in** to start chatting.
- **Initiate video/voice calls** with other users.
- **Use AI-powered features** for translation, summarization, and more.
- **Backup messages** to IPFS and restore them when needed.
- **Listen to music via Spotify integration**.

##  Security & Privacy
- **End-to-End Encryption** for messages.
- **Decentralized backup** to prevent data loss.
- **Encrypted email storage** for user authentication recovery.

##  Contributing
Pull requests are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`feature-branch-name`).
3. Commit your changes and push to the branch.
4. Open a pull request.



