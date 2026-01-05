"use client";

import { useEffect, useState } from "react";
import { searchProducts, getProductsByCategory, BackendProduct } from "../../services/backendApi";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("🔄 Starting API test...");
      
      // Test 1: Direct fetch to backend
      const directResponse = await fetch('http://localhost:5000/api/cache/count');
      const directData = await directResponse.json();
      
      console.log("📡 Direct API response:", directData);
      
      // Test 2: Using our API service
      const searchResults = await searchProducts("clothing", "fashion");
      console.log("🔍 Search results:", searchResults.length);
      
      // Test 3: Category API
      const categoryResults = await getProductsByCategory("fashion", undefined, 100);
      console.log("📂 Category results:", categoryResults.length);
      
      setProducts(searchResults);
      setDebugInfo({
        directAPI: directData,
        searchCount: searchResults.length,
        categoryCount: categoryResults.length,
        firstProduct: searchResults[0] || null,
        timestamp: new Date().toISOString()
      });
      
    } catch (err: any) {
      console.error("❌ API test failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 Debug page mounted, testing API...");
    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">🔧 API Debug Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Panel */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">📊 API Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Loading:</span>
                <span className={loading ? "text-blue-600" : "text-gray-600"}>
                  {loading ? "🔄 Yes" : "❌ No"}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Error:</span>
                <span className={error ? "text-red-600" : "text-green-600"}>
                  {error ? `❌ ${error}` : "✅ None"}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Products Loaded:</span>
                <span className="text-blue-600 font-bold">
                  {products.length}
                </span>
              </div>
            </div>
            
            <button 
              onClick={testAPI}
              disabled={loading}
              className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "🔄 Testing..." : "🧪 Test API Again"}
            </button>
          </div>
          
          {/* Debug Info Panel */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">🔍 Debug Information</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
        
        {/* Products Display */}
        {products.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">🛍️ Products ({products.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 8).map((product) => (
                <div key={product.product_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-32 object-cover rounded mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/200x150/ec4899/ffffff?text=No+Image';
                    }}
                  />
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>
                  <p className="text-lg font-bold text-pink-600">₹{Math.floor(product.price)}</p>
                  <p className="text-xs text-gray-500">{product.category} • {product.gender}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Console Logs */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">📝 Instructions</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>1. Open browser Developer Tools (F12)</p>
            <p>2. Go to Console tab</p>
            <p>3. Look for debug messages starting with 🔄, 📡, 🔍, 📂</p>
            <p>4. Check Network tab for API requests to localhost:5000</p>
            <p>5. If you see CORS errors, the backend CORS configuration needs adjustment</p>
          </div>
        </div>
      </div>
    </div>
  );
}