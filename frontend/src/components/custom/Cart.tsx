import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

export default function Cart() {
    const { cart } = useCart();
    const cartCount = cart?.items.length || 0;

    return (
        <Link to={'/cart'} className='relative hover:bg-darkgray-800 p-3 rounded-full'>
            <ShoppingCart size={24} color='white'/>
            {cartCount > 0 && (
                <div className="text-sm text-white bg-red-600 rounded-full p-1 size-5 flex items-center justify-center font-bold absolute top-1 right-0">
                    <span>{cartCount}</span>
                </div>
            )}
        </Link>
    );
}