import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./navbarr";
import Sidebar from "./sidebarr";

/**
 * App frame: navy sidebar + top bar + scrolling content.
 *
 * Desktop and landscape tablets (lg, ≥1024px) keep the sidebar docked.
 * Phones and portrait tablets get it as a slide-in drawer from the top bar's
 * menu button; its links, the overlay and Escape close it.
 */
const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);

  // The content pane scrolls, not the window — so reset it on every new page.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background-hover">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onToggleSidebar={() => setIsSidebarOpen((v) => !v)} isSidebarOpen={isSidebarOpen} />
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Opacity-only page fade: a transform here would trap every fixed popup
              (delete dialogs, dropdown menus) inside the content pane. */}
          <div key={location.pathname} className="sv-fade mx-auto w-full max-w-[1600px] px-1 pb-10 sm:px-2 lg:px-3">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
