import { useState } from 'react';
import { VietnamMap } from './components/VietnamMap';
import { ProvinceDetails } from './components/ProvinceDetails';
import { provincesData } from "../data/provincesData";
import { motion, AnimatePresence } from "framer-motion";
export default function App() {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [keyword, setKeyword] = useState("");
  const [started, setStarted] = useState(false);
  const provinces = Object.keys(provincesData) as Array<keyof typeof provincesData>;

  const filtered = provinces.filter((p) =>
    provincesData[p].name
      .toLowerCase()
      .includes(keyword.toLowerCase())
  );
  return (
  <AnimatePresence mode="wait">

    {!started ? (

      <motion.div
        key="welcome"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-screen overflow-hidden"
      >

        {/* Background */}
        <img
          src="/banner/vietnam-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">

          <div className="w-[80%] h-[1px] bg-white/60 mb-16" />

          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[120px] font-black tracking-widest leading-none"
          >
            VIETNAM
          </motion.h1>

          <motion.h2
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[90px] font-black tracking-wide mt-6"
          >
            TRAVEL
          </motion.h2>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => setStarted(true)}
            className="
              mt-14
              px-14 py-4
              rounded-full
              border border-white/40
              bg-black/25
              backdrop-blur-md
              text-4xl
              font-bold
              hover:bg-black/40
              hover:scale-105
              transition-all duration-300
            "
          >
            BẮT ĐẦU
          </motion.button>

          <div className="w-[55%] h-[1px] bg-white/60 mt-20" />
        </div>
      </motion.div>

    ) : (

      <motion.div
        key="main"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >

        <div className="min-h-screen bg-white flex flex-col md:flex-row p-4 md:p-6 gap-6 font-sans">

          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

          {/* LEFT */}
          <div className="w-full md:w-[45%] h-[50vh] md:h-[calc(100vh-3rem)] shrink-0 flex flex-col">

            <div className="mb-4 px-2 shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Khám phá Việt Nam
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Chọn một tỉnh thành trên bản đồ để xem chi tiết
              </p>

              <input
                placeholder="🔍 Tìm tỉnh..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="mt-3 w-full p-2 border rounded-lg"
              />

              {keyword && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg shadow-sm">
                  {filtered.length > 0 ? (
                    filtered.map((p) => (
                      <div
                        key={p}
                        onClick={() => {
                          setSelectedProvince(p);
                          setKeyword("");
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {provincesData[p].name}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">
                      Không tìm thấy tỉnh
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0">
              <VietnamMap
                selectedProvince={selectedProvince}
                onSelect={setSelectedProvince}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full md:flex-1 h-[60vh] md:h-[calc(100vh-3rem)] flex flex-col">
            <ProvinceDetails province={selectedProvince} />
          </div>

        </div>
      </motion.div>

    )}

  </AnimatePresence>
);
}