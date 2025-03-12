import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

const TextToSpeech = ({ text }) => {
  const [voice, setVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isSpeechSupported = 'speechSynthesis' in window;

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === 'Microsoft David - English (United States)');
      setVoice(selectedVoice || voices[0]); // Fallback to the first available voice
      setIsLoading(false);
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

  const handleReadAloud = () => {
    if (!text) {
      console.error("No text provided to read aloud.");
      return;
    }

    if (voice) {
      speechSynthesis.cancel(); // Cancel ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = 'en-US';
      utterance.rate = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    } else {
      console.error("Voice not found.");
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!isSpeechSupported) {
    return <p>Text-to-speech is not supported in your browser.</p>;
  }

  if (isLoading) {
    return <p>Loading voices...</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleReadAloud}
        disabled={isSpeaking}
        aria-label={isSpeaking ? "Stop reading aloud" : "Read aloud"}
        className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300"
      >
        <Volume2 className="size-4" />
        {isSpeaking ? "Speaking..." : "Read Aloud"}
      </button>
      {isSpeaking && (
        <button
          onClick={handleStop}
          className="px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300"
        >
          Stop
        </button>
      )}
    </div>
  );
};

export default TextToSpeech;