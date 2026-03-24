import Image from "next/image";
import SearchForm from "./SearchForm";

const SUGGESTED_PROMPTS = [
  "How have global temperatures changed since 1900?",
  "Compare atmospheric CO2 measurements this decade",
  "Show COVID-19 incidence per district",
  "Compare pharma spending trends across countries",
];

export default function HeroSectionLight({
  stats,
}: {
  stats: {
    orgCount: number;
    groupCount: number;
    datasetCount: number;
    visualizationCount: number;
  };
}) {
  const handlePrompt = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("queryless:open", { detail: { message: prompt } }));
  };

  return (
    <section
      className="h-[calc(100vh-100px)] flex flex-col px-4 hero-glow"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 w-full max-w-3xl mx-auto">
        <Image
          src="/images/logos/MainLogoSymbol.svg"
          alt="KAUST Data Portal"
          width={96}
          height={96}
          style={{ objectFit: "contain" }}
          priority
        />

        <div className="flex flex-col gap-3">
          <h1 className="font-black text-[42px] md:text-[58px] leading-tight text-gray-900">
            KAUST Research Data
          </h1>
          <p className="text-gray-500 text-[17px] md:text-[19px] max-w-xl mx-auto">
            Explore academic and scientific datasets.
            Ask anything in plain English.
          </p>
        </div>

        <div className="w-full">
          <SearchForm />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handlePrompt(prompt)}
              className="text-sm px-4 py-2 rounded-full border border-gray-200 text-gray-500 hover:border-accent hover:text-accent transition-colors bg-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Portal stats pinned to the bottom */}
      <div className="mt-auto w-full">
        <div className="custom-container mx-auto py-5 flex flex-wrap gap-8 justify-center">
          <span className="text-sm text-gray-500"><span className="font-bold text-gray-900 text-base">{stats.datasetCount}</span> Datasets</span>
          <span className="text-sm text-gray-500"><span className="font-bold text-gray-900 text-base">{stats.orgCount}</span> Organizations</span>
          <span className="text-sm text-gray-500"><span className="font-bold text-gray-900 text-base">{stats.groupCount}</span> Topics</span>
          {!!stats.visualizationCount && (
            <span className="text-sm text-gray-500"><span className="font-bold text-gray-900 text-base">{stats.visualizationCount}</span> Visualizations</span>
          )}
        </div>
      </div>
    </section>
  );
}
