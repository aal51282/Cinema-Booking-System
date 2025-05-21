import { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAuth } from '@/components/custom/AuthContext';

import Logo from '@/assets/BulldogLogo.png';
import Cart from '@/components/custom/Cart';

const getRandomGradient = () => {
  const gradients = [
    'bg-gradient-to-r from-purple-500 to-indigo-500',
    'bg-gradient-to-r from-pink-500 to-orange-500',
    'bg-gradient-to-r from-blue-500 to-green-500',
    'bg-gradient-to-r from-yellow-500 to-red-500'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
};  

const LogoutDialog = ({ isOpen, onClose, onLogout }: { isOpen: boolean, onClose: () => void, onLogout: () => void }) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent className='bg-darkgray-900 text-white border-darkgray-700'>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          Do you want to logout?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="bg-darkgray-700" onClick={onClose}>Cancel</AlertDialogCancel>
        <AlertDialogAction className="bg-darkgray-700 hover:bg-red-600 border hover:border-red-600 border-white" onClick={onLogout}>Logout</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default function Header() {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated;
  const user = auth?.user;
  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const gradient = useMemo(() => getRandomGradient(), []);

  const handleLogout = useCallback(() => {
    auth?.logout();
    navigate('/');
    setIsAlertOpen(false);
  }, [auth, navigate]);

  const openLogoutDialog = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsAlertOpen(true);
  }, []);

  return (
    <header className="bg-darkgray-900 p-4 border-b border-darkgray-700 sticky top-0 left-0 right-0 w-full z-10">
      <div className="flex flex-row items-center justify-between w-full px-20">
        <Link to="/">
          <div className="flex flex-row items-center">
            <img src={Logo} className="w-10 h-10 mr-2" alt="Bulldog Film Logo" />
            <h1 className="text-3xl font-extrabold text-white">Go Dawgs Cinemax</h1>
          </div>
        </Link>
        <div>
          {isAuthenticated && user ? (
            <div className="flex flex-row items-center gap-10">
              {!!user.isAdmin && 
                <button onClick={() => navigate('/panel')} className="text-white bg-darkgray-800 border-darkgray-500 border p-3 rounded-lg hover:bg-darkgray-700 ">Admin Panel</button>
              }
              <Cart />
              <DropdownMenu >
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${gradient} cursor-pointer`}
                    >
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-darkgray-900 text-white border-darkgray-700">
                  <DropdownMenuLabel className='text-center'>{user.firstName} {user.lastName}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-darkgray-700" />
                  <DropdownMenuItem className='hover:cursor-pointer' onClick={() => navigate('/account')}>
                    Manage Account
                  </DropdownMenuItem>
                  <DropdownMenuItem className='hover:cursor-pointer' onClick={() => navigate('/purchases')}>
                    Order History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-darkgray-700" />
                  <DropdownMenuItem onClick={openLogoutDialog} className='hover:cursor-pointer text-center focus:text-white focus:bg-red-700'>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button variant='link' className="text-white text-lg" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
      <LogoutDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onLogout={handleLogout}
      />
    </header>
  );
}