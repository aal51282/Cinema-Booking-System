import React, { useEffect, useState } from "react";
import { useCart } from "@/components/custom/CartContext";
import {
  calculateCartTotalsAPI,
  checkout,
  applyPromoCode,
} from "@/services/cartAPI";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMovieByShowId } from "@/services/movieAPI";
import { CardInformation, CartItem, Movie } from "../util/types";
import { FaTrash } from "react-icons/fa";
import { useAuth } from "@/components/custom/AuthContext";
import CardEditor from "../components/custom/CardEditor";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CartItemComponent: React.FC<{
  item: CartItem;
  onDelete: (showId: number, seatNumber: string) => void;
}> = ({ item, onDelete }) => {
  const [movieDetails, setMovieDetails] = useState<Movie | null>(null);
  const [dateString, setDateString] = useState<string>("");
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    (async () => {
      const movie = await getMovieByShowId(item.ticket.showId);
      const tempDate = new Date(
        movie.shows!.find((show) => show.showId === item.ticket.showId)!.showDate
      );
      setDateString(tempDate.toLocaleDateString()); // Format date as MM/DD/YYYY
      setTimeString(
        tempDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      ); // Format time as HH:MM AM/PM
      setMovieDetails(movie);
    })();
  }, [item.ticket.showId]);

  return (
    <Card className="flex justify-between mb-2 p-4 relative items-center">
      {movieDetails && (
        <div className="flex items-center">
          <img
            src={movieDetails.movie_poster}
            alt={movieDetails.title}
            className="w-16 h-24 mr-4"
          />
          <div>
            <div>
              {item.ticket.ticketType} ticket for seat {item.ticket.seatNumber} on{" "}
              {dateString} @ {timeString}
            </div>
            <span className="text-lg font-semibold">{movieDetails.title}</span>
          </div>
        </div>
      )}
      <span>${item.ticket.price.toFixed(2)}</span>
      <Button
        variant={"ghost"}
        onClick={() => onDelete(item.ticket.showId, item.ticket.seatNumber)}
        className="absolute text-white hover:text-primary hover:bg-transparent transition-colors right-2 top-2"
      >
        <FaTrash />
      </Button>
    </Card>
  );
};

const CartPage: React.FC = () => {
  const { cart, clearCart, removeFromCart, applyPromotion } = useCart();
  const [totals, setTotals] = useState<{
    subtotal: number;
    saleTax: number;
    totalPrice: number;
    discountAmount?: number;
  } | null>(null);
  const { user, fetchPaymentMethods, addCard } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<CardInformation[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardInformation | null>(null);
  const [newCardInfo, setNewCardInfo] = useState<CardInformation | null>(null);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const nav = useNavigate();

  useEffect(() => {
    const loadPaymentMethods = async () => {
      const methods = await fetchPaymentMethods();
      setPaymentMethods(methods || []);
      // Set the default selected card
      if (methods && methods.length > 0) {
        setSelectedCard(methods[0]);
      }
    };
    loadPaymentMethods();
  }, [fetchPaymentMethods]);

  useEffect(() => {
    const fetchCartTotals = async () => {
      if (cart) {
        try {
          const calculatedTotals = await calculateCartTotalsAPI(cart);
          if (cart.promotion) {
            const discountAmount =
              calculatedTotals.subtotal -
              (calculatedTotals.totalPrice - calculatedTotals.saleTax - 3.0);
            setTotals({ ...calculatedTotals, discountAmount });
          } else {
            setTotals(calculatedTotals);
          }
        } catch (error) {
          console.error("Error fetching cart totals:", error);
        }
      }
    };

    fetchCartTotals();
  }, [cart]);

  const handleClearCart = () => {
    if (cart) {
      clearCart(cart.userId);
    }
  };

  const handleDeleteItem = (showId: number, seatNumber: string) => {
    if (cart) {
      removeFromCart(cart.userId, seatNumber, showId);
    }
  };

  const handleCardSelect = (card: CardInformation) => {
    setSelectedCard(card);
    setShowCardEditor(false);
    setNewCardInfo(null);
  };

  const handleNewCard = () => {
    setSelectedCard(null);
    setShowCardEditor(true);
  };

  const handleCardEditorChange = (card: CardInformation) => {
    setNewCardInfo(card);
    setSelectedCard(card); // Temporarily set as selected
  };

  const handleCheckout = async () => {
    if (!cart || !(cart.items.length > 0)) {
      alert("You must have items in the cart to checkout.");
      return;
    }
    if (selectedCard) {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        let cardToUse = selectedCard;
        if (newCardInfo) {
          const registeredCard = await addCard(newCardInfo);
          console.log("Successfully Registered Card: ", registeredCard)
          cardToUse = {card_id: registeredCard.paymentId} as any;
        }
        console.log("Checking out Cart: ", cart);
        console.log("Using card: ", cardToUse.card_id);
        const bookingDetails = await checkout(cart!, cardToUse.card_id!);
        clearCart(cart!.userId);
        nav(`/confirmation/${bookingDetails.bookingId}`);
      } catch (err) {
        console.log(err)
        setError("Checkout failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("You must select a payment method.");
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promotion code");
      return;
    }

    setLoading(true);
    setPromoError(null);
    setPromoSuccess(null);

    try {
      const result = await applyPromoCode(cart!.userId, promoCode);
      applyPromotion(cart!.userId, { description: result.promotion.description });
      const updatedTotals = await calculateCartTotalsAPI(cart!);
      setTotals(updatedTotals);
      setPromoSuccess("Promotion applied successfully!");
      setPromoCode("");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setPromoError(err.response.data.message);
      } else {
        setPromoError(
          "Sorry, this promotion code is not valid or has expired. Please check and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 text-white bg-gradient-to-br from-darkgray-900 via-darkgray-800 to-red-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Your Cart</h1>
        {cart && cart.items.length > 0 ? (
          <Card className="w-full bg-darkgray-800 border-darkgray-700 p-6 rounded-xl shadow-xl">
            <CardContent>
              <div className="mb-4">
                <label className="text-lg">Select Payment Method</label>
                <Select
                  onValueChange={(value) => {
                    if (value === "new") {
                      handleNewCard();
                    } else {
                      handleCardSelect(paymentMethods[Number(value)]);
                    }
                  }}
                  value={
                    showCardEditor
                      ? "new"
                      : selectedCard
                      ? paymentMethods.findIndex(
                          (card) => card.card_id === selectedCard.card_id
                        ).toString()
                      : paymentMethods.length > 0
                      ? "0"
                      : "new"
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a card" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((card, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {card.cardType} **** {card.cardNumber.slice(-4)}
                      </SelectItem>
                    ))}
                    {paymentMethods.length < 3 && (
                      <SelectItem value="new">Add New Card</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showCardEditor && (
                  <CardEditor onChange={handleCardEditorChange} />
                )}
              </div>
              <ul className="mb-4">
                {cart.items.map((item, index) => (
                  <CartItemComponent
                    key={index}
                    item={item}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </ul>

              {/* Promotion Code Section */}
              <div className="border-t border-darkgray-700 pt-4 mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promotion code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-darkgray-700 border-darkgray-600"
                  />
                  <Button
                    onClick={handleApplyPromo}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Apply
                  </Button>
                </div>
                {promoError && (
                  <p className="text-red-500 text-sm mt-1">{promoError}</p>
                )}
                {promoSuccess && (
                  <p className="text-green-500 text-sm mt-1">{promoSuccess}</p>
                )}
              </div>

              <div className="border-t border-darkgray-700 pt-4 w-full">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="text-lg">Subtotal:</td>
                      <td className="text-lg text-right">
                        ${totals?.subtotal.toFixed(2) || 0}
                      </td>
                    </tr>
                    {totals?.discountAmount ? (
                      <tr>
                        <td className="text-lg text-green-500">Discount:</td>
                        <td className="text-lg text-right text-green-500">
                          -${totals.discountAmount.toFixed(2)}
                        </td>
                      </tr>
                    ) : null}
                    <tr>
                      <td className="text-lg">Booking Fee:</td>
                      <td className="text-lg text-right">$3.00</td>
                    </tr>
                    <tr>
                      <td className="text-lg">Sales Tax:</td>
                      <td className="text-lg text-right">
                        ${totals?.saleTax.toFixed(2) || 0}
                      </td>
                    </tr>
                    <tr className="border-t border-darkgray-700">
                      <td className="text-lg font-bold pt-2">Total Price:</td>
                      <td className="text-lg font-bold text-right pt-2">
                        ${totals?.totalPrice.toFixed(2) || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-4">
              <Button
                onClick={handleClearCart}
                className="bg-red-600 hover:bg-red-500 w-full mr-2"
              >
                Clear Cart
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="bg-green-600 hover:bg-green-500 w-full"
              >
                {loading ? "Processing..." : "Checkout"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <p className="text-center text-lg">Your cart is empty.</p>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      </div>
    </div>
  );
};

export default CartPage;
