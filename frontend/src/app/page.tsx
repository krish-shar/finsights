import SearchBar from "@/app/components/searchbar";
import { CompanyButton } from "@/app/components/buttons";
import { NewsFeed } from "@/app/components/news-feed";

export default function Home() {
  return (
    <div className="flex flex-col justify-evenly h-screen px-8 pt-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 py-8 justify-center items-center overflow-hidden">
        <div className="justify-center py-16 space-x-4">
          <CompanyButton company={"Apple"} />
          <CompanyButton company={"Alphabet"} />
          <CompanyButton company={"Meta"} />
        </div>
        <SearchBar placeholder="Ask a Question" className="w-1/2 h-16" />
      </main>
      <NewsFeed />
    </div>
  );
}
