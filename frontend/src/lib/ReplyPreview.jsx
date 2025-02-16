export const ReplyPreview = ({ message, isSender, senderName }) => {
    if (!message.replyTo) return null;
  
    return (
      <div className={`p-2 bg-black/20 rounded-t-lg -mb-1 ${isSender ? 'ml-auto' : 'mr-auto'} max-w-xs`}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-primary rounded-full" />
          <span className="text-sm font-medium">
            Reply to {senderName ? senderName : 'you'}
          </span>
        </div>
        <div className="mt-1 text-sm opacity-80 truncate">
          {message.replyTo.text || (message.replyTo.image ? "Image message" : "")}
        </div>
        {message.replyTo.image && (
          <img 
            src={message.replyTo.image} 
            alt="Replied image" 
            className="h-16 w-16 object-cover rounded mt-1"
          />
        )}
      </div>
    );
  };