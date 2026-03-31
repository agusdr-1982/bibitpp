import React, { useState, useEffect } from 'react';
import { Sprout, User, Check, Printer, ArrowRight, ArrowLeft, AlertCircle, ShoppingCart, Trash2, Home, Trees, Mountain, Camera, X, RefreshCw, Settings, Lock, Package, FileText, LogOut, Database, AlertTriangle } from 'lucide-react';

// --- 1. IMPORT FIREBASE ---
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, writeBatch, serverTimestamp, query, orderBy } from 'firebase/firestore';

// --- DEFINISI TIPE DATA TYPESCRIPT ---
interface UserData {
  nik: string;
  nama: string;
  fotoKtp: string | null;
}

interface Bibit {
  id: number;
  firebaseId?: string;
  nama: string;
  kategori: string;
  stok: number;
  max: number;
  img: string;
}

interface Transaksi {
  id?: string;
  kode: string;
  waktu: string;
  tanggal: string;
  timestamp?: any;
  nama: string;
  nik: string;
  total: number;
  detail: Record<string, number>;
}

// --- 2. KONFIGURASI FIREBASE ANDA ---
const firebaseConfig = {
  apiKey: "AIzaSyBSAyi5T5YdZsyeCBV0x5h06TM8T9o9sXU",
  authDomain: "bibitpp-63887.firebaseapp.com",
  projectId: "bibitpp-63887",
  storageBucket: "bibitpp-63887.firebasestorage.app",
  messagingSenderId: "978178774604",
  appId: "1:978178774604:web:95911a54015a3f6c73c6e9"
};

// Inisialisasi Firebase
let app: any;
let db: any;
let isFirebaseConfigured = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirebaseConfigured = true;
} catch (error) {
  console.error("Gagal menginisialisasi Firebase:", error);
}

// --- DATA BIBIT AWAL (Untuk Inisialisasi Database oleh Admin) ---
const INITIAL_BIBIT_DATA: Bibit[] = [
  { id: 1, nama: 'Sengon (Solomon)', kategori: 'Kayu-kayuan', stok: 1500, max: 25, img: '🌲' },
  { id: 2, nama: 'Matoa (Pometia pinnata)', kategori: 'Buah Lokal', stok: 80, max: 5, img: '🍈' },
  { id: 3, nama: 'Trembesi', kategori: 'Peneduh', stok: 200, max: 10, img: '🌳' },
  { id: 4, nama: 'Ulin (Kayu Besi)', kategori: 'Endemik', stok: 0, max: 2, img: '🪵' },
  { id: 5, nama: 'Durian Otong', kategori: 'Buah', stok: 60, max: 5, img: '🥔' },
  { id: 6, nama: 'Gaharu', kategori: 'Hasil Hutan', stok: 100, max: 5, img: '🌿' },
  { id: 7, nama: 'Jengkol', kategori: 'Buah', stok: 120, max: 10, img: '🌰' },
  { id: 8, nama: 'Tabebuya (Kuning)', kategori: 'Hias', stok: 50, max: 5, img: '🌼' },
];

export default function App() {
  const [step, setStep] = useState<string>('welcome'); 
  const [userData, setUserData] = useState<UserData>({ nik: '', nama: '', fotoKtp: null });
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [ticketCode, setTicketCode] = useState<string>('');
  
  // State untuk Data Firebase beserta tipe datanya
  const [bibitData, setBibitData] = useState<Bibit[]>([]);
  const [riwayatTransaksi, setRiwayatTransaksi] = useState<Transaksi[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // --- URL LOGO BPDAS ---
  const LOGO_BPDAS_URL = ""; 

  // --- 3. AMBIL DATA DARI FIREBASE SECARA REAL-TIME ---
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setIsLoadingData(false);
      return;
    }

    // Listener koleksi 'bibit'
    const unsubBibit = onSnapshot(collection(db, 'bibit'), (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ firebaseId: doc.id, ...doc.data() } as Bibit));
      data.sort((a: Bibit, b: Bibit) => a.id - b.id);
      setBibitData(data);
      setIsLoadingData(false);
    }, (error: any) => {
      console.error("Gagal mengambil data bibit:", error);
      setIsLoadingData(false);
    });

    // Listener koleksi 'transaksi' (diurutkan terbaru)
    const qTrx = query(collection(db, 'transaksi'), orderBy('timestamp', 'desc'));
    const unsubTrx = onSnapshot(qTrx, (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Transaksi));
      setRiwayatTransaksi(data);
    });

    return () => {
      unsubBibit();
      unsubTrx();
    };
  }, []);

  // Reset System (Untuk Masyarakat)
  const resetSystem = () => {
    setStep('welcome');
    setUserData({ nik: '', nama: '', fotoKtp: null });
    setCart({});
    setTicketCode('');
  };

  // --- COMPONENT: LOGO BPDAS PLACEHOLDER ---
  const BpdasLogo = ({ size = "large" }: { size?: "large" | "small" }) => {
    if (LOGO_BPDAS_URL) {
      return (
        <img 
          src={LOGO_BPDAS_URL} 
          alt="Logo BPDAS" 
          className={`${size === "large" ? "h-32" : "h-16"} w-auto object-contain rounded-lg`}
        />
      );
    }
    return (
      <div className={`${size === "large" ? "h-32 w-32" : "h-16 w-16"} bg-green-50 rounded-2xl border-2 border-green-100 flex flex-col items-center justify-center text-green-700 p-2 text-center shadow-inner`}>
         <div className="flex items-end justify-center">
            <Trees size={size === "large" ? 40 : 20} />
            <Mountain size={size === "large" ? 40 : 20} className="-ml-4 text-green-800" />
         </div>
         <span className={`${size === "large" ? "text-xs" : "text-[8px]"} font-bold mt-1 uppercase tracking-tighter`}>BPDAS Kahayan</span>
      </div>
    );
  };

  // --- COMPONENT: WELCOME SCREEN ---
  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-green-600 to-green-800 text-white p-8 text-center animate-fadeIn relative">
      
      {!isFirebaseConfigured && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-pulse">
          <AlertTriangle size={20} /> Konfigurasi Firebase Belum Diisi!
        </div>
      )}

      {/* Tombol Rahasia Admin */}
      <button 
        onClick={() => setStep('admin-login')}
        className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition text-white/50 hover:text-white"
        title="Login Petugas"
      >
        <Settings size={24} />
      </button>

      <div className="bg-white p-6 rounded-3xl mb-8 shadow-2xl flex items-center gap-6">
        <BpdasLogo size="large" />
        <div className="h-24 w-0.5 bg-gray-200"></div>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/0/07/Logo_Kementerian_Lingkungan_Hidup_dan_Kehutanan.png" 
          alt="Logo KLHK" 
          className="h-32 w-auto object-contain"
        />
      </div>
      <h1 className="text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">Layanan Bibit Gratis</h1>
      <p className="text-3xl font-bold mb-12 max-w-4xl leading-relaxed opacity-95 drop-shadow-sm">
        Persemaian Permanen<br/>
        Balai Pengelolaan DAS Kahayan
      </p>
      
      <button 
        onClick={() => setStep('input-nik')}
        className="group relative bg-white text-green-700 font-extrabold py-6 px-12 rounded-2xl text-3xl shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:bg-green-50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-4"
      >
        <User size={36} />
        Mulai Pemesanan
        <ArrowRight size={36} className="group-hover:translate-x-2 transition-transform" />
      </button>
      
      <p className="mt-12 text-2xl font-medium opacity-80 animate-pulse">Sentuh layar untuk memulai</p>
    </div>
  );

  // --- COMPONENT: INPUT NIK ---
  const InputNikScreen = () => {
    const [input, setInput] = useState<string>(userData.nik || '');
    const [error, setError] = useState<string>('');
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(userData.fotoKtp || null);
    const [isScanning, setIsScanning] = useState<boolean>(false);

    const handleLogin = () => {
      if (input.length < 16) {
        setError('NIK harus 16 digit angka');
        return;
      }
      setUserData({ nik: input, nama: 'Budi Santoso (Masyarakat)', fotoKtp: capturedImage });
      setStep('catalog');
    };

    const handleCapture = () => {
      setIsScanning(true);
      setTimeout(() => {
        setCapturedImage("https://via.placeholder.com/300x200/166534/ffffff?text=FOTO+KTP+TERSIMPAN");
        setIsScanning(false);
        setShowCamera(false);
      }, 1500);
    };

    if (showCamera) {
      return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
           <div className="w-full max-w-4xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative border-4 border-gray-700">
              <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center text-white">
                 <span className="font-bold flex items-center gap-2 text-xl"><Camera size={24}/> Mode Foto KTP</span>
                 <button onClick={() => setShowCamera(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/40"><X size={32}/></button>
              </div>
              <div className="aspect-video w-full bg-gray-800 relative flex items-center justify-center overflow-hidden">
                 {isScanning ? (
                    <div className="absolute inset-0 z-20 bg-white/10 animate-pulse flex items-center justify-center">
                       <p className="text-white font-bold text-3xl tracking-widest">MEMPROSES GAMBAR...</p>
                    </div>
                 ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center relative">
                        <User size={160} className="text-gray-600 opacity-50" />
                        <p className="absolute mt-48 text-gray-300 text-lg font-bold bg-black/50 px-4 py-2 rounded-full">Posisikan KTP di dalam kotak area</p>
                        <div className="absolute w-2/3 h-2/3 border-2 border-green-400/50 rounded-lg pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1"></div>
                        </div>
                    </div>
                 )}
              </div>
              <div className="bg-black p-8 flex justify-center items-center gap-12">
                 <button onClick={() => setShowCamera(false)} className="text-gray-400 font-bold hover:text-white text-xl">Batal</button>
                 <button 
                   onClick={handleCapture} 
                   className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-[0_0_20px_rgba(255,255,255,0.5)] active:scale-95 transition-transform flex items-center justify-center"
                 >
                   <div className="w-16 h-16 rounded-full bg-green-600"></div>
                 </button>
                 <div className="w-16"></div> 
              </div>
           </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
        <Header title="Identifikasi Pemohon" icon={<User />} />
        
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full h-full pb-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl w-full border border-gray-100 flex flex-col h-auto">
            
            <div className="mb-6">
              <label className="block text-gray-600 text-xl font-bold mb-3 text-center">Masukkan NIK KTP Anda:</label>
              <input 
                type="number" 
                value={input}
                readOnly
                className="w-full text-4xl p-4 border-2 border-green-200 rounded-2xl focus:border-green-600 focus:outline-none text-center tracking-widest font-mono text-green-800 bg-green-50"
                placeholder="16 Digit Angka"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 mb-4 bg-red-50 p-3 rounded-xl text-lg justify-center font-bold animate-pulse">
                <AlertCircle size={24} /> {error}
              </div>
            )}

            <div className="mb-6">
               {!capturedImage ? (
                 <button 
                    onClick={() => setShowCamera(true)}
                    className="w-full py-4 bg-blue-50 text-blue-700 border-2 border-blue-200 border-dashed rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-100 transition active:scale-95 text-lg"
                 >
                    <Camera size={24} /> Ambil Foto / Scan KTP
                 </button>
               ) : (
                 <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="bg-green-100 p-3 rounded-xl text-green-700">
                          <Check size={24} />
                       </div>
                       <div className="text-left">
                          <p className="text-sm text-gray-500 font-bold uppercase">Dokumen Pendukung</p>
                          <p className="text-lg font-bold text-green-800">Foto KTP Tersimpan</p>
                       </div>
                    </div>
                    <button onClick={() => setShowCamera(true)} className="p-3 text-gray-500 hover:text-blue-600 bg-white rounded-xl shadow-sm border border-gray-200 active:scale-95 transition">
                       <RefreshCw size={20} /> Ganti
                    </button>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 flex-shrink">
              {[1,2,3,4,5,6,7,8,9].map(num => (
                <button key={num} onClick={() => setInput(prev => prev.length < 16 ? prev + num.toString() : prev)} className="bg-gray-50 py-4 rounded-2xl text-4xl font-bold text-gray-700 hover:bg-green-100 hover:text-green-700 hover:shadow-md transition active:scale-95">
                  {num}
                </button>
              ))}
              <button onClick={() => setInput('')} className="bg-red-50 text-red-600 py-4 rounded-2xl font-bold text-2xl hover:bg-red-100 transition">Reset</button>
              <button onClick={() => setInput(prev => prev.length < 16 ? prev + '0' : prev)} className="bg-gray-50 py-4 rounded-2xl text-4xl font-bold text-gray-700 hover:bg-green-100 hover:text-green-700 transition">0</button>
              <button onClick={() => setInput(prev => prev.slice(0, -1))} className="bg-orange-50 text-orange-600 py-4 rounded-2xl font-bold text-3xl hover:bg-orange-100 transition flex justify-center items-center"><ArrowLeft size={32}/></button>
            </div>

            <button 
              onClick={handleLogin}
              className={`w-full py-5 rounded-2xl text-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-3 mt-auto ${input.length === 16 ? 'bg-green-600 hover:bg-green-700 transform hover:-translate-y-1' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={input.length !== 16}
            >
              Lanjut Pilih Bibit <ArrowRight size={28} />
            </button>
          </div>
          
          <button onClick={resetSystem} className="mt-6 text-gray-500 hover:text-red-600 font-bold flex items-center gap-2 px-8 py-3 rounded-full hover:bg-white shadow-sm transition text-lg border border-transparent hover:border-gray-200">
            <Home size={20}/> Batal & Kembali ke Layar Utama
          </button>
        </div>
      </div>
    );
  };

  // --- COMPONENT: CATALOG ---
  const CatalogScreen = () => {
    const addToCart = (bibit: Bibit) => {
      const currentQty = cart[bibit.id] || 0;
      if (currentQty < bibit.max && currentQty < bibit.stok) {
        setCart({ ...cart, [bibit.id]: currentQty + 1 });
      }
    };

    const removeFromCart = (bibitId: number) => {
      const currentQty = cart[bibitId] || 0;
      if (currentQty > 0) {
        const newCart = { ...cart };
        newCart[bibitId] -= 1;
        if (newCart[bibitId] === 0) delete newCart[bibitId];
        setCart(newCart);
      }
    };

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <Header title={`Halo, ${userData.nama.split(' ')[0]}`} sub="Silakan pilih bibit yang tersedia hari ini" icon={<Sprout />} />
        
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {isLoadingData ? (
             <div className="flex flex-col items-center justify-center h-full text-green-600">
                <RefreshCw size={48} className="animate-spin mb-4" />
                <p className="font-bold text-xl">Menghubungkan ke Database Gudang...</p>
             </div>
          ) : !isFirebaseConfigured ? (
             <div className="flex flex-col items-center justify-center h-full text-orange-500 p-8 text-center">
                <AlertTriangle size={64} className="mb-4 opacity-80" />
                <p className="font-bold text-2xl mb-2">Firebase Belum Dikonfigurasi</p>
                <p className="text-lg text-gray-600">Silakan masukkan API Key Anda di file kode sumber (baris 12) agar sistem Kiosk dapat memuat data bibit.</p>
             </div>
          ) : bibitData.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                <Database size={64} className="mb-4 opacity-50" />
                <p className="font-bold text-2xl mb-2">Data Bibit Kosong</p>
                <p className="text-lg">Minta Admin untuk melakukan Inisialisasi Data Default di menu Pengelola.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-32 max-w-7xl mx-auto">
              {bibitData.map(bibit => {
                const qty = cart[bibit.id] || 0;
                const isHabis = bibit.stok <= 0;
                
                return (
                  <div key={bibit.id} className={`relative bg-white rounded-3xl p-6 shadow-sm border-2 transition-all duration-200 ${qty > 0 ? 'border-green-500 ring-4 ring-green-100 scale-[1.02]' : 'border-transparent hover:border-green-200'} ${isHabis ? 'opacity-60 grayscale' : ''}`}>
                    
                    <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${
                        bibit.kategori.includes('Buah') ? 'bg-orange-100 text-orange-700' : 
                        bibit.kategori === 'Endemik' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                      {bibit.kategori}
                    </span>

                    <div className="flex flex-col items-center text-center mt-6">
                      <div className="text-8xl mb-6 drop-shadow-md transform transition hover:scale-110 duration-300">{bibit.img}</div>
                      <h3 className="text-2xl font-bold text-gray-800 leading-tight mb-2">{bibit.nama}</h3>
                      <p className={`text-base font-bold mb-6 px-4 py-1 rounded-full ${bibit.stok < 50 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                          {isHabis ? 'STOK HABIS' : `Sisa: ${bibit.stok} Pohon`}
                      </p>
                    </div>
                    
                    {isHabis ? (
                      <div className="w-full py-4 bg-gray-100 text-gray-400 text-center font-bold rounded-2xl border border-gray-200 text-lg">Tidak Tersedia</div>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2 border border-gray-100">
                        <button 
                          onClick={() => removeFromCart(bibit.id)}
                          disabled={qty === 0}
                          className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm disabled:opacity-30 disabled:shadow-none text-3xl font-bold text-red-500 hover:bg-red-50 active:scale-95 transition"
                        >
                          -
                        </button>
                        <span className={`font-bold text-3xl w-12 text-center ${qty > 0 ? 'text-green-700' : 'text-gray-300'}`}>{qty}</span>
                        <button 
                          onClick={() => addToCart(bibit)}
                          disabled={qty >= bibit.max}
                          className="w-14 h-14 flex items-center justify-center bg-green-600 text-white rounded-xl shadow-md shadow-green-200 disabled:opacity-50 disabled:shadow-none disabled:bg-gray-300 text-3xl font-bold hover:bg-green-700 active:scale-95 transition"
                        >
                          +
                        </button>
                      </div>
                    )}
                    {!isHabis && <p className="text-sm text-center text-gray-400 mt-4 font-medium">Batas Maksimal: {bibit.max} btg</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Floating Cart Bar */}
        <div className="bg-white/95 backdrop-blur-md p-6 border-t border-green-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] fixed bottom-0 w-full z-10 flex items-center justify-between max-w-7xl">
            <div className="flex items-center gap-6">
              <button 
                  onClick={() => setStep('input-nik')} 
                  className="p-5 text-gray-500 font-bold hover:bg-gray-100 hover:text-gray-800 rounded-2xl transition flex items-center gap-3 border border-transparent hover:border-gray-200 text-lg"
              >
                   <ArrowLeft size={28}/> <span className="hidden md:inline">Kembali</span>
              </button>

              <div className="h-12 w-px bg-gray-200 hidden md:block"></div>

              <div className="relative">
                <div className="bg-green-100 p-4 rounded-2xl text-green-700">
                    <ShoppingCart size={36} />
                </div>
                {totalItems > 0 && <span className="absolute -top-3 -right-3 bg-red-500 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg border-4 border-white shadow-sm">{totalItems}</span>}
              </div>
              <div className="hidden sm:block">
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Total Pilihan</p>
                <p className="text-3xl font-extrabold text-gray-800">{totalItems} <span className="text-xl font-normal text-gray-500">Bibit</span></p>
              </div>
            </div>
            
            <div className="flex gap-4">
               {totalItems > 0 && (
                   <button onClick={() => setCart({})} className="px-6 py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition flex items-center gap-2 text-lg">
                       <Trash2 size={24}/> <span className="hidden md:inline">Kosongkan</span>
                   </button>
               )}
               <button 
                onClick={() => setStep('summary')}
                disabled={totalItems === 0}
                className="bg-green-600 text-white px-10 py-5 rounded-2xl font-bold text-2xl shadow-xl shadow-green-200 hover:bg-green-700 hover:scale-105 active:scale-95 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none transition-all flex items-center gap-3"
               >
                 Checkout <ArrowRight size={28} />
               </button>
            </div>
        </div>
      </div>
    );
  };

  // --- COMPONENT: SUMMARY ---
  const SummaryScreen = () => {
    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    const handlePrint = async () => {
      setIsPrinting(true);
      
      try {
        const newCode = `TRX-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        setTicketCode(newCode);

        // Jika Firebase sudah dikonfigurasi, simpan ke database
        if (isFirebaseConfigured && db) {
            const batch = writeBatch(db);

            Object.entries(cart).forEach(([bibitId, qty]) => {
              const bibitRef = doc(db, 'bibit', bibitId.toString());
              const bibitAktual = bibitData.find(b => b.id === parseInt(bibitId));
              if(bibitAktual) {
                 batch.update(bibitRef, { stok: bibitAktual.stok - qty });
              }
            });

            const trxRef = doc(collection(db, 'transaksi'));
            const detailPesanan: Record<string, number> = {};
            
            Object.entries(cart).forEach(([id, qty]) => {
                const namaTanaman = bibitData.find(b => b.id === parseInt(id))?.nama || id.toString();
                detailPesanan[namaTanaman] = qty;
            });

            const newTrx: Transaksi = {
               kode: newCode,
               waktu: new Date().toLocaleTimeString('id-ID'),
               tanggal: new Date().toLocaleDateString('id-ID'),
               timestamp: serverTimestamp(),
               nama: userData.nama,
               nik: userData.nik,
               total: totalItems,
               detail: detailPesanan
            };

            batch.set(trxRef, newTrx);

            await batch.commit();
        } else {
            // Simulasi delay jika Firebase belum diatur (Mode Demo Offline)
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        setIsPrinting(false);
        setStep('success');

      } catch (error) {
        console.error("Gagal memproses transaksi:", error);
        alert("Maaf, terjadi kendala saat memproses permohonan. Silakan coba lagi.");
        setIsPrinting(false);
      }
    };

    return (
      <div className="flex flex-col h-full bg-gray-50 p-8">
         <Header title="Konfirmasi Pesanan" icon={<Check />} />
         
         <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 overflow-hidden">
            
            <div className="flex-[2] bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-500 text-sm uppercase tracking-widest">Rincian Bibit Yang Dipilih</h3>
                    <span className="bg-green-100 text-green-700 font-bold px-4 py-1 rounded-full text-sm">Total: {totalItems} Bibit</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {Object.entries(cart).map(([id, qty]) => {
                    const bibit = bibitData.find(b => b.id === parseInt(id)) || INITIAL_BIBIT_DATA.find(b => b.id === parseInt(id));
                    return (
                      <div key={id} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition px-4 rounded-xl">
                        <div className="flex items-center gap-6">
                          <span className="text-5xl bg-gray-100 w-20 h-20 flex items-center justify-center rounded-2xl shadow-sm">{bibit?.img}</span>
                          <div>
                            <p className="font-bold text-2xl text-gray-800 mb-1">{bibit?.nama}</p>
                            <p className="text-sm font-medium text-green-700 bg-green-50 border border-green-100 inline-block px-3 py-1 rounded-md">{bibit?.kategori}</p>
                          </div>
                        </div>
                        <div className="font-bold text-3xl text-gray-700 font-mono bg-gray-100 px-6 py-3 rounded-xl border border-gray-200">x{qty}</div>
                      </div>
                    );
                  })}
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                    <h3 className="font-bold text-gray-500 text-sm uppercase tracking-widest mb-6 flex items-center gap-2"><User size={16}/> Data Pemohon</h3>
                    <p className="text-3xl font-bold text-gray-800 mb-2">{userData.nama}</p>
                    <p className="text-xl text-gray-600 font-mono border-b border-gray-100 pb-6 mb-6 tracking-wider">{userData.nik}</p>
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-green-700 font-bold bg-green-50 border border-green-100 px-4 py-3 rounded-xl text-sm">
                            <Check size={20}/> NIK Terverifikasi Sistem
                        </div>
                        {userData.fotoKtp && (
                          <div className="flex items-center gap-3 text-blue-700 font-bold bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl text-sm">
                            <Camera size={20}/> Foto KTP Terlampir
                          </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-end gap-4">
                     {isPrinting ? (
                         <div className="bg-white rounded-3xl shadow-xl p-8 text-center flex-1 flex flex-col items-center justify-center border-2 border-green-500">
                            <div className="animate-spin text-green-600 text-6xl mb-6"><Printer /></div>
                            <h2 className="text-3xl font-bold text-green-800 animate-pulse mb-2">Memproses ke Server...</h2>
                            <p className="text-gray-500 text-lg">Mohon jangan tinggalkan layar ini.</p>
                         </div>
                     ) : (
                        <>
                            <button onClick={() => setStep('catalog')} className="py-6 border-2 border-gray-300 text-gray-600 font-bold text-xl rounded-2xl hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 transition">
                                <ArrowLeft className="inline mr-2" /> Kembali & Ubah Pesanan
                            </button>
                            <button onClick={handlePrint} className="py-8 bg-green-600 text-white font-extrabold text-3xl rounded-2xl shadow-[0_10px_20px_rgba(22,101,52,0.3)] hover:bg-green-700 transform hover:-translate-y-1 active:scale-95 transition flex items-center justify-center gap-4">
                                <Printer size={36} /> CETAK PERMOHONAN
                            </button>
                        </>
                     )}
                </div>
            </div>

         </div>
      </div>
    );
  };

  // --- COMPONENT: SUCCESS ---
  const SuccessScreen = () => (
    <div className="flex flex-col items-center justify-center h-full bg-green-600 text-white p-8 text-center animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <Sprout size={500} className="absolute -bottom-24 -right-24" />
          <Trees size={300} className="absolute top-10 -left-10" />
      </div>

      <div className="bg-white text-green-600 p-10 rounded-full mb-8 shadow-2xl animate-bounce relative z-10">
        <Check size={80} strokeWidth={4} />
      </div>
      <h1 className="text-6xl font-extrabold mb-4 relative z-10 drop-shadow-md">Permohonan Berhasil!</h1>
      <p className="text-3xl mb-12 opacity-95 relative z-10 font-medium">Silakan ambil struk Anda di printer bawah.</p>
      
      <div className="bg-white text-gray-800 p-8 rounded-xl w-96 shadow-2xl transform rotate-2 border-t-8 border-gray-800 relative mb-16 z-10">
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-6 mb-6">
          <div className="flex justify-center mb-3 text-green-700"><Trees size={40}/></div>
          <h2 className="font-black text-2xl tracking-widest text-gray-800">TIKET PENGAMBILAN</h2>
          <p className="text-sm text-gray-500 mt-2 font-mono">{new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="text-center mb-6">
          <p className="text-7xl font-mono font-black my-6 tracking-tighter text-green-800 drop-shadow-sm">{ticketCode.split('-')[1]}</p>
          <p className="text-sm font-mono bg-gray-100 py-1 px-3 rounded-md inline-block border border-gray-200">Ref: {ticketCode}</p>
        </div>
        <div className="text-base text-center text-gray-600 border-t border-gray-200 pt-6 leading-relaxed">
          Serahkan tiket permohonan ini ke<br/>
          <strong className="text-xl text-gray-900 block mt-2 mb-1">Petugas Distribusi Bibit</strong>
          BPDAS Kahayan
        </div>
        <div className="absolute -bottom-3 left-0 w-full h-6 bg-green-600" style={{clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'}}></div>
      </div>

      <button onClick={resetSystem} className="bg-white text-green-700 hover:bg-green-50 py-5 px-12 rounded-full shadow-xl font-extrabold text-2xl relative z-10 flex items-center gap-3 transform hover:-translate-y-1 transition active:scale-95">
        <Home size={28} /> Selesai / Lanjut Pemohon Berikutnya
      </button>
    </div>
  );

  // --- COMPONENT: ADMIN LOGIN ---
  const AdminLoginScreen = () => {
    const [pin, setPin] = useState<string>('');
    const [error, setError] = useState<boolean>(false);

    const handleLogin = () => {
      if (pin === '1234') { 
        setStep('admin-dashboard');
      } else {
        setError(true);
        setPin('');
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 p-8">
         <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock size={36} className="text-slate-700" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Portal Petugas</h2>
            <p className="text-slate-500 mb-8">Masukkan PIN Otorisasi BPDAS</p>

            <input 
              type="password" 
              value={pin}
              readOnly
              className={`w-full text-5xl p-4 border-2 rounded-xl text-center tracking-[1em] mb-6 font-mono bg-slate-50 focus:outline-none ${error ? 'border-red-500 text-red-500 animate-pulse' : 'border-slate-200 text-slate-800'}`}
              placeholder="••••"
            />
            {error && <p className="text-red-500 text-sm font-bold mb-4">PIN SALAH!</p>}

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1,2,3,4,5,6,7,8,9].map(num => (
                <button key={num} onClick={() => {setPin(p => p.length < 4 ? p + num.toString() : p); setError(false);}} className="bg-slate-100 py-4 rounded-xl text-2xl font-bold text-slate-700 hover:bg-slate-200 transition">
                  {num}
                </button>
              ))}
              <button onClick={() => setPin('')} className="bg-red-50 text-red-600 py-4 rounded-xl font-bold">C</button>
              <button onClick={() => {setPin(p => p.length < 4 ? p + '0' : p); setError(false);}} className="bg-slate-100 py-4 rounded-xl text-2xl font-bold text-slate-700 hover:bg-slate-200 transition">0</button>
              <button onClick={() => setPin(p => p.slice(0, -1))} className="bg-orange-50 text-orange-600 py-4 rounded-xl font-bold">⌫</button>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep('welcome')} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Batal</button>
              <button onClick={handleLogin} disabled={pin.length < 4} className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-slate-900 transition">Login</button>
            </div>
         </div>
         <p className="text-white/30 mt-8 font-mono text-sm">Hint: PIN simulasi adalah 1234</p>
      </div>
    );
  };

  // --- COMPONENT: ADMIN DASHBOARD ---
  const AdminDashboardScreen = () => {
    const [activeTab, setActiveTab] = useState<string>('stok'); 
    const [isSeeding, setIsSeeding] = useState<boolean>(false);

    const handleSeedData = async () => {
      if(!isFirebaseConfigured || !db) {
         alert("Firebase belum dikonfigurasi! Harap isi API Key Anda di file App.tsx.");
         return;
      }

      if(!window.confirm("Perhatian! Ini akan memasukkan data bibit default ke Firebase Anda. Lanjutkan?")) return;
      
      setIsSeeding(true);
      try {
        const batch = writeBatch(db);
        INITIAL_BIBIT_DATA.forEach(bibit => {
          const docRef = doc(db, 'bibit', bibit.id.toString());
          batch.set(docRef, bibit);
        });
        await batch.commit();
        alert("BERHASIL! Data default telah dimasukkan ke Firebase Gudang Anda.");
      } catch (error) {
        console.error("Gagal Seed Data:", error);
        alert("Gagal menyimpan data ke Firebase. Pastikan Rules Firestore Anda mengizinkan penulisan.");
      }
      setIsSeeding(false);
    };

    return (
      <div className="flex flex-col h-full bg-slate-50">
         <div className="bg-slate-900 text-white p-6 flex justify-between items-center shadow-lg z-10">
            <div className="flex items-center gap-4">
               <div className="bg-white/20 p-2 rounded-lg"><Settings size={28}/></div>
               <div>
                  <h1 className="text-2xl font-bold tracking-wide">DASHBOARD PENGELOLA</h1>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    Koneksi: {isFirebaseConfigured ? <span className="text-green-400 font-mono">Firebase Online</span> : <span className="text-red-400 font-mono">Offline / Unconfigured</span>}
                  </p>
               </div>
            </div>
            <button onClick={() => setStep('welcome')} className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition">
               <LogOut size={20}/> Tutup & Kunci Layar
            </button>
         </div>

         <div className="flex-1 flex overflow-hidden">
            <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-2 shadow-sm">
               <button onClick={() => setActiveTab('stok')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition ${activeTab === 'stok' ? 'bg-green-100 text-green-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <Package size={24}/> Manajemen Stok
               </button>
               <button onClick={() => setActiveTab('riwayat')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition ${activeTab === 'riwayat' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <FileText size={24}/> Riwayat Kiosk
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
               {activeTab === 'stok' && (
                  <div>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-800">Status Stok Bibit Gudang</h2>
                        
                        {bibitData.length === 0 && (
                          <button 
                            onClick={handleSeedData}
                            disabled={isSeeding || !isFirebaseConfigured}
                            className={`font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition ${isFirebaseConfigured ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          >
                             <Database size={20}/> {isSeeding ? 'Memproses...' : 'Inisialisasi Data ke Firebase'}
                          </button>
                        )}
                     </div>

                     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                           <thead className="bg-slate-100 border-b border-slate-200">
                              <tr>
                                 <th className="p-4 font-bold text-slate-600">ID</th>
                                 <th className="p-4 font-bold text-slate-600">Tanaman</th>
                                 <th className="p-4 font-bold text-slate-600">Kategori</th>
                                 <th className="p-4 font-bold text-slate-600 text-right">Sisa Stok</th>
                                 <th className="p-4 font-bold text-slate-600 text-center">Status</th>
                              </tr>
                           </thead>
                           <tbody>
                              {bibitData.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">Data kosong. Jika Firebase sudah dikonfigurasi, silakan klik tombol Inisialisasi Data di atas.</td></tr>
                              ) : (
                                bibitData.map(bibit => (
                                   <tr key={bibit.id} className="border-b border-slate-100 hover:bg-slate-50">
                                      <td className="p-4 text-slate-500 font-mono">#{bibit.id}</td>
                                      <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                         <span className="text-2xl bg-slate-100 p-2 rounded-lg">{bibit.img}</span> {bibit.nama}
                                      </td>
                                      <td className="p-4 text-slate-600">{bibit.kategori}</td>
                                      <td className="p-4 text-right font-mono font-bold text-xl text-slate-700">{bibit.stok}</td>
                                      <td className="p-4 text-center">
                                         {bibit.stok > 50 ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">AMAN</span> :
                                          bibit.stok > 0 ? <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">MENIPIS</span> :
                                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">HABIS</span>}
                                      </td>
                                   </tr>
                                ))
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}

               {activeTab === 'riwayat' && (
                  <div>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-800">Riwayat Pengambilan Terkini</h2>
                        <span className="bg-blue-100 text-blue-800 font-bold px-4 py-2 rounded-lg">Total: {riwayatTransaksi.length} Transaksi</span>
                     </div>
                     
                     {riwayatTransaksi.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                           <FileText size={64} className="mx-auto mb-4 opacity-50"/>
                           <p className="text-xl font-bold">Belum ada data transaksi di Firebase.</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 gap-4">
                           {riwayatTransaksi.map((trx) => (
                              <div key={trx.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-6 hover:border-green-300 transition">
                                 <div>
                                    <p className="text-sm text-slate-500 font-mono mb-1">{trx.tanggal} - {trx.waktu}</p>
                                    <h3 className="text-xl font-bold text-slate-800">{trx.nama}</h3>
                                    <p className="text-slate-600 font-mono text-sm">NIK: {trx.nik}</p>
                                 </div>
                                 <div className="bg-slate-50 p-4 rounded-xl flex-1 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Item Diambil</p>
                                    <div className="flex flex-wrap gap-2">
                                       {trx.detail && Object.entries(trx.detail).map(([namaTanaman, qty]) => (
                                           <span key={namaTanaman} className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm font-bold text-slate-700 shadow-sm">
                                             {namaTanaman} (x{qty})
                                           </span>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="text-right flex flex-col justify-center items-end border-l pl-6 border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Kode Tiket</p>
                                    <p className="text-2xl font-black text-green-700 font-mono">{trx.kode}</p>
                                    <p className="text-sm font-bold text-slate-500 mt-2">{trx.total} Bibit Total</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
    );
  };

  // --- HELPER: HEADER ---
  const Header = ({ title, sub, icon }: { title: string; sub?: string; icon: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border-b border-gray-100">
      <div>
        <h2 className="text-4xl font-extrabold text-green-800 flex items-center gap-4">
           {icon} {title}
        </h2>
        {sub && <p className="text-gray-500 mt-2 ml-12 text-xl font-medium">{sub}</p>}
      </div>
      <div className="flex items-center gap-5 opacity-90">
        <div className="text-right hidden md:block">
           <p className="text-sm font-bold text-green-700 uppercase tracking-widest">BPDAS Kahayan</p>
        </div>
        <BpdasLogo size="small" />
        <img 
            src="https://upload.wikimedia.org/wikipedia/commons/0/07/Logo_Kementerian_Lingkungan_Hidup_dan_Kehutanan.png" 
            alt="Logo KLHK" 
            className="h-16 w-auto drop-shadow-sm" 
        />
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className="h-screen w-full font-sans overflow-hidden bg-gray-900 select-none flex items-center justify-center">
       {/* Container dengan batas maksimal lebar untuk menjaga proporsi Landscape Kiosk */}
       <div className="h-full w-full max-w-[1920px] mx-auto bg-white shadow-2xl overflow-hidden relative">
          {step === 'welcome' && <WelcomeScreen />}
          {step === 'input-nik' && <InputNikScreen />}
          {step === 'catalog' && <CatalogScreen />}
          {step === 'summary' && <SummaryScreen />}
          {step === 'success' && <SuccessScreen />}
          {step === 'admin-login' && <AdminLoginScreen />}
          {step === 'admin-dashboard' && <AdminDashboardScreen />}
       </div>
    </div>
  );
}
