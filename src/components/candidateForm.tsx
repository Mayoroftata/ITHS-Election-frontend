'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  email: z.email('Invalid email'),
  position: z.enum([
    'Chairman', 'Vice-Chairman', 'Social Director 1', 'Social Director 2',
    'Welfare Director 1', 'Welfare Director 2', 'PRO 1', 'PRO 2',
    'Secretary 1', 'Secretary 2'
  ]),
});

type FormData = z.infer<typeof schema>;

export default function CandidateForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidates/register`, data);
    //   alert('Candidate registered! Committee notified.');
      toast.success('Candidate registered successfully!');
      reset();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message ?? err.message ?? 'An unknown error occurred';
        // alert('Error: ' + message);
        toast.error('Error: ' + message);
      } else if (err instanceof Error) {
        // alert('Error: ' + err.message);
        toast.error('Error: ' + err.message);
      } else {
        // alert('Error: An unexpected error occurred');
        toast.error('Error: An unexpected error occurred');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 bg-white rounded shadow text-black">
      <h2 className="text-2xl font-bold mb-4">Register as Candidate</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium">Name</label>
        <input {...register('name')} className="w-full border p-2 rounded" />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium">Email</label>
        <input {...register('email')} type="email" className="w-full border p-2 rounded" />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium">Position</label>
        <select {...register('position')} className="w-full border p-2 rounded">
          <option value="">Select...</option>
          {schema.shape.position.options.map(pos => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>
        {errors.position && <p className="text-red-500 text-xs">{errors.position.message}</p>}
      </div>
      
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Submit
      </button>
    </form>
  );
}