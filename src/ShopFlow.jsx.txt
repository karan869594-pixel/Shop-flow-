import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Home as HomeIcon, Grid3x3, ShoppingCart, Package, User, Search, Heart,
  Star, Minus, Plus, Trash2, ChevronLeft, ChevronRight, MapPin, CreditCard,
  Check, CheckCircle2, X, LogOut, Pencil, LayoutDashboard, Users, BarChart3,
  ArrowLeft, ShoppingBag, Truck, ShieldCheck, Smartphone, Shirt, Sofa,
  Sparkles, Dumbbell, BookOpen, PlusCircle, ChevronDown, Banknote, Wallet,
  AlertCircle, PackageCheck, Clock, Ban, Eye, EyeOff
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

/* ------------------------------------------------------------------ */
/*  DEMO DATA                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { id: "electronics", name: "Electronics", icon: Smartphone },
  { id: "fashion", name: "Fashion", icon: Shirt },
  { id: "home", name: "Home & Living", icon: Sofa },
  { id: "beauty", name: "Beauty & Care", icon: Sparkles },
  { id: "sports", name: "Sports & Fitness", icon: Dumbbell },
  { id: "books", name: "Books & Stationery", icon: BookOpen },
];

const seedImg = (seed) => `https://picsum.photos/seed/${seed}/640/640`;

const RAW_PRODUCTS = [
  // Electronics
  { name: "Pulse Wireless Earbuds", category: "electronics", price: 2199, mrp: 3499, rating: 4.4, ratingCount: 812, stock: 34, seed: "sf-earbuds", featured: true, bestseller: true, desc: "True wireless earbuds with active noise cancellation, 30-hour battery life and punchy bass tuned for everyday listening." },
  { name: "Aura Smartwatch Lite", category: "electronics", price: 3299, mrp: 4999, rating: 4.2, ratingCount: 501, stock: 21, seed: "sf-smartwatch", newArrival: true, desc: "AMOLED smartwatch with heart-rate tracking, sleep insights and 10-day battery backup." },
  { name: "Flux 20000mAh Power Bank", category: "electronics", price: 1499, mrp: 1999, rating: 4.5, ratingCount: 1203, stock: 58, seed: "sf-powerbank", bestseller: true, desc: "Fast-charging 20000mAh power bank with dual USB-C ports, enough for 4 full phone charges." },
  { name: "Ripple Bluetooth Speaker", category: "electronics", price: 1899, mrp: 2599, rating: 4.1, ratingCount: 340, stock: 15, seed: "sf-speaker", desc: "Compact waterproof speaker with 12-hour playtime and deep, room-filling sound." },
  { name: "Nova 65W Charger", category: "electronics", price: 899, mrp: 1299, rating: 4.3, ratingCount: 276, stock: 40, seed: "sf-charger", newArrival: true, desc: "GaN 65W fast charger, compact enough to carry anywhere, charges laptop and phone together." },

  // Fashion
  { name: "Drift Cotton Shirt", category: "fashion", price: 899, mrp: 1499, rating: 4.0, ratingCount: 210, stock: 60, seed: "sf-shirt", featured: true, desc: "Breathable 100% cotton shirt with a relaxed fit, perfect for daily wear." },
  { name: "Horizon Denim Jacket", category: "fashion", price: 1999, mrp: 2999, rating: 4.6, ratingCount: 430, stock: 18, seed: "sf-jacket", bestseller: true, desc: "Classic denim jacket with a modern tapered cut and reinforced stitching." },
  { name: "Glide Running Shoes", category: "fashion", price: 2499, mrp: 3999, rating: 4.5, ratingCount: 980, stock: 25, seed: "sf-shoes", bestseller: true, featured: true, desc: "Lightweight running shoes with responsive cushioning and breathable mesh upper." },
  { name: "Coastal Linen Trousers", category: "fashion", price: 1299, mrp: 1899, rating: 3.9, ratingCount: 156, stock: 32, seed: "sf-trousers", newArrival: true, desc: "Airy linen-blend trousers with an easy, tapered silhouette." },
  { name: "Tide Canvas Tote Bag", category: "fashion", price: 699, mrp: 999, rating: 4.4, ratingCount: 145, stock: 48, seed: "sf-tote", desc: "Durable canvas tote with reinforced handles, roomy enough for daily essentials." },

  // Home
  { name: "Meadow Ceramic Mug Set", category: "home", price: 649, mrp: 999, rating: 4.6, ratingCount: 320, stock: 44, seed: "sf-mugs", featured: true, desc: "Set of 4 hand-glazed ceramic mugs, microwave and dishwasher safe." },
  { name: "Ember Scented Candle", category: "home", price: 449, mrp: 699, rating: 4.3, ratingCount: 198, stock: 70, seed: "sf-candle", newArrival: true, desc: "Soy-wax candle with a warm sandalwood and amber fragrance, 40-hour burn time." },
  { name: "Loom Cotton Bedsheet Set", category: "home", price: 1599, mrp: 2499, rating: 4.5, ratingCount: 402, stock: 22, seed: "sf-bedsheet", bestseller: true, desc: "300 thread-count cotton bedsheet set with 2 pillow covers, breathable and soft." },
  { name: "Grove Indoor Planter", category: "home", price: 799, mrp: 1099, rating: 4.2, ratingCount: 88, stock: 36, seed: "sf-planter", desc: "Self-watering ceramic planter, ideal for succulents and small indoor plants." },
  { name: "Hearth Non-Stick Pan", category: "home", price: 1199, mrp: 1799, rating: 4.4, ratingCount: 265, stock: 29, seed: "sf-pan", desc: "Induction-friendly non-stick pan with a soft-touch handle and even heat distribution." },

  // Beauty
  { name: "Dew Vitamin C Serum", category: "beauty", price: 599, mrp: 899, rating: 4.5, ratingCount: 670, stock: 55, seed: "sf-serum", bestseller: true, featured: true, desc: "Brightening vitamin C serum with hyaluronic acid for a smooth, even glow." },
  { name: "Bloom Matte Lipstick Set", category: "beauty", price: 749, mrp: 1099, rating: 4.3, ratingCount: 312, stock: 40, seed: "sf-lipstick", newArrival: true, desc: "Set of 3 long-wear matte lipsticks in everyday shades." },
  { name: "Silk Argan Hair Oil", category: "beauty", price: 399, mrp: 599, rating: 4.1, ratingCount: 220, stock: 63, seed: "sf-hairoil", desc: "Lightweight argan hair oil that nourishes and adds shine without residue." },
  { name: "Clay Detox Face Mask", category: "beauty", price: 449, mrp: 699, rating: 4.4, ratingCount: 190, stock: 38, seed: "sf-facemask", desc: "Purifying clay mask that draws out impurities and tightens pores." },

  // Sports
  { name: "Core Yoga Mat", category: "sports", price: 899, mrp: 1299, rating: 4.6, ratingCount: 540, stock: 41, seed: "sf-yogamat", bestseller: true, desc: "Extra-thick non-slip yoga mat with carry strap, ideal for home workouts." },
  { name: "Surge Resistance Bands", category: "sports", price: 549, mrp: 799, rating: 4.3, ratingCount: 275, stock: 66, seed: "sf-bands", newArrival: true, desc: "Set of 5 resistance bands for strength training and mobility work." },
  { name: "Momentum Gym Bag", category: "sports", price: 1099, mrp: 1599, rating: 4.2, ratingCount: 132, stock: 27, seed: "sf-gymbag", desc: "Spacious gym duffel with a separate shoe compartment and water-resistant base." },
  { name: "Pulse Skipping Rope", category: "sports", price: 349, mrp: 499, rating: 4.0, ratingCount: 98, stock: 80, seed: "sf-rope", desc: "Adjustable speed rope with ball-bearing handles for smooth, fast rotation." },

  // Books
  { name: "The Quiet Current (Novel)", category: "books", price: 349, mrp: 499, rating: 4.7, ratingCount: 410, stock: 50, seed: "sf-book1", featured: true, desc: "A quiet, atmospheric novel about a coastal town and the secrets it keeps." },
  { name: "Notion Dot-Grid Notebook", category: "books", price: 249, mrp: 349, rating: 4.5, ratingCount: 300, stock: 90, seed: "sf-notebook", bestseller: true, desc: "A5 dot-grid notebook with 160 pages of thick, bleed-resistant paper." },
  { name: "Field & Focus (Essays)", category: "books", price: 399, mrp: 599, rating: 4.3, ratingCount: 150, stock: 33, seed: "sf-book2", newArrival: true, desc: "A collection of essays on craft, attention and the practice of noticing." },
];

const PRODUCTS = RAW_PRODUCTS.map((p, i) => ({ id: "P" + (i + 1), ...p, image: seedImg(p.seed) }));

const DEMO_CUSTOMERS = [
  { id: "U100", name: "Riya Malhotra", email: "riya.m@example.com", joined: "2026-02-11" },
  { id: "U101", name: "Aarav Shah", email: "aarav.shah@example.com", joined: "2026-03-04" },
  { id: "U102", name: "Kavya Nair", email: "kavya.nair@example.com", joined: "2026-05-19" },
];

const REVIEWS_SEED = [
  { id: "RV1", productId: "P1", name: "Ananya Kapoor", rating: 5, comment: "Noise cancellation is genuinely impressive for this price. Battery easily lasts my full work day.", date: "2026-06-02" },
  { id: "RV2", productId: "P1", name: "Rohit Verma", rating: 4, comment: "Great sound, fit is comfortable. Wish the case felt a bit sturdier.", date: "2026-06-18" },
  { id: "RV3", productId: "P3", name: "Priya Sen", rating: 5, comment: "Charges my phone twice over and still has juice left. Exactly what I needed for travel.", date: "2026-05-21" },
  { id: "RV4", productId: "P7", name: "Karan Mehta", rating: 5, comment: "Fit is true to size and the denim feels sturdy without being stiff. Wear it every week.", date: "2026-07-01" },
  { id: "RV5", productId: "P8", name: "Simran Kaur", rating: 5, comment: "Lightweight and cushioned — did a 10K in these with zero discomfort.", date: "2026-06-27" },
  { id: "RV6", productId: "P8", name: "Devansh Rao", rating: 4, comment: "Good grip and breathable mesh. Sizing runs slightly narrow.", date: "2026-07-09" },
  { id: "RV7", productId: "P11", name: "Neha Joshi", rating: 5, comment: "The glaze finish looks so much nicer in person. Perfect morning coffee mugs.", date: "2026-05-30" },
  { id: "RV8", productId: "P16", name: "Ishita Bansal", rating: 4, comment: "Noticed a visible glow within two weeks. A little sticky if applied too generously.", date: "2026-06-14" },
  { id: "RV9", productId: "P21", name: "Aditya Kulkarni", rating: 5, comment: "Thick, non-slip, and doesn't smell like rubber. My go-to mat now.", date: "2026-06-05" },
  { id: "RV10", productId: "P26", name: "Meera Iyer", rating: 5, comment: "Finished it in a weekend. Beautifully written and paced.", date: "2026-05-12" },
];

const STATUS_FLOW = ["Pending", "Confirmed", "Shipped", "Delivered"];
const STATUS_STYLE = {
  Pending: { bg: "#FFF3E6", fg: "#B4600D", icon: Clock },
  Confirmed: { bg: "#E7F1FF", fg: "#1855A8", icon: Check },
  Shipped: { bg: "#EEE7FF", fg: "#5C3DBF", icon: Truck },
  Delivered: { bg: "#E4F2EE", fg: "#0F6D5C", icon: PackageCheck },
  Cancelled: { bg: "#FDE8E6", fg: "#C23B2E", icon: Ban },
};

const money = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const uid = (p) => p + Math.random().toString(36).slice(2, 8).toUpperCase();

/* ------------------------------------------------------------------ */
/*  GLOBAL STYLE (design tokens)                                       */
/* ------------------------------------------------------------------ */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    :root{
      --ink:#10231F; --ink-soft:#4C5D59; --muted:#7C8B87;
      --paper:#F5F7F5; --surface:#FFFFFF; --border:#E4E8E5;
      --primary:#0F6D5C; --primary-dark:#0A4F42; --primary-light:#E4F2EE;
      --accent:#FF6B4A; --accent-dark:#E1502F; --accent-light:#FFEAE3;
      --gold:#E8A33D;
    }
    .sf-root{
      font-family:'Inter',system-ui,sans-serif; color:var(--ink); background:var(--paper);
      -webkit-tap-highlight-color:transparent;
    }
    .sf-display{ font-family:'Fraunces',serif; }
    .sf-mono{ font-family:'JetBrains Mono',monospace; }

    .sf-btn-primary{ background:var(--primary); color:#fff; transition:background .15s, transform .1s; }
    .sf-btn-primary:hover{ background:var(--primary-dark); }
    .sf-btn-primary:active{ transform:scale(0.97); }
    .sf-btn-primary:disabled{ background:#B9C4C1; }

    .sf-btn-accent{ background:var(--accent); color:#fff; transition:background .15s, transform .1s; }
    .sf-btn-accent:hover{ background:var(--accent-dark); }
    .sf-btn-accent:active{ transform:scale(0.97); }

    .sf-btn-outline{ border:1.5px solid var(--border); background:#fff; color:var(--ink); transition:border-color .15s, background .15s; }
    .sf-btn-outline:hover{ border-color:var(--primary); background:var(--primary-light); }

    .sf-chip{ background:var(--primary-light); color:var(--primary-dark); }
    .sf-card{ background:var(--surface); border:1px solid var(--border); }
    .sf-link{ color:var(--primary); }

    .sf-price-tag{
      position:relative; display:inline-flex; align-items:center; gap:4px;
      background:var(--ink); color:#fff; padding:3px 10px 3px 14px; border-radius:4px 10px 10px 4px;
    }
    .sf-price-tag::before{
      content:''; position:absolute; left:5px; top:50%; transform:translateY(-50%);
      width:4px; height:4px; border-radius:50%; background:var(--paper);
    }

    .sf-wave{ display:block; width:100%; height:28px; }

    .sf-scroll-x{ overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; }
    .sf-scroll-x::-webkit-scrollbar{ display:none; }

    .sf-navpill{ transition: all .25s cubic-bezier(.4,0,.2,1); }

    .sf-input{
      width:100%; border:1.5px solid var(--border); border-radius:12px; padding:11px 14px;
      font-family:'Inter',sans-serif; font-size:14.5px; background:#fff; color:var(--ink);
      outline:none; transition:border-color .15s;
    }
    .sf-input:focus{ border-color:var(--primary); }
    .sf-input::placeholder{ color:var(--muted); }

    .sf-fade-in{ animation:sfFadeIn .3s ease both; }
    @keyframes sfFadeIn{ from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }

    .sf-skeleton{ background:linear-gradient(90deg,#ECEFED 25%,#F6F7F6 37%,#ECEFED 63%); background-size:400% 100%; animation:sfShimmer 1.4s ease infinite; border-radius:10px; }
    @keyframes sfShimmer{ 0%{background-position:100% 0} 100%{background-position:0 0} }

    @media (prefers-reduced-motion: reduce){
      .sf-fade-in, .sf-navpill, .sf-skeleton, .sf-splash-icon, .sf-splash-text, .sf-splash-tag, .sf-splash-line{ animation:none !important; transition:none !important; opacity:1 !important; width:120px !important; }
    }

    .sf-line-clamp-2{ display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .sf-focus:focus-visible{ outline:2px solid var(--primary); outline-offset:2px; }

    /* Splash screen */
    .sf-splash-icon{ animation: sfSplashIcon 1s cubic-bezier(.16,1,.3,1) both; }
    @keyframes sfSplashIcon{ from{ opacity:0; transform:scale(.6) rotate(-8deg); } to{ opacity:1; transform:scale(1) rotate(0deg); } }
    .sf-splash-text{ opacity:0; animation: sfSplashUp .8s ease .35s both; }
    .sf-splash-tag{ opacity:0; animation: sfSplashUp .8s ease .75s both; }
    @keyframes sfSplashUp{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:translateY(0); } }
    .sf-splash-line{ width:0; height:1px; background:linear-gradient(90deg,transparent,#E8C27A,transparent); animation: sfSplashLine 1s ease .55s forwards; }
    @keyframes sfSplashLine{ from{ width:0; } to{ width:120px; } }
    .sf-splash-shimmer{ position:absolute; inset:0; background:radial-gradient(ellipse at 50% 35%, rgba(232,194,122,0.12), transparent 60%), radial-gradient(ellipse 700px 700px at 85% 95%, rgba(15,109,92,0.22), transparent 60%); }
    .sf-splash-frame{ position:absolute; inset:28px; border:1px solid rgba(232,194,122,0.3); }
    .sf-splash-corner{ position:absolute; width:24px; height:24px; opacity:0; animation: sfSplashUp .6s ease .1s both; }
    .sf-splash-eyebrow{ opacity:0; animation: sfSplashUp .8s ease .1s both; }
    @media (max-width: 480px){ .sf-splash-frame{ inset:16px; } .sf-splash-corner{ width:18px; height:18px; } }
  `}</style>
);

/* ------------------------------------------------------------------ */
/*  SPLASH / WELCOME SCREEN                                            */
/* ------------------------------------------------------------------ */

function SplashScreen({ onEnter }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2300);
    const t2 = setTimeout(() => onEnter(), 2750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line

  return (
    <div
      className={"fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 transition-opacity duration-500 " + (leaving ? "opacity-0 pointer-events-none" : "opacity-100")}
      style={{ background: "linear-gradient(160deg,#0A1613 0%,#10231F 55%,#0A1613 100%)" }}
    >
      <div className="sf-splash-shimmer" />
      <div className="sf-splash-frame" />
      {[
        { pos: "top-3 left-3", flip: "" },
        { pos: "top-3 right-3", flip: "scale(-1,1)" },
        { pos: "bottom-3 left-3", flip: "scale(1,-1)" },
        { pos: "bottom-3 right-3", flip: "scale(-1,-1)" },
      ].map((c, i) => (
        <svg key={i} className={"sf-splash-corner absolute " + c.pos} viewBox="0 0 24 24" fill="none" style={{ transform: c.flip }}>
          <path d="M1 24V5C1 2.8 2.8 1 5 1H24" stroke="#E8C27A" strokeWidth="1" />
        </svg>
      ))}

      <div className="relative flex flex-col items-center text-center">
        <span className="sf-splash-eyebrow text-[11px] font-semibold tracking-[0.5em] uppercase mb-6" style={{ color: "#C9A46B" }}>
          Introducing
        </span>
        <svg width="52" height="52" viewBox="0 0 26 26" fill="none" className="sf-splash-icon">
          <path d="M4 15c3-6 6 6 9 0s6-6 9 0" stroke="#E8C27A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <circle cx="13" cy="13" r="11.3" stroke="#E8C27A" strokeWidth="0.9" fill="none" opacity="0.55" />
        </svg>
        <h1 className="sf-display sf-splash-text text-white text-[32px] font-semibold tracking-wide mt-5">ShopFlow</h1>
        <div className="sf-splash-line mt-4" />
        <p className="sf-splash-tag text-[11px] font-medium tracking-[0.3em] uppercase mt-4" style={{ color: "#C9A46B" }}>
          Curated Everyday Luxury
        </p>
      </div>

      <div className="sf-splash-tag absolute bottom-10 left-0 right-0 flex items-center justify-center gap-3">
        <span className="w-1 h-1 rounded-full" style={{ background: "#E8C27A", opacity: 0.7 }} />
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase" style={{ color: "#6E8079" }}>Shop the Flow</span>
        <span className="w-1 h-1 rounded-full" style={{ background: "#E8C27A", opacity: 0.7 }} />
      </div>
    </div>
  );
}



/* ------------------------------------------------------------------ */
/*  SMALL UI PRIMITIVES                                                */
/* ------------------------------------------------------------------ */

function Stars({ rating, size = 13 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <Star size={size} fill="#E8A33D" color="#E8A33D" />
      <span className="text-xs font-semibold" style={{ color: "var(--ink-soft)" }}>{rating.toFixed(1)}</span>
    </span>
  );
}

function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 sf-fade-in">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--primary-light)" }}>
        <Icon size={28} color="var(--primary)" />
      </div>
      <p className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>{title}</p>
      {subtitle && <p className="text-sm mt-1 max-w-xs" style={{ color: "var(--muted)" }}>{subtitle}</p>}
      {actionLabel && (
        <button onClick={onAction} className="sf-btn-primary sf-focus mt-5 px-5 py-2.5 rounded-full text-sm font-semibold">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-[100] sf-fade-in px-4 w-full max-w-sm">
      <div className="flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg" style={{ background: "var(--ink)", color: "#fff" }}>
        <CheckCircle2 size={17} color="#7CD9C0" />
        <span className="text-sm font-medium">{toast}</span>
      </div>
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={"sf-skeleton " + className} />;
}

function QtyStepper({ qty, onDec, onInc, max }) {
  return (
    <div className="flex items-center border rounded-full overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <button onClick={onDec} className="sf-focus w-8 h-8 flex items-center justify-center active:bg-gray-100"><Minus size={14} /></button>
      <span className="w-7 text-center text-sm font-semibold sf-mono">{qty}</span>
      <button onClick={onInc} disabled={max !== undefined && qty >= max} className="sf-focus w-8 h-8 flex items-center justify-center active:bg-gray-100 disabled:opacity-30"><Plus size={14} /></button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PRODUCT CARD                                                       */
/* ------------------------------------------------------------------ */

function ProductCard({ product, onOpen, onAddToCart, onToggleWishlist, isWishlisted, cartQty }) {
  const discount = Math.round(100 - (product.price / product.mrp) * 100);
  return (
    <div className="sf-card rounded-2xl overflow-hidden flex flex-col sf-fade-in">
      <div className="relative cursor-pointer" onClick={() => onOpen(product.id)}>
        <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" loading="lazy" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full sf-btn-accent">{discount}% OFF</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          className="sf-focus absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} color={isWishlisted ? "#FF6B4A" : "#8A9793"} fill={isWishlisted ? "#FF6B4A" : "none"} />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-wide">OUT OF STOCK</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[13.5px] font-semibold leading-snug sf-line-clamp-2 cursor-pointer" onClick={() => onOpen(product.id)}>{product.name}</p>
        <Stars rating={product.rating} />
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="sf-price-tag sf-mono text-[13px] font-bold">{money(product.price)}</span>
          {discount > 0 && <span className="text-xs line-through" style={{ color: "var(--muted)" }}>{money(product.mrp)}</span>}
        </div>
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={product.stock === 0}
          className="sf-focus sf-btn-primary mt-2 rounded-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <ShoppingCart size={14} /> {cartQty > 0 ? `In Cart · ${cartQty}` : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HEADER + BOTTOM NAV                                                */
/* ------------------------------------------------------------------ */

function Logo({ onClick }) {
  return (
    <button onClick={onClick} className="sf-focus flex items-center gap-1.5 shrink-0">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M4 15c3-6 6 6 9 0s6-6 9 0" stroke="#FF6B4A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <circle cx="13" cy="13" r="11.3" stroke="#0F6D5C" strokeWidth="1.6" fill="none" />
      </svg>
      <span className="sf-display font-bold text-[19px] tracking-tight" style={{ color: "var(--primary-dark)" }}>ShopFlow</span>
    </button>
  );
}

function Header({ nav, query, setQuery, onSearch, cartCount, wishlistCount, user, showBack, onBack }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        {showBack ? (
          <button onClick={onBack} className="sf-focus w-9 h-9 -ml-1 flex items-center justify-center rounded-full active:bg-gray-100"><ArrowLeft size={19} /></button>
        ) : (
          <Logo onClick={() => nav("home")} />
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); onSearch(query); }}
          className="flex-1 flex items-center gap-2 rounded-full px-3.5 py-2" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}
        >
          <Search size={16} color="var(--muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands..."
            className="bg-transparent outline-none text-sm flex-1 min-w-0"
          />
        </form>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => nav("wishlist")} className="sf-focus relative w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100">
            <Heart size={19} />
            {wishlistCount > 0 && <Badge n={wishlistCount} />}
          </button>
          <button onClick={() => nav("cart")} className="sf-focus relative w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100">
            <ShoppingCart size={19} />
            {cartCount > 0 && <Badge n={cartCount} />}
          </button>
          <button onClick={() => nav(user ? "profile" : "auth")} className="sf-focus w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100">
            <User size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Badge({ n }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: "var(--accent)" }}>
      {n}
    </span>
  );
}

function BottomNav({ page, nav, cartCount }) {
  const items = [
    { key: "home", label: "Home", icon: HomeIcon },
    { key: "categories", label: "Categories", icon: Grid3x3 },
    { key: "cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { key: "orders", label: "Orders", icon: Package },
    { key: "profile", label: "Profile", icon: User },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-stretch">
        {items.map((it) => {
          const active = page === it.key;
          const Icon = it.icon;
          return (
            <button key={it.key} onClick={() => nav(it.key)} className="sf-focus flex-1 flex flex-col items-center gap-0.5 py-2.5 relative">
              <div className="sf-navpill relative px-3.5 py-1 rounded-full" style={{ background: active ? "var(--primary-light)" : "transparent" }}>
                <Icon size={19} color={active ? "var(--primary-dark)" : "var(--muted)"} />
                {it.badge > 0 && <Badge n={it.badge} />}
              </div>
              <span className="text-[10.5px] font-semibold" style={{ color: active ? "var(--primary-dark)" : "var(--muted)" }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN APP                                                           */
/* ------------------------------------------------------------------ */

export default function ShopFlowApp() {
  const [page, setPage] = useState("home");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const [products, setProducts] = useState(PRODUCTS);
  const [categories, setCategories] = useState(CATEGORIES.map((c) => ({ ...c })));

  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(DEMO_CUSTOMERS);

  const [cart, setCart] = useState([]); // {productId, qty}
  const [wishlist, setWishlist] = useState([]); // productId[]
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState(REVIEWS_SEED);

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [buyNowItem, setBuyNowItem] = useState(null); // {productId, qty}
  const [checkoutAddressId, setCheckoutAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [lastOrderId, setLastOrderId] = useState(null);
  const [postLoginRedirect, setPostLoginRedirect] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 650); return () => clearTimeout(t); }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const nav = (p) => {
    setHistory((h) => [...h, page]);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  };
  const goBack = () => {
    setHistory((h) => {
      const copy = [...h];
      const prev = copy.pop();
      setPage(prev || "home");
      return copy;
    });
  };

  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  /* ---------------- cart / wishlist helpers ---------------- */
  const addToCart = (productId, qty = 1) => {
    const prod = productMap[productId];
    if (!prod || prod.stock === 0) return;
    setCart((c) => {
      const existing = c.find((i) => i.productId === productId);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, prod.stock);
        return c.map((i) => (i.productId === productId ? { ...i, qty: newQty } : i));
      }
      return [...c, { productId, qty: Math.min(qty, prod.stock) }];
    });
    showToast("Added to cart");
  };
  const setCartQty = (productId, qty) => {
    const prod = productMap[productId];
    if (qty <= 0) return removeFromCart(productId);
    setCart((c) => c.map((i) => (i.productId === productId ? { ...i, qty: Math.min(qty, prod.stock) } : i)));
  };
  const removeFromCart = (productId) => {
    setCart((c) => c.filter((i) => i.productId !== productId));
    showToast("Removed from cart");
  };
  const toggleWishlist = (productId) => {
    setWishlist((w) => {
      if (w.includes(productId)) { showToast("Removed from wishlist"); return w.filter((id) => id !== productId); }
      showToast("Added to wishlist");
      return [...w, productId];
    });
  };
  const addReview = (productId, { name, rating, comment }) => {
    setReviews((r) => [{ id: uid("RV"), productId, name, rating, comment, date: new Date().toISOString() }, ...r]);
  };

  const cartLines = useMemo(() => cart.map((i) => ({ ...i, product: productMap[i.productId] })).filter((l) => l.product), [cart, productMap]);
  const activeLines = buyNowItem ? [{ ...buyNowItem, product: productMap[buyNowItem.productId] }] : cartLines;
  const subtotal = activeLines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const deliveryCharge = subtotal === 0 || subtotal >= 999 ? 0 : 49;
  const total = subtotal + deliveryCharge;

  /* ---------------- auth ---------------- */
  const login = ({ email, name, isAdmin }) => {
    setUser({ id: uid("U"), name: name || email.split("@")[0], email, isAdmin: !!isAdmin });
    showToast(isAdmin ? "Welcome back, Admin" : `Welcome, ${name || email.split("@")[0]}`);
    if (postLoginRedirect) { nav(postLoginRedirect); setPostLoginRedirect(null); }
    else nav(isAdmin ? "admin" : "profile");
  };
  const signup = ({ name, email }) => {
    setRegisteredUsers((u) => [...u, { id: uid("U"), name, email, joined: new Date().toISOString().slice(0, 10) }]);
    login({ email, name });
  };
  const logout = () => { setUser(null); showToast("Logged out"); nav("home"); };

  const requireAuth = (target) => {
    if (!user) { setPostLoginRedirect(target); nav("auth"); return false; }
    return true;
  };

  /* ---------------- checkout / orders ---------------- */
  const placeOrder = () => {
    const addr = addresses.find((a) => a.id === checkoutAddressId);
    if (!addr || activeLines.length === 0) return;
    setProcessing(true);
    setTimeout(() => {
      const order = {
        id: uid("SF"),
        items: activeLines.map((l) => ({ productId: l.product.id, name: l.product.name, image: l.product.image, price: l.product.price, qty: l.qty })),
        subtotal, deliveryCharge, total,
        address: addr,
        payment: paymentMethod,
        date: new Date().toISOString(),
        status: "Pending",
      };
      setOrders((o) => [order, ...o]);
      // decrement stock
      setProducts((ps) => ps.map((p) => {
        const line = activeLines.find((l) => l.product.id === p.id);
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
      }));
      if (buyNowItem) setBuyNowItem(null); else setCart([]);
      setLastOrderId(order.id);
      setProcessing(false);
      nav("orderSuccess");
    }, 900);
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  /* ---------------- product admin ---------------- */
  const saveProduct = (prod) => {
    setProducts((ps) => {
      if (prod.id) return ps.map((p) => (p.id === prod.id ? { ...p, ...prod } : p));
      return [{ ...prod, id: uid("P"), image: seedImg(prod.seed || uid("seed")) }, ...ps];
    });
  };
  const deleteProduct = (id) => setProducts((ps) => ps.filter((p) => p.id !== id));
  const addCategory = (name) => setCategories((c) => [...c, { id: uid("cat"), name, icon: Sparkles }]);
  const deleteCategory = (id) => setCategories((c) => c.filter((cat) => cat.id !== id));

  /* ---------------- navigation helpers ---------------- */
  const openProduct = (id) => { setSelectedProductId(id); nav("productDetails"); };
  const openCategory = (id) => { setSelectedCategory(id); nav("productList"); };
  const runSearch = (q) => { setSearchTerm(q); nav("search"); };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const hideChrome = ["auth", "checkout", "orderSuccess", "productDetails", "admin"].includes(page);
  const showBottomNav = !["auth", "admin", "orderSuccess"].includes(page);

  /* ------------------------------------------------------------------ */
  return (
    <div className="sf-root min-h-screen flex flex-col">
      <GlobalStyle />
      {showSplash && <SplashScreen onEnter={() => setShowSplash(false)} />}
      {page !== "admin" && (
        <Header
          nav={nav} query={query} setQuery={setQuery} onSearch={runSearch}
          cartCount={cartCount} wishlistCount={wishlist.length} user={user}
          showBack={["productDetails", "checkout"].includes(page)}
          onBack={goBack}
        />
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto pb-24 md:pb-10">
        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {page === "home" && (
              <HomePage products={products} categories={categories} nav={nav} openProduct={openProduct} openCategory={openCategory}
                addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />
            )}
            {page === "categories" && <CategoriesPage categories={categories} products={products} openCategory={openCategory} />}
            {page === "productList" && (
              <ProductListPage products={products} categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />
            )}
            {page === "productDetails" && (
              <ProductDetailsPage product={productMap[selectedProductId]} cart={cart} wishlist={wishlist}
                addToCart={addToCart} setCartQty={setCartQty} toggleWishlist={toggleWishlist}
                reviews={reviews.filter((r) => r.productId === selectedProductId)} onAddReview={addReview} showToast={showToast}
                onBuyNow={(id, qty) => { setBuyNowItem({ productId: id, qty }); if (requireAuth("checkout")) nav("checkout"); }} />
            )}
            {page === "search" && (
              <SearchResultsPage term={searchTerm} products={products} openProduct={openProduct} addToCart={addToCart}
                toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />
            )}
            {page === "cart" && (
              <CartPage lines={cartLines} setCartQty={setCartQty} removeFromCart={removeFromCart}
                subtotal={subtotal} deliveryCharge={deliveryCharge} total={total} nav={nav}
                onCheckout={() => { setBuyNowItem(null); if (requireAuth("checkout")) nav("checkout"); }} />
            )}
            {page === "wishlist" && (
              <WishlistPage items={wishlist.map((id) => productMap[id]).filter(Boolean)} openProduct={openProduct}
                addToCart={addToCart} toggleWishlist={toggleWishlist} cart={cart} nav={nav} />
            )}
            {page === "auth" && <AuthPage onLogin={login} onSignup={signup} />}
            {page === "profile" && <ProfilePage user={user} nav={nav} logout={logout} ordersCount={orders.length} wishlistCount={wishlist.length} addressesCount={addresses.length} />}
            {page === "orders" && <OrdersPage user={user} orders={orders} nav={nav} requireAuth={requireAuth} />}
            {page === "addresses" && (
              <AddressesPage addresses={addresses} setAddresses={setAddresses} user={user} nav={nav} requireAuth={requireAuth} showToast={showToast} />
            )}
            {page === "checkout" && (
              <CheckoutPage lines={activeLines} addresses={addresses} setAddresses={setAddresses}
                checkoutAddressId={checkoutAddressId} setCheckoutAddressId={setCheckoutAddressId}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                subtotal={subtotal} deliveryCharge={deliveryCharge} total={total}
                onPlaceOrder={placeOrder} processing={processing} showToast={showToast} />
            )}
            {page === "orderSuccess" && <OrderSuccessPage orderId={lastOrderId} nav={nav} />}
            {page === "admin" && (
              <AdminDashboard
                user={user} onAdminLogin={(email) => login({ email, name: "Admin", isAdmin: true })}
                products={products} categories={categories} orders={orders} customers={registeredUsers}
                saveProduct={saveProduct} deleteProduct={deleteProduct} addCategory={addCategory} deleteCategory={deleteCategory}
                updateOrderStatus={updateOrderStatus} nav={nav} logout={logout} showToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {showBottomNav && <BottomNav page={page} nav={nav} cartCount={cartCount} />}
      <Toast toast={toast} />

      {/* quick admin access footer link on profile-adjacent pages */}
      {["home"].includes(page) && !hideChrome && (
        <button
          onClick={() => nav("admin")}
          className="sf-focus hidden md:flex fixed bottom-6 right-6 items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg sf-btn-outline"
        >
          <LayoutDashboard size={14} /> Admin Dashboard
        </button>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 w-full" />)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HOME PAGE                                                          */
/* ------------------------------------------------------------------ */

function ProductGrid({ products, openProduct, addToCart, toggleWishlist, wishlist, cart }) {
  const qtyOf = (id) => cart.find((i) => i.productId === id)?.qty || 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onOpen={openProduct} onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist} isWishlisted={wishlist.includes(p.id)} cartQty={qtyOf(p.id)} />
      ))}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <h2 className="sf-display font-semibold text-[19px]">{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function HomePage({ products, categories, nav, openProduct, openCategory, addToCart, toggleWishlist, wishlist, cart }) {
  const featured = products.filter((p) => p.featured);
  const bestsellers = products.filter((p) => p.bestseller);
  const newArrivals = products.filter((p) => p.newArrival);

  return (
    <div className="p-4 space-y-7">
      {/* Promo banner */}
      <div className="rounded-2xl overflow-hidden relative sf-fade-in" style={{ background: "linear-gradient(120deg,#0F6D5C,#0A4F42)" }}>
        <div className="p-6 relative z-10 max-w-xs">
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#9FE0CD" }}>Season Flow Sale</span>
          <h2 className="sf-display text-white text-2xl font-semibold mt-1 leading-tight">Up to 40% off on everyday essentials</h2>
          <button onClick={() => nav("categories")} className="sf-focus sf-btn-accent mt-4 px-5 py-2.5 rounded-full text-sm font-bold">Shop the sale</button>
        </div>
        <svg className="absolute right-0 bottom-0 opacity-30" width="160" height="160" viewBox="0 0 100 100"><circle cx="80" cy="80" r="70" fill="#fff" opacity="0.08" /><circle cx="70" cy="30" r="35" fill="#fff" opacity="0.08" /></svg>
      </div>
      <svg className="sf-wave -mt-6" viewBox="0 0 400 20" preserveAspectRatio="none"><path d="M0 10 Q 50 0, 100 10 T 200 10 T 300 10 T 400 10 V20 H0 Z" fill="var(--primary-light)" /></svg>

      {/* Categories row */}
      <div>
        <SectionHeader title="Shop by Category" />
        <div className="sf-scroll-x flex gap-3 -mx-4 px-4">
          {categories.map((c) => {
            const Icon = c.icon || Sparkles;
            return (
              <button key={c.id} onClick={() => openCategory(c.id)} className="sf-focus flex flex-col items-center gap-2 shrink-0 w-20">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center sf-chip"><Icon size={24} color="var(--primary-dark)" /></div>
                <span className="text-[11px] font-semibold text-center leading-tight">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeader title="Featured for You" subtitle="Hand-picked picks, refreshed weekly" />
        <ProductGrid products={featured} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />
      </div>

      <div>
        <SectionHeader title="Best Sellers" subtitle="Most loved by ShopFlow shoppers" />
        <ProductGrid products={bestsellers} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />
      </div>

      <div>
        <SectionHeader title="New Arrivals" subtitle="Just landed" />
        <ProductGrid products={newArrivals} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CATEGORIES PAGE                                                    */
/* ------------------------------------------------------------------ */

function CategoriesPage({ categories, products, openCategory }) {
  return (
    <div className="p-4">
      <h1 className="sf-display font-semibold text-xl mb-4">All Categories</h1>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((c) => {
          const Icon = c.icon || Sparkles;
          const count = products.filter((p) => p.category === c.id).length;
          return (
            <button key={c.id} onClick={() => openCategory(c.id)} className="sf-focus sf-card rounded-2xl p-4 flex flex-col items-start gap-3 text-left">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center sf-chip"><Icon size={22} color="var(--primary-dark)" /></div>
              <div>
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{count} products</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PRODUCT LIST PAGE (category filter + sort)                         */
/* ------------------------------------------------------------------ */

function ProductListPage({ products, categories, selectedCategory, setSelectedCategory, openProduct, addToCart, toggleWishlist, wishlist, cart }) {
  const [sort, setSort] = useState("relevance");
  const filtered = useMemo(() => {
    let list = selectedCategory ? products.filter((p) => p.category === selectedCategory) : products;
    if (sort === "priceLow") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, selectedCategory, sort]);
  const catName = categories.find((c) => c.id === selectedCategory)?.name;

  return (
    <div className="p-4">
      <h1 className="sf-display font-semibold text-xl mb-3">{catName || "All Products"}</h1>
      <div className="sf-scroll-x flex gap-2 mb-4 -mx-4 px-4">
        <FilterChip label="All" active={!selectedCategory} onClick={() => setSelectedCategory(null)} />
        {categories.map((c) => <FilterChip key={c.id} label={c.name} active={selectedCategory === c.id} onClick={() => setSelectedCategory(c.id)} />)}
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs" style={{ color: "var(--muted)" }}>{filtered.length} items</span>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="sf-input text-xs py-1.5 w-auto pr-8">
          <option value="relevance">Relevance</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products here yet" subtitle="Check back soon — new items are added regularly." />
      ) : (
        <ProductGrid products={filtered} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className="sf-focus shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border"
      style={active ? { background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" } : { background: "#fff", color: "var(--ink-soft)", borderColor: "var(--border)" }}>
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  PRODUCT DETAILS PAGE                                               */
/* ------------------------------------------------------------------ */

function ProductDetailsPage({ product, cart, wishlist, addToCart, setCartQty, toggleWishlist, onBuyNow, reviews, onAddReview, showToast }) {
  const [qty, setQty] = useState(1);
  if (!product) return <EmptyState icon={AlertCircle} title="Product not found" subtitle="It may have been removed." />;
  const discount = Math.round(100 - (product.price / product.mrp) * 100);
  const inCart = cart.find((i) => i.productId === product.id);
  const wishlisted = wishlist.includes(product.id);

  return (
    <div className="pb-6">
      <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
      <div className="p-4 space-y-4">
        <div>
          <span className="sf-chip text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">{product.category}</span>
          <h1 className="sf-display text-2xl font-semibold mt-2">{product.name}</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <Stars rating={product.rating} size={15} />
            <span className="text-xs" style={{ color: "var(--muted)" }}>({product.ratingCount} ratings)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="sf-price-tag sf-mono text-lg font-bold">{money(product.price)}</span>
          {discount > 0 && <>
            <span className="text-sm line-through" style={{ color: "var(--muted)" }}>{money(product.mrp)}</span>
            <span className="text-sm font-bold" style={{ color: "var(--accent-dark)" }}>{discount}% off</span>
          </>}
        </div>

        <p className={"text-xs font-semibold flex items-center gap-1.5"} style={{ color: product.stock > 0 ? "var(--primary-dark)" : "#C23B2E" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: product.stock > 0 ? "var(--primary)" : "#C23B2E" }} />
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>

        <div>
          <p className="text-sm font-semibold mb-1">Description</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{product.desc}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">Quantity</span>
          <QtyStepper qty={qty} onDec={() => setQty((q) => Math.max(1, q - 1))} onInc={() => setQty((q) => Math.min(product.stock, q + 1))} max={product.stock} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => toggleWishlist(product.id)} className="sf-focus sf-btn-outline w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <Heart size={20} color={wishlisted ? "#FF6B4A" : "var(--ink)"} fill={wishlisted ? "#FF6B4A" : "none"} />
          </button>
          <button disabled={product.stock === 0} onClick={() => addToCart(product.id, qty)} className="sf-focus sf-btn-outline flex-1 rounded-full py-3 text-sm font-bold disabled:opacity-40">
            {inCart ? `In Cart (${inCart.qty})` : "Add to Cart"}
          </button>
          <button disabled={product.stock === 0} onClick={() => onBuyNow(product.id, qty)} className="sf-focus sf-btn-accent flex-1 rounded-full py-3 text-sm font-bold disabled:opacity-40">
            Buy Now
          </button>
        </div>

        <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}><Truck size={15} /> Free delivery above ₹999</div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}><ShieldCheck size={15} /> 7-day returns</div>
        </div>

        <ReviewsSection productId={product.id} reviews={reviews} onAddReview={onAddReview} showToast={showToast} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  REVIEWS SECTION                                                    */
/* ------------------------------------------------------------------ */

function ReviewsSection({ productId, reviews, onAddReview, showToast }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Enter your name.");
    if (!comment.trim()) return setError("Share a few words about the product.");
    onAddReview(productId, { name: name.trim(), rating, comment: comment.trim() });
    setName(""); setComment(""); setRating(5); setError(""); setOpen(false);
    showToast && showToast("Review submitted");
  };

  return (
    <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-3 gap-3">
        <div>
          <p className="text-sm font-bold">Customer Reviews</p>
          {avg ? (
            <div className="flex items-center gap-1.5 mt-1">
              <Stars rating={avg} size={13} />
              <span className="text-xs" style={{ color: "var(--muted)" }}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
          ) : (
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>No reviews yet</p>
          )}
        </div>
        <button onClick={() => setOpen((o) => !o)} className="sf-focus sf-btn-outline px-3.5 py-2 rounded-full text-xs font-semibold shrink-0">
          {open ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="sf-card rounded-2xl p-4 space-y-2.5 mb-4 sf-fade-in">
          <input className="sf-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>Your rating</p>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)} className="sf-focus" aria-label={`Rate ${n} stars`}>
                  <Star size={24} fill={n <= rating ? "#E8A33D" : "none"} color="#E8A33D" strokeWidth={1.6} />
                </button>
              ))}
            </div>
          </div>
          <textarea className="sf-input" rows={3} placeholder="Share your experience with this product..." value={comment} onChange={(e) => setComment(e.target.value)} />
          {error && <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "#C23B2E" }}><AlertCircle size={13} /> {error}</p>}
          <button className="sf-focus sf-btn-primary w-full rounded-full py-2.5 text-sm font-bold">Submit Review</button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: "var(--muted)" }}>Be the first to review this product.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3 sf-fade-in">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 sf-chip">{r.name[0]?.toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <Stars rating={r.rating} size={11} />
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--ink-soft)" }}>{r.comment}</p>
                <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
                  {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SEARCH RESULTS PAGE                                                */
/* ------------------------------------------------------------------ */

function SearchResultsPage({ term, products, openProduct, addToCart, toggleWishlist, wishlist, cart }) {
  const results = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return [];
    return products.filter((p) => p.name.toLowerCase().includes(t) || p.desc.toLowerCase().includes(t) || p.category.toLowerCase().includes(t));
  }, [term, products]);

  return (
    <div className="p-4">
      <h1 className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        {results.length} results for <span className="font-semibold" style={{ color: "var(--ink)" }}>"{term}"</span>
      </h1>
      {results.length === 0 ? (
        <EmptyState icon={Search} title="No matches found" subtitle="Try a different keyword or browse categories instead." />
      ) : (
        <ProductGrid products={results} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CART PAGE                                                          */
/* ------------------------------------------------------------------ */

function CartPage({ lines, setCartQty, removeFromCart, subtotal, deliveryCharge, total, nav, onCheckout }) {
  if (lines.length === 0) {
    return <div className="p-4"><EmptyState icon={ShoppingCart} title="Your cart is empty" subtitle="Browse products and add your favourites here." actionLabel="Start Shopping" onAction={() => nav("home")} /></div>;
  }
  return (
    <div className="p-4 pb-40 md:pb-6">
      <h1 className="sf-display font-semibold text-xl mb-4">My Cart ({lines.length})</h1>
      <div className="space-y-3">
        {lines.map((l) => (
          <div key={l.productId} className="sf-card rounded-2xl p-3 flex gap-3">
            <img src={l.product.image} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col">
              <p className="text-sm font-semibold sf-line-clamp-2">{l.product.name}</p>
              <span className="sf-mono text-sm font-bold mt-1">{money(l.product.price)}</span>
              <div className="flex items-center justify-between mt-auto pt-1">
                <QtyStepper qty={l.qty} onDec={() => setCartQty(l.productId, l.qty - 1)} onInc={() => setCartQty(l.productId, l.qty + 1)} max={l.product.stock} />
                <button onClick={() => removeFromCart(l.productId)} className="sf-focus text-xs font-semibold flex items-center gap-1" style={{ color: "#C23B2E" }}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sf-card rounded-2xl p-4 mt-5 space-y-2">
        <Row label="Subtotal" value={money(subtotal)} />
        <Row label="Delivery" value={deliveryCharge === 0 ? "FREE" : money(deliveryCharge)} highlight={deliveryCharge === 0} />
        <div className="border-t pt-2 mt-1" style={{ borderColor: "var(--border)" }}>
          <Row label="Total" value={money(total)} bold />
        </div>
      </div>

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white border-t p-4 md:static md:border-0 md:p-0 md:mt-5" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="hidden md:block flex-1" />
          <button onClick={onCheckout} className="sf-focus sf-btn-primary w-full md:w-auto md:px-10 rounded-full py-3.5 text-sm font-bold">
            Proceed to Checkout · {money(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className={"text-sm " + (bold ? "font-bold" : "")} style={{ color: bold ? "var(--ink)" : "var(--ink-soft)" }}>{label}</span>
      <span className={"sf-mono " + (bold ? "text-base font-bold" : "text-sm font-semibold")} style={{ color: highlight ? "var(--primary)" : "var(--ink)" }}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WISHLIST PAGE                                                      */
/* ------------------------------------------------------------------ */

function WishlistPage({ items, openProduct, addToCart, toggleWishlist, cart, nav }) {
  if (items.length === 0) {
    return <div className="p-4"><EmptyState icon={Heart} title="Your wishlist is empty" subtitle="Tap the heart on any product to save it here." actionLabel="Discover Products" onAction={() => nav("home")} /></div>;
  }
  return (
    <div className="p-4">
      <h1 className="sf-display font-semibold text-xl mb-4">Wishlist ({items.length})</h1>
      <ProductGrid products={items} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={items.map((i) => i.id)} cart={cart} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AUTH PAGE                                                          */
/* ------------------------------------------------------------------ */

function AuthPage({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 4) return setError("Password must be at least 4 characters.");
    if (mode === "signup") {
      if (!name.trim()) return setError("Enter your name.");
      onSignup({ name, email });
    } else {
      onLogin({ email, name: email.split("@")[0] });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm sf-fade-in">
        <div className="text-center mb-7">
          <div className="inline-flex mb-3">
            <svg width="34" height="34" viewBox="0 0 26 26" fill="none"><path d="M4 15c3-6 6 6 9 0s6-6 9 0" stroke="#FF6B4A" strokeWidth="2.6" strokeLinecap="round" fill="none" /><circle cx="13" cy="13" r="11.3" stroke="#0F6D5C" strokeWidth="1.6" fill="none" /></svg>
          </div>
          <h1 className="sf-display text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{mode === "login" ? "Log in to continue shopping" : "Join ShopFlow in a few seconds"}</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && <input className="sf-input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />}
          <input className="sf-input" placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="relative">
            <input className="sf-input pr-10" placeholder="Password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="sf-focus absolute right-3 top-1/2 -translate-y-1/2">{showPw ? <EyeOff size={16} color="var(--muted)" /> : <Eye size={16} color="var(--muted)" />}</button>
          </div>
          {error && <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "#C23B2E" }}><AlertCircle size={13} /> {error}</p>}
          <button type="submit" className="sf-focus sf-btn-primary w-full rounded-full py-3 text-sm font-bold mt-2">
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: "var(--muted)" }}>
          {mode === "login" ? "New to ShopFlow?" : "Already have an account?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="sf-focus font-semibold sf-link">
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
        <p className="text-center text-[11px] mt-3" style={{ color: "var(--muted)" }}>Demo mode: any email &amp; password (4+ chars) works.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PROFILE PAGE                                                       */
/* ------------------------------------------------------------------ */

function ProfilePage({ user, nav, logout, ordersCount, wishlistCount, addressesCount }) {
  if (!user) {
    return <div className="p-4"><EmptyState icon={User} title="You're not logged in" subtitle="Log in to view your profile, orders and saved addresses." actionLabel="Log In / Sign Up" onAction={() => nav("auth")} /></div>;
  }
  const menu = [
    { label: "My Orders", icon: Package, count: ordersCount, page: "orders" },
    { label: "Wishlist", icon: Heart, count: wishlistCount, page: "wishlist" },
    { label: "Saved Addresses", icon: MapPin, count: addressesCount, page: "addresses" },
  ];
  return (
    <div className="p-4">
      <div className="sf-card rounded-2xl p-5 flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold sf-chip">{user.name[0]?.toUpperCase()}</div>
        <div>
          <p className="font-semibold text-[15px]">{user.name}</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{user.email}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {menu.map((m) => (
          <button key={m.label} onClick={() => nav(m.page)} className="sf-focus sf-card w-full rounded-xl p-4 flex items-center justify-between">
            <span className="flex items-center gap-3 text-sm font-medium"><m.icon size={17} color="var(--primary)" /> {m.label}</span>
            <span className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>{m.count} <ChevronRight size={15} /></span>
          </button>
        ))}
        {user.isAdmin && (
          <button onClick={() => nav("admin")} className="sf-focus sf-card w-full rounded-xl p-4 flex items-center justify-between">
            <span className="flex items-center gap-3 text-sm font-medium"><LayoutDashboard size={17} color="var(--primary)" /> Admin Dashboard</span>
            <ChevronRight size={15} color="var(--muted)" />
          </button>
        )}
      </div>

      <button onClick={logout} className="sf-focus w-full mt-6 rounded-full py-3 text-sm font-bold flex items-center justify-center gap-2" style={{ color: "#C23B2E", background: "#FDE8E6" }}>
        <LogOut size={16} /> Logout
      </button>

      {!user.isAdmin && (
        <button onClick={() => nav("admin")} className="sf-focus w-full mt-3 text-center text-xs" style={{ color: "var(--muted)" }}>
          Store owner? <span className="sf-link font-semibold">Go to Admin Dashboard</span>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ORDERS PAGE                                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Pending;
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.fg }}>
      <Icon size={12} /> {status}
    </span>
  );
}

function OrdersPage({ user, orders, nav, requireAuth }) {
  useEffect(() => { requireAuth("orders"); }, []); // eslint-disable-line
  const [expanded, setExpanded] = useState(new Set());
  const toggle = (id) => setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (!user) return <div className="p-4"><EmptyState icon={Package} title="Log in to view your orders" actionLabel="Log In" onAction={() => nav("auth")} /></div>;
  if (orders.length === 0) {
    return <div className="p-4"><EmptyState icon={Package} title="No orders yet" subtitle="Your placed orders will show up here." actionLabel="Start Shopping" onAction={() => nav("home")} /></div>;
  }
  return (
    <div className="p-4">
      <h1 className="sf-display font-semibold text-xl mb-4">My Orders</h1>
      <div className="space-y-3">
        {orders.map((o) => {
          const isOpen = expanded.has(o.id);
          return (
            <div key={o.id} className="sf-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="sf-mono text-xs font-bold" style={{ color: "var(--muted)" }}>#{o.id}</span>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex -space-x-3 mb-2">
                {o.items.slice(0, 4).map((it, i) => <img key={i} src={it.image} className="w-11 h-11 rounded-lg border-2 border-white object-cover" />)}
                {o.items.length > 4 && <div className="w-11 h-11 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold">+{o.items.length - 4}</div>}
              </div>
              <p className="text-xs sf-line-clamp-2" style={{ color: "var(--ink-soft)" }}>{o.items.map((i) => i.name).join(", ")}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <span className="text-[11px]" style={{ color: "var(--muted)" }}>{new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="sf-mono text-sm font-bold">{money(o.total)}</span>
              </div>
              <button onClick={() => toggle(o.id)} className="sf-focus w-full mt-3 pt-3 border-t flex items-center justify-center gap-1.5 text-xs font-bold" style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                <MapPin size={13} /> {isOpen ? "Hide Tracking" : "Track Order"}
                <ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
              {isOpen && (
                <div className="mt-1 sf-fade-in">
                  <OrderTimeline status={o.status} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ORDER TRACKING TIMELINE                                            */
/* ------------------------------------------------------------------ */

const TIMELINE_STEPS = [
  { status: "Pending", label: "Order Placed", desc: "We've received your order" },
  { status: "Confirmed", label: "Confirmed", desc: "Seller has confirmed your order" },
  { status: "Shipped", label: "Shipped", desc: "Your order has left the warehouse" },
  { status: "Delivered", label: "Delivered", desc: "Order delivered successfully" },
];

function OrderTimeline({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 py-3 px-1">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FDE8E6" }}>
          <Ban size={16} color="#C23B2E" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#C23B2E" }}>Order Cancelled</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>This order will not be delivered.</p>
        </div>
      </div>
    );
  }
  const currentIndex = STATUS_FLOW.indexOf(status);
  return (
    <div className="py-2 px-1">
      {TIMELINE_STEPS.map((s, i) => {
        const done = i <= currentIndex;
        const isLast = i === TIMELINE_STEPS.length - 1;
        const Icon = STATUS_STYLE[s.status].icon;
        return (
          <div key={s.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: done ? "var(--primary)" : "var(--paper)", border: done ? "none" : "1.5px solid var(--border)" }}>
                <Icon size={14} color={done ? "#fff" : "var(--muted)"} />
              </div>
              {!isLast && <div className="w-0.5 flex-1 my-0.5" style={{ background: i < currentIndex ? "var(--primary)" : "var(--border)", minHeight: 22 }} />}
            </div>
            <div className={isLast ? "pb-0.5" : "pb-5"}>
              <p className="text-sm font-semibold" style={{ color: done ? "var(--ink)" : "var(--muted)" }}>{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{s.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ADDRESSES PAGE                                                     */
/* ------------------------------------------------------------------ */

function emptyAddr() { return { fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" }; }

function AddressForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyAddr());
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.fullName && form.phone.length >= 10 && form.line1 && form.city && form.state && form.pincode.length >= 6;
  return (
    <div className="sf-card rounded-2xl p-4 space-y-2.5 sf-fade-in">
      <input className="sf-input" placeholder="Full name" value={form.fullName} onChange={set("fullName")} />
      <input className="sf-input" placeholder="Phone number" value={form.phone} onChange={set("phone")} />
      <input className="sf-input" placeholder="Address line (house no., street, area)" value={form.line1} onChange={set("line1")} />
      <div className="grid grid-cols-2 gap-2.5">
        <input className="sf-input" placeholder="City" value={form.city} onChange={set("city")} />
        <input className="sf-input" placeholder="State" value={form.state} onChange={set("state")} />
      </div>
      <input className="sf-input" placeholder="Pincode" value={form.pincode} onChange={set("pincode")} />
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="sf-focus sf-btn-outline flex-1 rounded-full py-2.5 text-sm font-semibold">Cancel</button>
        <button disabled={!valid} onClick={() => onSave(form)} className="sf-focus sf-btn-primary flex-1 rounded-full py-2.5 text-sm font-semibold disabled:opacity-40">Save Address</button>
      </div>
    </div>
  );
}

function AddressesPage({ addresses, setAddresses, user, nav, requireAuth, showToast, embedded, onSelect, selectedId }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  useEffect(() => { if (!embedded) requireAuth("addresses"); }, []); // eslint-disable-line

  if (!embedded && !user) return <div className="p-4"><EmptyState icon={MapPin} title="Log in to manage addresses" actionLabel="Log In" onAction={() => nav("auth")} /></div>;

  const save = (addr) => {
    if (editingId) {
      setAddresses((a) => a.map((x) => (x.id === editingId ? { ...x, ...addr } : x)));
      setEditingId(null);
    } else {
      const newAddr = { ...addr, id: uid("A"), isDefault: addresses.length === 0 };
      setAddresses((a) => [...a, newAddr]);
      if (onSelect) onSelect(newAddr.id);
    }
    setAdding(false);
    showToast && showToast("Address saved");
  };
  const remove = (id) => setAddresses((a) => a.filter((x) => x.id !== id));
  const makeDefault = (id) => setAddresses((a) => a.map((x) => ({ ...x, isDefault: x.id === id })));

  return (
    <div className={embedded ? "" : "p-4"}>
      {!embedded && <h1 className="sf-display font-semibold text-xl mb-4">Saved Addresses</h1>}
      <div className="space-y-3">
        {addresses.map((a) => (
          editingId === a.id ? (
            <AddressForm key={a.id} initial={a} onSave={save} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={a.id} onClick={() => onSelect && onSelect(a.id)}
              className={"sf-card rounded-2xl p-4 " + (onSelect ? "cursor-pointer" : "")}
              style={selectedId === a.id ? { borderColor: "var(--primary)", boxShadow: "0 0 0 1.5px var(--primary)" } : {}}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} color="var(--primary)" className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">{a.fullName} {a.isDefault && <span className="sf-chip text-[10px] font-bold px-1.5 py-0.5 rounded-full">DEFAULT</span>}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>{a.line1}, {a.city}, {a.state} - {a.pincode}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{a.phone}</p>
                  </div>
                </div>
                {selectedId === a.id && <CheckCircle2 size={18} color="var(--primary)" />}
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <button onClick={(e) => { e.stopPropagation(); setEditingId(a.id); }} className="sf-focus text-xs font-semibold flex items-center gap-1 sf-link"><Pencil size={12} /> Edit</button>
                <button onClick={(e) => { e.stopPropagation(); remove(a.id); }} className="sf-focus text-xs font-semibold flex items-center gap-1" style={{ color: "#C23B2E" }}><Trash2 size={12} /> Delete</button>
                {!a.isDefault && <button onClick={(e) => { e.stopPropagation(); makeDefault(a.id); }} className="sf-focus text-xs font-semibold" style={{ color: "var(--muted)" }}>Make default</button>}
              </div>
            </div>
          )
        ))}
      </div>

      {adding ? (
        <div className="mt-3"><AddressForm onSave={save} onCancel={() => setAdding(false)} /></div>
      ) : (
        <button onClick={() => setAdding(true)} className="sf-focus sf-btn-outline w-full rounded-2xl py-3 mt-3 text-sm font-semibold flex items-center justify-center gap-2">
          <PlusCircle size={16} /> Add New Address
        </button>
      )}

      {addresses.length === 0 && !adding && (
        <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>You have no saved addresses yet.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHECKOUT PAGE                                                      */
/* ------------------------------------------------------------------ */

function CheckoutPage({ lines, addresses, setAddresses, checkoutAddressId, setCheckoutAddressId, paymentMethod, setPaymentMethod, subtotal, deliveryCharge, total, onPlaceOrder, processing, showToast }) {
  useEffect(() => {
    if (!checkoutAddressId && addresses.length > 0) {
      setCheckoutAddressId((addresses.find((a) => a.isDefault) || addresses[0]).id);
    }
  }, [addresses]); // eslint-disable-line

  if (lines.length === 0) {
    return <div className="p-4"><EmptyState icon={ShoppingBag} title="Nothing to checkout" subtitle="Add items to your cart first." /></div>;
  }

  return (
    <div className="p-4 pb-40 space-y-5">
      <h1 className="sf-display font-semibold text-xl">Checkout</h1>

      <section>
        <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5"><MapPin size={15} color="var(--primary)" /> Delivery Address</h2>
        <AddressesPage embedded addresses={addresses} setAddresses={setAddresses} onSelect={setCheckoutAddressId} selectedId={checkoutAddressId} showToast={showToast} />
      </section>

      <section>
        <h2 className="text-sm font-bold mb-2">Order Summary</h2>
        <div className="sf-card rounded-2xl p-4 space-y-3">
          {lines.map((l) => (
            <div key={l.productId} className="flex items-center gap-3">
              <img src={l.product.image} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold sf-line-clamp-2">{l.product.name}</p>
                <p className="text-[11px]" style={{ color: "var(--muted)" }}>Qty {l.qty}</p>
              </div>
              <span className="sf-mono text-xs font-bold">{money(l.product.price * l.qty)}</span>
            </div>
          ))}
          <div className="border-t pt-2 space-y-1.5" style={{ borderColor: "var(--border)" }}>
            <Row label="Subtotal" value={money(subtotal)} />
            <Row label="Delivery" value={deliveryCharge === 0 ? "FREE" : money(deliveryCharge)} highlight={deliveryCharge === 0} />
            <Row label="Total" value={money(total)} bold />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5"><CreditCard size={15} color="var(--primary)" /> Payment Method</h2>
        <div className="space-y-2">
          <PaymentOption icon={Banknote} label="Cash on Delivery" desc="Pay when your order arrives" value="cod" selected={paymentMethod} onSelect={setPaymentMethod} />
          <PaymentOption icon={Wallet} label="Demo Online Payment" desc="Simulated card / UPI payment — no real charge" value="online" selected={paymentMethod} onSelect={setPaymentMethod} />
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t p-4" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto">
          <button onClick={onPlaceOrder} disabled={!checkoutAddressId || processing} className="sf-focus sf-btn-accent w-full rounded-full py-3.5 text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2">
            {processing ? <>Processing<Spinner /></> : `Place Order · ${money(total)}`}
          </button>
          {!checkoutAddressId && <p className="text-[11px] text-center mt-2" style={{ color: "#C23B2E" }}>Select or add a delivery address to continue.</p>}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin ml-1" />;
}

function PaymentOption({ icon: Icon, label, desc, value, selected, onSelect }) {
  const active = selected === value;
  return (
    <button onClick={() => onSelect(value)} className="sf-focus sf-card w-full rounded-2xl p-4 flex items-center gap-3 text-left"
      style={active ? { borderColor: "var(--primary)", boxShadow: "0 0 0 1.5px var(--primary)" } : {}}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center sf-chip shrink-0"><Icon size={18} color="var(--primary-dark)" /></div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>{desc}</p>
      </div>
      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: active ? "var(--primary)" : "var(--border)" }}>
        {active && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />}
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  ORDER SUCCESS PAGE                                                 */
/* ------------------------------------------------------------------ */

function OrderSuccessPage({ orderId, nav }) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 sf-fade-in" style={{ background: "var(--primary-light)" }}>
        <CheckCircle2 size={40} color="var(--primary)" />
      </div>
      <h1 className="sf-display text-2xl font-semibold">Order Placed!</h1>
      <p className="text-sm mt-2" style={{ color: "var(--ink-soft)" }}>Thank you — your order has been confirmed.</p>
      <p className="sf-mono text-xs font-bold mt-3 px-3 py-1.5 rounded-full" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>Order ID: {orderId}</p>
      <div className="flex flex-col gap-2.5 w-full max-w-xs mt-8">
        <button onClick={() => nav("orders")} className="sf-focus sf-btn-primary rounded-full py-3 text-sm font-bold">Track My Order</button>
        <button onClick={() => nav("home")} className="sf-focus sf-btn-outline rounded-full py-3 text-sm font-bold">Continue Shopping</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ADMIN DASHBOARD                                                    */
/* ------------------------------------------------------------------ */

function AdminLogin({ onAdminLogin, nav }) {
  const [email, setEmail] = useState("admin@shopflow.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (email !== "admin@shopflow.com" || password !== "admin123") { setError("Invalid admin credentials."); return; }
    onAdminLogin(email);
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--ink)" }}>
      <div className="w-full max-w-sm sf-fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--primary)" }}><LayoutDashboard size={22} color="#fff" /></div>
          <h1 className="sf-display text-xl font-semibold text-white">Admin Dashboard</h1>
          <p className="text-xs mt-1" style={{ color: "#9AAAA6" }}>Store management access</p>
        </div>
        <form onSubmit={submit} className="space-y-2.5">
          <input className="sf-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" />
          <input className="sf-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          {error && <p className="text-xs font-medium" style={{ color: "#FF8A75" }}>{error}</p>}
          <button className="sf-focus sf-btn-primary w-full rounded-full py-3 text-sm font-bold">Log In</button>
        </form>
        <p className="text-center text-[11px] mt-4" style={{ color: "#7C8B87" }}>Demo credentials: admin@shopflow.com / admin123</p>
        <button onClick={() => nav("home")} className="sf-focus block mx-auto mt-4 text-xs font-semibold" style={{ color: "#9AAAA6" }}>← Back to store</button>
      </div>
    </div>
  );
}

function AdminDashboard({ user, onAdminLogin, products, categories, orders, customers, saveProduct, deleteProduct, addCategory, deleteCategory, updateOrderStatus, nav, logout, showToast }) {
  const [tab, setTab] = useState("overview");
  if (!user || !user.isAdmin) return <AdminLogin onAdminLogin={onAdminLogin} nav={nav} />;

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "products", label: "Products", icon: Package },
    { key: "categories", label: "Categories", icon: Grid3x3 },
    { key: "orders", label: "Orders", icon: ShoppingCart },
    { key: "customers", label: "Customers", icon: Users },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <div className="bg-white border-b sticky top-0 z-30" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}><LayoutDashboard size={16} color="#fff" /></div>
            <span className="sf-display font-semibold text-[17px]">ShopFlow Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => nav("home")} className="sf-focus sf-btn-outline px-3 py-1.5 rounded-full text-xs font-semibold">View Store</button>
            <button onClick={logout} className="sf-focus px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1" style={{ color: "#C23B2E", background: "#FDE8E6" }}><LogOut size={13} /> Logout</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sf-scroll-x flex gap-1 pb-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className="sf-focus shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2"
              style={{ borderColor: tab === t.key ? "var(--primary)" : "transparent", color: tab === t.key ? "var(--primary-dark)" : "var(--muted)" }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {tab === "overview" && <AdminOverview products={products} orders={orders} customers={customers} categories={categories} />}
        {tab === "products" && <AdminProducts products={products} categories={categories} saveProduct={saveProduct} deleteProduct={deleteProduct} showToast={showToast} />}
        {tab === "categories" && <AdminCategories categories={categories} products={products} addCategory={addCategory} deleteCategory={deleteCategory} showToast={showToast} />}
        {tab === "orders" && <AdminOrders orders={orders} updateOrderStatus={updateOrderStatus} />}
        {tab === "customers" && <AdminCustomers customers={customers} orders={orders} />}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="sf-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{label}</span>
        <Icon size={15} color="var(--primary)" />
      </div>
      <p className="sf-mono text-xl font-bold">{value}</p>
    </div>
  );
}

function AdminOverview({ products, orders, customers, categories }) {
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const chartData = categories.map((c) => ({
    name: c.name.split(" ")[0],
    orders: orders.reduce((s, o) => s + o.items.filter((it) => products.find((p) => p.id === it.productId)?.category === c.id).reduce((a, it) => a + it.qty, 0), 0),
  }));
  const lowStock = products.filter((p) => p.stock <= 5);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Revenue" value={money(revenue)} icon={Banknote} />
        <StatCard label="Total Orders" value={orders.length} icon={ShoppingCart} />
        <StatCard label="Customers" value={customers.length} icon={Users} />
        <StatCard label="Products Listed" value={products.length} icon={Package} />
      </div>

      <div className="sf-card rounded-2xl p-4">
        <p className="text-sm font-bold mb-3">Units Sold by Category</p>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="orders" fill="#0F6D5C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="sf-card rounded-2xl p-4">
          <p className="text-sm font-bold mb-3 flex items-center gap-1.5"><AlertCircle size={15} color="#B4600D" /> Low Stock Alerts</p>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="font-medium sf-line-clamp-2">{p.name}</span>
                <span className="font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF3E6", color: "#B4600D" }}>{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function emptyProduct(categories) {
  return { name: "", category: categories[0]?.id || "", price: "", mrp: "", stock: "", desc: "", rating: 4.0, ratingCount: 0, seed: "" };
}

function AdminProducts({ products, categories, saveProduct, deleteProduct, showToast }) {
  const [editing, setEditing] = useState(null); // product or null
  const [creating, setCreating] = useState(false);
  const form = editing || (creating ? emptyProduct(categories) : null);
  const [draft, setDraft] = useState(form);

  useEffect(() => { setDraft(form); }, [editing, creating]); // eslint-disable-line

  const startEdit = (p) => { setCreating(false); setEditing(p); };
  const startCreate = () => { setEditing(null); setCreating(true); };
  const close = () => { setEditing(null); setCreating(false); };

  const submit = () => {
    if (!draft.name || !draft.price || !draft.stock) return;
    saveProduct({
      ...draft,
      price: Number(draft.price), mrp: Number(draft.mrp) || Number(draft.price),
      stock: Number(draft.stock), rating: Number(draft.rating) || 4.0,
      seed: draft.seed || draft.name.toLowerCase().replace(/\s+/g, "-"),
    });
    showToast(editing ? "Product updated" : "Product added");
    close();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold">{products.length} products</p>
        <button onClick={startCreate} className="sf-focus sf-btn-primary px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5"><PlusCircle size={14} /> Add Product</button>
      </div>

      {draft && (
        <div className="sf-card rounded-2xl p-4 mb-4 space-y-2.5 sf-fade-in">
          <p className="text-sm font-bold mb-1">{editing ? "Edit Product" : "New Product"}</p>
          <input className="sf-input" placeholder="Product name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2.5">
            <select className="sf-input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="sf-input" placeholder="Stock" type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input className="sf-input" placeholder="Price (₹)" type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
            <input className="sf-input" placeholder="MRP (₹)" type="number" value={draft.mrp} onChange={(e) => setDraft({ ...draft, mrp: e.target.value })} />
          </div>
          <textarea className="sf-input" placeholder="Description" rows={2} value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} />
          <div className="flex gap-2 pt-1">
            <button onClick={close} className="sf-focus sf-btn-outline flex-1 rounded-full py-2.5 text-sm font-semibold">Cancel</button>
            <button onClick={submit} className="sf-focus sf-btn-primary flex-1 rounded-full py-2.5 text-sm font-semibold">Save</button>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {products.map((p) => (
          <div key={p.id} className="sf-card rounded-xl p-3 flex items-center gap-3">
            <img src={p.image} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold sf-line-clamp-2">{p.name}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{money(p.price)} · Stock {p.stock} · {categories.find((c) => c.id === p.category)?.name}</p>
            </div>
            <button onClick={() => startEdit(p)} className="sf-focus w-8 h-8 rounded-full flex items-center justify-center active:bg-gray-100"><Pencil size={15} /></button>
            <button onClick={() => deleteProduct(p.id)} className="sf-focus w-8 h-8 rounded-full flex items-center justify-center active:bg-gray-100"><Trash2 size={15} color="#C23B2E" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCategories({ categories, products, addCategory, deleteCategory, showToast }) {
  const [name, setName] = useState("");
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input className="sf-input" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => { if (!name.trim()) return; addCategory(name.trim()); setName(""); showToast("Category added"); }} className="sf-focus sf-btn-primary px-4 rounded-full text-xs font-bold shrink-0">Add</button>
      </div>
      <div className="space-y-2.5">
        {categories.map((c) => (
          <div key={c.id} className="sf-card rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{products.filter((p) => p.category === c.id).length} products</p>
            </div>
            <button onClick={() => deleteCategory(c.id)} className="sf-focus w-8 h-8 rounded-full flex items-center justify-center active:bg-gray-100"><Trash2 size={15} color="#C23B2E" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminOrders({ orders, updateOrderStatus }) {
  if (orders.length === 0) return <EmptyState icon={ShoppingCart} title="No orders yet" subtitle="Orders placed by customers will appear here." />;
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="sf-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="sf-mono text-xs font-bold">#{o.id}</span>
            <StatusBadge status={o.status} />
          </div>
          <p className="text-xs sf-line-clamp-2 mb-1" style={{ color: "var(--ink-soft)" }}>{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{o.address.fullName} · {o.address.city}, {o.address.state} · {o.payment === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="sf-mono text-sm font-bold">{money(o.total)}</span>
            <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="sf-input py-1.5 text-xs w-auto">
              {[...STATUS_FLOW, "Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminCustomers({ customers, orders }) {
  return (
    <div className="space-y-2.5">
      {customers.map((c) => (
        <div key={c.id} className="sf-card rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm sf-chip shrink-0">{c.name[0]?.toUpperCase()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{c.name}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{c.email}</p>
          </div>
          <span className="text-[11px]" style={{ color: "var(--muted)" }}>Joined {c.joined}</span>
        </div>
      ))}
    </div>
  );
}
