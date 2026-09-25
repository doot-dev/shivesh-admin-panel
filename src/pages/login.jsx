import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import Logo from "../assets/img/shivesh-logo.png";
import sitePhoto from "../assets/img/login/site.webp";
import pourPhoto from "../assets/img/login/pour.webp";
import handoverPhoto from "../assets/img/login/handover.webp";
import { useAuth } from "../hooks/useAuth";

/**
 * Sign-in. Left: the form. Right (lg and up): a photo carousel — site, pour,
 * handover — each captioned with what the panel does at that step. Public page,
 * so the captions show no real client, order or amount.
 */
const SLIDES = [
  { src: sitePhoto, title: "Every order, straight from the client app", text: "Confirm orders, pick the plant and assign technicians in minutes." },
  { src: pourPhoto, title: "Trucks tracked from plant to pour", text: "Dispatched, reached, challan accepted — your team sees it live." },
  { src: handoverPhoto, title: "Bills that close themselves", text: "Each bill follows the accepted quantity, ready for accounts." },
];
const SLIDE_MS = 5000;

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  // Auto-advance; picking a dot restarts the timer. Still for reduced motion.
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => setSlide((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [slide]);

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

      {/* Photo carousel — large screens only */}
      <section aria-label="Shivesh at work" aria-roledescription="carousel"
        className="sv-fade relative m-5 hidden flex-1 overflow-hidden rounded-[30px] bg-primary lg:block">
        {SLIDES.map((s, i) => (
          <img key={s.src} src={s.src} alt="" aria-hidden="true" decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1400ms] ease-out ${i === slide ? "scale-100 opacity-100" : "scale-105 opacity-0"}`} />
        ))}
        {/* Keeps white text readable on any photo. */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,18,55,.92) 0%, rgba(8,18,55,.45) 38%, rgba(8,18,55,0) 65%)" }} />

        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-14">
          <div key={slide} className="sv-rise max-w-[540px]" aria-live="polite">
            <h2 className="text-[34px] font-semibold leading-tight text-white xl:text-4xl">{SLIDES[slide].title}</h2>
            <p className="mt-3 text-base leading-relaxed text-primary-light">{SLIDES[slide].text}</p>
          </div>
          <div className="mt-8 flex gap-2">
            {SLIDES.map((s, i) => (
              <button key={s.src} type="button" onClick={() => setSlide(i)}
                aria-label={`Show photo ${i + 1} of ${SLIDES.length}`} aria-current={i === slide}
                className={`h-1.5 overflow-hidden rounded-full bg-white/30 transition-all duration-300 ${i === slide ? "w-12" : "w-5 hover:bg-white/60"}`}>
                {i === slide && <span className="block h-full bg-white" style={{ animation: `sv-progress ${SLIDE_MS}ms linear both` }} />}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
