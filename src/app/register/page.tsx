'use client';

import Link from 'next/link';
// import CandidateForm from '@/components/candidateForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Register() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 text-black">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Candidate Registration</h1>
        <p className="mt-2">Register to run for an ITHS Alumni Committee position.</p>
      </div>

        <div>
          <p>
            Registration for committee positions is currently closed. Please proceed to <Link href="/vote">vote</Link> to cast your vote for your preferred candidate.
          </p>
        </div>
      {/* <CandidateForm/> */}
      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}