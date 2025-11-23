import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';
import { SetupForm } from './components/SetupForm';

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = (user: string, t: string | null) => {
    setUsername(user);
    setToken(t);
  };

  const handleLogout = () => {
    setUsername(null);
    setToken(null);
  };

  return (
    <Layout>
      {!username ? (
        <SetupForm onSubmit={handleLogin} isLoading={false} />
      ) : (
        <Dashboard 
          username={username} 
          token={token} 
          onLogout={handleLogout} 
        />
      )}
    </Layout>
  );
}

export default App;
