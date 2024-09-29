import React, { useEffect, memo } from "react";

interface Message {
  role: "assistant" | "user";
  content?: string;
  status?: "thinking";
  imageUrl?: string; // For displaying image results
}

interface ChatAreaProps {
  messages: Message[];
  scrollToBottom: () => void;
}

const Loading: React.FC = () => (
  <div className="mb-4 flex justify-start last:mb-0">
    <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-100 px-4 py-2">
      <div className="flex justify-center">
        <div className="loader-dots relative mt-3 block h-5 w-20">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="absolute h-3 w-3 rounded-full bg-gray-500" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MessageBubble: React.FC<{ message: Message }> = memo(({ message }) => {
  const isAssistant = message.role === "assistant";
  return (
    <div className={`mb-4 flex ${isAssistant ? "justify-start" : "justify-end"} last:mb-0`}>
      <div className={`whitespace-pre-wrap rounded-xl px-4 py-2 ${
        isAssistant 
          ? "border border-gray-200 bg-gray-100" 
          : "bg-blue-500 text-white"
      }`}>
        {message.content && <p>{message.content}</p>}
        {message.imageUrl && <img src={message.imageUrl} alt="Image result" />}
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

const ChatArea: React.FC<ChatAreaProps> = ({ messages, scrollToBottom }) => {
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <>
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
    </>
  );
};

export default ChatArea;
