import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SchoolIcon } from '../components/Icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
              <SchoolIcon className="h-10 w-10 text-indigo-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Attendance Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to manage student attendance
          </p>
        </div>
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            <div>
              <Input
                id="email-address"
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={error ? 'Invalid email or password' : undefined}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Input
                id="password"
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={error ? 'Invalid email or password' : undefined}
                placeholder="Enter your password"
              />
            </div>

            <div>
              <Button type="submit" isLoading={loading} className="w-full">
                Sign in
              </Button>
            </div>

            <div className="text-sm text-gray-600 mt-4">
              <p className="font-medium">Demo Credentials:</p>
              <p>Email: admin@example.com</p>
              <p>Password: password123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
