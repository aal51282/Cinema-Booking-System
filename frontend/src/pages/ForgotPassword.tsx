import { FormEvent, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios for making HTTP requests

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSendLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/request-password-reset', { email });

      // Handle success response
      setMessage('A password reset link has been sent to your email. Please check your inbox and follow the instructions to reset your password.');
      setEmail(''); // Clear the email input after sending
    } catch (error: any) {
      // Handle error response
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to send reset link. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-black flex flex-col justify-center items-center p-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email to receive a password reset link.
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

        <form className="mt-8 space-y-6" onSubmit={handleSendLink}>
          <div>
            <Label htmlFor="email" className="sr-only">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-darkgray-700 placeholder-darkgray-500 text-white focus:outline-none focus:ring-[#BA0C2F] focus:border-[#BA0C2F] sm:text-sm bg-darkgray-800"
              placeholder="Email address"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#BA0C2F] hover:bg-[#98001D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA0C2F] transition duration-150 ease-in-out"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link to="/login" className="font-medium text-[#BA0C2F] hover:text-[#FF8F8F]">
              Remembered your password? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
