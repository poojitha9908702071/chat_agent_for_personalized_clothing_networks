"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import AIChatBox from "../../components/AIChatBox";
import { useCart } from "../../context/CartContext";
import { searchProducts, getProductsByCategory, BackendProduct } from "../../services/backendApi";

// Helper function to adjust prices to reasonable range (₹500-₹5000)
const adjustPrice = (price: number): number => {
  if (price < 500) return Math.floor(Math.random() * 1500) + 500; // ₹500-₹2000
  if (price > 5000) return Math.floor(Math.random() * 3000) + 2000; // ₹2000-₹5000
  return Math.floor(price);
};

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [apiProducts, setApiProducts] = useState<BackendProduct[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { cart, wishlist, addToCart, removeFromCart, incrementQuantity, decrementQuantity, toggleWishlist, cartCount, cartTotal } = useCart();

  const handleProductClick = (product: any) => {
    const productId = product.product_id || product.id;
    if (productId) {
      router.push(`/products/${productId}`);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || "Guest");
      } catch {}
    }
  }, []);

  const handleLogout = async () => {
    // Save chat history before logout
    if ((window as any).saveAndClearFashionPulseChat) {
      await (window as any).saveAndClearFashionPulseChat();
    }
    
    // Clear user data
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("auth_token");
    
    // Clear session storage
    sessionStorage.removeItem('fashionpulse_active_chat');
    
    // Trigger logout event
    window.dispatchEvent(new Event('fashionpulse-logout'));
    
    setUserName(null);
  };

  // Load products from database with proper filtering
  const loadApiProducts = async (query?: string) => {
    setApiLoading(true);
    try {
      let products: BackendProduct[] = [];
      
      console.log("🔄 loadApiProducts called with:", { categoryFilter, searchTerm, query });
      
      // Handle category filtering
      if (categoryFilter && !searchTerm) {
        console.log("Loading products for category:", categoryFilter);
        
        if (categoryFilter === "All Women") {
          products = await getProductsByCategory("women", "women", 500);
        } else if (categoryFilter === "All Men") {
          products = await getProductsByCategory("men", "men", 500);
        } else if (categoryFilter === "Women" || categoryFilter === "Men") {
          // Handle main category clicks
          const gender = categoryFilter.toLowerCase();
          products = await getProductsByCategory(gender, gender, 500);
        } else {
          // Handle specific category filtering
          console.log("Calling getProductsByCategory with:", categoryFilter);
          products = await getProductsByCategory(categoryFilter, undefined, 500);
          console.log("Received products:", products.length);
        }
      } 
      // Handle search
      else if (searchTerm) {
        console.log("Searching products for:", searchTerm);
        products = await searchProducts(searchTerm, "fashion");
      } 
      // Load all products by default
      else {
        console.log("Loading all products");
        products = await searchProducts("clothing", "fashion");
      }
      
      console.log("🎯 API Response:", { 
        productsLength: products.length, 
        firstProduct: products[0] ? {
          id: products[0].product_id,
          title: products[0].title,
          price: products[0].price
        } : null 
      });
      
      setApiProducts(products);
      console.log(`✅ Loaded ${products.length} products`);
      
    } catch (err: any) {
      console.error("❌ Error loading products:", err);
      // Try to load all products as fallback
      try {
        console.log("🔄 Trying fallback...");
        const fallbackProducts = await searchProducts("clothing", "fashion");
        console.log("🎯 Fallback products:", fallbackProducts.length);
        setApiProducts(fallbackProducts);
      } catch (fallbackErr) {
        console.error("❌ Fallback also failed:", fallbackErr);
        setApiProducts([]);
      }
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 Home page mounted, loading products...");
    console.log("🔧 Environment check:", {
      nodeEnv: process.env.NODE_ENV,
      apiUrl: 'http://localhost:5000/api',
      userAgent: navigator.userAgent
    });
    
    // Add a small delay to ensure the page is fully loaded
    setTimeout(() => {
      console.log("⏰ Starting delayed product load...");
      loadApiProducts();
    }, 1000);
  }, []);

  useEffect(() => {
    console.log("Category or search changed:", { categoryFilter, searchTerm });
    loadApiProducts();
  }, [searchTerm, categoryFilter]);

  // Process products (adjust prices and remove duplicates)
  const allProducts = useMemo(() => {
    let processedProducts = apiProducts.map(p => ({
      ...p,
      price: adjustPrice(p.price)
    }));

    // Remove duplicates based on product_id
    const uniqueProducts = processedProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.product_id === product.product_id)
    );

    return uniqueProducts;
  }, [apiProducts]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200">
      <div className="bg-gradient-to-r from-pink-100 to-pink-200 shadow-lg sticky top-0 z-40 border-b-2 border-pink-300">
        <Header
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          cartCount={cartCount}
          cartTotal={cartTotal}
          cartItems={cart}
          onRemoveFromCart={removeFromCart}
          onIncreaseQty={incrementQuantity}
          onDecreaseQty={decrementQuantity}
          onAddToCart={addToCart}
          wishlistItems={wishlist}
          onRemoveFromWishlist={(id) => {
            const item = wishlist.find((it) => it.id === id);
            if (item) toggleWishlist(item);
          }}
          userName={userName}
          onLogout={handleLogout}
        />
      </div>
      
      <Sidebar selected={categoryFilter ?? null} onSelect={setCategoryFilter} />
      
      <div className="mx-auto max-w-[1400px] px-5 py-8">
        <div className="w-full">
          <div className="space-y-6">
            {apiLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-300 border-t-pink-600"></div>
                <p className="mt-4 text-pink-700 font-semibold">Loading products...</p>
              </div>
            ) : apiProducts.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-8 shadow-lg border border-pink-200">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent mb-2">No Products Found</h3>
                <p className="text-pink-600">Try adjusting your search or filters</p>
                
                {/* Debug Info */}
                <div className="mt-4 p-4 bg-white rounded-lg text-left text-sm">
                  <div className="font-semibold text-gray-700 mb-2">Debug Info:</div>
                  <div className="text-gray-600">
                    <div>API Products Length: {apiProducts.length}</div>
                    <div>Category Filter: {categoryFilter || 'None'}</div>
                    <div>Search Term: {searchTerm || 'None'}</div>
                    <div>Loading: {apiLoading ? 'Yes' : 'No'}</div>
                  </div>
                  <button 
                    onClick={() => loadApiProducts()} 
                    className="mt-2 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                  >
                    Retry Loading Products
                  </button>
                  <button 
                    onClick={async () => {
                      console.log("🧪 Manual API test started...");
                      try {
                        const response = await fetch('http://localhost:5000/api/cache/count');
                        const data = await response.json();
                        console.log("✅ Manual test success:", data);
                        alert(`Manual test success! Found ${data.cached_products} products`);
                      } catch (error) {
                        console.error("❌ Manual test failed:", error);
                        alert(`Manual test failed: ${error.message}`);
                      }
                    }} 
                    className="mt-2 ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Manual API Test
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* All Products Section */}
                <section className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-8 shadow-lg border border-pink-200">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
                        🛍️ {categoryFilter ? `${categoryFilter} Products` : 'All Products'}
                      </h2>
                    </div>
                    <div className="text-sm text-pink-700 font-semibold">
                      {allProducts.length} products
                      {categoryFilter && (
                        <div className="text-xs text-pink-600 mt-1">
                          Category: {categoryFilter}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Product Grid - All 145 Products */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {allProducts.map((p) => {
                      const product = {
                        id: p.product_id,
                        title: p.title,
                        price: p.price,
                        img: p.image_url,
                        imageUrl: p.image_url,
                      };
                      const isInWishlist = !!wishlist.find((it) => it.id === product.id);
                      const cartItem = cart.find((it) => it.id === product.id);
                      const qty = cartItem?.qty ?? 0;

                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                        >
                          {/* Wishlist Button */}
                          <button
                            onClick={() => toggleWishlist({ id: product.id, title: product.title, image: product.imageUrl, price: product.price })}
                            className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
                            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <span className={`text-xl ${isInWishlist ? "text-pink-500" : "text-gray-400"}`}>
                              {isInWishlist ? "❤️" : "🤍"}
                            </span>
                          </button>

                          {/* Product Image */}
                          <div
                            onClick={() => handleProductClick(product)}
                            className="relative w-full aspect-square bg-gray-100 cursor-pointer overflow-hidden"
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://via.placeholder.com/300x300/ec4899/ffffff?text=${encodeURIComponent(product.title.substring(0, 20))}`;
                              }}
                            />
                          </div>

                          {/* Product Info */}
                          <div className="p-4 flex flex-col h-[180px]">
                            <h3
                              onClick={() => handleProductClick(product)}
                              className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-pink-600 transition-colors h-10"
                            >
                              {product.title}
                            </h3>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-bold text-pink-600">₹{product.price}</span>
                              <div className="flex items-center gap-1 text-xs text-yellow-500">
                                <span>⭐</span>
                                <span className="text-gray-600">4.5</span>
                              </div>
                            </div>

                            {/* Add to Cart / Quantity Controls */}
                            {qty > 0 ? (
                              <div className="flex items-center justify-between bg-pink-50 rounded-lg p-2">
                                <button
                                  onClick={() => decrementQuantity(product.id)}
                                  className="w-8 h-8 rounded-full bg-pink-500 text-white font-bold hover:bg-pink-600 transition-colors"
                                >
                                  -
                                </button>
                                <span className="font-bold text-pink-700">{qty}</span>
                                <button
                                  onClick={() => incrementQuantity(product.id)}
                                  className="w-8 h-8 rounded-full bg-pink-500 text-white font-bold hover:bg-pink-600 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart({ id: product.id, title: product.title, price: product.price, qty: 1, image: product.imageUrl })}
                                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                              >
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      <AIChatBox />
      
      <footer className="bg-gradient-to-r from-pink-600 via-pink-700 to-pink-800 text-white mt-12 py-8 shadow-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white drop-shadow-lg">FashioPulse</h3>
              <p className="text-pink-100 text-sm">Your one-stop destination for fashion and lifestyle products.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Shop</h4>
              <ul className="space-y-2 text-sm text-pink-100">
                <li><Link href="/home" className="hover:text-white transition-colors">New Arrivals</Link></li>
                <li><Link href="/home" className="hover:text-white transition-colors">Best Sellers</Link></li>
                <li><Link href="/home" className="hover:text-white transition-colors">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Customer Service</h4>
              <ul className="space-y-2 text-sm text-pink-100">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Follow Us</h4>
              <div className="flex gap-3 text-2xl">
                <a href="#" className="hover:scale-110 transition-transform">📘</a>
                <a href="#" className="hover:scale-110 transition-transform">📷</a>
                <a href="#" className="hover:scale-110 transition-transform">🐦</a>
              </div>
            </div>
          </div>
          <div className="border-t border-pink-500 mt-8 pt-6 text-center text-sm text-pink-100">
            <p>© 2024 FashioPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
