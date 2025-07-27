"use client";
import axios from "axios";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const page = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/v1/login`, {
        email,
      });
      if (res.status === 200) {
        router.push(`/verify?email=${email}`);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-gray-600 border">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Mail size={40} color="white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">
              Welcome to Chat App
            </h2>
            <p className="text-gray-300 text-lg">Please login to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-300 text-sm font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                placeholder="Enter your email"
                required
                autoComplete="off"
                className="w-full p-3 border border-gray-600 rounded-lg outline-none text-gray-400 focus:border-blue-600"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} color="white" />
              ) : (
                <>
                  Send OTP <ArrowRight size={20} color="white" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default page;
