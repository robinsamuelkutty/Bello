import { Copy, Edit, Forward, Reply, Trash2, Languages,ChevronDown ,ChevronUp,Volume2,FileText} from "lucide-react";
import { useState } from "react";

export const MessageActions = ({ message, onAction, isSender }) => {
  const wordCount = message.text ? message.text.split(/\s+/).length : 0;
  const [showLanguages, setShowLanguages] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" }
  ];

  return (
    <div className={`absolute top-full ${isSender ? 'right-0' : 'left-0'} mt-2 bg-base-200 rounded-lg shadow-lg border border-base-300 w-40 z-10`}>
      <ul className="py-1">
        {!isSender && (
          <li>
            <button 
              onClick={() => onAction('reply', message)}
              className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300"
            >
              <Reply className="size-4" />
              Reply
            </button>
          </li>
        )}
        <li>
          <button 
            onClick={() => onAction('copy', message)}
            className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300"
          >
            <Copy className="size-4" />
            Copy
          </button>
        </li>
        <li>
          <button 
            onClick={() => onAction('forward', message)}
            className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300"
          >
            <Forward className="size-4" />
            Forward
          </button>
        </li>
        {isSender && (
          <li>
            <button 
              onClick={() => onAction('edit', message)}
              className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300"
            >
              <Edit className="size-4" />
              Edit
            </button>
          </li>
        )}
        {wordCount > 50 && (
          <li>
            <button 
              onClick={() => onAction('summarize', message)}
              className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300"
            >
              <FileText className="size-4" />  {/* Icon for Summarize */}
              Summarize
            </button>
          </li>
        )}
        <li>
          <button 
            onClick={() => setShowLanguages(!showLanguages)}
            className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300 justify-between"
          >
            <div className="flex items-center gap-2">
              <Languages className="size-4" />
              Translate
            </div>
            {showLanguages ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </button>
          {showLanguages && (
            <div className="ml-4 my-1 max-h-40 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onAction('translate', { ...message, targetLanguage: lang.code });
                    console.log("Translate lang.code", lang.code);
                    setShowLanguages(false);
                  }}
                  className="w-full px-4 py-1 text-xs hover:bg-base-300 text-left"
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </li>
        <li>
          <button 
            onClick={() => onAction('delete', message)}
            className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </li>
        <li>
          <button
            onClick={() => onAction('readAloud', message)}
            className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300"
          >
            <Volume2 className="size-4" />
            Read Aloud
          </button>
        </li>
      </ul>
    </div>
  );
};