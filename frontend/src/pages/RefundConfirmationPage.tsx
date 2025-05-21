import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/custom/AuthContext';
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react'; // Assuming you're using lucide-react for icons

const RefundConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-darkgray-900 to-darkgray-800 flex flex-col justify-center items-center p-4">
      <Card className="max-w-2xl w-full bg-darkgray-800 border-darkgray-700 shadow-lg">
        <CardHeader className="bg-green-500 text-white py-6 rounded-t-lg">
          <div className="flex items-center justify-center">
            <CheckCircle className="w-16 h-16 mr-4" />
            <CardTitle className="text-4xl font-extrabold">Refund Confirmed</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <p className="text-white text-xl text-center">
              Your refund has been processed successfully.
            </p>
            <div className="bg-darkgray-700 p-4 rounded-lg flex items-center">
              <Mail className="text-yellow-400 w-6 h-6 mr-3" />
              <p className="text-yellow-400">
                An email confirmation has been sent to <strong>{user?.email}</strong>.
              </p>
            </div>
            <div className="bg-darkgray-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Refund Details:</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Refund ID: #RF12345</li>
                <li>Amount: $XX.XX</li>
                <li>Date: {new Date().toLocaleDateString()}</li>
              </ul>
            </div>
            <p className="text-sm text-gray-400 text-center">
              Please allow 3-5 business days for the refund to appear in your account.
            </p>
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleBackToHome}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full flex items-center transition duration-300 ease-in-out transform hover:scale-105"
              >
                <ArrowLeft className="mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundConfirmationPage;