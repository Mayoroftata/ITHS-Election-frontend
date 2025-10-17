'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  position: string;
  createdAt: string;
}

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
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
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('API response:', res.data); // Debug: Check shape here
        
        // Normalize to array
        let candidatesData: Candidate[] = [];
        if (Array.isArray(res.data)) {
          candidatesData = res.data;
        } else if (res.data && Array.isArray(res.data.candidates)) {
          candidatesData = res.data.candidates;
        } else if (res.data && Array.isArray(res.data.data)) {
          candidatesData = res.data.data;
        } // Extend based on actual response
        
        setCandidates(candidatesData);
      } catch (err) {
        let message = 'Error fetching candidates';
        if (axios.isAxiosError(err)) {
          console.error('Axios error details:', err.response?.data); // Debug error
          message = err.response?.data?.message ?? err.message ?? message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        alert(message);
        logout();
        router.push('/committee/login');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [isAuthenticated, router, logout]);

  if (loading) return <div className="p-6">Loading candidates...</div>;

  return (
    <div className="p-6 text-black bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Registered Candidates</h1>
      <button onClick={() => { logout(); router.push('/committee/login'); }} className="mb-4 bg-red-500 text-white p-2 rounded">
        Logout
      </button>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Position</th>
            <th className="border p-2 text-left">Created At</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((cand: Candidate) => (
            <tr key={cand._id}>
              <td className="border p-2">{cand.name}</td>
              <td className="border p-2">{cand.email}</td>
              <td className="border p-2">{cand.position}</td>
              <td className="border p-2">{new Date(cand.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {candidates.length === 0 && <p>No candidates yet.</p>}
    </div>
  );
}