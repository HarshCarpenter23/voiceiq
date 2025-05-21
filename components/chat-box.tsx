"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "./ui/button";
import { SendHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  type: "user" | "bot";
  text: string;
  timestamp: string;
};

const ChatBox = () => {
  const params = useParams();
  const uuid = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (input.trim() === "") return;
    
    const userMessage: Message = { 
      type: "user", 
      text: input,
      timestamp: formatTimestamp()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("https://voiceiq-db.indominuslabs.in/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_prompt: input, uuid }),
      });

      const data = await res.json();

      const botMessage: Message = {
        type: "bot",
        text:
          data.status === "success"
            ? data.content
            : "Sorry, I couldn't process that request.",
        timestamp: formatTimestamp()
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        type: "bot", 
        text: "Network error. Please try again later.",
        timestamp: formatTimestamp()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Empty state message
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <SendHorizontal className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-foreground font-medium mb-2">No messages yet</h3>
      <p className="text-muted-foreground text-sm">
        Ask a question about this call to get started
      </p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-background rounded-lg overflow-hidden border border-border shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-3",
                  msg.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.type === "bot" && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    AI
                  </div>
                )}
                
                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-sm",
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto rounded-tr-none"
                        : "bg-muted text-foreground mr-auto rounded-tl-none"
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
                
                {msg.type === "user" && (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                    You
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {isLoading && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-border flex items-center gap-2">
        <input
          type="text"
          className="flex-1 p-2 px-3 bg-muted/50 text-foreground rounded-full outline-none focus:ring-1 focus:ring-primary/40 focus:bg-background transition-colors"
          placeholder="Ask about this call..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={input.trim() === "" || isLoading}
          size="sm"
          className={cn(
            "rounded-full h-9 w-9 p-0 flex items-center justify-center",
            input.trim() === "" ? "bg-muted text-muted-foreground" : "bg-primary hover:bg-primary/90"
          )}
        >
          <SendHorizontal size={16} className="text-primary-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;

// export default ChatBox;