import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Info, TrendingUp, Apple, Utensils } from 'lucide-react';

const FoodCalorieTracker = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('scanner');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Comprehensive food database with calorie information
  const foodDatabase = {
    pizza: { name: 'Pizza', calories: 266, protein: 11, carbs: 33, fat: 10, serving: '100g' },
    burger: { name: 'Burger', calories: 295, protein: 17, carbs: 24, fat: 14, serving: '100g' },
    pasta: { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fat: 1, serving: '100g' },
    salad: { name: 'Green Salad', calories: 33, protein: 3, carbs: 6, fat: 0.3, serving: '100g' },
    sandwich: { name: 'Sandwich', calories: 250, protein: 12, carbs: 32, fat: 8, serving: '100g' },
    rice: { name: 'Cooked Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: '100g' },
    chicken: { name: 'Grilled Chicken', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g' },
    apple: { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, serving: '100g' },
    banana: { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving: '100g' },
    bread: { name: 'Bread', calories: 265, protein: 9, carbs: 49, fat: 3.2, serving: '100g' },
    eggs: { name: 'Boiled Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, serving: '100g' },
    fish: { name: 'Grilled Fish', calories: 206, protein: 22, carbs: 0, fat: 12, serving: '100g' },
    steak: { name: 'Beef Steak', calories: 271, protein: 25, carbs: 0, fat: 19, serving: '100g' },
    broccoli: { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, serving: '100g' },
    fries: { name: 'French Fries', calories: 312, protein: 3.4, carbs: 41, fat: 15, serving: '100g' },
    chocolate: { name: 'Chocolate', calories: 546, protein: 5, carbs: 61, fat: 31, serving: '100g' },
    yogurt: { name: 'Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, serving: '100g' },
    soup: { name: 'Vegetable Soup', calories: 67, protein: 3, carbs: 12, fat: 1.5, serving: '100g' },
    sushi: { name: 'Sushi', calories: 143, protein: 6, carbs: 21, fat: 3.6, serving: '100g' },
    cake: { name: 'Cake', calories: 257, protein: 4, carbs: 51, fat: 4, serving: '100g' }
  };

  // AI food recognition simulation
  const recognizeFood = (imgData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const foods = Object.keys(foodDatabase);
        const detectedFood = foods[Math.floor(Math.random() * foods.length)];
        const confidence = (Math.random() * 0.25 + 0.75).toFixed(2);
        const portionSize = Math.floor(Math.random() * 150 + 100);
        
        const foodInfo = foodDatabase[detectedFood];
        const multiplier = portionSize / 100;
        
        resolve({
          foodName: foodInfo.name,
          confidence: confidence,
          portionSize: portionSize,
          calories: Math.round(foodInfo.calories * multiplier),
          protein: (foodInfo.protein * multiplier).toFixed(1),
          carbs: (foodInfo.carbs * multiplier).toFixed(1),
          fat: (foodInfo.fat * multiplier).toFixed(1),
          timestamp: new Date().toLocaleString()
        });
      }, 2000);
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        analyzeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imgData) => {
    setAnalyzing(true);
    setResult(null);
    
    const recognitionResult = await recognizeFood(imgData);
    setResult(recognitionResult);
    
    setHistory(prev => [recognitionResult, ...prev].slice(0, 10));
    setAnalyzing(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      alert('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setPreview(imageData);
    stopCamera();
    analyzeImage(imageData);
  };

  const resetScanner = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setAnalyzing(false);
    stopCamera();
  };

  const getTotalCalories = () => {
    return history.reduce((sum, item) => sum + item.calories, 0);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-blue-500 p-3 rounded-xl">
                <Utensils className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">AI Food Tracker</h1>
                <p className="text-gray-600">Snap, Analyze & Track Your Nutrition</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Today's Intake</div>
              <div className="text-3xl font-bold text-green-600">{getTotalCalories()}</div>
              <div className="text-sm text-gray-500">calories</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'scanner'
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Camera className="inline mr-2" size={20} />
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="inline mr-2" size={20} />
            History
          </button>
        </div>

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {!preview && !cameraActive ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <Apple className="mx-auto text-gray-300" size={80} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Identify Your Food
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Take a photo or upload an image to get instant nutritional information
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={startCamera}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Camera size={20} />
                    Take Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-green-500 transition-all flex items-center gap-2"
                  >
                    <Upload size={20} />
                    Upload Image
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : cameraActive ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-xl"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-4 justify-center mt-4">
                  <button
                    onClick={capturePhoto}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <img
                    src={preview}
                    alt="Food preview"
                    className="w-full max-h-96 object-contain rounded-xl"
                  />
                  <button
                    onClick={resetScanner}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {analyzing && (
                  <div className="mt-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-500 mb-4"></div>
                    <p className="text-gray-600 font-semibold">Analyzing food image...</p>
                  </div>
                )}

                {result && (
                  <div className="mt-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{result.foodName}</h3>
                        <p className="text-sm text-gray-600">
                          Confidence: {(result.confidence * 100).toFixed(0)}% | Portion: {result.portionSize}g
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-green-600">{result.calories}</div>
                        <div className="text-sm text-gray-600">calories</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{result.protein}g</div>
                        <div className="text-sm text-gray-600">Protein</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{result.carbs}g</div>
                        <div className="text-sm text-gray-600">Carbs</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{result.fat}g</div>
                        <div className="text-sm text-gray-600">Fat</div>
                      </div>
                    </div>

                    <button
                      onClick={resetScanner}
                      className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Scan Another Food
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Food History</h2>
            {history.length === 0 ? (
              <div className="text-center py-12">
                <Info className="mx-auto text-gray-300 mb-4" size={60} />
                <p className="text-gray-600">No food scanned yet. Start tracking your meals!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{item.foodName}</h3>
                      <p className="text-sm text-gray-600">{item.timestamp}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-blue-600 font-semibold">P: {item.protein}g</span>
                        <span className="text-orange-600 font-semibold">C: {item.carbs}g</span>
                        <span className="text-purple-600 font-semibold">F: {item.fat}g</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">{item.calories}</div>
                      <div className="text-sm text-gray-600">cal</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-6 bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Demo Mode</p>
              <p>This is a demonstration using simulated AI recognition. In production, this would integrate with real computer vision models like TensorFlow, PyTorch, or cloud APIs (Google Vision, AWS Rekognition) for accurate food identification.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCalorieTracker;