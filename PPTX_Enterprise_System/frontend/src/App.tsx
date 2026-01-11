import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Studio from "./pages/Studio";

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" dir="rtl">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-lg font-semibold">PPTX Enterprise Studio</h1>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-emerald-400" : "text-slate-300"
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/studio"
              className={({ isActive }) =>
                isActive ? "text-emerald-400" : "text-slate-300"
              }
            >
              Training Studio
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/studio" element={<Studio />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
