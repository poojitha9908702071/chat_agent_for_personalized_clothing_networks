"use client";

import { useEffect, useState } from "react";

interface Product {
  product_id: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
  gender: string;
}

export default function ProductsTestPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string>("Not tested");

  const testDirectAPI = async () => {
    setLoading(true);
    setError(null);
    setApiStatus("Testing...");
    
    try {
      console.log("🔄 Testing direct API call...");
      
      // Test backend health first
      const healthResponse = await fetch('http://localhost:5000/api/cache/count');
      if (!healthResponse.ok) {
        throw new Error(`Backend health check failed: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      console.log("✅ Backend health:", healthData);
      setApiStatus(`Backend OK - ${healthData.cached_products} products available`);
      
      // Fetch products
      const productsResponse = await fetch('http://localhost:5000/api/products/search?query=clothing&category=fashion');
      if (!productsResponse.ok) {
        throw new Error(`Products API failed: ${productsResponse.status}`);
      }
      
      const productsData = await productsResponse.json();
      console.log("✅ Products data:", productsData);
      
      const fetchedProducts = productsData.products || [];
      setProducts(fetchedProducts);
      setApiStatus(`Success - Loaded ${fetchedProducts.length} products`);
      
    } catch (err: any) {
      console.error("❌ API test failed:", err);
      setError(err.message);
      setApiStatus(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCategoryAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/products/category/fashion?limit=100');
      if (!response.ok) {
        throw new Error(`Category API failed: ${response.status}`);
      }
      
      const data = await response.json();
      const fetchedProducts = data.products || [];
      setProducts(fetchedProducts);
      setApiStatus(`Category API - Loaded ${fetchedProducts.length} products`);
      
    } catch (err: any) {
      setError(err.message);
      setApiStatus(`Category API Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 Products test page mounted");
    // Auto-test on mount
    setTimeout(testDirectAPI, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
          🧪 Products API Test Page
        </h1>
        
        {/* Status Panel */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">📊 API Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">API Status</div>
              <div className={`font-bold ${error ? 'text-red-600' : 'text-green-600'}`}>
                {apiStatus}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Products Loaded</div>
              <div className="font-bold text-blue-600">{products.length}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Loading Status</div>
              <div className={`font-bold ${loading ? 'text-blue-600' : 'text-gray-600'}`}>
                {loading ? '🔄 Loading...' : '✅ Ready'}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={testDirectAPI}
              disabled={loading}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 disabled:bg-gray-400 font-semibold"
            >
              🔍 Test Search API
            </button>
            
            <button 
              onClick={testCategoryAPI}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
            >
              📂 Test Category API
            </button>
            
            <button 
              onClick={() => {
                setProducts([]);
                setError(null);
                setApiStatus("Cleared");
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-semibold"
            >
              🗑️ Clear Results
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 font-semibold">❌ Error:</div>
              <div className="text-red-600">{error}</div>
            </div>
          )}
        </div>
        
        {/* Products Display */}
        {products.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">
              🛍️ Products ({products.length} items)
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.slice(0, 20).map((product) => (
                <div key={product.product_id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/200x160/ec4899/ffffff?text=${encodeURIComponent(product.title.substring(0, 10))}`;
                    }}
                  />
                  
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-pink-600">
                      ₹{Math.floor(product.price)}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                      <span>⭐</span>
                      <span className="text-gray-600">4.5</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {product.category} • {product.gender}
                  </div>
                  
                  <button className="w-full mt-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all text-sm">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
            
            {products.length > 20 && (
              <div className="text-center mt-6 text-gray-600">
                Showing first 20 of {products.length} products
              </div>
            )}
          </div>
        )}
        
        {/* Instructions */}
        <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
          <h2 className="text-2xl font-semibold mb-4">📝 Instructions</h2>
          <div className="text-gray-600 space-y-2">
            <p>1. This page tests direct API calls to the backend</p>
            <p>2. Open browser Developer Tools (F12) to see console logs</p>
            <p>3. Check the Network tab for API requests</p>
            <p>4. If this page works but the main home page doesn't, there's an issue with the home page logic</p>
            <p>5. Backend should be running on http://localhost:5000</p>
          </div>
        </div>
      </div>
    </div>
  );
}