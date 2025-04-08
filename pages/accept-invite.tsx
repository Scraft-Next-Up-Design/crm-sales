import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AcceptInvite() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState('');

  useEffect(() => {
    // Only run once the router is ready and we have query parameters
    if (!router.isReady) return;

    const { workspaceId, email, status } = router.query;

    if (!workspaceId || !email || !status) {
      setStatus('Failed');
      setError('Missing required parameters');
      return;
    }

    // Create a form and submit it programmatically
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/api/auth?workspaceId=${workspaceId}&email=${email}&status=${status}&action=acceptInvite`;
    
    // Submit the form automatically
    document.body.appendChild(form);
    form.submit();
    
    // Set a timeout to show an error message if the form submission doesn't redirect
    const timeout = setTimeout(() => {
      setStatus('Failed');
      setError('Request timed out. Please try again.');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router.isReady, router.query]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Head>
        <title>Processing Invitation</title>
      </Head>
      
      <div style={{
        maxWidth: '500px',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>Workspace Invitation</h1>
        
        {status === 'Processing...' ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #4CAF50',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 2s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
            <p>Processing your invitation. Please wait...</p>
            <style jsx global>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </>
        ) : (
          <>
            <p style={{ color: 'red' }}>{error}</p>
            <p>Please check your invitation link and try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: '20px'
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
