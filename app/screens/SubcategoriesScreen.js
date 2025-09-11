"use client"

import { useFocusEffect } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, Filter, Heart, MessageCircle, Search as SearchIcon, ShoppingCart, Star } from "lucide-react-native"
import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Header, { HeaderVariants } from "../components/ui/Header"
import { useAppContext } from "../context/AppContext"
import { cartAPI, categoriesAPI, productsAPI } from "../services/api"

const { width, height } = Dimensions.get("window")

const SubcategoriesScreen = ({ navigation, route }) => {
  const { category } = route.params
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [products, setProducts] = useState([])
  const [loadingSubcategories, setLoadingSubcategories] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [buyNowPressedId, setBuyNowPressedId] = useState(null)
  const [updatingRatings, setUpdatingRatings] = useState(new Set())
  const [updatingAllProducts, setUpdatingAllProducts] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Add search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [selectedRating, setSelectedRating] = useState(0)
  const [sortBy, setSortBy] = useState("name")
  const [inStockOnly, setInStockOnly] = useState(false)

  // Use ref to track if we're in the middle of initialization
  const initializingRef = useRef(false)

  const { cartItems, wishlistItems, updateCartItems, addToWishlist, removeFromWishlist } = useAppContext()

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.farmer?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query),
      )
    }

    filtered = filtered.filter((product) => {
      const price = product.price || 0
      return price >= priceRange.min && price <= priceRange.max
    })

    if (selectedRating > 0) {
      filtered = filtered.filter((product) => (product.rating || 0) >= selectedRating)
    }

    if (inStockOnly) {
      filtered = filtered.filter((product) => (product.inStock || (product.stockQuantity || 0) > 0))
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0)
        case "price-high":
          return (b.price || 0) - (a.price || 0)
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "")
      }
    })

    return filtered
  }, [products, searchQuery, priceRange, selectedRating, sortBy, inStockOnly])

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      console.log("🚀 Initializing component data...")
      initializingRef.current = true
      setIsInitialized(false)

      try {
        await fetchSubcategories()
      } catch (error) {
        console.error("Failed to initialize data:", error)
      } finally {
        initializingRef.current = false
        setIsInitialized(true)
      }
    }

    initializeData()
  }, [category])

  // Fetch products when subcategory changes (but only after initialization)
  useEffect(() => {
    if (selectedSubcategory && isInitialized && !initializingRef.current) {
      console.log("🔄 Subcategory changed, fetching products for:", selectedSubcategory.name)
      fetchProducts(selectedSubcategory)
    }
  }, [selectedSubcategory, isInitialized])

  const fetchSubcategories = async () => {
    try {
      setLoadingSubcategories(true)
      console.log("🔄 Fetching subcategories for category:", category.name)

      const res = await categoriesAPI.getSubcategories(category._id || category.id)
      const categorySubcategories = res?.data?.data?.categories || res?.data?.data || []

      let finalSubcategories = []
      let defaultSubcategory = null

      if (categorySubcategories.length === 0) {
        try {
          const categoryWithSubs = await categoriesAPI.getCategoryById(category._id || category.id)
          const populatedCategory = categoryWithSubs?.data?.data?.category

          if (populatedCategory?.subcategories && populatedCategory.subcategories.length > 0) {
            finalSubcategories = populatedCategory.subcategories
            defaultSubcategory = populatedCategory.subcategories[0]
          } else {
            finalSubcategories = [category]
            defaultSubcategory = category
          }
        } catch (categoryErr) {
          console.error("Failed to fetch category with subcategories:", categoryErr)
          finalSubcategories = [category]
          defaultSubcategory = category
        }
      } else {
        finalSubcategories = categorySubcategories
        defaultSubcategory = categorySubcategories[0]
      }

      console.log("✅ Subcategories loaded:", finalSubcategories.length)
      console.log("🎯 Default subcategory:", defaultSubcategory?.name)

      setSubcategories(finalSubcategories)

      // Set the selected subcategory and immediately fetch its products
      if (defaultSubcategory) {
        setSelectedSubcategory(defaultSubcategory)
        // Fetch products for the default subcategory immediately
        await fetchProducts(defaultSubcategory)
      }
    } catch (err) {
      console.error("Failed to fetch subcategories:", err?.response?.data || err.message)
      const fallbackSubcategories = [category]
      setSubcategories(fallbackSubcategories)
      setSelectedSubcategory(category)
      await fetchProducts(category)
    } finally {
      setLoadingSubcategories(false)
    }
  }

  const fetchProducts = async (subcategory = selectedSubcategory) => {
    if (!subcategory) {
      console.log("⚠️ No subcategory provided, skipping product fetch")
      return
    }

    try {
      setLoadingProducts(true)
      console.log("🔄 Fetching products for subcategory:", subcategory.name, "ID:", subcategory._id || subcategory.id)

      const params = {
        category: subcategory._id || subcategory.id,
        limit: 50,
      }

      const res = await productsAPI.getProducts(params)
      const fetchedProducts = (res?.data?.data?.products || []).map((p) => ({
        ...p,
        id: p._id,
        image: p.images?.[0]?.url || "",
        discount: p.offerPercentage,
        rating: p.averageRating,
        reviews: p.totalReviews,
        farmer: p.supplierId?.businessName || "",
        category: p.categoryId?.name || "",
        price: p.discountedPrice ?? p.price,
        originalPrice: p.price,
        stockQuantity: typeof p.stockQuantity === 'number' ? p.stockQuantity : 0,
        inStock: (typeof p.stockQuantity === 'number' ? p.stockQuantity : 0) > 0,
      }))

      console.log("✅ Fetched", fetchedProducts.length, "products for", subcategory.name)
      setProducts(fetchedProducts)

      // Update price range based on fetched products
      if (fetchedProducts.length > 0) {
        const prices = fetchedProducts.map((p) => p.price || 0)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        setPriceRange((prev) => ({
          min: Math.min(prev.min, minPrice),
          max: Math.max(prev.max, maxPrice),
        }))
      }
    } catch (err) {
      console.error("Failed to fetch products:", err?.response?.data || err.message)
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const isInWishlist = (id) => wishlistItems.some((item) => item && item._id === id)
  const isInCart = (id) => cartItems.some((item) => item && item._id === id)

  const toggleWishlist = async (product) => {
    const productId = product._id
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(product)
    }
  }

  const handleAddToCart = async (product) => {
    const productId = product._id || product.id
    if (!isInCart(productId)) {
      try {
        const response = await cartAPI.addToCart({ productId, quantity: 1 })
        updateCartItems(response.data.data.cart.items)
        Alert.alert("Added to Cart", `${product.name} has been added to your cart`)
      } catch (error) {
        console.error("Failed to add to cart:", error)
        Alert.alert("Error", "Could not add item to cart. Please try again.")
      }
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    console.log("🔄 Manual refresh triggered")

    try {
      // Reset states
      setProducts([])
      setSelectedSubcategory(null)
      setIsInitialized(false)
      initializingRef.current = true

      // Fetch subcategories and products
      await fetchSubcategories()

      // Update product details after basic refresh
      setTimeout(() => {
        if (products.length > 0) {
          fetchUpdatedProductDetails()
        }
      }, 1000)
    } catch (error) {
      console.error("Refresh failed:", error)
    } finally {
      initializingRef.current = false
      setIsInitialized(true)
      setRefreshing(false)
    }
  }

  const fetchUpdatedProductDetails = async () => {
    if (!products.length) return

    console.log("🔄 Fetching updated details for all products")
    setUpdatingAllProducts(true)

    try {
      const updatedProducts = await Promise.all(
        products.map(async (product) => {
          try {
            const response = await productsAPI.getProductDetails(product._id || product.id)
            const updatedProduct = response.data.data.product
            return {
              ...product,
              rating: updatedProduct.averageRating,
              reviews: updatedProduct.totalReviews,
            }
          } catch (error) {
            console.error(`Failed to fetch details for product ${product._id}:`, error)
            return product
          }
        }),
      )

      setProducts(updatedProducts)
    } catch (error) {
      console.error("Failed to fetch updated product details:", error)
    } finally {
      setUpdatingAllProducts(false)
    }
  }

  const updateProductRating = async (productId) => {
    console.log("🔄 Updating product rating for:", productId)

    try {
      setUpdatingRatings((prev) => new Set(prev).add(productId))

      const response = await productsAPI.getProductDetails(productId)
      const updatedProduct = response.data.data.product

      setProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((product) =>
          product._id === productId || product.id === productId
            ? {
              ...product,
              rating: updatedProduct.averageRating,
              reviews: updatedProduct.totalReviews,
            }
            : product,
        )

        return updatedProducts
      })
    } catch (error) {
      console.error("❌ Failed to update product rating:", error)
      await fetchProducts()
    } finally {
      setUpdatingRatings((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setPriceRange({ min: 0, max: 10000 })
    setSelectedRating(0)
    setSortBy("name")
    setInStockOnly(false)
  }

  const renderFilterModal = () => {
    if (!showFilters) return null

    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1000,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            margin: 20,
            borderRadius: 16,
            padding: 20,
            maxHeight: "80%",
            width: "90%",
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1f2937" }}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={{ fontSize: 16, color: "#6b7280" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sort By */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#1f2937", marginBottom: 10 }}>Sort By</Text>
              {[
                { key: "name", label: "Name (A-Z)" },
                { key: "price-low", label: "Price: Low to High" },
                { key: "price-high", label: "Price: High to Low" },
                { key: "rating", label: "Rating" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setSortBy(option.key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: sortBy === option.key ? "#f0fdf4" : "transparent",
                    borderRadius: 8,
                    marginBottom: 4,
                  }}
                >
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: sortBy === option.key ? "#10b981" : "#d1d5db",
                      backgroundColor: sortBy === option.key ? "#10b981" : "transparent",
                      marginRight: 12,
                    }}
                  />
                  <Text style={{ color: "#1f2937", fontSize: 14 }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating Filter */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#1f2937", marginBottom: 10 }}>
                Minimum Rating
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => setSelectedRating(rating)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: selectedRating === rating ? "#10b981" : "#f3f4f6",
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Star
                      width={12}
                      height={12}
                      fill={selectedRating === rating ? "#fff" : "#facc15"}
                      color={selectedRating === rating ? "#fff" : "#facc15"}
                    />
                    <Text
                      style={{
                        color: selectedRating === rating ? "#fff" : "#1f2937",
                        fontSize: 12,
                        marginLeft: 4,
                      }}
                    >
                      {rating === 0 ? "All" : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stock Filter */}
            <TouchableOpacity
              onPress={() => setInStockOnly(!inStockOnly)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: inStockOnly ? "#10b981" : "#d1d5db",
                  backgroundColor: inStockOnly ? "#10b981" : "transparent",
                  marginRight: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {inStockOnly && <Text style={{ color: "white", fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={{ color: "#1f2937", fontSize: 14 }}>In Stock Only</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={clearFilters}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: "#f3f4f6",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#1f2937", fontWeight: "600" }}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: "#10b981",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }

  const renderSubcategoryItem = ({ item }) => {
    const isSelected =
      selectedSubcategory && (selectedSubcategory._id === item._id || selectedSubcategory.id === item.id)

    return (
      <TouchableOpacity
        onPress={() => {
          console.log("🔄 Selecting subcategory:", item.name)
          if (!isSelected) {
            setProducts([])
            setLoadingProducts(true)
            setSelectedSubcategory(item)
          }
        }}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 12,
          marginRight: 12,
          backgroundColor: isSelected ? "#f0fdf4" : "white",
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isSelected ? "#10b981" : "#e5e7eb",
          minWidth: 80,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 6,
              backgroundColor: "#f3f4f6",
            }}
          >
            <Image
              source={
                item.image && typeof item.image === "object" && item.image.url
                  ? { uri: item.image.url }
                  : item.image && typeof item.image === "string" && item.image.trim() !== ""
                    ? { uri: item.image }
                    : { uri: "https://via.placeholder.com/40" }
              }
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>

          <Text
            style={{
              fontSize: 10,
              fontWeight: isSelected ? "600" : "500",
              color: isSelected ? "#10b981" : "#374151",
              textAlign: "center",
              lineHeight: 12,
            }}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderProductItem = ({ item }) => {
    const productId = item._id || item.id
    const inWishlist = isInWishlist(productId)
    const inCart = isInCart(productId)
    const isOutOfStock = !item.inStock && !(item.stockQuantity > 0)
    const isLowStock = !isOutOfStock && (typeof item.stockQuantity === 'number' ? item.stockQuantity : 0) > 0 && (typeof item.stockQuantity === 'number' ? item.stockQuantity : 0) <= 5
    const isUpdatingRating = updatingRatings.has(productId)

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("ProductDetails", {
            product: item,
            onReviewSubmitted: () => {
              updateProductRating(item._id || item.id)
            },
          })
        }}
        activeOpacity={0.9}
        style={{ width: "48%", marginBottom: 16 }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: "#f3f4f6",
            height: 250,
          }}
        >
          <View style={{ position: "relative" }}>
            <Image source={{ uri: item.image }} style={{ width: "100%", height: 100 }} resizeMode="cover" />
            <View
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.1)" }}
            />
            {isOutOfStock ? (
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  backgroundColor: "#dc2626",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
                  Out of stock
                </Text>
              </View>
            ) : item.discount && (
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  backgroundColor: "#ef4444",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
                  {Number(item.discount).toFixed(0)}% OFF
                </Text>
              </View>
            )}
            {isLowStock && (
              <View
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  backgroundColor: "#f59e0b",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
                  Only {item.stockQuantity} left
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.9)",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              }}
              onPress={(e) => {
                e.stopPropagation()
                toggleWishlist(item)
              }}
            >
              <Heart
                width={14}
                height={14}
                color={inWishlist ? "#ef4444" : "#9ca3af"}
                fill={inWishlist ? "#ef4444" : "none"}
              />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#1f2937", marginBottom: 3, lineHeight: 14 }}>
              {item.name}
            </Text>
            <Text style={{ fontSize: 10, color: "#10b981", fontWeight: "500", marginBottom: 4 }}>by {item.farmer}</Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}
            >
              <Text style={{ fontSize: 14, fontWeight: "bold", color: "#10b981" }}>₹{item.price}</Text>
              {item.originalPrice !== item.price && (
                <Text style={{ fontSize: 10, color: "#9ca3af", textDecorationLine: "line-through" }}>
                  ₹{item.originalPrice}
                </Text>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fef3c7",
                  paddingHorizontal: 4,
                  paddingVertical: 1,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: "#fde68a",
                }}
              >
                <Star width={6} height={6} fill="#facc15" color="#facc15" />
                {isUpdatingRating ? (
                  <ActivityIndicator size={8} color="#92400e" style={{ marginLeft: 1 }} />
                ) : (
                  <Text style={{ fontSize: 9, color: "#92400e", fontWeight: "600", marginLeft: 1 }}>
                    {item.rating || 0}
                  </Text>
                )}
              </View>
            </View>
            <Text style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>
              {isUpdatingRating ? "Updating..." : `${item.reviews || 0} reviews`}
            </Text>
            <TouchableOpacity
              style={{
                overflow: "hidden",
                borderRadius: 8,
                marginBottom: 4,
              }}
              onPress={(e) => {
                e.stopPropagation()
                handleAddToCart(item)
              }}
              disabled={inCart || isOutOfStock}
            >
              {inCart ? (
                <View
                  style={{
                    paddingVertical: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f3f4f6",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#6b7280", fontWeight: "600", fontSize: 11 }}>Added to Cart</Text>
                </View>
              ) : isOutOfStock ? (
                <View
                  style={{
                    paddingVertical: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e5e7eb",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "red", fontWeight: "600", fontSize: 11 }}>Out of stock</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={["#fdba74", "#fb923c"]}
                  style={{
                    paddingVertical: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                  }}
                >
                  <ShoppingCart width={10} height={10} color="#fff" />
                  <Text style={{ color: "white", fontWeight: "600", fontSize: 11, marginLeft: 3 }}>Add to Cart</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: isOutOfStock ? "#e5e7eb" : (buyNowPressedId === productId ? '#10b981':'#059669'),
                  paddingVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  shadowColor: "#d1d5db",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                onPress={async (e) => {
                  e.stopPropagation()
                  setBuyNowPressedId(productId)
                  setTimeout(() => {
                    setBuyNowPressedId(null)
                    if (isOutOfStock) return
                    navigation.navigate("OrderSummary", {
                      items: [{ ...item, quantity: 1 }],
                    })
                  }, 150)
                }}
                disabled={isOutOfStock}
              >
                <Text
                  style={{
                    color: isOutOfStock ? "red" : (buyNowPressedId === productId ? "white" : "white"),
                    fontWeight: "600",
                    fontSize: 11,
                  }}
                >
                  {isOutOfStock ? 'Out of stock' : 'Buy Now'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: "#f3f4f6",
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  shadowColor: "#d1d5db",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                onPress={(e) => {
                  e.stopPropagation()
                  navigation.navigate("ProductDetails", {
                    product: item,
                    onReviewSubmitted: () => {
                      updateProductRating(item._id || item.id)
                    },
                  })
                }}
              >
                <MessageCircle width={12} height={12} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Only update ratings when returning to screen, don't refetch products
  useFocusEffect(
    React.useCallback(() => {
      if (products.length > 0 && isInitialized) {
        console.log("🔄 Screen focused - updating product ratings only")
        setTimeout(() => {
          fetchUpdatedProductDetails()
        }, 1000)
      }
    }, [products.length, isInitialized]),
  )

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }} className="pt-2">
      {/* Header */}
      <HeaderVariants.BackWithSearchAndFilter
        title={category.name}
        subtitle={`${filteredProducts.length} of ${products.length} products`}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search products..."
        onFilterPress={() => setShowFilters(true)}
      />

      {/* Active Filters Display */}
      {(searchQuery || selectedRating > 0 || inStockOnly || sortBy !== "name") && (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {searchQuery && (
              <View
                style={{
                  backgroundColor: "#10b981",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 12 }}>Search: {searchQuery}</Text>
                <TouchableOpacity onPress={() => setSearchQuery("")} style={{ marginLeft: 4 }}>
                  <Text style={{ color: "white", fontSize: 12 }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {selectedRating > 0 && (
              <View
                style={{
                  backgroundColor: "#10b981",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 12 }}>{selectedRating}+ Stars</Text>
                <TouchableOpacity onPress={() => setSelectedRating(0)} style={{ marginLeft: 4 }}>
                  <Text style={{ color: "white", fontSize: 12 }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {inStockOnly && (
              <View
                style={{
                  backgroundColor: "#10b981",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 12 }}>In Stock</Text>
                <TouchableOpacity onPress={() => setInStockOnly(false)} style={{ marginLeft: 4 }}>
                  <Text style={{ color: "white", fontSize: 12 }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Horizontal Subcategories */}
      <View style={{ backgroundColor: "#f9fafb", paddingVertical: 12 }}>
        {loadingSubcategories ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#10b981" />
            <Text style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>Loading categories...</Text>
          </View>
        ) : (
          <FlatList
            data={subcategories}
            renderItem={renderSubcategoryItem}
            keyExtractor={(item) => (item._id || item.id).toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            decelerationRate="fast"
            snapToInterval={92}
            snapToAlignment="start"
          />
        )}
      </View>

      {/* Main Content - Products */}
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#059669"]} />}
        >
          <View style={{ padding: 16 }}>
            {selectedSubcategory && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 4 }}>
                  {selectedSubcategory.name}
                </Text>
                {selectedSubcategory.description && (
                  <Text style={{ fontSize: 14, color: "#6b7280" }}>{selectedSubcategory.description}</Text>
                )}
              </View>
            )}

            {loadingSubcategories || loadingProducts ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={{ marginTop: 12, fontSize: 14, color: "#6b7280" }}>
                  {loadingSubcategories ? "Loading categories..." : "Loading products..."}
                </Text>
              </View>
            ) : updatingAllProducts ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#10b981" />
                <Text style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>Updating product ratings...</Text>
              </View>
            ) : filteredProducts.length === 0 ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: "#6b7280", textAlign: "center" }}>
                  {products.length === 0 ? "No products found in this category" : "No products match your filters"}
                </Text>
                <Text style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
                  {products.length === 0
                    ? "Try selecting a different subcategory"
                    : "Try adjusting your search or filters"}
                </Text>
                {products.length > 0 && (
                  <TouchableOpacity
                    onPress={clearFilters}
                    style={{
                      marginTop: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: "#10b981",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => (item._id || item.id).toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </ScrollView>
      </View>

      {/* Filter Modal */}
      {renderFilterModal()}
    </View>
  );
}

export default SubcategoriesScreen;
