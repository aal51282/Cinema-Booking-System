import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart, CartTicket } from '../../util/types';
import Cookies from 'js-cookie';
import { calculateCartTotals, initializeCart, CART_STORAGE_KEY } from '../../services/cartAPI';

interface CartContextType {
    cart: Cart | null;
    addToCart: (userId: number, ticket: CartTicket) => void;
    removeFromCart: (userId: number, seatNumber: string, showId: number) => void;
    clearCart: (userId: number) => void;
    applyPromotion: (userId: number, promotion: { description: string }) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);

    // Load or initialize cart on mount
    useEffect(() => {
        const savedCart = Cookies.get(CART_STORAGE_KEY);
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        } else {
            // If no cart exists, initialize with a temporary userId of 0
            // This will be updated when the user logs in
            const newCart = initializeCart(0);
            setCart(newCart);
            Cookies.set(CART_STORAGE_KEY, JSON.stringify(newCart), { expires: 7 });
        }
    }, []);

    // Save cart to cookies whenever it changes
    useEffect(() => {
        if (cart) {
            Cookies.set(CART_STORAGE_KEY, JSON.stringify(cart), { expires: 7 });
        }
    }, [cart]);

    const addToCart = (userId: number, ticket: CartTicket) => {
        setCart(currentCart => {
            if (!currentCart) {
                currentCart = initializeCart(userId);
            }

            // Update userId if it's different (e.g., after login)
            if (currentCart.userId !== userId) {
                currentCart.userId = userId;
            }

            const updatedItems = [...currentCart.items, { ticket }];
            // const totals = calculateCartTotals(updatedItems);

            return {
                ...currentCart,
                items: updatedItems,
                // ...totals,
                quantity: updatedItems.length
            };
        });
    };

    const removeFromCart = (userId: number, seatNumber: string, showId: number) => {
        setCart(currentCart => {
            if (!currentCart) return null;

            // Update userId if it's different
            if (currentCart.userId !== userId) {
                currentCart.userId = userId;
            }

            const updatedItems = currentCart.items.filter(
                item => !(item.ticket.seatNumber === seatNumber && item.ticket.showId === showId)
            );
            // const totals = calculateCartTotals(updatedItems);

            return {
                ...currentCart,
                items: updatedItems,
                // ...totals,
                quantity: updatedItems.length
            };
        });
    };

    const clearCart = (userId: number) => {
        const emptyCart = initializeCart(userId);
        setCart(emptyCart);
    };

    const applyPromotion = (userId: number, promotion: { description: string }) => {
        setCart(currentCart => {
            if (!currentCart) {
                currentCart = initializeCart(userId);
            }

            // Update userId if it's different
            if (currentCart.userId !== userId) {
                currentCart.userId = userId;
            }

            return {
                ...currentCart,
                promotion
            };
        });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, applyPromotion }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 