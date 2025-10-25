import { useState } from "react";
import "./App.css";
import AppRoutes from "./routes/appRoutes";
import ProtectedRoute from "./routes/protectedRoutess";
import { ToastContainer } from "react-toastify";



// import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
