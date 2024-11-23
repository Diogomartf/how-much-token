import { HowMuchToken } from "@/app/how-much-token";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid p-6 min-h-screen w-full font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
        <HowMuchToken />
      </main>
      <footer className="row-start-3 mt-8 flex gap-2 flex-wrap items-center justify-center">
        Using
        <div className="flex items-center space-x-1">
          <Image
            src="/dune.svg"
            alt="Dune logo"
            width={12}
            height={12}
            className="w-full h-4"
          />
          <a
            href="https://dune.com/echo"
            className="text-orange-400 w-full text-nowrap  hover:underline hover:underline-offset-2"
          >
            Dune Echo API
          </a>
        </div>
        by
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-2 text-indigo-500"
          href="https://diogo.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          diogo.xyz
        </a>
      </footer>
      <p className="text-xs mx-auto row-start-5 text-center">
        *The amount is just an approximation. Dune Echo doesn't support all
        networks nor all usd values. Also calculations might have some errors.
        <br />* Currently we're accounting liquid staking as ETH.
      </p>
    </div>
  );
}
