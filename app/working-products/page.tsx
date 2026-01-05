"use client";

import { useEffect, useState } from 'react';

interface Product {
  product_id: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
  gender: string;
}

export default function WorkingProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client-side data fetching with multiple fallback strategies
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    const apiUrls = [
      'http://localhost:5000/api/products/search?query=clothing&category=fashion',
      'http://127.0.0.1:5000/api/products/search?query=clothing&category=fashion',
      'http://localhost:5000/api/products/category/fashion?limit=500'
    ];
    
    for (const url of apiUrls) {
      try {
        console.log(`🔄 Trying API URL: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`📡 Response status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Data received:`, { count: data.count, productsLength: data.products?.length });
        
        const fetchedProducts = data.products || [];
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
          setLoading(false);
          console.log(`🎉 Successfully loaded ${fetchedProducts.length} products`);
          return;
        }
      } catch (err: any) {
        console.error(`❌ Failed with ${url}:`, err.message);
        continue;
      }
    }
    
    // If all URLs failed
    setError('Unable to connect to the backend API. Please ensure the backend is running on port 5000.');
    setLoading(false);
  };

  useEffect(() => {
    console.log('🚀 Working Products page mounted');
    fetchProducts();
  }, []);

  const adjustPrice = (price: number) => {
    if (price < 500) return Math.floor(Math.random() * 1500) + 500;
    if (price > 5000) return Math.floor(Math.random() * 3000) + 2000;
    return Math.floor(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-100 to-pink-200 shadow-lg sticky top-0 z-40 border-b-2 border-pink-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
              FashioPulse
            </h1>
            <div className="text-sm text-pink-700">
              {loading ? '🔄 Loading...' : products.length > 0 ? `✅ ${products.length} Products Loaded` : '❌ No Products'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mx-auto max-w-[1400px] px-5 py-8">
        <div className="w-full">
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-300 border-t-pink-600"></div>
                <p className="mt-4 text-pink-700 font-semibold">Loading products from FashioPulse database...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 shadow-lg border border-red-200">
                <span className="text-6xl mb-4 block">❌</span>
                <h3 className="text-xl font-bold text-red-800 mb-2">Connection Error</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={fetchProducts}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 font-semibold"
                >
                  🔄 Retry Connection
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-8 shadow-lg border border-yellow-200">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-xl font-bold text-yellow-800 mb-2">No Products Found</h3>
                <p className="text-yellow-600 mb-4">The database appears to be empty</p>
                <button 
                  onClick={fetchProducts}
                  className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 font-semibold"
                >
                  🔄 Reload Products
                </button>
              </div>
            ) : (
              <section className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-8 shadow-lg border border-pink-200">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
                      🛍️ FashioPulse Products
                    </h2>
                  </div>
                  <div className="text-sm text-pink-700 font-semibold">
                    {products.length} products from database
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.product_id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                    >
                      {/* Wishlist Button */}
                      <button className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all">
                        <span className="text-xl text-gray-400">🤍</span>
                      </button>

                      {/* Product Image */}
                      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={product.image_url}
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
                        <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-pink-600 transition-colors h-10">
                          {product.title}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-pink-600">₹{adjustPrice(product.price)}</span>
                          <div className="flex items-center gap-1 text-xs text-yellow-500">
                            <span>⭐</span>
                            <span className="text-gray-600">4.5</span>
                          </div>
                        </div>

                        <button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-600 via-pink-700 to-pink-800 text-white mt-12 py-8 shadow-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4 text-white drop-shadow-lg">FashioPulse</h3>
            <p className="text-pink-100 text-sm">Your one-stop destination for fashion and lifestyle products.</p>
            <div className="border-t border-pink-500 mt-6 pt-4 text-sm text-pink-100">
              <p>© 2024 FashioPulse. All rights reserved. | Connected to database ✅</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}