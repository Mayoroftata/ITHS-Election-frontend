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

const schema = z.object({
  voterName: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  voterEmail: z.string().email('Invalid email'),
  position: z.enum([
    'Chairman',
      'Vice-Chairman',
      'Treasurer 1',
      'Treasurer 2',
      'Welfare 1',
      'Welfare 2',
      'Secretary 1',
      'Secretary 2',
      'PRO 1',
      'PRO 2',
      'Social Director 1',
      'Social Director 2'
  ]),
  candidateId: z.string().min(1, 'Please select a candidate'),
});

type FormData = z.infer<typeof schema>;

export default function Vote() {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [candidates, setCandidates] = useState<CandidateGroup>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedPosition = watch('position');

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
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/votes`, data);
      toast.success('Vote submitted successfully!', {
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
        
        // If it's a duplicate vote error, clear the position and candidate fields
        if (errorMessage.includes('already voted')) {
          reset({
            voterName: data.voterName,
            voterEmail: data.voterEmail,
            position: undefined,
            candidateId: undefined,
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

  return (
    <main className="min-h-screen bg-gray-100 py-10 text-black">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Vote for a Candidate</h1>
        <p className="mt-2">Select your preferred candidate for each position.</p>
        {/* <p className="text-sm text-gray-600 mt-2">
          Note: You can only vote once per position with the same email.
        </p> */}
      </div>

      {loading ? (
        <p className="text-center">Loading candidates...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Submit Your Vote</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium">Your Full Name</label>
            <input
              {...register('voterName')}
              type="text"
              className="w-full border p-2 rounded"
              placeholder="Enter your full name"
            />
            {errors.voterName && <p className="text-red-500 text-xs">{errors.voterName.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Your Email</label>
            <input
              {...register('voterEmail')}
              type="email"
              className="w-full border p-2 rounded"
              placeholder="your.email@example.com"
            />
            {errors.voterEmail && <p className="text-red-500 text-xs">{errors.voterEmail.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Position</label>
            <select {...register('position')} className="w-full border p-2 rounded">
              <option value="">Select a position...</option>
              {Object.keys(candidates).map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            {errors.position && <p className="text-red-500 text-xs">{errors.position.message}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium">Candidate</label>
            <select
              {...register('candidateId')}
              className="w-full border p-2 rounded"
              disabled={!selectedPosition}
            >
              <option value="">Select a candidate...</option>
              {selectedPosition && candidates[selectedPosition]?.map(candidate => (
                <option key={candidate._id} value={candidate._id}>
                  {candidate.name} ({candidate.email})
                </option>
              ))}
            </select>
            {errors.candidateId && <p className="text-red-500 text-xs">{errors.candidateId.message}</p>}
            {!selectedPosition && (
              <p className="text-gray-500 text-xs mt-1">Select a position to see candidates</p>
            )}
            {selectedPosition && candidates[selectedPosition]?.length === 0 && (
              <p className="text-red-500 text-xs mt-1">No candidates available for this position</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
            disabled={!selectedPosition || candidates[selectedPosition]?.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
          </button>
        </form>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}