import { useAuth } from "@/components/custom/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBooking } from "@/services/bookingAPI";
import { 
  ArrowLeft, 
  CalendarDays, 
  Clock, 
  CreditCard,
  CheckCircle2,
  Receipt,
  Film
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BookingTicket {
  ticketId: number;
  showId: number;
  ticketType: string;
  price: number;
  seatNumber: string;
  movieTitle: string;
}

interface Booking {
  bookingId: number;
  userId: number;
  bookingDate: string | number;
  showDate: string | number;
  totalAmount: number;
  cardFour: string;
  tickets: BookingTicket[];
  movieTitle: string;
  promotion?: {
    description: string;
    discountPercentage: number;
  };
}

function formatDateTime(dateStr: string | number): [string, string] {
  try {
    let date: Date;
    
    if (typeof dateStr === 'number') {
      // Check if the number is already in milliseconds
      const timestamp = dateStr > 9999999999 ? dateStr : dateStr * 1000;
      date = new Date(timestamp);
    } else {
      date = new Date(dateStr);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateStr);
      return ['Invalid date', ''];
    }

    return [
      date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    ];
  } catch (error) {
    console.error('Error formatting date:', dateStr, error);
    return ['Invalid date', ''];
  }
}

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [dateTime, setDateTime] = useState<[string, string]>(["", ""]);
  const nav = useNavigate();

  useEffect(() => {
    if (user?.userId && bookingId) {
      (async () => {
        const resBooking = await getBooking(user.userId, parseInt(bookingId));
        console.log('Booking data:', {
          bookingDate: resBooking.bookingDate,
          showDate: resBooking.showDate
        });
        setBooking(resBooking);
        if (resBooking?.bookingDate) {
          setDateTime(formatDateTime(resBooking.bookingDate));
        }
      })();
    }
  }, [user?.userId, bookingId]);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-darkgray-900 via-darkgray-800 to-red-900">
        <div className="animate-pulse text-white text-xl">Loading booking details...</div>
      </div>
    );
  }

  // Format dates
  const [showDate, showTime] = formatDateTime(booking.showDate);
  console.log('Formatting show date:', {
    original: booking.showDate,
    formatted: { showDate, showTime }
  });

  const subtotal = booking.tickets.reduce((sum, ticket) => sum + ticket.price, 0);
  const discount = booking.promotion ? (subtotal * booking.promotion.discountPercentage / 100) : 0;
  const tax = (subtotal - discount) * 0.07; // 7% tax
  const bookingFee = 3.00;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-darkgray-900 via-darkgray-800 to-red-900">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button
          variant="ghost"
          className="text-white hover:text-primary hover:bg-white/10"
          onClick={() => nav(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Movies
        </Button>

        <Card className="p-8 bg-darkgray-800 border-darkgray-700 text-white shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500/20 rounded-full p-3">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-gray-400">Thank you for your purchase</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between text-gray-300">
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span className="font-semibold">Booking ID:</span>
              </div>
              <span className="font-mono">{booking.bookingId}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Film className="h-5 w-5" />
              <span className="text-xl font-semibold">{booking.movieTitle}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <CalendarDays className="h-5 w-5" />
                <span>Show Date: {showDate} at {showTime}</span>
              </div>
              <div className="flex items-center justify-end space-x-2 text-gray-300">
                <Clock className="h-5 w-5" />
                <span>Booked on: {dateTime[0]} at {dateTime[1]}</span>
              </div>
            </div>

            <Separator className="my-6 bg-darkgray-600" />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Film className="h-5 w-5" />
                <h3 className="text-xl font-semibold">Your Tickets</h3>
              </div>
              <div className="bg-darkgray-700/50 rounded-lg divide-y divide-darkgray-600">
                {booking.tickets.map((ticket) => (
                  <div key={ticket.ticketId} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Badge variant="outline" className="bg-primary/20 border-primary text-primary">
                            {ticket.ticketType}
                          </Badge>
                          <span>Seat {ticket.seatNumber}</span>
                        </div>
                      </div>
                      <span className="font-medium">${ticket.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6 bg-darkgray-600" />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <h3 className="text-xl font-semibold">Payment Details</h3>
              </div>
              <div className="bg-darkgray-700/50 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-darkgray-600">
                  <span className="text-gray-400">Card Details</span>
                  <span>{booking.cardFour}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Booking Fee</span>
                    <span>${bookingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax (7%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {(booking.totalAmount - (subtotal + bookingFee + tax)) <0 && <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-${((booking.totalAmount - (subtotal + bookingFee + tax)) * -1).toFixed(2)}</span>
                  </div>}
                  <div className="flex justify-between pt-2 border-t border-darkgray-600 font-semibold">
                    <span>Total Paid</span>
                    <span>${booking.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}