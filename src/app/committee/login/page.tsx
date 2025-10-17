'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

const schema = z.object({
  email: z.email(),
  surname: z.string().min(1),
});
type FormData = z.infer<typeof schema>;
export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();
  const { login } = useAuth();

  const onSubmit = async (data: FormData) => {
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
      message = maybeErr?.response?.data?.message || maybeErr?.response?.data?.msg || JSON.stringify(maybeErr);
    } else {
      message = String(err);
    }
    
    console.log('📧 Error message:', message);
    toast.error('Error: ' + message);
  }
};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10 text-black">
      <h2 className="text-2xl font-bold mb-4">Committee Login</h2>
      {/* Inputs similar to signup */}
      <div className="mb-4">
        <label className="block">Email</label>
        <input {...register('email')} type="email" className="w-full border p-2 rounded" />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
      </div>
      <div className="mb-4">
        <label className="block">Surname</label>
        <input {...register('surname')} type="password" className="w-full border p-2 rounded" /> {/* Hide as password field */}
        {errors.surname && <p className="text-red-500 text-xs">{errors.surname.message}</p>}
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Login
      </button>
    </form>
  );
}