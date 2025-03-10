// สร้าง Context สำหรับจัดการข้อมูลตะกร้าสินค้าทั่วแอพพลิเคชัน
import {createContext, useContext, useEffect, useState} from "react";

const CartContext = createContext();
const CART_STORAGE_KEY = 'pumpkin_pos_cart';
export const CartProvider = ({children}) => {
    const [cartItems, setCartItems] = useState([]);

    // โหลดข้อมูลจาก localStorage เมื่อคอมโพเนนต์ถูกโหลด
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error("Error loading cart from localStorage:", error);
            // กรณีเกิดข้อผิดพลาด ให้เริ่มต้นด้วยตะกร้าว่าง
            setCartItems([]);
        }
    }, []);

    // บันทึกข้อมูลลง localStorage ทุกครั้งที่ cartItems เปลี่ยนแปลง
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error("Error saving cart to localStorage:", error);
        }
    }, [cartItems]);

    const addToCart = (item, quantity = 1) => {
        console.log(item)
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.spcode === item.spcode);
            if (existingItem) {
                return prevItems.map(i =>
                    i.pid === item.spcode
                        ? {...i,
                            quantity: i.quantity + quantity}
                        : i
                );
            }
            return [...prevItems, {...item, quantity}];
        });
    };

    const removeFromCart = (spcode) => {
        setCartItems(prevItems => prevItems.filter(item => item.spcode !== spcode));
    };

    const updateQuantity = (spcode, quantity) => {
        if (quantity <= 0) {
            removeFromCart(spcode);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.spcode === spcode ? {...item, quantity} : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within CartProvider");
    }
    return context;
};
