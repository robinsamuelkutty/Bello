import { MessageSquareQuote } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const NoChatSelected = () => {
  const { theme } = useThemeStore();

  return (
    <div className="flex flex-1 items-center justify-center" data-theme={theme}>
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl shadow-lg bg-base-100">
        <MessageSquareQuote className="h-16 w-16 text-primary animate-bounce" />
        <p className="text-gray-600 text-lg font-semibold">
          Select a Conversation to get started!
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
