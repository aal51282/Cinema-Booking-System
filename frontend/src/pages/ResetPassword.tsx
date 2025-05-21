import { useState, FormEvent, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios'; // Import axios for making HTTP requests

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token. Please request a new password reset.');
    }
  }, [token]);

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    if (!token) {
      setError('Invalid or missing token.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/reset-password', {
        token,
        newPassword,
      });

      // Handle success response
      setMessage('Your password has been reset successfully. Redirecting to login...');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-black flex flex-col justify-center items-center p-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your new password below.
          </p>
        </div>

        {message && (
          <div className="bg-green-500 text-white p-3 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md">
            {error}
          </div>
        )}

        {!message && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <Label htmlFor="newPassword" className="sr-only">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-darkgray-700 placeholder-darkgray-500 text-white focus:outline-none focus:ring-[#BA0C2F] focus:border-[#BA0C2F] sm:text-sm bg-darkgray-800"
                placeholder="New Password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="sr-only">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-darkgray-700 placeholder-darkgray-500 text-white focus:outline-none focus:ring-[#BA0C2F] focus:border-[#BA0C2F] sm:text-sm bg-darkgray-800"
                placeholder="Confirm New Password"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#BA0C2F] hover:bg-[#98001D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA0C2F] transition duration-150 ease-in-out"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}

        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link to="/login" className="font-medium text-[#BA0C2F] hover:text-[#FF8F8F]">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
