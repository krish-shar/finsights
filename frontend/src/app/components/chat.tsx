"use client";
import { AiChat, ChatAdapter, StreamingAdapterObserver } from "@nlux/react";
import "@nlux/themes/nova.css";
import Image from "next/image";

export default function Chat() {
  const chatAdapter: ChatAdapter = {
    streamText: async (prompt: string, observer: StreamingAdapterObserver) => {
      const response = await fetch("http://localhost:8080/test_chat", {
        method: "POST",
        body: JSON.stringify({
          message: prompt,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.status !== 200) {
        observer.error(new Error("Failed to connect to the server"));
        return;
      }

      if (!response.body) {
        return;
      }

      const reader = response.body.getReader();
      const textDecoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += textDecoder.decode(value, { stream: true });

        // Try to parse complete JSON objects
        let startIndex = 0;
        while (true) {
          const endIndex = buffer.indexOf("}", startIndex);
          if (endIndex === -1) break;

          try {
            const jsonString = buffer.slice(startIndex, endIndex + 1);
            const jsonObject = JSON.parse(jsonString);

            if (jsonObject.response) {
              observer.next(jsonObject.response);
            }

            startIndex = endIndex + 1;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            // If parsing fails, it's likely an incomplete JSON object
            break;
          }
        }

        // Remove processed data from the buffer
        buffer = buffer.slice(startIndex);
      }

      observer.complete();
    },
  };

  return (
    <main className="flex flex-col items-center justify-between overflow-hidden">
      <div className="z-10 w-full flex max-w-3xl items-center justify-between font-mono text-sm lg:flex">
        <AiChat
          adapter={chatAdapter}
          personaOptions={{
            assistant: {
              name: "Finsight",
              avatar: (
                <Image
                  src="/logo.png"
                  alt="/logo.png"
                  width={100}
                  height={100}
                />
              ),
              description: "Your AI assistant for financial insights",
            },
          }}
        />
      </div>
    </main>
  );
}
