'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  position: string;
}

interface CandidateGroup {
  [key: string]: Candidate[];
}

// Create dynamic schema that depends on available positions
const createSchema = (availablePositions: string[]) => z.object({
  voterName: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  voterEmail: z.string().email('Invalid email'),
  votes: z.record(z.string(), z.string().min(1, 'Please select a candidate for this position'))
    .refine((votes) => {
      const votedPositions = Object.keys(votes);
      const missingPositions = availablePositions.filter(pos => !votedPositions.includes(pos));
      return missingPositions.length === 0;
    }, `Please vote for all ${availablePositions.length} positions`),
});

type FormData = z.infer<ReturnType<typeof createSchema>>;

export default function Vote() {
  const [candidates, setCandidates] = useState<CandidateGroup>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const availablePositions = Object.keys(candidates);
  
  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(createSchema(availablePositions)),
    defaultValues: {
      votes: {}
    }
  });

  // Fetch candidates on mount
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidates`);
        const grouped = res.data.data.reduce((acc: CandidateGroup, candidate: Candidate) => {
          acc[candidate.position] = acc[candidate.position] || [];
          acc[candidate.position].push(candidate);
          return acc;
        }, {});
        setCandidates(grouped);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Failed to fetch candidates:', err);
        toast.error('Failed to load candidates', { position: 'top-right', autoClose: 5000 });
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Transform data to match backend expectation
      const voteData = {
        voterName: data.voterName,
        voterEmail: data.voterEmail,
        votes: Object.entries(data.votes).map(([position, candidateId]) => ({
          position,
          candidateId
        }))
      };

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/votes/bulk`, voteData);
      
      toast.success(`All ${availablePositions.length} votes submitted successfully!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      
      // Reset the entire form
      reset();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.msg || 'Voting failed';
        toast.error(`Error: ${errorMessage}`, {
          position: 'top-right',
          autoClose: 5000,
        });
        
        // If it's a duplicate vote error, clear all vote selections but keep user info
        if (errorMessage.includes('already voted')) {
          reset({
            voterName: data.voterName,
            voterEmail: data.voterEmail,
            votes: {}
          });
        }
      } else if (err instanceof Error) {
        toast.error(`Error: ${err.message}`, {
          position: 'top-right',
          autoClose: 5000,
        });
      } else {
        toast.error('Error: Voting failed', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Count how many positions the user has voted for
  const votes = watch('votes') || {};
  const votesCount = Object.keys(votes).length;
  const totalPositions = availablePositions.length;
  const allPositionsVoted = votesCount === totalPositions;

  // Get missing positions for error display
  const missingPositions = availablePositions.filter(pos => !votes[pos]);

  return (
    <main className="min-h-screen bg-gray-100 py-10 text-black">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Vote for Committee Positions</h1>
        <p className="mt-2">Select your preferred candidate for each position below.</p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Important:</strong> You must vote for all {totalPositions} positions to submit your ballot.
        </p>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading candidates...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Submit Your Votes</h2>
            
            {/* Voter Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Full Name *</label>
                <input
                  {...register('voterName')}
                  type="text"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
                {errors.voterName && <p className="text-red-500 text-xs mt-1">{errors.voterName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Email *</label>
                <input
                  {...register('voterEmail')}
                  type="email"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
                {errors.voterEmail && <p className="text-red-500 text-xs mt-1">{errors.voterEmail.message}</p>}
              </div>
            </div>

            {/* Voting Progress */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Voting Progress: {votesCount} of {totalPositions} positions
                </span>
                <span className={`text-sm font-semibold ${allPositionsVoted ? 'text-green-600' : 'text-orange-600'}`}>
                  {allPositionsVoted ? 'Ready to Submit!' : `${totalPositions - votesCount} remaining`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(votesCount / totalPositions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Error Message for Missing Votes */}
            {errors.votes && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 font-medium">
                      {errors.votes && typeof (errors.votes as { message?: unknown }).message === 'string'
                        ? (errors.votes as { message?: string }).message
                        : null}
                    </span>
                  </div>
                {missingPositions.length > 0 && (
                  <p className="text-red-700 text-sm mt-2">
                    Missing votes for: <strong>{missingPositions.join(', ')}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Voting Sections for Each Position */}
            <div className="space-y-6">
              {availablePositions.map((position) => {
                const positionCandidates = candidates[position];
                const hasVoted = !!votes[position];
                
                return (
                  <div 
                    key={position} 
                    className={`border rounded-lg p-6 transition-all duration-200 ${
                      hasVoted 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm mr-3 ${
                          hasVoted 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {position}
                        </span>
                        {hasVoted && (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </h3>
                      <span className={`text-sm font-medium ${
                        hasVoted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {hasVoted ? 'Voted ✓' : 'Not voted'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {positionCandidates.map((candidate) => (
                        <label 
                          key={candidate._id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            votes[position] === candidate._id
                              ? 'border-green-500 bg-green-100 ring-2 ring-green-200'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            value={candidate._id}
                            {...register(`votes.${position}`)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <span className="ml-3 text-sm">
                            <span className="font-medium text-gray-900 block">{candidate.name}</span>
                            <span className="text-gray-500 text-xs">{candidate.email}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    {errors.votes?.[position] && (
                      <p className="text-red-500 text-xs mt-2">{errors.votes[position].message}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Section */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="mb-4">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    allPositionsVoted 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-orange-100 text-orange-800 border border-orange-300'
                  }`}>
                    {allPositionsVoted ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        All positions voted! Ready to submit.
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        {totalPositions - votesCount} position(s) remaining
                      </>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!allPositionsVoted || isSubmitting}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-3 mx-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting All Votes...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit All {totalPositions} Votes
                    </>
                  )}
                </button>
                
                <p className="text-sm text-gray-600 mt-3">
                  Your ballot will be submitted once you complete all {totalPositions} positions.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}