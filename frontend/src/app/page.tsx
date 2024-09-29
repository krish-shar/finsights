import SearchBar from "@/app/components/searchbar";
import { CompanyButton } from "@/app/components/buttons";

export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 justify-center items-center">
        <div className="flex justify-center py-16 space-x-4">
          <CompanyButton company={"Apple"} />
          <CompanyButton company={"Alphabet"} />
          <CompanyButton company={"Meta"} />
        </div>
        <SearchBar placeholder="Ask a Question" className="w-1/2 h-16" />
      </main>
    </div>
  );
}
