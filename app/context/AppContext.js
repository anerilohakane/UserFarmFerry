// // context/AppContext.js
// import React, { createContext, useState, useContext } from 'react';

// const AppContext = createContext();

// export const AppProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);
//   const [wishlistItems, setWishlistItems] = useState([]);

//   // Add to Cart
//   const addToCart = (item) => {
//     const existingItem = cartItems.find((i) => i.id === item.id);
//     if (existingItem) {
//       setCartItems((prevItems) =>
//         prevItems.map((i) =>
//           i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
//         )
//       );
//     } else {
//       setCartItems((prevItems) => [...prevItems, { ...item, quantity: 1 }]);
//     }
//   };

//   // Increase quantity
//   const increaseQty = (id) => {
//     setCartItems((prevItems) =>
//       prevItems.map((item) =>
//         item.id === id ? { ...item, quantity: item.quantity + 1 } : item
//       )
//     );
//   };

//   // Decrease quantity
//   const decreaseQty = (id) => {
//     setCartItems((prevItems) =>
//       prevItems
//         .map((item) =>
//           item.id === id ? { ...item, quantity: item.quantity - 1 } : item
//         )
//         .filter((item) => item.quantity > 0)
//     );
//   };

//   // Remove item from cart
//   const removeFromCart = (id) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
//   };

//   // Add to Wishlist
//   const addToWishlist = (item) => {
//     const exists = wishlistItems.find((i) => i.id === item.id);
//     if (!exists) {
//       setWishlistItems((prevItems) => [...prevItems, item]);
//     }
//   };

//   // Remove from Wishlist
//   const removeFromWishlist = (id) => {
//     setWishlistItems((prevItems) =>
//       prevItems.filter((item) => item.id !== id)
//     );
//   };

//   // Optional direct update methods
//   const updateCartItems = (items) => setCartItems(items);
//   const updateWishlistItems = (items) => setWishlistItems(items);

//   return (
//     <AppContext.Provider
//       value={{
//         cartItems,
//         wishlistItems,
//         addToCart,
//         removeFromCart,
//         increaseQty,
//         decreaseQty,
//         addToWishlist,
//         removeFromWishlist,
//         updateCartItems,
//         updateWishlistItems,
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   );
// };

// export const useAppContext = () => useContext(AppContext);



// context/AppContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationsAPI, wishlistAPI } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [allProducts, setAllProducts] = useState([
    {
      id: 1,
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      price: 45,
      originalPrice: 60,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop',
      discount: 25,
      rating: 4.5,
      farmer: 'Rajesh Kumar',
      inStock: true,
      reviews: 124,
    },
    {
      id: 2,
      name: 'Fresh Apples',
      category: 'Fruits',
      price: 120,
      originalPrice: 150,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop',
      discount: 20,
      rating: 4.3,
      farmer: 'Priya Sharma',
      inStock: true,
      reviews: 89,
    },
    {
      id: 3,
      name: 'Basmati Rice',
      category: 'Grains',
      price: 90,
      originalPrice: 110,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1609137144797-1a16f276b90d?w=200&h=200&fit=crop',
      discount: 18,
      rating: 4.6,
      farmer: 'Manoj Yadav',
      inStock: true,
      reviews: 63,
    },
    {
      id: 4,
      name: 'Cashew Nuts',
      category: 'Dry Fruits',
      price: 450,
      originalPrice: 500,
      unit: '500g',
      image: 'https://images.unsplash.com/photo-1624176263141-b3e7c92e76d1?w=200&h=200&fit=crop',
      discount: 10,
      rating: 4.8,
      farmer: 'Anita Desai',
      inStock: true,
      reviews: 140,
    },
    // Add more products here if needed
  ]);

  // Load wishlist from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          setWishlistItems([]);
          return;
        }
        const res = await wishlistAPI.getWishlist();
        setWishlistItems(res.data.data.wishlist || []);
      } catch (e) {
        if (e?.response?.status === 401) {
          // Not logged in or token expired, clear wishlist
          setWishlistItems([]);
        } else {
          console.error('Failed to load wishlist', e);
        }
      }
    })();
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications();
      const notifs = Array.isArray(response.data.data) ? response.data.data : [];
      setNotifications(notifs);
      setUnreadNotificationCount(notifs.filter(n => n.unread).length);
    } catch (error) {
      setNotifications([]);
      setUnreadNotificationCount(0);
    }
  };

  // Poll for notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Increase quantity
  const increaseQty = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrease quantity
  const decreaseQty = (id) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Add to Wishlist
  const addToWishlist = async (item) => {
    try {
      const productId = item._id;
      if (!productId) throw new Error('Product _id is required');
      const res = await wishlistAPI.addToWishlist(productId);
      setWishlistItems(res.data.data.wishlist || []);
    } catch (e) {
      console.error('Failed to add to wishlist', e);
    }
  };

  // Remove from Wishlist
  const removeFromWishlist = async (id) => {
    try {
      const res = await wishlistAPI.removeFromWishlist(id);
      setWishlistItems(res.data.data.wishlist || []);
    } catch (e) {
      console.error('Failed to remove from wishlist', e);
    }
  };

  const updateCartItems = (items) => {
    console.log('updateCartItems called with:', items);
    setCartItems(Array.isArray(items) ? items : []);
  };
  // Use this only for full refreshes from backend, not for add/remove actions!
  const updateWishlistItems = (items) => setWishlistItems(items);

  return (
    <AppContext.Provider
      value={{
        cartItems,
        wishlistItems,
        increaseQty,
        decreaseQty,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        updateCartItems,
        updateWishlistItems,
        allProducts,
        setAllProducts,
        notifications,
        unreadNotificationCount,
        fetchNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
