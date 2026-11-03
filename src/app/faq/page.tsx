import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FaqSection } from "@/components/FaqSection";

export const metadata = {
  title: "Frequently Asked Questions — Solvent",
  description: "Learn about Solvent's local-first statement parsing, supported bank exports, pricing, and security.",
};

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar showSampleCta={true} />

      <main className="flex-1 py-12">
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
