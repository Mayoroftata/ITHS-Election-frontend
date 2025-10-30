'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  position: string;
  createdAt: string;
  voteCount: number;
}

interface CandidateGroup {
  [key: string]: Candidate[];
}

export default function Dashboard() {
  const [candidates, setCandidates] = useState<CandidateGroup>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/committee/login');
      return;
    }

    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/committee/candidates`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('API response:', res.data); // Debug: Check response shape

        // Set grouped candidates
        setCandidates(res.data.data || {});
      } catch (err) {
        let message = 'Error fetching candidates';
        if (axios.isAxiosError(err)) {
          console.error('Axios error details:', err.response?.data);
          message = err.response?.data?.msg || err.message || message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        toast.error(message, { position: 'top-right', autoClose: 5000 });
        logout();
        router.push('/committee/login');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [isAuthenticated, router, logout]);

  if (loading) return <div className="p-6 text-black">Loading candidates...</div>;

  return (
    <div className="p-6 text-black bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Election Committee Dashboard</h1>
      <button
        type='button'
        onClick={() => {
          logout();
          router.push('/committee/login');
        }}
        className="mb-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>

      {Object.keys(candidates).length === 0 ? (
        <p className="text-center text-gray-600">No candidates registered yet.</p>
      ) : (
        Object.entries(candidates).map(([position, positionCandidates]) => (
          <div key={position} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{position}</h2>
            <table className="w-full border-collapse border border-gray-300 bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Registered At</th>
                  <th className="border p-2 text-left">Votes</th>
                </tr>
              </thead>
              <tbody>
                {positionCandidates.map((cand: Candidate) => (
                  <tr key={cand._id}>
                    <td className="border p-2">{cand.name}</td>
                    <td className="border p-2">{cand.email}</td>
                    <td className="border p-2">{new Date(cand.createdAt).toLocaleString()}</td>
                    <td className="border p-2">{cand.voteCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}