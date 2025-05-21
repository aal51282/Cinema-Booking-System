// Import necessary modules and components
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Movie, CartTicket, TicketType } from '@/util/types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/custom/AuthContext';
import { useCart } from '@/components/custom/CartContext';
import { getMovieByShowId, getShowSeats } from '@/services/movieAPI';
import { getTicketTypes } from '@/services/cartAPI';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

enum SeatStatus {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    SELECTED = 'SELECTED',
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const LEFT_SECTION = 4;    // 4 seats on the left
const CENTER_SECTION = 7;  // 7 seats in center
const RIGHT_SECTION = 4;   // 4 seats on the right
const TOTAL_SEATS = LEFT_SECTION + CENTER_SECTION + RIGHT_SECTION; // Should equal 15

export default function PurchaseTickets() {
    const { isAuthenticated, user } = useAuth();
    const { addToCart, cart } = useCart();
    const [dateTime, setDateTime] = useState({
        date: "Loading",
        time: "Loading",
    });
    const nav = useNavigate();

    if (!isAuthenticated || !user) {
        alert("You must be logged in to purchase tickets!");
        nav('/login');
        return null;
    }

    const { showId } = useParams();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [modifiedSeats, setModifiedSeats] = useState<{ id: string; status: SeatStatus; ticketType?: string }[]>([]);
    const [tickets, setTickets] = useState<TicketType[]>([]);

    let id = Number(showId);
    if (isNaN(id)) return <p className='text-red-600'>ERROR</p>;

    useEffect(() => {
        (async () => {
            const tempMovie = await getMovieByShowId(id);
            if (!tempMovie) throw Error('No movie by that id');
            setMovie(tempMovie);
            const tempDateObject = new Date(tempMovie.shows!.find(show => show.showId == id)?.showDate!);
            setDateTime({
                date: tempDateObject.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
                time: tempDateObject.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            });

            // Initialize all seats as available
            const initialSeats = ROWS.flatMap(row =>
                Array.from({ length: TOTAL_SEATS }, (_, i) => ({
                    id: `${row}${i + 1}`,
                    status: SeatStatus.AVAILABLE,
                    ticketType: undefined,
                }))
            );
            setModifiedSeats(initialSeats);

            // Fetch ticket types from the backend
            const fetchedTickets = await getTicketTypes();
            setTickets(fetchedTickets);

            // Mark seats that are currently in the cart or booked as OCCUPIED
            if (cart && cart.items) {
                const occupiedSeats = cart.items.filter(item => item.ticket.showId == id).map(item => item.ticket.seatNumber);
                const bookedSeats = showId ? (await getShowSeats(showId)).map((seatObj: any) => seatObj.seatNumber) : null;
                if (bookedSeats) occupiedSeats.push(...bookedSeats);
                setModifiedSeats(prevSeats =>
                    prevSeats.map(seat =>
                        occupiedSeats.includes(seat.id)
                            ? { ...seat, status: SeatStatus.OCCUPIED }
                            : seat
                    )
                );
            }
        })();
    }, [id, cart]);

    const handleSeatClick = (seatId: string) => {
        setModifiedSeats(prev => prev.map(seat => {
            if (seat.id === seatId) {
                if (seat.status === SeatStatus.OCCUPIED) return seat;
                if (seat.status === SeatStatus.AVAILABLE) {
                    return {
                        ...seat,
                        status: SeatStatus.SELECTED,
                        ticketType: tickets[0]?.ticketType, // Default to the first ticket type
                    };
                } else if (seat.status === SeatStatus.SELECTED) {
                    return {
                        ...seat,
                        status: SeatStatus.AVAILABLE,
                        ticketType: undefined,
                    };
                }
            }
            return seat;
        }));
    };

    const handleTicketTypeChange = (seatId: string, newTicketType: string) => {
        setModifiedSeats(prev => prev.map(seat => {
            if (seat.id === seatId) {
                return {
                    ...seat,
                    ticketType: newTicketType,
                };
            }
            return seat;
        }));
    };

    const selectedSeats = modifiedSeats.filter(seat => seat.status === SeatStatus.SELECTED);

    const totalPrice = selectedSeats.reduce((sum, seat) => {
        const ticketType = tickets.find(t => t.ticketType === seat.ticketType);
        return sum + (ticketType?.price || 0);
    }, 0);

    const handleSubmit = () => {
        if (selectedSeats.some(seat => !seat.ticketType)) {
            alert('Please select a ticket type for each selected seat.');
            return;
        }

        const cartTickets = selectedSeats.map(seat => ({
            showId: id,
            ticketType: seat.ticketType!,
            price: tickets.find(t => t.ticketType === seat.ticketType)?.price || 0,
            seatNumber: seat.id,
        }));

        cartTickets.forEach(cartTicket => {
            addToCart(user.userId, cartTicket);
        });

        nav('/cart');
    };

    return (
        <>
            {movie && (
                <div className="min-h-screen p-6 text-white bg-gradient-to-br from-darkgray-900 via-darkgray-800 to-red-900">
                    <div className="max-w-5xl mx-auto">
                        <Button
                            variant="ghost"
                            className="mb-4 text-white hover:text-red-400 transition-colors text-base"
                            onClick={() => nav(-1)}
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Movie Details
                        </Button>

                        <div className="mb-6 text-center">
                            <h1 className="text-4xl font-bold mb-3">{movie.title}</h1>
                            <div className="flex justify-center items-center space-x-4">
                                <Badge variant="outline" className="text-xl px-3 py-1 text-white border-white">
                                    {dateTime.date}
                                </Badge>
                                <Badge variant="outline" className="text-xl px-3 py-1 text-white border-white">
                                    {dateTime.time}
                                </Badge>
                            </div>
                        </div>

                        <Card className='text-white bg-darkgray-800/70 border-darkgray-700 p-6 rounded-xl shadow-xl'>
                            <CardTitle className='text-center mb-6 text-3xl font-bold'>
                                Select Your Seats
                            </CardTitle>
                            <CardContent>
                                <div className="flex flex-col items-center space-y-8">
                                    {/* Screen */}
                                    <div className="w-[80%] h-8 bg-gradient-to-b from-white/20 to-transparent rounded-lg mb-12 relative">
                                        <p className="absolute -bottom-8 w-full text-center text-sm text-gray-400">Screen</p>
                                    </div>

                                    {/* Seats Container */}
                                    <div className="flex justify-center w-full">
                                        <div className='flex flex-col gap-3'>
                                            {ROWS.map(row => (
                                                <div key={row} className="flex items-center gap-3">
                                                    {/* Row label */}
                                                    <div className="w-8 text-gray-400 text-center">{row}</div>

                                                    {/* Left section */}
                                                    {Array.from({ length: LEFT_SECTION }).map((_, i) => {
                                                        const seatId = `${row}${i + 1}`;
                                                        const seat = modifiedSeats.find(s => s.id === seatId);
                                                        return (
                                                            <Card
                                                                key={seatId}
                                                                className={cn(
                                                                    `border-darkgray-500 w-10 h-10
                                                                    flex items-center justify-center
                                                                    text-white bg-darkgray-700 hover:cursor-pointer
                                                                    hover:bg-darkgray-600 transition-all duration-300 rounded-lg shadow-md
                                                                    text-sm font-medium`,
                                                                    seat?.status === SeatStatus.OCCUPIED && 'bg-darkgray-400 text-darkgray-600 hover:cursor-not-allowed hover:bg-darkgray-400',
                                                                    seat?.status === SeatStatus.SELECTED && 'bg-red-600 hover:bg-red-500 transform hover:scale-105'
                                                                )}
                                                                onClick={() => seat && handleSeatClick(seatId)}
                                                            >
                                                                {seatId}
                                                            </Card>
                                                        );
                                                    })}

                                                    {/* Left aisle */}
                                                    <div className="w-8" />

                                                    {/* Center section */}
                                                    {Array.from({ length: CENTER_SECTION }).map((_, i) => {
                                                        const seatId = `${row}${i + LEFT_SECTION + 1}`;
                                                        const seat = modifiedSeats.find(s => s.id === seatId);
                                                        return (
                                                            <Card
                                                                key={seatId}
                                                                className={cn(
                                                                    `border-darkgray-500 w-10 h-10
                                                                    flex items-center justify-center
                                                                    text-white bg-darkgray-700 hover:cursor-pointer
                                                                    hover:bg-darkgray-600 transition-all duration-300 rounded-lg shadow-md
                                                                    text-sm font-medium`,
                                                                    seat?.status === SeatStatus.OCCUPIED && 'bg-darkgray-400 text-darkgray-600 hover:cursor-not-allowed hover:bg-darkgray-400',
                                                                    seat?.status === SeatStatus.SELECTED && 'bg-red-600 hover:bg-red-500 transform hover:scale-105'
                                                                )}
                                                                onClick={() => seat && handleSeatClick(seatId)}
                                                            >
                                                                {seatId}
                                                            </Card>
                                                        );
                                                    })}

                                                    {/* Right aisle */}
                                                    <div className="w-8" />

                                                    {/* Right section */}
                                                    {Array.from({ length: RIGHT_SECTION }).map((_, i) => {
                                                        const seatId = `${row}${i + LEFT_SECTION + CENTER_SECTION + 1}`;
                                                        const seat = modifiedSeats.find(s => s.id === seatId);
                                                        return (
                                                            <Card
                                                                key={seatId}
                                                                className={cn(
                                                                    `border-darkgray-500 w-10 h-10
                                                                    flex items-center justify-center
                                                                    text-white bg-darkgray-700 hover:cursor-pointer
                                                                    hover:bg-darkgray-600 transition-all duration-300 rounded-lg shadow-md
                                                                    text-sm font-medium`,
                                                                    seat?.status === SeatStatus.OCCUPIED && 'bg-darkgray-400 text-darkgray-600 hover:cursor-not-allowed hover:bg-darkgray-400',
                                                                    seat?.status === SeatStatus.SELECTED && 'bg-red-600 hover:bg-red-500 transform hover:scale-105'
                                                                )}
                                                                onClick={() => seat && handleSeatClick(seatId)}
                                                            >
                                                                {seatId}
                                                            </Card>
                                                        );
                                                    })}

                                                    {/* Row label on right side */}
                                                    <div className="w-8 text-gray-400 text-center">{row}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            {selectedSeats.length === 0 && (
                                <div className='mt-6 text-center'>
                                    <p className='text-xl text-gray-400 border-b-2 border-gray-600 inline-block pb-1 transition-all duration-300'>
                                        Select a seat
                                    </p>
                                </div>
                            )}
                            {selectedSeats.length > 0 && (
                                <>
                                    <div className="mt-8 border-t border-darkgray-700 pt-6">
                                        <h2 className="text-2xl font-semibold mb-4">Selected Seats</h2>
                                        {selectedSeats.map((seat) => (
                                            <div key={seat.id} className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-lg">
                                                        Seat {seat.id}
                                                    </span>
                                                </div>
                                                <div className="w-48">
                                                    <Select
                                                        value={seat.ticketType}
                                                        onValueChange={(value) => handleTicketTypeChange(seat.id, value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select ticket type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {tickets.map((ticket) => (
                                                                <SelectItem key={ticket.ticketType} value={ticket.ticketType}>
                                                                    {ticket.ticketType} - ${ticket.price.toFixed(2)}{ticket.ticketType == "Child" && ` (<12)`}{ticket.ticketType == "Senior"  && ` (65+)`}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="mt-6 text-right">
                                            <p className="text-xl font-semibold">Total: ${totalPrice.toFixed(2)}</p>
                                        </div>
                                        <CardFooter className="mt-6 px-0">
                                            <Button
                                                className='bg-red-600 text-white hover:bg-red-500 w-full text-xl font-bold shadow-lg py-6 rounded-xl transition-all duration-300 transform hover:scale-105'
                                                onClick={handleSubmit}
                                                disabled={selectedSeats.some(seat => !seat.ticketType)}
                                            >
                                                Add to Cart (${totalPrice.toFixed(2)})
                                            </Button>
                                        </CardFooter>
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            )}
        </>
    );
}
