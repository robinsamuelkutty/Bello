# Bello

Bello is a **real-time messaging and video conferencing platform** that combines seamless messaging, high-quality video conferencing, and productivity-enhancing tools. It includes AI-powered features such as **real-time translation, message summarization, speech-to-text, text-to-speech, and AI-generated images**.

## 🚀 Features

- **Real-Time Messaging**: Send and receive instant messages with rich text formatting.
- **Video & Voice Calls**: High-quality video and voice calls using ZegoCloud SDK.
- **AI-Powered Features**:
  - **Real-Time Translation** (Live audio captions & message translation)
  - **Message & Voice Note Summarization**
  - **Text-to-Speech & Speech-to-Text (Whisper)**
  - **AI Image Generation (DALL·E)**
- **Decentralized Message Backup & Restore**:
  - Messages backed up to **IPFS**, with CIDs stored on the **blockchain** (Ethereum/Hyperledger).
  - Restore messages using CID stored on the blockchain.
- **User Authentication Backup**:
  - Encrypted user emails stored on **IPFS**.
  - CID stored on blockchain for recovery.
- **Spotify Integration**: Listen to and share music directly in the chat.

## 🛠️ Tech Stack

### **Frontend**
- **React.js** / **Vue.js**
- Tailwind CSS

### **Backend**
- **Node.js** + **Express.js**
- **MongoDB** / **Firebase**
- **WebRTC** / **OpenVidu**
- **ZegoCloud SDK** (Voice/Video Calls)
- **Ethereum / Hyperledger** (Blockchain Backup)
- **Web3.Storage** (IPFS Backup)
- **Google Translate API** / **DeepL API** (Translation)
- **OpenAI APIs** / **AWS Polly** (AI Features)
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
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLOUDINARY_URL=your_cloudinary_url
   ```
4. Start the backend server:
   ```sh
   npm start
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

## 📜 Usage
- **Sign up or log in** to start chatting.
- **Initiate video/voice calls** with other users.
- **Use AI-powered features** for translation, summarization, and more.
- **Backup messages** to IPFS and restore them when needed.
- **Listen to music via Spotify integration**.

## 🔒 Security & Privacy
- **End-to-End Encryption** for messages.
- **Decentralized backup** to prevent data loss.
- **Encrypted email storage** for user authentication recovery.

## 🤝 Contributing
Pull requests are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`feature-branch-name`).
3. Commit your changes and push to the branch.
4. Open a pull request.

## 📜 License
This project is licensed under the **MIT License**.

## 🌍 Connect with Us
- **Email**: support@belloapp.com
- **GitHub**: [github.com/yourusername/bello](https://github.com/yourusername/bello)
- **Twitter**: [@BelloApp](https://twitter.com/BelloApp)

