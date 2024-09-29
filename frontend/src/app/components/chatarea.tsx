"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LoadingSVG = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const darkModePreference = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    setIsDarkMode(darkModePreference.matches);

    const handleChange = (e) => setIsDarkMode(e.matches);
    darkModePreference.addEventListener("change", handleChange);

    return () => darkModePreference.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { text: message, sender: "user" };
    setChatMessages((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.text();
      let apiResponse;
      try {
        apiResponse = JSON.parse(data);
      } catch (error) {
        apiResponse = { message: data };
      }

      setChatMessages((prev) => [
        ...prev,
        { text: apiResponse.response || "No response", sender: "api" },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setChatMessages((prev) => [
        ...prev,
        { text: `Error: ${error.message}`, sender: "api" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col ${isDarkMode ? "bg-gray-950 text-white" : "bg-white text-black"}`}
    >
      <div
        className={`flex-grow overflow-y-auto p-4 ${isDarkMode ? "bg-black" : "bg-gray-100"}`}
      >
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow ${
                msg.sender === "user"
                  ? isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkMode
                    ? "bg-sky-950 text-white"
                    : "bg-white text-black"
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-1" {...props} />,
                  a: ({ node, ...props }) => (
                    <a className="text-blue-300 hover:underline" {...props} />
                  ),
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code
                        className="bg-gray-800 text-pink-300 px-1 rounded"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-gray-800 text-pink-300 p-2 rounded"
                        {...props}
                      />
                    ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside mb-1" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside mb-1" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-1" {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold mb-2" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold mb-2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-bold mb-1" {...props} />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4 className="text-base font-bold mb-1" {...props} />
                  ),
                  h5: ({ node, ...props }) => (
                    <h5 className="text-sm font-bold mb-1" {...props} />
                  ),
                  h6: ({ node, ...props }) => (
                    <h6 className="text-xs font-bold mb-1" {...props} />
                  ),
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex p-4 justify-center">
        <div className="flex w-full max-w-[50vw] min-w-[40px]">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className={`flex-grow px-4 py-2 rounded-l-2xl focus:outline-none ${
              isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 h-12 font-extrabold bg-sky-950 text-white rounded-r-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? <LoadingSVG /> : ">"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
