'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { useState } from 'react';

const schema = z.object({
  email: z.email('Invalid email'),
  surname: z.string().min(1, 'Surname is required'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false); // 👈 Loading state

  const onSubmit = async (data: FormData) => {
    setIsLoading(true); // 👈 Start loading
    try {
      console.log('🔄 Attempting login with:', { email: data.email, surname: data.surname });
      
      await login(data.email, data.surname);
      toast.success('Login successful!');
      router.push('/committee/dashboard');
    } catch (err: unknown) {
      console.error('❌ Login error:', err);
      
      let message = 'An unexpected error occurred';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const maybeErr = err as { response?: { data?: { message?: string; msg?: string } } };
        message = maybeErr?.response?.data?.message || maybeErr?.response?.data?.msg || 'Login failed';
      } else {
        message = String(err);
      }
      
      console.log('📧 Error message:', message);
      toast.error('Error: ' + message);
    } finally {
      setIsLoading(false); // 👈 Always stop loading
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10 text-black">
      <h2 className="text-2xl font-bold mb-4">Committee Login</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="committee@example.com"
          disabled={isLoading}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Surname</label>
        <input
          {...register('surname')}
          type="password" // 👈 Keep as password for privacy
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your surname"
          disabled={isLoading}
        />
        {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname.message}</p>}
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
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}