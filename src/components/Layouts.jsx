import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

export default function Layouts() {
  return (
    <div className="h-screen">
      <Navbar />

      <div className="flex  flex-1">
        <Sidebar />
        <main className="py-5 px-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
