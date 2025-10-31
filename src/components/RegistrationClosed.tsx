import Link from 'next/link';

export default function RegistrationClosed() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <div className="text-center">
        <div className="mb-6">
          <svg 
            className="mx-auto h-16 w-16 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Registration Closed
        </h2>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Registration for committee positions is currently closed. Please proceed to{' '}
            <Link 
              href="/vote" 
              className="text-blue-600 hover:text-blue-800 font-semibold underline transition-colors"
            >
              vote
            </Link>{' '}
            to cast your vote for your preferred candidate.
          </p>
        </div>

        <div className="mt-8">
          <Link 
            href="/vote"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Go to Voting Page
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>If you believe this is an error, please contact the election committee.</p>
        </div>
      </div>
    </div>
  );
}