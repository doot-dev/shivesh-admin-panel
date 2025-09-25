import { useState } from "react";
import "./App.css";
import AppRoutes from "./routes/appRoutes";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {


  return (
    <>
      {/* <h1 class="text-3xl font-bold underline bg-primary  text-primary-dark ">Hello world!</h1> */}
      <AppRoutes />

    </>
  );
}

export default App;
