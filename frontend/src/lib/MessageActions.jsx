import {  Copy, Edit, Forward, Reply,Trash2 } from "lucide-react";

export const MessageActions = ({ message, onAction, isSender }) => {
    return (
      <div className={`absolute top-full ${isSender ? 'right-0' : 'left-0'} mt-2 bg-base-200 rounded-lg shadow-lg border border-base-300 w-36 z-10`}>
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
          <li>
          {isSender && (
            <button 
              onClick={() => onAction('edit', message)}
              className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-base-300"
            >
              <Edit className="size-4" />
              Edit
            </button>
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
        </ul>
      </div>
    );
  };