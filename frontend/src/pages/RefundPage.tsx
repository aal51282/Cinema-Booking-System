import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/custom/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { GetUserPurchases, GetMovieById } from '@/util/exampledata';
import { Purchase } from '@/util/types';

const RefundPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (!user || !isAuthenticated) {
    navigate('/login');
    return null;
  }

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<{ [purchaseId: string]: boolean }>({});

  // Variables for calculations
  const [refundSubtotal, setRefundSubtotal] = useState<number>(0);
  const [refundDiscountAmount, setRefundDiscountAmount] = useState<number>(0);
  const [refundTax, setRefundTax] = useState<number>(0);
  const [refundTotalAmount, setRefundTotalAmount] = useState<number>(0);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Constants
  const onlineFee = 3; // Online fee
  const salesTaxRate = 0.06; // 6% sales tax

  useEffect(() => {
    const userPurchases = GetUserPurchases(user.userId);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const filteredPurchases = userPurchases.filter((purchase) => {
      const showTime = new Date(purchase.showTime);
      return showTime >= twentyFourHoursAgo;
    });
    setPurchases(filteredPurchases);
  }, [user.userId]);

  const handleTicketSelection = (purchaseId: string, ticketPrice: number, showTime: Date) => {
    const isSelected = selectedTickets[purchaseId];
    const now = new Date();
    const timeDifference = (showTime.getTime() - now.getTime()) / (1000 * 60); // Time difference in minutes

    if (timeDifference <= 60 && timeDifference > 0) {
      alert('Tickets can only be refunded up to 60 minutes before the show time.');
      return;
    }

    if (timeDifference <= 0) {
      alert('Tickets for past shows cannot be refunded.');
      return;
    }

    setSelectedTickets((prev) => ({
      ...prev,
      [purchaseId]: !isSelected,
    }));

    // Update refund calculations
    const ticketSubtotal = ticketPrice; // Assuming price includes base price per ticket
    const updatedRefundSubtotal = !isSelected ? refundSubtotal + ticketSubtotal : refundSubtotal - ticketSubtotal;

    // Apply any discounts if applicable (assuming no discount for simplicity)
    const discountAmount = 0;

    const taxableAmount = updatedRefundSubtotal - discountAmount;
    const tax = taxableAmount * salesTaxRate;

    // Online fee - assuming it's a flat fee per transaction
    const totalRefundAmount = taxableAmount + tax + onlineFee;

    setRefundSubtotal(updatedRefundSubtotal);
    setRefundDiscountAmount(discountAmount);
    setRefundTax(tax);
    setRefundTotalAmount(totalRefundAmount);
  };

  const handleConfirmRefund = () => {
    // Process refund logic here
    // For example, update the database, handle payment refund, etc.

    // Remove refunded tickets from purchases
    const updatedPurchases = purchases.filter((purchase) => !selectedTickets[purchase.id.toString()]);
    setPurchases(updatedPurchases);

    // Clear selected tickets and refund amount
    setSelectedTickets({});
    setRefundSubtotal(0);
    setRefundDiscountAmount(0);
    setRefundTax(0);
    setRefundTotalAmount(0);

    setIsConfirmDialogOpen(false);

    // Navigate to the Refund Confirmation Page
    navigate('/refund-confirmation');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <Card className="max-w-4xl w-full bg-darkgray-800 border-darkgray-700 m-auto my-4 p-6">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-white">Refund Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Refund Note */}
          <div className="bg-darkgray-700 p-4 rounded-lg mb-6">
            <p className="text-yellow-400 text-sm">
              Note: Refunds must be completed prior to 1 hour before showtime.
            </p>
          </div>

          {purchases.length > 0 ? (
            purchases.map((purchase) => {
              const movie = GetMovieById(purchase.movieId);
              const isSelected = selectedTickets[purchase.id.toString()];
              const now = new Date();
              const showTime = new Date(purchase.showTime);
              const timeDifference = (showTime.getTime() - now.getTime()) / (1000 * 60); // Time difference in minutes
              const canRefund = timeDifference > 60;
              const isPastShow = timeDifference <= 0;

              return (
                <div
                  key={purchase.id}
                  className={`flex items-center justify-between bg-darkgray-700 p-4 rounded-md mb-4 ${
                    !canRefund ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <Checkbox
                      id={`ticket-${purchase.id}`}
                      checked={!!isSelected}
                      disabled={!canRefund || isPastShow}
                      onCheckedChange={() =>
                        handleTicketSelection(purchase.id.toString(), purchase.totalAmount, showTime)
                      }
                      className="mr-4"
                      style={{ border: '2px solid white', borderRadius: '4px' }}
                    />
                    <label htmlFor={`ticket-${purchase.id}`} className="text-white">
                      <div className="font-semibold">{movie?.title || 'Unknown Movie'}</div>
                      <div className="text-sm text-gray-400">Show Time: {showTime.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Seats: {purchase.seats.join(', ')}</div>
                    </label>
                  </div>
                  <div className="text-right text-white">
                    <div className="font-semibold">${purchase.totalAmount.toFixed(2)}</div>
                    {isPastShow && <div className="text-sm text-red-500">Past show</div>}
                    {!canRefund && !isPastShow && (
                      <div className="text-sm text-red-500">Refund unavailable</div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-white text-center">You have no eligible purchases to refund.</div>
          )}

          {refundSubtotal > 0 && (
            <div className="mt-4 text-white">
              <h2 className="text-xl font-bold">Refund Summary</h2>
              <div className="flex justify-between mt-2">
                <span>Subtotal:</span>
                <span>${refundSubtotal.toFixed(2)}</span>
              </div>
              {refundDiscountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-${refundDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Sales Tax (6%):</span>
                <span>+${refundTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Online Fee:</span>
                <span>+${onlineFee.toFixed(2)}</span>
              </div>
              <hr className="my-2 border-gray-500" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total Refund Amount:</span>
                <span>${refundTotalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="mt-6 text-right">
            <Button
              disabled={refundSubtotal === 0}
              onClick={() => setIsConfirmDialogOpen(true)}
              className={`bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded ${
                refundSubtotal === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Confirm Refund
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="bg-darkgray-800 text-white max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white mb-2">Confirm Refund</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p>Are you sure you want to refund the selected tickets?</p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Refund Summary</h3>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${refundSubtotal.toFixed(2)}</span>
                </div>
                {refundDiscountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${refundDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Sales Tax (6%):</span>
                  <span>+${refundTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Online Fee:</span>
                  <span>+${onlineFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold mt-2">
                  <span>Total Refund Amount:</span>
                  <span>${refundTotalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {/* Refund Note */}
            <p className="text-sm text-yellow-400 mt-4">
              Refunds must be completed prior to 1 hour before showtime.
            </p>
            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={() => setIsConfirmDialogOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRefund}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Yes, Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundPage;