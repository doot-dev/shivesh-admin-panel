import { Link } from "react-router-dom";
import Logo from "../assets/img/shivesh-logo.png";
import LoginImg from "../assets/img/loginImg.png";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";
export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const { updateUser } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (!userName.trim()) {
      toast.error("Please enter your username");
      return;
    }
    
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }
    
    try {
      const result = await login({ userName, password });
      
      // Check if the login thunk was fulfilled
      if (result.type === 'auth/login/fulfilled') {
        console.log("Login successful:", result.payload);
        toast.success("Login successful!");
        navigate("/dashboard");
        
      } 
      else if (result.type === 'auth/login/rejected') {
        // Login failed - could be wrong credentials or server error
        console.error("Login failed:", result.error);
        toast.error("Invalid username or password. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast.error("Invalid username or password. Please try again.");
    }
  };
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 text-left justify-center">
          <img src={Logo} alt="Shivesh Logo" className=" w-50" />  
            <h1 className=" text-2xl md:text-[42px] font-semibold mt-4 text-primary tracking-wide leading-11 ">
              Welcome back!
            </h1>
            <p className="text-2xl text-[#6D8FEF] leading-8 mt-2">
              Please log in to continue
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className=" text-[18px]  text-text-primary">
                E-mail address
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-1 w-full px-3  border rounded-[6px] h-[60px] border-[#6D8FEFA6] focus:outline-none bg-input-bg"
              />
            </div>

            <div>
              <label className="text-[18px]  text-text-primary">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3  border rounded-[6px] h-[60px] border-[#6D8FEFA6] focus:outline-none bg-input-bg"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-white text-xl mt-[30px] transition rounded-[6px] h-[60px]"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-8">
            <a
              href="#"
              className="text-base font-medium tracking-wide text-primary hover:underline"
            >
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
