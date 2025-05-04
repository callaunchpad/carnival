import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

interface CarnivalLandingProps {}

export default function CarnivalLanding({}: CarnivalLandingProps): React.ReactNode {
  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#333] flex flex-col items-center justify-center p-6">
      {/* Hero Section */}
      <motion.h1
        className="text-6xl font-serif text-[#D72638] text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Carnival
      </motion.h1>
      <motion.p
        className="text-lg text-gray-600 mt-4 text-center max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        A collection of mini-games on mechanistic interpretability.
      </motion.p>

      {/* Call-to-Action */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <Button className="bg-[#D72638] hover:bg-[#F8C471] text-white font-bold py-3 px-6 rounded-xl text-lg shadow-lg">
          Get Your Ticket
        </Button>
      </motion.div>

      {/* Mini-Games Grid */}
      <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-4xl">
        <Link to="/adversarial-attack">
          <motion.div className="p-6 bg-white shadow-lg rounded-lg" whileHover={{ scale: 1.05 }}>
            <h2 className="text-xl font-bold text-[#D72638]">Adversarial Attack</h2>
            <p className="text-gray-600 mt-2">Try to optimally fool a classifier!!</p>
          </motion.div>
        </Link>
        <Link to="/feature-hunt">
          <motion.div className="p-6 bg-white shadow-lg rounded-lg" whileHover={{ scale: 1.05 }}>
            <h2 className="text-xl font-bold text-[#D72638]">Feature Hunt</h2>
            <p className="text-gray-600 mt-2">Try to figure out the hidden feature!!.</p>
          </motion.div>
        </Link>
        <Link to="/surgical-simulator">
          <motion.div className="p-6 bg-white shadow-lg rounded-lg" whileHover={{ scale: 1.05 }}>
            <h2 className="text-xl font-bold text-[#D72638]">Surgery Simulator</h2>
            <p className="text-gray-600 mt-2">Test your precision in correcting model behavior.</p>
          </motion.div>
        </Link>
        <div className="p-6 bg-gray-200 shadow-lg rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Wooooweeeee</p>
        </div>
      </div>

      {/* Subtle Background Elements */}
      <motion.div
        className="absolute top-10 right-10 text-[#F8C471] text-5xl opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        🎡
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-10 text-[#D72638] text-5xl opacity-20"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        🎠
      </motion.div>
    </div>
  );
}
