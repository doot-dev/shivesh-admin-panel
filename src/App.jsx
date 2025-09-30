import { useState } from "react";
import "./App.css";
import AppRoutes from "./routes/appRoutes";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      {/* <h1 class="text-3xl font-bold underline bg-primary  text-primary-dark ">Hello world!</h1> */}
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
