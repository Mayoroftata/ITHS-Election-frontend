'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const schema = z.object({
  email: z.email('Invalid email'),
  surname: z.string().min(1, 'Surname required'),
});

type FormData = z.infer<typeof schema>;

export default function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/committee/signup`, data);
    //   alert('Signup successful! Now login.');
        toast.success('Signup successful! Now login.');
      router.push('/committee/login');
    } catch (err: unknown) {
      let message = 'An unknown error occurred';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message ?? err.message;
      } else if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else {
        try {
          message = JSON.stringify(err);
        } catch {
          // ignore JSON stringify errors and keep fallback message
        }
      }
    //   alert('Error: ' + message);
        toast.error('Error: ' + message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center text-black">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Committee Signup</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            {...register('email')} 
            type="email" 
            className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="committee@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Surname</label>
          <input 
            {...register('surname')} 
            type="text" 
            className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Your surname"
          />
          {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname.message}</p>}
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-200"
        >
          Signup
        </button>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a href="/committee/login" className="text-blue-500 hover:underline">Login</a>
        </p>
      </form>
    </div>
  );
}