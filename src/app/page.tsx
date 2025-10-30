'use client';

import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 text-black flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome to ITHS Election Portal</h1>
        <p className="text-lg mb-8">Join the ITHS Alumni Election by registering as a candidate or voting for your preferred candidate.</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Register as a Candidate
          </Link>
          <Link
            href="/vote"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-200"
          >
            Vote for a Candidate
          </Link>
        </div>
        <div className="mt-6 text-sm">

          
          {/* <p>
            Election Committee: <Link href="/committee/login" className="text-blue-500 hover:underline">Login</Link> |{' '}
            <Link href="/committee/signup" className="text-blue-500 hover:underline">Signup</Link>
          </p> */}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}