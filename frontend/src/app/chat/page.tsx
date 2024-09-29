import Chat from "@/app/components/chat";
import { NewsFeed } from "@/app/components/news-feed";
import Chatarea from "@/app/components/chatarea";

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-full h-[85vh] space-y-8 top-24 relative left-1/2 transform -translate-x-1/2">
      <div className="transform px-4 rounded-2xl overflow-y-auto overscroll-auto w-screen max-h-max h-[90vh]">
        {/*<Chat />*/}
        <Chatarea />
      </div>
      {/*<NewsFeed />*/}
    </div>
  );
}
