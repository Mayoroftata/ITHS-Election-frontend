import CandidateForm from "@/components/candidateForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 text-black">
      <div>
        <h1 className="text-4xl font-bold text-center mb-8">ITHS Alumni Election</h1>
        <p className="text-center mb-6">Register as a candidate for the alumni committee positions below.</p>
      </div>
      <CandidateForm />
    </main>
  );
}