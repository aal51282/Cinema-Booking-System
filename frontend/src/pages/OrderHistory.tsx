import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserHistory } from "@/services/bookingAPI";
import { useAuth } from "@/components/custom/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function OrderHistory() {
  const [bookings, setInvoices] = useState<any[]>([]);

  const { user } = useAuth();

  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      setInvoices(await getUserHistory(user?.userId!));
    })();
  }, []);

  return (
    <div className="max-w-fit mx-auto px-4 py-6 space-y-6">
      <Button
        variant="ghost"
        className="mb-4 text-white hover:text-red-400 transition-colors"
        onClick={() => nav(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Movies
      </Button>
      <Card className="bg-darkgray-800 border-darkgray-700 w-fit h-fit m-auto mb-4 mt-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Order History
          </CardTitle>
          <CardDescription className="text-darkgray-300">
            View your order history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <Table>
              <TableCaption>A list of your recent bookings.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-fit text-nowrap">
                    Booking ID
                  </TableHead>
                  <TableHead className="w-fit text-nowrap">
                    Movie Title
                  </TableHead>
                  <TableHead className="w-fit text-nowrap">
                    Date Ordered
                  </TableHead>
                  <TableHead className="w-fit text-nowrap">Show Date</TableHead>
                  <TableHead className="w-fit text-nowrap">
                    Payment Method
                  </TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-white">
                {bookings.map((booking) => {
                  return (
                    <TableRow key={booking.bookingId}>
                      <TableCell className="w-fit text-nowrap">
                        {booking.bookingId}
                      </TableCell>
                      <TableCell className="w-fit text-nowrap">
                        {booking.movieTitle}
                      </TableCell>
                      <TableCell className="w-fit text-nowrap">
                        {new Date(
                          booking.bookingDate * 1000
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="w-fit text-nowrap">
                        {new Date(booking.showDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="w-fit text-nowrap">
                        {booking.cardFour}
                      </TableCell>
                      <TableCell className="w-fit text-nowrap">
                        ${booking.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() =>
                            nav(`/confirmation/${booking.bookingId}`)
                          }
                        >
                          View Confirmation
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-white">There is no account history.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
