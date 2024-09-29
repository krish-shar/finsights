"use client";
import SearchBar from "@/app/components/searchbar";
import { CompanyButton } from "@/app/components/buttons";
import { NewsFeed } from "@/app/components/news-feed";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Home() {
  const { user, error, isLoading } = useUser();

  return (
    <div className="flex flex-col justify-evenly h-screen px-8 pt-8 font-[family-name:var(--font-geist-sans)]">
      {user ? (
        <main className="flex flex-col gap-8 py-16 justify-center items-center overflow-hidden">
          <div className="justify-center py-16 space-x-4">
            <CompanyButton company={"Apple"} />
            <CompanyButton company={"Alphabet"} />
            <CompanyButton company={"Meta"} />
          </div>
          <SearchBar placeholder="Ask a Question" className="w-1/2 h-16" />
        </main>
      ) : (
        <div className="flex flex-col justify-center h-1/2 space-y-4">
          <h1 className="w-full text-4xl text-center font-bold">
            Welcome to Finsight
          </h1>
          <h2 className="w-full text-2xl text-center">
            The best place to get financial insights!
          </h2>
          <h2 className="w-full text-2xl text-center">
            Please login to Continue
          </h2>
          <button
            onClick={() => {
              window.location.href = "/api/auth/login";
            }}
            className="px-4 py-2 text-lg font-bold text-white bg-blue-500 rounded-lg"
          >
            Login
          </button>
        </div>
      )}
      <NewsFeed />
    </div>
  );
}
