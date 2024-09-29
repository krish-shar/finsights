"use client";
import SearchBar from "@/app/components/searchbar";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Home() {
  const { user, error, isLoading } = useUser();

  return (
    <div className="flex flex-col justify-evenly h-screen px-8 pt-8 font-[family-name:var(--font-geist-sans)]">
      {user ? (
        <main className="flex flex-col gap-8 py-8 justify-center items-center">
          <div className="pt-8">
            <TickerComponent></TickerComponent>
          </div>
          <h1>Hello, {user.name}!</h1>
          <div className="h-[30rem] flex items-center justify-center">
            <TextHoverEffect text="Hello, User!" />
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
            Please Login or Signup to Continue
          </h2>
          <button
            onClick={() => {
              window.location.href = "/api/auth/login";
            }}
            className="px-4 py-2 text-lg font-bold text-white bg-accent-dark hover:brightness-90 rounded-lg"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}
