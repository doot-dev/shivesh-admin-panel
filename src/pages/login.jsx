import { Link } from "react-router-dom";
import Logo from "../assets/img/shivesh-logo.png";
import LoginImg from "../assets/img/loginImg.png";
export default function Login() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 text-left justify-center">
            <img src={Logo} alt="Shivesh Logo" className=" w-50" />
            <h1 className=" text-2xl md:text-[42px] font-semibold mt-4 text-primary-dark">
              Welcome back!
            </h1>
            <p className="text-2xl text-primary">Please log in to continue</p>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                E-mail address
              </label>
              <input
                type="email"
                defaultValue="admin@gmail.com"
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                defaultValue="********"
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary-dark text-white rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Image (hidden on small screens) */}
      <div className="hidden md:flex w-1/2">
        <img
          src={LoginImg}
          alt="Construction"
          className="w-full max-h-[100vh] object-left-bottom object-cover"
        />
      </div>
    </div>
  );
}
