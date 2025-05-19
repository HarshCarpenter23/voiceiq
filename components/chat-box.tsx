"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "./ui/button";
import { IoMdSend } from "react-icons/io";
type Message = {
    type: "user" | "bot";
    text: string;
};

const ChatBox = () => {
    const params = useParams();
    const uuid = params?.id as string;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    const handleSend = async () => {
        if (input.trim() === "") return;

        const userMessage: Message = { type: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);

        setInput("");

        try {
            const res = await fetch("http://172.105.54.63:8000/chat", {
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
                        : "Error: could not get a response.",
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { type: "bot", text: "Network error. Try again later." },
            ]);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-black text-white border border-gray-700 rounded-2xl shadow-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`p-2 rounded-lg max-w-[80%] ${msg.type === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 text-white"
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-700 flex items-center gap-2">
                <input
                    type="text"
                    className="flex-1 p-2 bg-gray-900 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                    onClick={handleSend}
                >
                    <IoMdSend size={10} />
                </Button>
            </div>
        </div>
    );
};

export default ChatBox;
