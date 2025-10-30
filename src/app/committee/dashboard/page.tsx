'use client';

import { useEffect, useState, useCallback } from 'react';
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

interface DashboardStats {
  totalCandidates: number;
  totalVotes: number;
  positionsCount: number;
}

export default function Dashboard() {
  const [candidates, setCandidates] = useState<CandidateGroup>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    totalVotes: 0,
    positionsCount: 0
  });
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  // Calculate statistics from candidates data
  const calculateStats = (candidatesData: CandidateGroup): DashboardStats => {
    let totalCandidates = 0;
    let totalVotes = 0;
    const positionsCount = Object.keys(candidatesData).length;

    Object.values(candidatesData).forEach(positionCandidates => {
      totalCandidates += positionCandidates.length;
      totalVotes += positionCandidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    });

    return { totalCandidates, totalVotes, positionsCount };
  };

  const fetchCandidates = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/committee/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });

      console.log('API response:', res.data);

      if (res.data.success && res.data.data) {
        setCandidates(res.data.data);
        setStats(calculateStats(res.data.data));
      } else {
        throw new Error(res.data.msg || 'Invalid response format');
      }
    } catch (err) {
      let message = 'Error fetching candidates';
      
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:', err.response?.data);
        
        if (err.response?.status === 401) {
          message = 'Authentication failed. Please login again.';
          logout();
          router.push('/committee/login');
        } else if (err.response?.status === 403) {
          message = 'Access denied. Insufficient permissions.';
        } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
          message = 'Network error. Please check your connection.';
        } else if (err.code === 'TIMEOUT') {
          message = 'Request timeout. Please try again.';
        } else {
          message = err.response?.data?.msg || err.message || message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      toast.error(message, { position: 'top-right', autoClose: 5000 });
      
      // Only redirect on auth errors
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        return;
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/committee/login');
      return;
    }

    fetchCandidates();
  }, [isAuthenticated, router, fetchCandidates]);

  const handleRefresh = () => {
    fetchCandidates(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/committee/login');
  };

  const getPositionWinner = (candidates: Candidate[]): Candidate | null => {
    if (candidates.length === 0) return null;
    
    const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
    return sorted[0].voteCount > 0 ? sorted[0] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-black text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Election Committee Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time election results and candidate statistics</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Refreshing...
                </>
              ) : (
                'Refresh Data'
              )}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Candidates</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalCandidates}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Votes Cast</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalVotes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Positions</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.positionsCount}</p>
          </div>
        </div>

        {/* Candidates by Position */}
        {Object.keys(candidates).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No candidates registered yet.</p>
            <p className="text-gray-500 mt-2">Candidates will appear here once they register.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(candidates).map(([position, positionCandidates]) => {
              const winner = getPositionWinner(positionCandidates);
              return (
                <div key={position} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-800 text-white px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <h2 className="text-xl font-semibold">{position}</h2>
                      {winner && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          🏆 Leading: {winner.name} ({winner.voteCount} votes)
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registered
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Votes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {positionCandidates.map((candidate) => (
                          <tr key={candidate._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{candidate.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {new Date(candidate.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {candidate.voteCount}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {winner && winner._id === candidate._id ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Leading
                                </span>
                              ) : candidate.voteCount > 0 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  No Votes
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Last updated: {new Date().toLocaleString()}
          {refreshing && ' (Updating...)'}
        </div>
      </div>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}