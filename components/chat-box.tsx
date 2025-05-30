"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "./ui/button";
import { SendHorizontal, Loader2, Mic, MicOff, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const ChatBox = ({ messages, setMessages }) => {
  const params = useParams();
  const uuid = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup recording interval on unmount
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingInterval]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data); 
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }

      // Process the recorded audio
      setTimeout(() => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        sendAudioMessage(audioBlob);
      }, 100);
    }
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
    // Initially add a placeholder message with loading animation
    const placeholderMessage: Message = { 
      type: "user", 
      text: "",
      timestamp: formatTimestamp(),
      isAudio: true,
      isProcessing: true
    };
    
    setMessages((prev) => [...prev, placeholderMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      formData.append('uuid', uuid);

      // Audio endpoint for voice messages
      const res = await fetch("https://voiceiq-db.indominuslabs.in/voice_chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success") {
        // Update the placeholder message with the actual user prompt
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessageIndex = updatedMessages.length - 1;
          
          // Update the user message with the transcribed text
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            text: data.user_prompt || "Voice message processed",
            isProcessing: false
          };
          
          return updatedMessages;
        });

        // Add bot response
        const botMessage: Message = {
          type: "bot",
          text: data.content,
          timestamp: formatTimestamp()
        };
        
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Update placeholder with error message
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessageIndex = updatedMessages.length - 1;
          
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            text: "Failed to process voice message",
            isProcessing: false
          };
          
          return updatedMessages;
        });

        const errorMessage: Message = {
          type: "bot",
          text: "Sorry, I couldn't process that audio message.",
          timestamp: formatTimestamp()
        };
        
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      // Update placeholder with error message
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const lastMessageIndex = updatedMessages.length - 1;
        
        updatedMessages[lastMessageIndex] = {
          ...updatedMessages[lastMessageIndex],
          text: "Network error occurred",
          isProcessing: false
        };
        
        return updatedMessages;
      });

      const errorMessage: Message = {
        type: "bot", 
        text: "Network error. Please try again later.",
        timestamp: formatTimestamp()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setRecordingTime(0);
    }
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
        Ask a question about this call or send a voice message to get started
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
                    {msg.isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1.2s' }}></div>
                          <div className="h-4 w-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '200ms', animationDuration: '1.2s' }}></div>
                          <div className="h-3 w-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '400ms', animationDuration: '1.2s' }}></div>
                          <div className="h-2 w-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '600ms', animationDuration: '1.2s' }}></div>
                          <div className="h-3 w-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '800ms', animationDuration: '1.2s' }}></div>
                        </div>
                        <span className="text-xs opacity-75">Processing audio...</span>
                      </div>
                    ) : (
                      msg.text
                    )}
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

      {/* Recording indicator */}
      {isRecording && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center justify-center gap-2 text-sm text-red-600">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            <span>Recording... {formatRecordingTime(recordingTime)}</span>
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
          onKeyDown={(e) => e.key === "Enter" && !isRecording && handleSend()}
          disabled={isLoading || isRecording}
        />
        
        {/* Audio recording button */}
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          size="sm"
          className={cn(
            "rounded-full h-10 w-10 p-0 flex items-center justify-center flex-shrink-0",
            isRecording 
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          {isRecording ? (
            <Square size={18} className="fill-current" />
          ) : (
            <Mic size={18} />
          )}
        </Button>

        {/* Text send button */}
        <Button
          onClick={handleSend}
          disabled={input.trim() === "" || isLoading || isRecording}
          size="sm"
          className={cn(
            "rounded-full h-10 w-10 p-0 flex items-center justify-center flex-shrink-0",
            input.trim() === "" || isRecording 
              ? "bg-muted text-muted-foreground" 
              : "bg-primary hover:bg-primary/90"
          )}
        >
          <SendHorizontal size={18} className="text-primary-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;