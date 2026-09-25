import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ShoppingCart, Truck, CircleCheck, ReceiptText } from "lucide-react";
import Logo from "../assets/img/shivesh-logo.png";
import { useAuth } from "../hooks/useAuth";

/**
 * Sign-in. Left: the form. Right (lg and up): what the panel does, as the
 * order → truck → challan → bill journey rising in one card at a time.
 * The journey is illustrative on purpose — this page is public, so it shows no
 * real client, order or amount.
 */
const JOURNEY = [
  { icon: ShoppingCart, title: "New order from the client app", meta: "RMC M25 · 12 CBM · tomorrow 9:00 AM", right: "Placed", offset: "ml-0" },
  { icon: Truck, title: "Truck reached site", meta: "Field technician · live status", right: "live", offset: "ml-16" },
  { icon: CircleCheck, title: "Challan accepted", meta: "Photo and quantity checked", right: "Accepted", offset: "ml-4" },
  { icon: ReceiptText, title: "Bill generated automatically", meta: "For the accepted quantity only", right: "Bill", offset: "ml-20" },
];

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return toast.error("Please enter your username");
    if (!password.trim()) return toast.error("Please enter your password");
    try {
      const result = await login({ userName, password });
      if (result.type === "auth/login/fulfilled") {
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid username or password. Please try again.");
      }
    } catch {
      toast.error("Invalid username or password. Please try again.");
    }
  };

  const field = "flex h-14 items-center gap-3 rounded-2xl border-[1.5px] bg-input-bg px-4 transition-all focus-within:border-border focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(109,143,239,.16)]";

  return (
    <div className="flex min-h-dvh bg-white">
      {/* Form */}
      <section className="flex w-full flex-col px-6 py-8 sm:px-12 lg:w-[46%] lg:max-w-[680px] lg:px-16 xl:px-24">
        <div className="sv-rise flex items-center gap-3">
          <img src={Logo} alt="" className="h-12 w-12 object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-[.1em] text-primary-second">SHIVESH</span>
            <span className="text-xs text-text-secondary">Group of Companies</span>
          </div>
        </div>

        <div className="my-auto w-full max-w-[440px] py-10">
          <span className="sv-rise inline-block rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold tracking-wide text-primary" style={{ animationDelay: ".07s" }}>
            Admin panel
          </span>
          <h1 className="sv-rise mt-4 text-4xl font-bold tracking-tight text-primary-second sm:text-[46px] sm:leading-[1.1]" style={{ animationDelay: ".14s" }}>
            Welcome back
          </h1>
          <p className="sv-rise mt-3 text-base leading-relaxed text-text-secondary" style={{ animationDelay: ".21s" }}>
            Sign in to confirm today&rsquo;s orders, review challans and close the day&rsquo;s billing.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5" noValidate>
            <div className="sv-rise space-y-2" style={{ animationDelay: ".28s" }}>
              <label htmlFor="login-user" className="text-[13px] font-semibold text-text-primary">Username</label>
              <div className={`${field} border-primary-light text-primary`}>
                <User size={20} className="shrink-0" />
                <input id="login-user" value={userName} onChange={(e) => setUserName(e.target.value)} autoComplete="username" autoFocus
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-text-primary outline-none" />
              </div>
            </div>

            <div className="sv-rise space-y-2" style={{ animationDelay: ".35s" }}>
              <label htmlFor="login-pass" className="text-[13px] font-semibold text-text-primary">Password</label>
              <div className={`${field} border-primary-light pr-2 text-primary`}>
                <Lock size={20} className="shrink-0" />
                <input id="login-pass" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" className="min-w-0 flex-1 bg-transparent text-[15px] text-text-primary outline-none" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-primary hover:bg-primary-light">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="sv-rise pt-2" style={{ animationDelay: ".42s" }}>
              <button type="submit" disabled={loading}
                className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-white shadow-[0_12px_28px_rgba(30,58,138,.28)] transition-all hover:-translate-y-px hover:bg-primary-second disabled:translate-y-0 disabled:opacity-70">
                <span>{loading ? "Signing in…" : "Sign in"}</span>
                {!loading && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />}
              </button>
            </div>
          </form>
        </div>

        <div className="sv-rise flex items-start gap-2.5 text-[13px] text-text-secondary" style={{ animationDelay: ".5s" }}>
          <ShieldCheck size={18} className="mt-px shrink-0 text-primary" />
          <span>You see only the menus your role allows. Missing one? Ask a Super Admin.</span>
        </div>
      </section>

      {/* What the panel does — large screens only */}
      <section aria-label="What the panel does"
        className="sv-fade relative m-5 hidden flex-1 flex-col overflow-hidden rounded-[30px] bg-primary p-14 lg:flex xl:p-16"
        style={{
          backgroundImage: "linear-gradient(rgba(229,236,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(229,236,255,.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}>
        <div className="pointer-events-none absolute -bottom-56 -right-52 h-[520px] w-[520px] rounded-full bg-primary-second opacity-80" />
        <div className="pointer-events-none absolute -top-24 right-16 h-64 w-64 rounded-full border border-primary-bg-alt/35" />

        <div className="sv-rise relative max-w-[520px]" style={{ animationDelay: ".2s" }}>
          <h2 className="text-[34px] font-semibold leading-tight text-white xl:text-4xl">Every order, truck and bill in one place</h2>
          <p className="mt-3 text-base leading-relaxed text-primary-light">
            From the client&rsquo;s order to the automatic bill, your team sees each step as it happens.
          </p>
        </div>

        <div className="relative mt-14 flex flex-col gap-5">
          <svg width="140" height="420" viewBox="0 0 140 420" fill="none" aria-hidden="true" className="absolute left-7 top-7">
            <path d="M10 10 C 70 60, 80 90, 70 130 S 30 220, 40 260 S 110 330, 90 400" stroke="#9bb3f4" strokeWidth="2"
              strokeDasharray="6 8" opacity=".7" style={{ strokeDashoffset: 700, animation: "sv-draw 3s ease .4s forwards" }} />
          </svg>
          {JOURNEY.map(({ icon, title, meta, right, offset }, i) => {
            const IconCmp = icon;
            return (
            <div key={title} className={`sv-rise ${offset}`} style={{ animationDelay: `${0.35 + i * 0.28}s` }}>
              <div className="sv-float flex w-[400px] max-w-full items-center gap-3.5 rounded-[18px] bg-white px-4 py-4 shadow-[0_18px_40px_rgba(8,18,55,.35)]"
                style={{ animationDelay: `${1.2 + i * 0.4}s`, animationDuration: `${6 + i * 0.5}s` }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <IconCmp size={20} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold text-primary-second">{title}</span>
                  <span className="text-xs text-text-secondary">{meta}</span>
                </div>
                {right === "live" ? (
                  <span className="flex items-center gap-2 text-xs font-semibold text-success">
                    <span className="sv-pulse h-2 w-2 rounded-full bg-success" />Live
                  </span>
                ) : (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${right === "Accepted" ? "bg-success-light text-success" : "bg-primary-light text-primary"}`}>
                    {right}
                  </span>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
