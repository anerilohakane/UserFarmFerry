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
import { notificationsAPI, wishlistAPI, cartAPI } from '../services/api';

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
        // Backend returns: { success: true, data: { customer: "...", items: [...] } }
        const items = res.data.data?.items || [];
        setWishlistItems(items);
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
    // try {
    //   const response = await notificationsAPI.getNotifications();
    //   const notifs = Array.isArray(response.data.data) ? response.data.data : [];
    //   setNotifications(notifs);
    //   setUnreadNotificationCount(notifs.filter(n => n.unread).length);
    // } catch (error) {
    //   setNotifications([]);
    //   setUnreadNotificationCount(0);
    // }
  };

  // Poll for notifications every 30 seconds
  useEffect(() => {
    // fetchNotifications();
    // const interval = setInterval(fetchNotifications, 30000);
    // return () => clearInterval(interval);
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

  // Helper to fetch wishlist (exposed for refresh)
  const fetchWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setWishlistItems([]);
        return;
      }
      const res = await wishlistAPI.getWishlist();
      if (res.data.success) {
        updateWishlistItems(res.data.data.wishlist || res.data.data.items || []);
      }
    } catch (e) {
      if (e?.response?.status === 401) {
        setWishlistItems([]);
      } else {
        console.error('Silent fetch wishlist failed', e);
      }
    }
  };

  // Helper to fetch cart
  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setCartItems([]);
        return;
      }
      const res = await cartAPI.getCart();
      if (res.data.success) {
        // Assuming data.cart.items or data.items
        const items = res.data.data?.cart?.items || res.data.data?.items || [];
        setCartItems(items);
      }
    } catch (e) {
      if (e?.response?.status !== 404) { // 404 might mean empty cart for some backends
        console.error('Silent fetch cart failed', e);
      }
    }
  };

  // Fetch initial data
  useEffect(() => {
    (async () => {
      await Promise.all([fetchWishlist(), fetchCart()]);
    })();
  }, []);

  // Add to Cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      console.log('AppContext: Adding to cart:', productId);
      // Optimistic? Maybe later. For now just standard.
      const res = await cartAPI.addToCart(productId, quantity);
      if (res.data.success) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to add to cart', e);
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      console.log('AppContext: Removing from cart:', productId);
      // Optimistic update
      const previousItems = [...cartItems];
      setCartItems((prev) => prev.filter((item) => {
        const itemId = item.productId || item.product?._id || item.product || item.id;
        return itemId?.toString() !== productId?.toString();
      }));

      const res = await cartAPI.removeCartItem(productId);
      if (res.data.success) {
        await fetchCart();
        return true;
      } else {
        throw new Error('Failed to remove');
      }
    } catch (e) {
      console.error('Failed to remove from cart', e);
      // Revert if needed, but for removal usually we just re-fetch
      await fetchCart();
      return false;
    }
  };

  // Update Cart Quantity
  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) {
        return removeFromCart(productId);
      }

      console.log('AppContext: Updating quantity:', productId, quantity);
      // Optimistic update
      setCartItems(prev => prev.map(item => {
        const itemId = item.productId || item.product?._id || item.product || item.id;
        if (itemId?.toString() === productId?.toString()) {
          return { ...item, quantity };
        }
        return item;
      }));

      const res = await cartAPI.updateCartItem(productId, quantity);
      if (res.data.success) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to update cart quantity', e);
      await fetchCart();
      return false;
    }
  };
  // Add to Wishlist
  const addToWishlist = async (item) => {
    // 1. Snapshot previous state for rollback
    const previousItems = [...wishlistItems];

    // 2. Optimistic Update
    try {
      const productId = item._id || item.id || item.product?._id || item.product;
      const productIdStr = productId.toString();

      if (!productId) {
        console.error('Invalid product for wishlist:', item);
        return false;
      }

      // Check if already in wishlist (prevent duplicates in optimistic state)
      const exists = wishlistItems.some(w => {
        const wId = w.product?._id || w.product;
        return wId?.toString() === productIdStr;
      });

      if (!exists) {
        // Construct a mock item that matches the schema structure
        const optimisticItem = {
          product: typeof productId === 'object' ? productId : { _id: productIdStr, ...item }, // Try to keep object if possible
          name: item.name || item.product?.name,
          price: item.price || item.product?.price,
          image: item.image || item.thumbnail || item.images?.[0]?.url,
          _id: 'temp_' + Date.now()
        };
        // If we only have ID, we might not have details, but HomeScreen passes full object.

        console.log('AppContext: Optimistically adding:', productIdStr);
        setWishlistItems(prev => [...prev, optimisticItem]);
      }

      // 3. API Call
      const res = await wishlistAPI.addToWishlist(productId);

      if (res.data.success) {
        // 4. Success - Fetch full populated list to be safe and consistent
        //    We could use res.data.data.items, but it's unpopulated.
        //    Refreshing ensures we have the "True" state.
        console.log('AppContext: API success, fetching full wishlist...');
        await fetchWishlist();
        return true;
      } else {
        throw new Error('API reported failure');
      }

    } catch (e) {
      console.error('Failed to add to wishlist', e);
      // 5. Revert on failure
      setWishlistItems(previousItems);
      // Optional: Emit error to UI? for now return false
      return false;
    }
  };

  // Remove from Wishlist
  const removeFromWishlist = async (id) => {
    const previousItems = [...wishlistItems];
    try {
      const idStr = id.toString();
      console.log('AppContext: Optimistically removing:', idStr);

      // Optimistic Remove
      setWishlistItems(prev => prev.filter(w => {
        const wId = w.product?._id || w.product;
        return wId?.toString() !== idStr;
      }));

      const res = await wishlistAPI.removeFromWishlist(id);

      if (res.data.success) {
        console.log('AppContext: API remove success, fetching full wishlist...');
        await fetchWishlist();
        return true;
      } else {
        throw new Error('API reported failure');
      }
    } catch (e) {
      console.error('Failed to remove from wishlist', e);
      setWishlistItems(previousItems);
      return false;
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
        notifications,
        unreadNotificationCount,
        fetchNotifications,
        addToCart,
        updateCartItemQuantity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
