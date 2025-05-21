import { FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/custom/AuthContext';
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const auth = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('remember-me') === 'on';

    try {
      await auth.login({ email, password, rememberMe });
      
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        nav(redirectPath);
      } else {
        nav('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-full bg-black flex flex-col justify-center items-center p-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">Sign in</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email-address" className="sr-only">
                Email address
              </Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-darkgray-700 placeholder-darkgray-500 text-white rounded-t-md focus:outline-none focus:ring-[#BA0C2F] focus:border-[#BA0C2F] focus:z-10 sm:text-sm bg-darkgray-800"
                placeholder="Email address"
              />
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-darkgray-700 placeholder-darkgray-500 text-white rounded-b-md focus:outline-none focus:ring-[#BA0C2F] focus:border-[#BA0C2F] focus:z-10 sm:text-sm bg-darkgray-800"
                placeholder="Password"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox id="remember-me" name="remember-me" className="h-4 w-4 text-[#BA0C2F] focus:ring-[#BA0C2F] border-white-700 rounded" />
              <Label htmlFor="remember-me" className="ml-2 block text-sm text-white font-medium">
                Remember me
              </Label>
            </div>
            <div className="text-sm">
              <Link to="../forgot-password" className="font-medium text-[#BA0C2F] hover:text-[#FF8F8F]">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="default"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#BA0C2F] hover:bg-[#98001D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA0C2F] transition duration-150 ease-in-out"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-[#FF8F8F] group-hover:text-white" aria-hidden="true" />
              </span>
              Sign in
            </Button>
          </div>
        </form>
        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link to="../register" className="font-medium text-[#BA0C2F] hover:text-[#FF8F8F]">
              Don't have an account? Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
