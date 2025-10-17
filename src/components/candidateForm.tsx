'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';

const positions = [
  'Chairman', 'Vice-Chairman', 'Treasurer 1', 'Treasurer 2',
  'Social Director 1', 'Social Director 2',
  'Welfare Director 1', 'Welfare Director 2',
  'PRO 1', 'PRO 2',
  'Secretary 1', 'Secretary 2'
] as const;

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  email: z.email('Invalid email'),
  position: z.string().nonempty('Position is required').refine((val) => (positions as readonly string[]).includes(val), { message: 'Please select a valid position' }),
});

type FormData = z.infer<typeof schema>;

export default function CandidateForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [isLoading, setIsLoading] = useState(false); // 👈 Loading state

  const onSubmit = async (data: FormData) => {
    setIsLoading(true); // 👈 Start loading
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidates/register`, data);
      toast.success('Candidate registered successfully!');
      reset();
    } catch (err: unknown) {
      let message = 'An unexpected error occurred';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || 'Request failed';
      } else if (err instanceof Error) {
        message = err.message;
      } else {
        message = String(err);
      }
      toast.error('Error: ' + message);
    } finally {
      setIsLoading(false); // 👈 Always stop loading
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 bg-white rounded shadow text-black">
      <h2 className="text-2xl font-bold mb-4">Register as Candidate</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          {...register('name')}
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Position</label>
        <select
          {...register('position')}
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="">Select...</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full p-2 rounded text-white transition duration-200 ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}