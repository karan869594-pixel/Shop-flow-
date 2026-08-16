import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Home as HomeIcon, Grid3x3, ShoppingCart, Package, User, Search, Heart,
  Star, Minus, Plus, Trash2, ChevronLeft, ChevronRight, MapPin, CreditCard,
  Check, CheckCircle2, X, LogOut, Pencil, LayoutDashboard, Users, BarChart3,
  ArrowLeft, ShoppingBag, Truck, ShieldCheck, Smartphone, Shirt, Sofa,
  Sparkles, Dumbbell, BookOpen, PlusCircle, ChevronDown, Banknote, Wallet,
  AlertCircle, PackageCheck, Clock, Ban, Eye, EyeOff, Bell, Tag, Printer,
  RotateCcw, Settings as SettingsIcon, XCircle, Loader2, Bookmark
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line
} from "recharts";

/* ==================================================================== */
/*  SUPABASE (lightweight fetch client — no npm import needed)          */
/* ==================================================================== */

const SUPABASE_URL = "https://pvabwvqbmzntwbtdzzty.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2YWJ3dnFibXpudHdidGR6enR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mjg2MzEsImV4cCI6MjEwMjEwNDYzMX0.QhDPB9H9-FU1LuIYKUwZnzqg06JqQL7nEMSAmJNjm2c";

async function authRequest(path, body, extraHeaders = {}) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, ...extraHeaders },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_description || data.msg || data.message || "Something went wrong. Please try again.");
  return data;
}

async function rest(table, { method = "GET", query = "", body, token, prefer, single } = {}) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  if (single) headers.Accept = "application/vnd.pgrst.object+json";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method, headers, body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.hint || `We couldn't complete that action. Please try again.`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ==================================================================== */
/*  CONSTANTS / MAPPERS                                                 */
/* ==================================================================== */

const CATEGORY_ICONS = {
  electronics: Smartphone, fashion: Shirt, home: Sofa, beauty: Sparkles, sports: Dumbbell, books: BookOpen,
};
const FALLBACK_IMG = "https://picsum.photos/seed/sf-placeholder/640/640";

const STATUS_FLOW = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];
const STATUS_LABEL = {
  pending: "Pending", confirmed: "Confirmed", processing: "Processing", packed: "Packed",
  shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered",
  cancelled: "Cancelled", returned: "Returned", refunded: "Refunded",
};
const STATUS_STYLE = {
  pending: { bg: "#FFF3E6", fg: "#B4600D", icon: Clock },
  confirmed: { bg: "#E7F1FF", fg: "#1855A8", icon: Check },
  processing: { bg: "#EEF0FF", fg: "#4B4FCB", icon: Loader2 },
  packed: { bg: "#F1EAFF", fg: "#7A3DBF", icon: Package },
  shipped: { bg: "#EEE7FF", fg: "#5C3DBF", icon: Truck },
  out_for_delivery: { bg: "#FFF0E0", fg: "#C2680E", icon: Truck },
  delivered: { bg: "#E4F2EE", fg: "#0F6D5C", icon: PackageCheck },
  cancelled: { bg: "#FDE8E6", fg: "#C23B2E", icon: Ban },
  returned: { bg: "#FDF0E6", fg: "#B4600D", icon: RotateCcw },
  refunded: { bg: "#E7F1FF", fg: "#1855A8", icon: Banknote },
};

const money = (n, currency = "INR") => (currency === "INR" ? "₹" : currency + " ") + Math.round(n || 0).toLocaleString("en-IN");
const uid = (p) => p + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

function mapProduct(r) {
  return {
    id: r.id, name: r.name, category: r.category?.slug || null, price: +r.price, mrp: +r.mrp,
    rating: +r.rating || 0, ratingCount: r.rating_count || 0,
    stock: (r.inventory && r.inventory[0]?.stock) ?? 0,
    image: r.images?.[0]?.url || FALLBACK_IMG, desc: r.description || "",
    featured: r.is_featured, bestseller: r.is_bestseller, newArrival: r.is_new_arrival,
    sku: r.sku, taxPercent: +r.tax_percent || 0,
  };
}
function mapCartItem(r) { return { id: r.id, productId: r.product_id, qty: r.quantity, product: mapProduct(r.product) }; }
function mapAddress(r) { return { id: r.id, fullName: r.full_name, phone: r.phone, line1: r.line1, city: r.city, state: r.state, pincode: r.pincode, isDefault: r.is_default }; }
function mapOrder(r) {
  return {
    id: r.id, orderNumber: r.order_number, status: r.status, paymentStatus: r.payment_status, paymentMethod: r.payment_method,
    subtotal: +r.subtotal, discount: +r.discount, tax: +r.tax, deliveryCharge: +r.shipping_charge, total: +r.total,
    address: r.address, date: r.placed_at,
    items: (r.items || []).map((it) => ({ id: it.id, productId: it.product_id, name: it.product_name, image: it.product_image, price: +it.price, qty: it.quantity })),
  };
}
function mapSettings(s) {
  return {
    storeName: s.store_name, primaryColor: s.primary_color, accentColor: s.accent_color, currency: s.currency,
    contactEmail: s.contact_email, contactPhone: s.contact_phone, address: s.address,
    taxPercent: +s.tax_percent, freeDeliveryThreshold: +s.free_delivery_threshold, deliveryCharge: +s.delivery_charge,
  };
}

/* ==================================================================== */
/*  GLOBAL STYLE                                                        */
/* ==================================================================== */

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
    .sf-root{ font-family:'Inter',system-ui,sans-serif; color:var(--ink); background:var(--paper); -webkit-tap-highlight-color:transparent; }
    .sf-display{ font-family:'Fraunces',serif; }
    .sf-mono{ font-family:'JetBrains Mono',monospace; }

    .sf-btn-primary{ background:var(--primary); color:#fff; transition:background .15s, transform .1s; }
    .sf-btn-primary:hover{ background:var(--primary-dark); }
    .sf-btn-primary:active{ transform:scale(0.97); }
    .sf-btn-primary:disabled{ background:#B9C4C1; }

    .sf-btn-accent{ background:var(--accent); color:#fff; transition:background .15s, transform .1s; }
    .sf-btn-accent:hover{ background:var(--accent-dark); }
    .sf-btn-accent:active{ transform:scale(0.97); }
    .sf-btn-accent:disabled{ background:#F3C1B0; }

    .sf-btn-outline{ border:1.5px solid var(--border); background:#fff; color:var(--ink); transition:border-color .15s, background .15s; }
    .sf-btn-outline:hover{ border-color:var(--primary); background:var(--primary-light); }

    .sf-chip{ background:var(--primary-light); color:var(--primary-dark); }
    .sf-card{ background:var(--surface); border:1px solid var(--border); }
    .sf-link{ color:var(--primary); }

    .sf-price-tag{ position:relative; display:inline-flex; align-items:center; gap:4px; background:var(--ink); color:#fff; padding:3px 10px 3px 14px; border-radius:4px 10px 10px 4px; }
    .sf-price-tag::before{ content:''; position:absolute; left:5px; top:50%; transform:translateY(-50%); width:4px; height:4px; border-radius:50%; background:var(--paper); }

    .sf-wave{ display:block; width:100%; height:28px; }
    .sf-scroll-x{ overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; }
    .sf-scroll-x::-webkit-scrollbar{ display:none; }
    .sf-navpill{ transition: all .25s cubic-bezier(.4,0,.2,1); }

    .sf-input{ width:100%; border:1.5px solid var(--border); border-radius:12px; padding:11px 14px; font-family:'Inter',sans-serif; font-size:14.5px; background:#fff; color:var(--ink); outline:none; transition:border-color .15s; }
    .sf-input:focus{ border-color:var(--primary); }
    .sf-input::placeholder{ color:var(--muted); }

    .sf-fade-in{ animation:sfFadeIn .3s ease both; }
    @keyframes sfFadeIn{ from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
    .sf-spin{ animation:sfSpin 1s linear infinite; }
    @keyframes sfSpin{ from{transform:rotate(0)} to{transform:rotate(360deg)} }

    .sf-skeleton{ background:linear-gradient(90deg,#ECEFED 25%,#F6F7F6 37%,#ECEFED 63%); background-size:400% 100%; animation:sfShimmer 1.4s ease infinite; border-radius:10px; }
    @keyframes sfShimmer{ 0%{background-position:100% 0} 100%{background-position:0 0} }

    @media (prefers-reduced-motion: reduce){
      .sf-fade-in, .sf-navpill, .sf-skeleton, .sf-splash-icon, .sf-splash-text, .sf-splash-tag, .sf-splash-line, .sf-spin{ animation:none !important; transition:none !important; opacity:1 !important; width:120px !important; }
    }

    .sf-line-clamp-2{ display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .sf-focus:focus-visible{ outline:2px solid var(--primary); outline-offset:2px; }

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

    @media print{
      body *{ visibility:hidden; }
      .sf-invoice, .sf-invoice *{ visibility:visible; }
      .sf-invoice{ position:absolute; left:0; top:0; width:100%; }
      .sf-no-print{ display:none !important; }
    }
  `}</style>
);

/* ==================================================================== */
/*  SPLASH SCREEN                                                       */
/* ==================================================================== */

function SplashScreen({ onEnter }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2300);
    const t2 = setTimeout(() => onEnter(), 2750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line

  return (
    <div className={"fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 transition-opacity duration-500 " + (leaving ? "opacity-0 pointer-events-none" : "opacity-100")}
      style={{ background: "linear-gradient(160deg,#0A1613 0%,#10231F 55%,#0A1613 100%)" }}>
      <div className="sf-splash-shimmer" />
      <div className="sf-splash-frame" />
      {[["top-3 left-3", ""], ["top-3 right-3", "scale(-1,1)"], ["bottom-3 left-3", "scale(1,-1)"], ["bottom-3 right-3", "scale(-1,-1)"]].map(([pos, flip], i) => (
        <svg key={i} className={"sf-splash-corner absolute " + pos} viewBox="0 0 24 24" fill="none" style={{ transform: flip }}>
          <path d="M1 24V5C1 2.8 2.8 1 5 1H24" stroke="#E8C27A" strokeWidth="1" />
        </svg>
      ))}
      <div className="relative flex flex-col items-center text-center">
        <span className="sf-splash-eyebrow text-[11px] font-semibold tracking-[0.5em] uppercase mb-6" style={{ color: "#C9A46B" }}>Introducing</span>
        <svg width="52" height="52" viewBox="0 0 26 26" fill="none" className="sf-splash-icon">
          <path d="M4 15c3-6 6 6 9 0s6-6 9 0" stroke="#E8C27A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <circle cx="13" cy="13" r="11.3" stroke="#E8C27A" strokeWidth="0.9" fill="none" opacity="0.55" />
        </svg>
        <h1 className="sf-display sf-splash-text text-white text-[32px] font-semibold tracking-wide mt-5">ShopFlow</h1>
        <div className="sf-splash-line mt-4" />
        <p className="sf-splash-tag text-[11px] font-medium tracking-[0.3em] uppercase mt-4" style={{ color: "#C9A46B" }}>Curated Everyday Luxury</p>
      </div>
      <div className="sf-splash-tag absolute bottom-10 left-0 right-0 flex items-center justify-center gap-3">
        <span className="w-1 h-1 rounded-full" style={{ background: "#E8C27A", opacity: 0.7 }} />
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase" style={{ color: "#6E8079" }}>Shop the Flow</span>
        <span className="w-1 h-1 rounded-full" style={{ background: "#E8C27A", opacity: 0.7 }} />
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  SMALL UI PRIMITIVES                                                 */
/* ==================================================================== */

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
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--primary-light)" }}><Icon size={28} color="var(--primary)" /></div>
      <p className="font-semibold text-[15px]">{title}</p>
      {subtitle && <p className="text-sm mt-1 max-w-xs" style={{ color: "var(--muted)" }}>{subtitle}</p>}
      {actionLabel && <button onClick={onAction} className="sf-btn-primary sf-focus mt-5 px-5 py-2.5 rounded-full text-sm font-semibold">{actionLabel}</button>}
    </div>
  );
}
function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-[100] sf-fade-in px-4 w-full max-w-sm">
      <div className="flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg" style={{ background: isErr ? "#C23B2E" : "var(--ink)", color: "#fff" }}>
        {isErr ? <XCircle size={17} color="#FFD7D0" /> : <CheckCircle2 size={17} color="#7CD9C0" />}
        <span className="text-sm font-medium">{toast.msg}</span>
      </div>
    </div>
  );
}
function Skeleton({ className }) { return <div className={"sf-skeleton " + className} />; }
function QtyStepper({ qty, onDec, onInc, max }) {
  return (
    <div className="flex items-center border rounded-full overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <button onClick={onDec} className="sf-focus w-8 h-8 flex items-center justify-center active:bg-gray-100"><Minus size={14} /></button>
      <span className="w-7 text-center text-sm font-semibold sf-mono">{qty}</span>
      <button onClick={onInc} disabled={max !== undefined && qty >= max} className="sf-focus w-8 h-8 flex items-center justify-center active:bg-gray-100 disabled:opacity-30"><Plus size={14} /></button>
    </div>
  );
}
function Spinner({ light }) { return <Loader2 size={15} className="sf-spin" color={light ? "#fff" : "var(--primary)"} />; }

/* ==================================================================== */
/*  PRODUCT CARD & GRID                                                 */
/* ==================================================================== */

function ProductCard({ product, onOpen, onAddToCart, onToggleWishlist, isWishlisted, cartQty }) {
  const discount = Math.round(100 - (product.price / product.mrp) * 100);
  return (
    <div className="sf-card rounded-2xl overflow-hidden flex flex-col sf-fade-in">
      <div className="relative cursor-pointer" onClick={() => onOpen(product.id)}>
        <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" loading="lazy" />
        {discount > 0 && <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full sf-btn-accent">{discount}% OFF</span>}
        <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }} className="sf-focus absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm" aria-label="Toggle wishlist">
          <Heart size={16} color={isWishlisted ? "#FF6B4A" : "#8A9793"} fill={isWishlisted ? "#FF6B4A" : "none"} />
        </button>
        {product.stock === 0 && <div className="absolute inset-0 bg-black/45 flex items-center justify-center"><span className="text-white text-xs font-bold tracking-wide">OUT OF STOCK</span></div>}
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[13.5px] font-semibold leading-snug sf-line-clamp-2 cursor-pointer" onClick={() => onOpen(product.id)}>{product.name}</p>
        <Stars rating={product.rating} />
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="sf-price-tag sf-mono text-[13px] font-bold">{money(product.price)}</span>
          {discount > 0 && <span className="text-xs line-through" style={{ color: "var(--muted)" }}>{money(product.mrp)}</span>}
        </div>
        <button onClick={() => onAddToCart(product.id)} disabled={product.stock === 0} className="sf-focus sf-btn-primary mt-2 rounded-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40">
          <ShoppingCart size={14} /> {cartQty > 0 ? `In Cart · ${cartQty}` : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
function ProductGrid({ products, openProduct, addToCart, toggleWishlist, wishlist, cart }) {
  const qtyOf = (id) => cart.find((i) => i.productId === id)?.qty || 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {products.map((p) => <ProductCard key={p.id} product={p} onOpen={openProduct} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isWishlisted={wishlist.includes(p.id)} cartQty={qtyOf(p.id)} />)}
    </div>
  );
}
function SectionHeader({ title, subtitle }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div><h2 className="sf-display font-semibold text-[19px]">{title}</h2>{subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{subtitle}</p>}</div>
    </div>
  );
}

/* ==================================================================== */
/*  HEADER + BOTTOM NAV                                                 */
/* ==================================================================== */

function Logo({ onClick, storeName }) {
  return (
    <button onClick={onClick} className="sf-focus flex items-center gap-1.5 shrink-0">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M4 15c3-6 6 6 9 0s6-6 9 0" stroke="#FF6B4A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <circle cx="13" cy="13" r="11.3" stroke="#0F6D5C" strokeWidth="1.6" fill="none" />
      </svg>
      <span className="sf-display font-bold text-[19px] tracking-tight" style={{ color: "var(--primary-dark)" }}>{storeName || "ShopFlow"}</span>
    </button>
  );
}
function Badge({ n }) {
  return <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: "var(--accent)" }}>{n}</span>;
}
function Header({ nav, query, setQuery, onSearch, cartCount, wishlistCount, unreadCount, user, showBack, onBack, storeName }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        {showBack ? <button onClick={onBack} className="sf-focus w-9 h-9 -ml-1 flex items-center justify-center rounded-full active:bg-gray-100"><ArrowLeft size={19} /></button> : <Logo onClick={() => nav("home")} storeName={storeName} />}
        <div onKeyDown={(e) => { if (e.key === "Enter") onSearch(query); }} className="flex-1 flex items-center gap-2 rounded-full px-3.5 py-2" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
          <button onClick={() => onSearch(query)} className="sf-focus shrink-0" aria-label="Search"><Search size={16} color="var(--muted)" /></button>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for products, brands..." className="bg-transparent outline-none text-sm flex-1 min-w-0" />
        </div>
        <div className="hidden md:flex items-center gap-3">
          {user && <button onClick={() => nav("notifications")} className="sf-focus relative w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100"><Bell size={18} />{unreadCount > 0 && <Badge n={unreadCount} />}</button>}
          <button onClick={() => nav("wishlist")} className="sf-focus relative w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100"><Heart size={19} />{wishlistCount > 0 && <Badge n={wishlistCount} />}</button>
          <button onClick={() => nav("cart")} className="sf-focus relative w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100"><ShoppingCart size={19} />{cartCount > 0 && <Badge n={cartCount} />}</button>
          <button onClick={() => nav(user ? "profile" : "auth")} className="sf-focus w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100"><User size={19} /></button>
        </div>
      </div>
    </header>
  );
}
function BottomNav({ page, nav, cartCount }) {
  const items = [
    { key: "home", label: "Home", icon: HomeIcon }, { key: "categories", label: "Categories", icon: Grid3x3 },
    { key: "cart", label: "Cart", icon: ShoppingCart, badge: cartCount }, { key: "orders", label: "Orders", icon: Package },
    { key: "profile", label: "Profile", icon: User },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-stretch">
        {items.map((it) => {
          const active = page === it.key; const Icon = it.icon;
          return (
            <button key={it.key} onClick={() => nav(it.key)} className="sf-focus flex-1 flex flex-col items-center gap-0.5 py-2.5 relative">
              <div className="sf-navpill relative px-3.5 py-1 rounded-full" style={{ background: active ? "var(--primary-light)" : "transparent" }}>
                <Icon size={19} color={active ? "var(--primary-dark)" : "var(--muted)"} />{it.badge > 0 && <Badge n={it.badge} />}
              </div>
              <span className="text-[10.5px] font-semibold" style={{ color: active ? "var(--primary-dark)" : "var(--muted)" }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ==================================================================== */
/*  MAIN APP                                                            */
/* ==================================================================== */

export default function ShopFlowApp() {
  const [page, setPage] = useState("home");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // catalog (from DB)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banner, setBanner] = useState(null);
  const [config, setConfig] = useState({ storeName: "ShopFlow", currency: "INR", taxPercent: 5, freeDeliveryThreshold: 999, deliveryCharge: 49, contactEmail: "", contactPhone: "", address: "" });

  // auth
  const [session, setSession] = useState(null); // {access_token, user:{id,email}}
  const [profile, setProfile] = useState(null); // sf_profiles row
  const user = profile ? { id: profile.id, email: session?.user?.email, name: profile.full_name || session?.user?.email?.split("@")[0], isAdmin: profile.role === "admin" || profile.role === "staff", role: profile.role } : null;
  const token = session?.access_token;

  // user data
  const [cartId, setCartId] = useState(null);
  const [cart, setCart] = useState([]); // {id,productId,qty,product}
  const [savedItems, setSavedItems] = useState([]);
  const [wishlist, setWishlist] = useState([]); // productId[]
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [returns, setReturns] = useState([]);

  // navigation
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  const [buyNowItem, setBuyNowItem] = useState(null);
  const [checkoutAddressId, setCheckoutAddressId] = useState(null);
  const [postLoginRedirect, setPostLoginRedirect] = useState(null);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [invoiceOrderId, setInvoiceOrderId] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2600); };

  /* ---------------- initial catalog load ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const [cats, prods, banns, settings] = await Promise.all([
          rest("sf_categories", { query: "?select=*&is_active=eq.true&order=sort_order.asc" }),
          rest("sf_products", { query: "?select=*,category:sf_categories(slug,name),images:sf_product_images(url),inventory:sf_inventory(stock)&is_active=eq.true&order=created_at.asc" }),
          rest("sf_banners", { query: "?select=*&is_active=eq.true&section=eq.hero&order=sort_order.asc&limit=1" }),
          rest("sf_store_settings", { query: "?select=*&id=eq.1", single: true }),
        ]);
        setCategories(cats.map((c) => ({ id: c.slug, dbId: c.id, name: c.name, icon: CATEGORY_ICONS[c.slug] || Sparkles })));
        setProducts(prods.map(mapProduct));
        setBanner(banns[0] || null);
        setConfig(mapSettings(settings));
      } catch (e) {
        showToast("Could not load the store. Please refresh.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nav = (p) => { setHistory((h) => [...h, page]); setPage(p); window.scrollTo({ top: 0 }); };
  const goBack = () => setHistory((h) => { const c = [...h]; setPage(c.pop() || "home"); return c; });

  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  /* ---------------- auth ---------------- */
  const loadUserData = async (tok, uid_) => {
    try {
      const [cartRow, wish, addr, ords, notifs, rets] = await Promise.all([
        rest("sf_carts", { query: `?user_id=eq.${uid_}&select=id`, token: tok, single: true }).catch(() => null),
        rest("sf_wishlists", { query: `?user_id=eq.${uid_}&select=product_id`, token: tok }),
        rest("sf_addresses", { query: `?user_id=eq.${uid_}&order=created_at.asc`, token: tok }),
        rest("sf_orders", { query: `?user_id=eq.${uid_}&select=*,items:sf_order_items(*)&order=placed_at.desc`, token: tok }),
        rest("sf_notifications", { query: `?user_id=eq.${uid_}&order=created_at.desc&limit=40`, token: tok }),
        rest("sf_returns", { query: `?user_id=eq.${uid_}&order=created_at.desc`, token: tok }),
      ]);
      setCartId(cartRow?.id || null);
      if (cartRow?.id) {
        const embed = "*,product:sf_products(*,category:sf_categories(slug),images:sf_product_images(url),inventory:sf_inventory(stock))";
        const [items, saved] = await Promise.all([
          rest("sf_cart_items", { query: `?cart_id=eq.${cartRow.id}&saved_for_later=eq.false&select=${embed}`, token: tok }),
          rest("sf_cart_items", { query: `?cart_id=eq.${cartRow.id}&saved_for_later=eq.true&select=${embed}`, token: tok }),
        ]);
        setCart(items.map(mapCartItem));
        setSavedItems(saved.map(mapCartItem));
      }
      setWishlist(wish.map((w) => w.product_id));
      setAddresses(addr.map(mapAddress));
      setOrders(ords.map(mapOrder));
      setNotifications(notifs || []);
      setReturns(rets || []);
    } catch (e) { showToast("Some of your data couldn't be loaded.", "error"); }
  };

  const clearUserData = () => { setCartId(null); setCart([]); setSavedItems([]); setWishlist([]); setAddresses([]); setOrders([]); setNotifications([]); setReturns([]); };

  const signIn = async (email, password) => {
    const data = await authRequest("token?grant_type=password", { email, password });
    const prof = await rest("sf_profiles", { query: `?id=eq.${data.user.id}&select=*`, token: data.access_token, single: true });
    if (prof.is_active === false) throw new Error("This account has been deactivated. Please contact support.");
    setSession({ access_token: data.access_token, user: data.user });
    setProfile(prof);
    await loadUserData(data.access_token, data.user.id);
    return prof;
  };
  const signUp = async (email, password, fullName) => {
    const data = await authRequest("signup", { email, password, data: { full_name: fullName } });
    if (data.access_token) {
      const prof = await rest("sf_profiles", { query: `?id=eq.${data.user.id}&select=*`, token: data.access_token, single: true });
      setSession({ access_token: data.access_token, user: data.user });
      setProfile(prof);
      await loadUserData(data.access_token, data.user.id);
      return { needsConfirmation: false };
    }
    return { needsConfirmation: true };
  };
  const requestPasswordReset = async (email) => authRequest("recover", { email });
  const doLogin = async (email, password) => {
    try {
      await signIn(email, password);
      showToast("Welcome back!");
      if (postLoginRedirect) { nav(postLoginRedirect); setPostLoginRedirect(null); } else nav("profile");
    } catch (e) { throw e; }
  };
  const doSignup = async (name, email, password) => {
    const res = await signUp(email, password, name);
    if (res.needsConfirmation) { showToast("Account created — check your email to verify, then log in."); return { needsConfirmation: true }; }
    showToast(`Welcome, ${name}!`);
    if (postLoginRedirect) { nav(postLoginRedirect); setPostLoginRedirect(null); } else nav("profile");
    return res;
  };
  const logout = async () => {
    try { if (token) await authRequest("logout", {}, { Authorization: `Bearer ${token}` }); } catch (e) {}
    setSession(null); setProfile(null); clearUserData(); showToast("Logged out"); nav("home");
  };
  const requireAuth = (target) => { if (!user) { setPostLoginRedirect(target); nav("auth"); return false; } return true; };

  /* ---------------- cart ---------------- */
  const addToCart = async (productId, qty = 1) => {
    const prod = productMap[productId];
    if (!prod || prod.stock === 0) return;
    if (!user) { showToast("Please log in to add items to your cart", "error"); requireAuth(page); return; }
    try {
      const existing = cart.find((i) => i.productId === productId);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, prod.stock);
        const row = await rest("sf_cart_items", { method: "PATCH", query: `?id=eq.${existing.id}`, body: { quantity: newQty }, token, prefer: "return=representation" });
        setCart((c) => c.map((i) => (i.id === existing.id ? { ...i, qty: newQty } : i)));
      } else {
        const row = await rest("sf_cart_items", { method: "POST", body: { cart_id: cartId, product_id: productId, quantity: Math.min(qty, prod.stock) }, token, prefer: "return=representation" });
        setCart((c) => [...c, { id: row[0].id, productId, qty: row[0].quantity, product: prod }]);
      }
      showToast("Added to cart");
    } catch (e) { showToast("Couldn't add to cart. Please try again.", "error"); }
  };
  const setCartQty = async (productId, qty) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;
    if (qty <= 0) return removeFromCart(productId);
    const max = item.product.stock;
    const newQty = Math.min(qty, max);
    setCart((c) => c.map((i) => (i.productId === productId ? { ...i, qty: newQty } : i)));
    try { await rest("sf_cart_items", { method: "PATCH", query: `?id=eq.${item.id}`, body: { quantity: newQty }, token }); }
    catch (e) { showToast("Couldn't update quantity.", "error"); }
  };
  const removeFromCart = async (productId) => {
    const item = cart.find((i) => i.productId === productId);
    setCart((c) => c.filter((i) => i.productId !== productId));
    showToast("Removed from cart");
    if (item) { try { await rest("sf_cart_items", { method: "DELETE", query: `?id=eq.${item.id}`, token }); } catch (e) {} }
  };
  const saveForLater = async (productId) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;
    setCart((c) => c.filter((i) => i.productId !== productId));
    setSavedItems((s) => [...s, { ...item }]);
    try { await rest("sf_cart_items", { method: "PATCH", query: `?id=eq.${item.id}`, body: { saved_for_later: true }, token }); } catch (e) {}
    showToast("Saved for later");
  };
  const moveToCart = async (productId) => {
    const item = savedItems.find((i) => i.productId === productId);
    if (!item) return;
    setSavedItems((s) => s.filter((i) => i.productId !== productId));
    setCart((c) => [...c, item]);
    try { await rest("sf_cart_items", { method: "PATCH", query: `?id=eq.${item.id}`, body: { saved_for_later: false }, token }); } catch (e) {}
    showToast("Moved to cart");
  };
  const toggleWishlist = async (productId) => {
    if (!user) { showToast("Please log in to use your wishlist", "error"); requireAuth(page); return; }
    const has = wishlist.includes(productId);
    setWishlist((w) => (has ? w.filter((id) => id !== productId) : [...w, productId]));
    showToast(has ? "Removed from wishlist" : "Added to wishlist");
    try {
      if (has) await rest("sf_wishlists", { method: "DELETE", query: `?user_id=eq.${user.id}&product_id=eq.${productId}`, token });
      else await rest("sf_wishlists", { method: "POST", body: { user_id: user.id, product_id: productId }, token });
    } catch (e) {}
  };

  const cartLines = useMemo(() => cart.filter((l) => l.product), [cart]);
  const activeLines = buyNowItem ? [{ productId: buyNowItem.productId, qty: buyNowItem.qty, product: productMap[buyNowItem.productId] }] : cartLines;
  const subtotal = activeLines.reduce((s, l) => s + l.product.price * l.qty, 0);

  /* ---------------- coupons ---------------- */
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const applyCoupon = async (code) => {
    const rows = await rest("sf_coupons", { query: `?code=eq.${code.trim().toUpperCase()}&is_active=eq.true`, token });
    if (!rows.length) throw new Error("Invalid or inactive coupon code");
    const c = rows[0];
    if (c.expiry_date && new Date(c.expiry_date) < new Date()) throw new Error("This coupon has expired");
    if (subtotal < c.min_order_value) throw new Error(`Add ${money(c.min_order_value - subtotal, config.currency)} more to use this coupon`);
    if (c.is_first_order_only && orders.length > 0) throw new Error("This coupon is valid on your first order only");
    if (user) {
      const usage = await rest("sf_coupon_usages", { query: `?coupon_id=eq.${c.id}&user_id=eq.${user.id}`, token });
      if (c.per_user_limit && usage.length >= c.per_user_limit) throw new Error("You've already used this coupon");
    }
    let discount = c.type === "percentage" ? (subtotal * c.value) / 100 : c.value;
    if (c.max_discount) discount = Math.min(discount, c.max_discount);
    discount = Math.min(discount, subtotal);
    setAppliedCoupon({ ...c, discount });
    showToast(`Coupon applied — you saved ${money(discount, config.currency)}`);
  };
  const removeCoupon = () => setAppliedCoupon(null);

  const discount = appliedCoupon?.discount || 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * (config.taxPercent / 100));
  const deliveryCharge = subtotal === 0 || subtotal >= config.freeDeliveryThreshold ? 0 : config.deliveryCharge;
  const total = taxable + tax + deliveryCharge;

  /* ---------------- checkout / orders ---------------- */
  const [processing, setProcessing] = useState(false);
  const placeOrder = async ({ addressId, paymentMethod, shippingMethod }) => {
    const addr = addresses.find((a) => a.id === addressId);
    if (!addr || activeLines.length === 0 || !user) return;
    setProcessing(true);
    try {
      const orderNumber = uid("SF");
      const paymentStatus = paymentMethod === "cod" ? "cod" : "paid";
      const orderRows = await rest("sf_orders", {
        method: "POST", token, prefer: "return=representation",
        body: {
          order_number: orderNumber, user_id: user.id, status: "pending", payment_status: paymentStatus,
          payment_method: paymentMethod, subtotal, discount, tax, shipping_charge: deliveryCharge, total,
          coupon_id: appliedCoupon?.id || null,
          address: { fullName: addr.fullName, phone: addr.phone, line1: addr.line1, city: addr.city, state: addr.state, pincode: addr.pincode },
        },
      });
      const order = orderRows[0];

      await Promise.all([
        rest("sf_order_items", { method: "POST", token, body: activeLines.map((l) => ({ order_id: order.id, product_id: l.product.id, product_name: l.product.name, product_image: l.product.image, price: l.product.price, quantity: l.qty })) }),
        rest("sf_order_status_history", { method: "POST", token, body: { order_id: order.id, status: "pending", note: "Order placed by customer" } }),
        rest("sf_payments", { method: "POST", token, body: { order_id: order.id, amount: total, method: paymentMethod, status: paymentStatus === "cod" ? "cod" : "paid" } }),
        rest("sf_notifications", { method: "POST", token, body: { user_id: user.id, type: "order_placed", title: "Order placed", message: `Your order #${orderNumber} has been placed successfully.` } }),
      ]);
      if (appliedCoupon) await rest("sf_coupon_usages", { method: "POST", token, body: { coupon_id: appliedCoupon.id, user_id: user.id, order_id: order.id } }).catch(() => {});

      // decrement inventory
      await Promise.all(activeLines.map(async (l) => {
        const newStock = Math.max(0, l.product.stock - l.qty);
        await rest("sf_inventory", { method: "PATCH", token, query: `?product_id=eq.${l.product.id}`, body: { stock: newStock } }).catch(() => {});
        await rest("sf_inventory_history", { method: "POST", token, body: { product_id: l.product.id, change: -l.qty, reason: `Order ${orderNumber}` } }).catch(() => {});
      }));
      setProducts((ps) => ps.map((p) => { const l = activeLines.find((x) => x.product.id === p.id); return l ? { ...p, stock: Math.max(0, p.stock - l.qty) } : p; }));

      if (buyNowItem) setBuyNowItem(null);
      else { await rest("sf_cart_items", { method: "DELETE", token, query: `?cart_id=eq.${cartId}&saved_for_later=eq.false` }).catch(() => {}); setCart([]); }
      setAppliedCoupon(null);
      setLastOrderId(order.id);
      setOrders((o) => [mapOrder({ ...order, items: activeLines.map((l) => ({ id: uid("I"), product_id: l.product.id, product_name: l.product.name, product_image: l.product.image, price: l.product.price, quantity: l.qty })) }), ...o]);
      nav("orderSuccess");
    } catch (e) {
      showToast("We couldn't place your order. Please try again.", "error");
    } finally { setProcessing(false); }
  };

  const cancelOrder = async (orderId) => {
    try {
      await rest("sf_orders", { method: "PATCH", token, query: `?id=eq.${orderId}`, body: { status: "cancelled" } });
      await rest("sf_order_status_history", { method: "POST", token, body: { order_id: orderId, status: "cancelled", note: "Cancelled by customer" } });
      setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
      showToast("Order cancelled");
    } catch (e) { showToast("Couldn't cancel this order.", "error"); }
  };

  const reorder = (order) => { order.items.forEach((it) => productMap[it.productId] && addToCart(it.productId, it.qty)); nav("cart"); };

  /* ---------------- admin ---------------- */
  const [allOrders, setAllOrders] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allReturns, setAllReturns] = useState([]);
  const loadAdminData = async () => {
    try {
      const [ords, custs, rets] = await Promise.all([
        rest("sf_orders", { query: "?select=*,items:sf_order_items(*)&order=placed_at.desc", token }),
        rest("sf_profiles", { query: "?select=*&order=created_at.desc", token }),
        rest("sf_returns", { query: "?select=*,order:sf_orders(order_number),item:sf_order_items(product_name,price,quantity)&order=created_at.desc", token }),
      ]);
      setAllOrders(ords.map(mapOrder).map((o, i) => ({ ...o, userId: ords[i].user_id })));
      setAllCustomers(custs);
      setAllReturns(rets);
    } catch (e) { showToast("Couldn't load admin data.", "error"); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const patch = { status };
      if (status === "delivered") patch.payment_status = "paid";
      if (status === "cancelled") patch.payment_status = "refunded";
      await rest("sf_orders", { method: "PATCH", token, query: `?id=eq.${orderId}`, body: patch });
      await rest("sf_order_status_history", { method: "POST", token, body: { order_id: orderId, status, note: "Updated by admin" } });
      const ord = allOrders.find((o) => o.id === orderId);
      if (ord) await rest("sf_notifications", { method: "POST", token, body: { user_id: ord.userId, type: "order_status", title: "Order update", message: `Your order #${ord.orderNumber} is now ${STATUS_LABEL[status]}.` } }).catch(() => {});
      setAllOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status } : o)));
      showToast("Order status updated");
    } catch (e) { showToast("Couldn't update order status.", "error"); }
  };

  const saveProduct = async (prod, editingId) => {
    try {
      const catId = categories.find((c) => c.id === prod.category)?.dbId;
      const body = { name: prod.name, description: prod.desc, category_id: catId, price: prod.price, mrp: prod.mrp, sku: prod.sku || null, is_featured: !!prod.featured, is_bestseller: !!prod.bestseller, is_new_arrival: !!prod.newArrival };
      if (editingId) {
        await rest("sf_products", { method: "PATCH", token, query: `?id=eq.${editingId}`, body });
        await rest("sf_inventory", { method: "PATCH", token, query: `?product_id=eq.${editingId}`, body: { stock: prod.stock } });
        if (prod.image) {
          const existing = await rest("sf_product_images", { query: `?product_id=eq.${editingId}&select=id&limit=1`, token });
          if (existing.length) await rest("sf_product_images", { method: "PATCH", token, query: `?id=eq.${existing[0].id}`, body: { url: prod.image } });
          else await rest("sf_product_images", { method: "POST", token, body: { product_id: editingId, url: prod.image } });
        }
      } else {
        body.slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
        const rows = await rest("sf_products", { method: "POST", token, prefer: "return=representation", body });
        const newId = rows[0].id;
        await rest("sf_inventory", { method: "POST", token, body: { product_id: newId, stock: prod.stock } });
        await rest("sf_product_images", { method: "POST", token, body: { product_id: newId, url: prod.image || `https://picsum.photos/seed/${newId}/640/640` } });
      }
      await refreshCatalog();
      showToast(editingId ? "Product updated" : "Product added");
    } catch (e) { showToast("Couldn't save product.", "error"); }
  };
  const deleteProduct = async (id) => {
    try { await rest("sf_products", { method: "DELETE", token, query: `?id=eq.${id}` }); setProducts((ps) => ps.filter((p) => p.id !== id)); showToast("Product deleted"); }
    catch (e) { showToast("Couldn't delete product.", "error"); }
  };
  const addCategory = async (name) => {
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36).slice(-4);
      const rows = await rest("sf_categories", { method: "POST", token, prefer: "return=representation", body: { name, slug, sort_order: categories.length + 1 } });
      setCategories((c) => [...c, { id: rows[0].slug, dbId: rows[0].id, name: rows[0].name, icon: Sparkles }]);
      showToast("Category added");
    } catch (e) { showToast("Couldn't add category.", "error"); }
  };
  const deleteCategory = async (dbId, catId) => {
    try { await rest("sf_categories", { method: "DELETE", token, query: `?id=eq.${dbId}` }); setCategories((c) => c.filter((x) => x.dbId !== dbId)); showToast("Category deleted"); }
    catch (e) { showToast("Couldn't delete category.", "error"); }
  };

  const refreshCatalog = async () => {
    const prods = await rest("sf_products", { query: "?select=*,category:sf_categories(slug,name),images:sf_product_images(url),inventory:sf_inventory(stock)&order=created_at.asc", token });
    setProducts(prods.map(mapProduct));
  };

  const updateReturnStatus = async (returnId, status, amount) => {
    try {
      await rest("sf_returns", { method: "PATCH", token, query: `?id=eq.${returnId}`, body: { status } });
      if (status === "approved" && amount) await rest("sf_refunds", { method: "POST", token, body: { return_id: returnId, order_id: allReturns.find((r) => r.id === returnId)?.order_id, amount, status: "processing" } }).catch(() => {});
      setAllReturns((rs) => rs.map((r) => (r.id === returnId ? { ...r, status } : r)));
      showToast("Return updated");
    } catch (e) { showToast("Couldn't update return.", "error"); }
  };

  const requestReturn = async (orderId, orderItemId, reason, description) => {
    try {
      await rest("sf_returns", { method: "POST", token, body: { order_id: orderId, order_item_id: orderItemId, user_id: user.id, reason, description } });
      showToast("Return request submitted");
      const rets = await rest("sf_returns", { query: `?user_id=eq.${user.id}&order=created_at.desc`, token });
      setReturns(rets || []);
    } catch (e) { showToast("Couldn't submit return request.", "error"); }
  };

  const saveSettings = async (patch) => {
    try {
      await rest("sf_store_settings", { method: "PATCH", token, query: "?id=eq.1", body: patch });
      const settings = await rest("sf_store_settings", { query: "?select=*&id=eq.1", single: true });
      setConfig(mapSettings(settings));
      showToast("Settings saved");
    } catch (e) { showToast("Couldn't save settings.", "error"); }
  };

  /* ---------------- reviews ---------------- */
  const addReview = async (productId, { rating, comment }) => {
    if (!user) { showToast("Please log in to write a review", "error"); return; }
    try {
      await rest("sf_reviews", { method: "POST", token, body: { product_id: productId, user_id: user.id, rating, comment } });
      showToast("Review submitted");
    } catch (e) { showToast("Couldn't submit review.", "error"); }
  };

  /* ---------------- notifications ---------------- */
  const markAllNotificationsRead = async () => {
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })));
    try { await rest("sf_notifications", { method: "PATCH", token, query: `?user_id=eq.${user.id}&is_read=eq.false`, body: { is_read: true } }); } catch (e) {}
  };
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  /* ---------------- navigation helpers ---------------- */
  const openProduct = (id) => { setSelectedProductId(id); nav("productDetails"); };
  const openCategory = (id) => { setSelectedCategory(id); nav("productList"); };
  const runSearch = (q) => { if (!q.trim()) return; setSearchTerm(q); setRecentSearches((r) => [q, ...r.filter((x) => x !== q)].slice(0, 6)); nav("search"); };
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const showBottomNav = !["auth", "admin", "orderSuccess"].includes(page);

  return (
    <div className="sf-root min-h-screen flex flex-col">
      <GlobalStyle />
      {showSplash && <SplashScreen onEnter={() => setShowSplash(false)} />}
      {page !== "admin" && (
        <Header nav={nav} query={query} setQuery={setQuery} onSearch={runSearch} cartCount={cartCount} wishlistCount={wishlist.length}
          unreadCount={unreadCount} user={user} showBack={["productDetails", "checkout", "notifications"].includes(page)} onBack={goBack} storeName={config.storeName} />
      )}
      <main className="flex-1 max-w-6xl w-full mx-auto pb-24 md:pb-10">
        {loading ? <PageSkeleton /> : (
          <>
            {page === "home" && <HomePage products={products} categories={categories} banner={banner} nav={nav} openProduct={openProduct} openCategory={openCategory} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} config={config} />}
            {page === "categories" && <CategoriesPage categories={categories} products={products} openCategory={openCategory} />}
            {page === "productList" && <ProductListPage products={products} categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />}
            {page === "productDetails" && <ProductDetailsPage product={productMap[selectedProductId]} products={products} cart={cart} wishlist={wishlist} addToCart={addToCart} toggleWishlist={toggleWishlist} user={user} showToast={showToast} openProduct={openProduct} token={token}
              onBuyNow={(id, qty) => { if (!requireAuth("checkout")) return; setBuyNowItem({ productId: id, qty }); nav("checkout"); }} />}
            {page === "search" && <SearchResultsPage term={searchTerm} products={products} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} recentSearches={recentSearches} runSearch={runSearch} />}
            {page === "cart" && <CartPage lines={cartLines} savedItems={savedItems} setCartQty={setCartQty} removeFromCart={removeFromCart} saveForLater={saveForLater} moveToCart={moveToCart}
              subtotal={subtotal} discount={discount} tax={tax} deliveryCharge={deliveryCharge} total={total} config={config} nav={nav}
              appliedCoupon={appliedCoupon} applyCoupon={applyCoupon} removeCoupon={removeCoupon}
              onCheckout={() => { setBuyNowItem(null); if (requireAuth("checkout")) nav("checkout"); }} />}
            {page === "wishlist" && <WishlistPage items={wishlist.map((id) => productMap[id]).filter(Boolean)} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} cart={cart} nav={nav} />}
            {page === "auth" && <AuthPage onLogin={doLogin} onSignup={doSignup} onForgot={requestPasswordReset} showToast={showToast} />}
            {page === "profile" && <ProfilePage user={user} nav={nav} logout={logout} ordersCount={orders.length} wishlistCount={wishlist.length} addressesCount={addresses.length} unreadCount={unreadCount} />}
            {page === "notifications" && <NotificationsPage user={user} nav={nav} notifications={notifications} markAllRead={markAllNotificationsRead} />}
            {page === "orders" && <OrdersPage user={user} orders={orders} nav={nav} requireAuth={requireAuth} cancelOrder={cancelOrder} reorder={reorder} requestReturn={requestReturn} returns={returns} showInvoice={setInvoiceOrderId} currency={config.currency} />}
            {page === "addresses" && <AddressesPage addresses={addresses} setAddresses={setAddresses} user={user} nav={nav} requireAuth={requireAuth} showToast={showToast} token={token} />}
            {page === "checkout" && <CheckoutPage lines={activeLines} addresses={addresses} setAddresses={setAddresses} checkoutAddressId={checkoutAddressId} setCheckoutAddressId={setCheckoutAddressId}
              subtotal={subtotal} discount={discount} tax={tax} deliveryCharge={deliveryCharge} total={total} config={config}
              appliedCoupon={appliedCoupon} applyCoupon={applyCoupon} removeCoupon={removeCoupon}
              onPlaceOrder={placeOrder} processing={processing} showToast={showToast} token={token} />}
            {page === "orderSuccess" && <OrderSuccessPage orderId={lastOrderId} nav={nav} />}
            {page === "admin" && <AdminDashboard user={user} onAdminLogin={doLogin} onLoad={loadAdminData} products={products} categories={categories} orders={allOrders} customers={allCustomers} returnsList={allReturns}
              saveProduct={saveProduct} deleteProduct={deleteProduct} addCategory={addCategory} deleteCategory={deleteCategory} updateOrderStatus={updateOrderStatus} updateReturnStatus={updateReturnStatus}
              nav={nav} logout={logout} showToast={showToast} config={config} saveSettings={saveSettings} token={token} />}
          </>
        )}
      </main>
      {showBottomNav && <BottomNav page={page} nav={nav} cartCount={cartCount} />}
      <Toast toast={toast} />
      {invoiceOrderId && <InvoiceModal order={orders.find((o) => o.id === invoiceOrderId)} config={config} onClose={() => setInvoiceOrderId(null)} />}
      {page === "home" && (
        <button onClick={() => nav("admin")} className="sf-focus hidden md:flex fixed bottom-6 right-6 items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg sf-btn-outline bg-white">
          <LayoutDashboard size={14} /> Admin Dashboard
        </button>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-11 w-full" /><Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-2 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 w-full" />)}</div>
    </div>
  );
}

/* ==================================================================== */
/*  HOME / CATEGORIES / LISTING / SEARCH                                */
/* ==================================================================== */

function HomePage({ products, categories, banner, nav, openProduct, openCategory, addToCart, toggleWishlist, wishlist, cart, config }) {
  const featured = products.filter((p) => p.featured);
  const bestsellers = products.filter((p) => p.bestseller);
  const newArrivals = products.filter((p) => p.newArrival);
  return (
    <div className="p-4 space-y-7">
      <div className="rounded-2xl overflow-hidden relative sf-fade-in" style={{ background: "linear-gradient(120deg,#0F6D5C,#0A4F42)" }}>
        <div className="p-6 relative z-10 max-w-xs">
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#9FE0CD" }}>{banner?.subtitle ? "Limited Time" : "Season Flow Sale"}</span>
          <h2 className="sf-display text-white text-2xl font-semibold mt-1 leading-tight">{banner?.title || "Up to 40% off on everyday essentials"}</h2>
          <button onClick={() => nav("categories")} className="sf-focus sf-btn-accent mt-4 px-5 py-2.5 rounded-full text-sm font-bold">Shop the sale</button>
        </div>
        <svg className="absolute right-0 bottom-0 opacity-30" width="160" height="160" viewBox="0 0 100 100"><circle cx="80" cy="80" r="70" fill="#fff" opacity="0.08" /><circle cx="70" cy="30" r="35" fill="#fff" opacity="0.08" /></svg>
      </div>
      <svg className="sf-wave -mt-6" viewBox="0 0 400 20" preserveAspectRatio="none"><path d="M0 10 Q 50 0, 100 10 T 200 10 T 300 10 T 400 10 V20 H0 Z" fill="var(--primary-light)" /></svg>
      <div>
        <SectionHeader title="Shop by Category" />
        <div className="sf-scroll-x flex gap-3 -mx-4 px-4">
          {categories.map((c) => { const Icon = c.icon || Sparkles; return (
            <button key={c.id} onClick={() => openCategory(c.id)} className="sf-focus flex flex-col items-center gap-2 shrink-0 w-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center sf-chip"><Icon size={24} color="var(--primary-dark)" /></div>
              <span className="text-[11px] font-semibold text-center leading-tight">{c.name}</span>
            </button>
          ); })}
        </div>
      </div>
      {featured.length > 0 && <div><SectionHeader title="Featured for You" subtitle="Hand-picked picks, refreshed weekly" /><ProductGrid products={featured} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} /></div>}
      {bestsellers.length > 0 && <div><SectionHeader title="Best Sellers" subtitle="Most loved by ShopFlow shoppers" /><ProductGrid products={bestsellers} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} /></div>}
      {newArrivals.length > 0 && <div><SectionHeader title="New Arrivals" subtitle="Just landed" /><ProductGrid products={newArrivals} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} /></div>}
      <p className="text-center text-[11px] pt-4" style={{ color: "var(--muted)" }}>{config.address}{config.contactPhone ? ` · ${config.contactPhone}` : ""}</p>
    </div>
  );
}

function CategoriesPage({ categories, products, openCategory }) {
  return (
    <div className="p-4">
      <h1 className="sf-display font-semibold text-xl mb-4">All Categories</h1>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((c) => { const Icon = c.icon || Sparkles; const count = products.filter((p) => p.category === c.id).length; return (
          <button key={c.id} onClick={() => openCategory(c.id)} className="sf-focus sf-card rounded-2xl p-4 flex flex-col items-start gap-3 text-left">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center sf-chip"><Icon size={22} color="var(--primary-dark)" /></div>
            <div><p className="font-semibold text-sm">{c.name}</p><p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{count} products</p></div>
          </button>
        ); })}
      </div>
    </div>
  );
}

function ProductListPage({ products, categories, selectedCategory, setSelectedCategory, openProduct, addToCart, toggleWishlist, wishlist, cart }) {
  const [sort, setSort] = useState("relevance");
  const [priceMax, setPriceMax] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = selectedCategory ? products.filter((p) => p.category === selectedCategory) : products;
    list = list.filter((p) => p.price <= priceMax && p.rating >= minRating && !(inStockOnly && p.stock === 0));
    list = list.filter((p) => Math.round(100 - (p.price / p.mrp) * 100) >= minDiscount);
    if (sort === "priceLow") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "discount") list = [...list].sort((a, b) => (100 - b.price / b.mrp) - (100 - a.price / a.mrp));
    if (sort === "newest") list = [...list].slice().reverse();
    return list;
  }, [products, selectedCategory, sort, priceMax, minRating, minDiscount, inStockOnly]);
  const catName = categories.find((c) => c.id === selectedCategory)?.name;

  return (
    <div className="p-4">
      <h1 className="sf-display font-semibold text-xl mb-3">{catName || "All Products"}</h1>
      <div className="sf-scroll-x flex gap-2 mb-4 -mx-4 px-4">
        <FilterChip label="All" active={!selectedCategory} onClick={() => setSelectedCategory(null)} />
        {categories.map((c) => <FilterChip key={c.id} label={c.name} active={selectedCategory === c.id} onClick={() => setSelectedCategory(c.id)} />)}
      </div>
      <div className="flex items-center justify-between mb-3 gap-2">
        <button onClick={() => setShowFilters((s) => !s)} className="sf-focus sf-btn-outline px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"><SettingsIcon size={13} /> Filters</button>
        <span className="text-xs flex-1 text-center" style={{ color: "var(--muted)" }}>{filtered.length} items</span>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="sf-input text-xs py-1.5 w-auto pr-8">
          <option value="relevance">Relevance</option><option value="newest">Newest</option>
          <option value="priceLow">Price: Low to High</option><option value="priceHigh">Price: High to Low</option>
          <option value="rating">Top Rated</option><option value="discount">Biggest Discount</option>
        </select>
      </div>
      {showFilters && (
        <div className="sf-card rounded-2xl p-4 mb-4 space-y-4 sf-fade-in">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5"><span>Max Price</span><span className="sf-mono">{money(priceMax)}</span></div>
            <input type="range" min="200" max="5000" step="100" value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} className="w-full accent-[#0F6D5C]" />
          </div>
          <div>
            <p className="text-xs font-semibold mb-1.5">Minimum Rating</p>
            <div className="flex gap-2">{[0, 3, 3.5, 4, 4.5].map((r) => <FilterChip key={r} label={r === 0 ? "Any" : `${r}★+`} active={minRating === r} onClick={() => setMinRating(r)} />)}</div>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1.5">Minimum Discount</p>
            <div className="flex gap-2">{[0, 10, 20, 30].map((d) => <FilterChip key={d} label={d === 0 ? "Any" : `${d}%+`} active={minDiscount === d} onClick={() => setMinDiscount(d)} />)}</div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock only</label>
        </div>
      )}
      {filtered.length === 0 ? <EmptyState icon={Package} title="No products match these filters" subtitle="Try widening your price range or clearing a filter." /> : <ProductGrid products={filtered} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />}
    </div>
  );
}
function FilterChip({ label, active, onClick }) {
  return <button onClick={onClick} className="sf-focus shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border" style={active ? { background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" } : { background: "#fff", color: "var(--ink-soft)", borderColor: "var(--border)" }}>{label}</button>;
}

function SearchResultsPage({ term, products, openProduct, addToCart, toggleWishlist, wishlist, cart, recentSearches, runSearch }) {
  const results = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return [];
    return products.filter((p) => p.name.toLowerCase().includes(t) || p.desc.toLowerCase().includes(t) || (p.category || "").toLowerCase().includes(t));
  }, [term, products]);
  return (
    <div className="p-4">
      <h1 className="text-sm mb-3" style={{ color: "var(--muted)" }}>{results.length} results for <span className="font-semibold" style={{ color: "var(--ink)" }}>"{term}"</span></h1>
      {recentSearches.length > 1 && (
        <div className="sf-scroll-x flex gap-2 mb-4">
          {recentSearches.filter((s) => s !== term).map((s) => <button key={s} onClick={() => runSearch(s)} className="sf-focus shrink-0 px-3 py-1.5 rounded-full text-xs font-medium sf-btn-outline">{s}</button>)}
        </div>
      )}
      {results.length === 0 ? <EmptyState icon={Search} title="No matches found" subtitle="Try a different keyword or browse categories instead." /> : <ProductGrid products={results} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} cart={cart} />}
    </div>
  );
}

/* ==================================================================== */
/*  PRODUCT DETAILS + REVIEWS                                           */
/* ==================================================================== */

function ProductDetailsPage({ product, products, cart, wishlist, addToCart, toggleWishlist, onBuyNow, user, showToast, openProduct, token }) {
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (!product) return;
    setLoadingReviews(true);
    rest("sf_reviews", { query: `?product_id=eq.${product.id}&select=*,profile:sf_profiles(full_name)&is_approved=eq.true&order=created_at.desc` })
      .then((rows) => setReviews(rows || [])).catch(() => setReviews([])).finally(() => setLoadingReviews(false));
  }, [product?.id]);

  if (!product) return <EmptyState icon={AlertCircle} title="Product not found" subtitle="It may have been removed." />;
  const discount = Math.round(100 - (product.price / product.mrp) * 100);
  const inCart = cart.find((i) => i.productId === product.id);
  const wishlisted = wishlist.includes(product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);

  return (
    <div className="pb-6">
      <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
      <div className="p-4 space-y-4">
        <div>
          <span className="sf-chip text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">{product.category}</span>
          <h1 className="sf-display text-2xl font-semibold mt-2">{product.name}</h1>
          <div className="flex items-center gap-3 mt-1.5"><Stars rating={product.rating} size={15} /><span className="text-xs" style={{ color: "var(--muted)" }}>({product.ratingCount} ratings)</span></div>
        </div>
        <div className="flex items-center gap-3">
          <span className="sf-price-tag sf-mono text-lg font-bold">{money(product.price)}</span>
          {discount > 0 && <><span className="text-sm line-through" style={{ color: "var(--muted)" }}>{money(product.mrp)}</span><span className="text-sm font-bold" style={{ color: "var(--accent-dark)" }}>{discount}% off</span></>}
        </div>
        {product.taxPercent > 0 && <p className="text-[11px]" style={{ color: "var(--muted)" }}>Inclusive of all taxes ({product.taxPercent}% GST)</p>}
        <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: product.stock > 0 ? "var(--primary-dark)" : "#C23B2E" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: product.stock > 0 ? "var(--primary)" : "#C23B2E" }} />
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
        <div><p className="text-sm font-semibold mb-1">Description</p><p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{product.desc}</p></div>
        <div className="flex items-center gap-4"><span className="text-sm font-semibold">Quantity</span><QtyStepper qty={qty} onDec={() => setQty((q) => Math.max(1, q - 1))} onInc={() => setQty((q) => Math.min(product.stock, q + 1))} max={product.stock} /></div>
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => toggleWishlist(product.id)} className="sf-focus sf-btn-outline w-12 h-12 rounded-full flex items-center justify-center shrink-0"><Heart size={20} color={wishlisted ? "#FF6B4A" : "var(--ink)"} fill={wishlisted ? "#FF6B4A" : "none"} /></button>
          <button disabled={product.stock === 0} onClick={() => addToCart(product.id, qty)} className="sf-focus sf-btn-outline flex-1 rounded-full py-3 text-sm font-bold disabled:opacity-40">{inCart ? `In Cart (${inCart.qty})` : "Add to Cart"}</button>
          <button disabled={product.stock === 0} onClick={() => onBuyNow(product.id, qty)} className="sf-focus sf-btn-accent flex-1 rounded-full py-3 text-sm font-bold disabled:opacity-40">Buy Now</button>
        </div>
        <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}><Truck size={15} /> Free delivery above ₹999</div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}><ShieldCheck size={15} /> 7-day returns</div>
        </div>

        {related.length > 0 && (
          <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-bold mb-3">Related Products</p>
            <div className="sf-scroll-x flex gap-3 -mx-4 px-4">
              {related.map((r) => (
                <div key={r.id} onClick={() => openProduct(r.id)} className="sf-card rounded-xl overflow-hidden shrink-0 w-32 cursor-pointer">
                  <img src={r.image} className="w-32 h-32 object-cover" />
                  <div className="p-2"><p className="text-[11px] font-semibold sf-line-clamp-2">{r.name}</p><span className="sf-mono text-xs font-bold">{money(r.price)}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ReviewsSection productId={product.id} reviews={reviews} loading={loadingReviews} user={user} showToast={showToast} token={token}
          onSubmitted={(r) => setReviews((rs) => [r, ...rs])} />
      </div>
    </div>
  );
}

function ReviewsSection({ productId, reviews, loading, user, showToast, onSubmitted, token }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  const sorted = useMemo(() => {
    const list = [...reviews];
    if (sortBy === "highest") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "lowest") list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, sortBy]);

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!comment.trim()) return showToast("Please add a few words about the product", "error");
    setSubmitting(true);
    try {
      const rows = await rest("sf_reviews", { method: "POST", token, prefer: "return=representation", body: { product_id: productId, user_id: user.id, rating, comment: comment.trim() } });
      onSubmitted({ ...rows[0], profile: { full_name: user.name } });
      setComment(""); setRating(5); setOpen(false);
      showToast("Review submitted");
    } catch (e2) { showToast("Couldn't submit review. Please try again.", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-3 gap-3">
        <div>
          <p className="text-sm font-bold">Customer Reviews</p>
          {avg ? <div className="flex items-center gap-1.5 mt-1"><Stars rating={avg} size={13} /><span className="text-xs" style={{ color: "var(--muted)" }}>({reviews.length})</span></div> : <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>No reviews yet</p>}
        </div>
        {user ? <button onClick={() => setOpen((o) => !o)} className="sf-focus sf-btn-outline px-3.5 py-2 rounded-full text-xs font-semibold shrink-0">{open ? "Cancel" : "Write a Review"}</button>
          : <span className="text-[11px]" style={{ color: "var(--muted)" }}>Log in to review</span>}
      </div>
      {open && (
        <div className="sf-card rounded-2xl p-4 space-y-2.5 mb-4 sf-fade-in">
          <div><p className="text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>Your rating</p>
            <div className="flex items-center gap-1.5">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} className="sf-focus"><Star size={24} fill={n <= rating ? "#E8A33D" : "none"} color="#E8A33D" strokeWidth={1.6} /></button>)}</div>
          </div>
          <textarea className="sf-input" rows={3} placeholder="Share your experience with this product..." value={comment} onChange={(e) => setComment(e.target.value)} />
          <button onClick={submit} disabled={submitting} className="sf-focus sf-btn-primary w-full rounded-full py-2.5 text-sm font-bold flex items-center justify-center gap-2">{submitting && <Spinner light />} Submit Review</button>
        </div>
      )}
      {reviews.length > 1 && (
        <div className="flex gap-2 mb-3">{[["recent", "Most Recent"], ["highest", "Highest Rated"], ["lowest", "Lowest Rated"]].map(([k, l]) => <FilterChip key={k} label={l} active={sortBy === k} onClick={() => setSortBy(k)} />)}</div>
      )}
      {loading ? <Skeleton className="h-16 w-full" /> : reviews.length === 0 ? <p className="text-sm py-6 text-center" style={{ color: "var(--muted)" }}>Be the first to review this product.</p> : (
        <div className="space-y-4">
          {sorted.map((r) => (
            <div key={r.id} className="flex gap-3 sf-fade-in">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 sf-chip">{(r.profile?.full_name || "U")[0]?.toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{r.profile?.full_name || "ShopFlow Customer"}</p>
                  {r.is_verified_purchase && <span className="sf-chip text-[9px] font-bold px-1.5 py-0.5 rounded-full">VERIFIED PURCHASE</span>}
                  <Stars rating={r.rating} size={11} />
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--ink-soft)" }}>{r.comment}</p>
                <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================================================================== */
/*  CART                                                                */
/* ==================================================================== */

function CouponBox({ appliedCoupon, applyCoupon, removeCoupon }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault(); setError(""); if (!code.trim()) return; setBusy(true);
    try { await applyCoupon(code); setCode(""); } catch (e2) { setError(e2.message); } finally { setBusy(false); }
  };
  if (appliedCoupon) {
    return (
      <div className="sf-card rounded-2xl p-3.5 flex items-center justify-between" style={{ borderColor: "var(--primary)" }}>
        <div className="flex items-center gap-2"><Tag size={16} color="var(--primary)" /><div><p className="text-sm font-bold sf-mono">{appliedCoupon.code}</p><p className="text-[11px]" style={{ color: "var(--muted)" }}>You saved {money(appliedCoupon.discount)}</p></div></div>
        <button onClick={removeCoupon} className="sf-focus text-xs font-semibold" style={{ color: "#C23B2E" }}>Remove</button>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(e); }} placeholder="Enter coupon code" className="sf-input flex-1 uppercase" />
        <button onClick={submit} disabled={busy} className="sf-focus sf-btn-outline px-4 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5">{busy && <Spinner />} Apply</button>
      </div>
      {error && <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "#C23B2E" }}><AlertCircle size={12} /> {error}</p>}
    </div>
  );
}

function CartPage({ lines, savedItems, setCartQty, removeFromCart, saveForLater, moveToCart, subtotal, discount, tax, deliveryCharge, total, config, nav, appliedCoupon, applyCoupon, removeCoupon, onCheckout }) {
  if (lines.length === 0 && savedItems.length === 0) return <div className="p-4"><EmptyState icon={ShoppingCart} title="Your cart is empty" subtitle="Browse products and add your favourites here." actionLabel="Start Shopping" onAction={() => nav("home")} /></div>;
  return (
    <div className="p-4 pb-48 md:pb-6">
      <h1 className="sf-display font-semibold text-xl mb-4">My Cart ({lines.length})</h1>
      {lines.length > 0 ? <div className="space-y-3">
        {lines.map((l) => (
          <div key={l.productId} className="sf-card rounded-2xl p-3 flex gap-3">
            <img src={l.product.image} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col">
              <p className="text-sm font-semibold sf-line-clamp-2">{l.product.name}</p>
              <span className="sf-mono text-sm font-bold mt-1">{money(l.product.price)}</span>
              <div className="flex items-center justify-between mt-auto pt-1">
                <QtyStepper qty={l.qty} onDec={() => setCartQty(l.productId, l.qty - 1)} onInc={() => setCartQty(l.productId, l.qty + 1)} max={l.product.stock} />
                <div className="flex items-center gap-3">
                  <button onClick={() => saveForLater(l.productId)} className="sf-focus text-xs font-semibold flex items-center gap-1" style={{ color: "var(--muted)" }}><Bookmark size={13} /> Save</button>
                  <button onClick={() => removeFromCart(l.productId)} className="sf-focus text-xs font-semibold flex items-center gap-1" style={{ color: "#C23B2E" }}><Trash2 size={14} /> Remove</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> : <EmptyState icon={ShoppingCart} title="No items in cart" subtitle="Move something back from Saved for Later." />}

      {savedItems.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-bold mb-3">Saved for Later ({savedItems.length})</p>
          <div className="space-y-2.5">
            {savedItems.map((l) => (
              <div key={l.productId} className="sf-card rounded-2xl p-3 flex gap-3 items-center">
                <img src={l.product.image} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-xs font-semibold sf-line-clamp-2">{l.product.name}</p><span className="sf-mono text-xs font-bold">{money(l.product.price)}</span></div>
                <button onClick={() => moveToCart(l.productId)} className="sf-focus sf-btn-outline px-3 py-1.5 rounded-full text-xs font-bold">Move to Cart</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {lines.length > 0 && <>
        <div className="mt-6"><CouponBox appliedCoupon={appliedCoupon} applyCoupon={applyCoupon} removeCoupon={removeCoupon} /></div>
        <div className="sf-card rounded-2xl p-4 mt-4 space-y-2">
          <Row label="Subtotal" value={money(subtotal)} />
          {discount > 0 && <Row label="Coupon Discount" value={"-" + money(discount)} highlight />}
          <Row label="Tax" value={money(tax)} />
          <Row label="Delivery" value={deliveryCharge === 0 ? "FREE" : money(deliveryCharge)} highlight={deliveryCharge === 0} />
          <div className="border-t pt-2 mt-1" style={{ borderColor: "var(--border)" }}><Row label="Total" value={money(total)} bold /></div>
        </div>
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white border-t p-4 md:static md:border-0 md:p-0 md:mt-5" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <div className="hidden md:block flex-1" />
            <button onClick={onCheckout} className="sf-focus sf-btn-primary w-full md:w-auto md:px-10 rounded-full py-3.5 text-sm font-bold">Proceed to Checkout · {money(total)}</button>
          </div>
        </div>
      </>}
    </div>
  );
}
function Row({ label, value, bold, highlight }) {
  return <div className="flex items-center justify-between"><span className={"text-sm " + (bold ? "font-bold" : "")} style={{ color: bold ? "var(--ink)" : "var(--ink-soft)" }}>{label}</span><span className={"sf-mono " + (bold ? "text-base font-bold" : "text-sm font-semibold")} style={{ color: highlight ? "var(--primary)" : "var(--ink)" }}>{value}</span></div>;
}

function WishlistPage({ items, openProduct, addToCart, toggleWishlist, cart, nav }) {
  if (items.length === 0) return <div className="p-4"><EmptyState icon={Heart} title="Your wishlist is empty" subtitle="Tap the heart on any product to save it here." actionLabel="Discover Products" onAction={() => nav("home")} /></div>;
  return <div className="p-4"><h1 className="sf-display font-semibold text-xl mb-4">Wishlist ({items.length})</h1><ProductGrid products={items} openProduct={openProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={items.map((i) => i.id)} cart={cart} /></div>;
}

/* ==================================================================== */
/*  AUTH                                                                */
/* ==================================================================== */

function AuthPage({ onLogin, onSignup, onForgot, showToast }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault(); setError("");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      if (mode === "signup") { if (!name.trim()) { setError("Enter your name."); setBusy(false); return; } await onSignup(name, email, password); }
      else await onLogin(email, password);
    } catch (e2) { setError(e2.message || "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };
  const forgot = async () => {
    if (!email.includes("@")) return setError("Enter your email above first, then tap 'Forgot password'.");
    try { await onForgot(email); showToast("Password reset email sent, if that account exists."); } catch (e) { showToast("Couldn't send reset email.", "error"); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm sf-fade-in">
        <div className="text-center mb-7">
          <div className="inline-flex mb-3"><svg width="34" height="34" viewBox="0 0 26 26" fill="none"><path d="M4 15c3-6 6 6 9 0s6-6 9 0" stroke="#FF6B4A" strokeWidth="2.6" strokeLinecap="round" fill="none" /><circle cx="13" cy="13" r="11.3" stroke="#0F6D5C" strokeWidth="1.6" fill="none" /></svg></div>
          <h1 className="sf-display text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{mode === "login" ? "Log in to continue shopping" : "Join ShopFlow in a few seconds"}</p>
        </div>
        <div className="space-y-3">
          {mode === "signup" && <input className="sf-input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />}
          <input className="sf-input" placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="relative">
            <input className="sf-input pr-10" placeholder="Password (min 6 characters)" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(e); }} />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="sf-focus absolute right-3 top-1/2 -translate-y-1/2">{showPw ? <EyeOff size={16} color="var(--muted)" /> : <Eye size={16} color="var(--muted)" />}</button>
          </div>
          {mode === "login" && <button type="button" onClick={forgot} className="sf-focus text-xs font-semibold sf-link">Forgot password?</button>}
          {error && <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "#C23B2E" }}><AlertCircle size={13} /> {error}</p>}
          <button onClick={submit} disabled={busy} className="sf-focus sf-btn-primary w-full rounded-full py-3 text-sm font-bold mt-2 flex items-center justify-center gap-2">{busy && <Spinner light />} {mode === "login" ? "Log In" : "Sign Up"}</button>
        </div>
        <p className="text-center text-xs mt-5" style={{ color: "var(--muted)" }}>
          {mode === "login" ? "New to ShopFlow?" : "Already have an account?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="sf-focus font-semibold sf-link">{mode === "login" ? "Sign up" : "Log in"}</button>
        </p>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  PROFILE / NOTIFICATIONS                                             */
/* ==================================================================== */

function ProfilePage({ user, nav, logout, ordersCount, wishlistCount, addressesCount, unreadCount }) {
  if (!user) return <div className="p-4"><EmptyState icon={User} title="You're not logged in" subtitle="Log in to view your profile, orders and saved addresses." actionLabel="Log In / Sign Up" onAction={() => nav("auth")} /></div>;
  const menu = [
    { label: "My Orders", icon: Package, count: ordersCount, page: "orders" },
    { label: "Wishlist", icon: Heart, count: wishlistCount, page: "wishlist" },
    { label: "Saved Addresses", icon: MapPin, count: addressesCount, page: "addresses" },
    { label: "Notifications", icon: Bell, count: unreadCount, page: "notifications" },
  ];
  return (
    <div className="p-4">
      <div className="sf-card rounded-2xl p-5 flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold sf-chip">{user.name[0]?.toUpperCase()}</div>
        <div><p className="font-semibold text-[15px]">{user.name}</p><p className="text-xs" style={{ color: "var(--muted)" }}>{user.email}</p></div>
      </div>
      <div className="space-y-2.5">
        {menu.map((m) => (
          <button key={m.label} onClick={() => nav(m.page)} className="sf-focus sf-card w-full rounded-xl p-4 flex items-center justify-between">
            <span className="flex items-center gap-3 text-sm font-medium"><m.icon size={17} color="var(--primary)" /> {m.label}</span>
            <span className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>{m.count} <ChevronRight size={15} /></span>
          </button>
        ))}
        {user.isAdmin && <button onClick={() => nav("admin")} className="sf-focus sf-card w-full rounded-xl p-4 flex items-center justify-between"><span className="flex items-center gap-3 text-sm font-medium"><LayoutDashboard size={17} color="var(--primary)" /> Admin Dashboard</span><ChevronRight size={15} color="var(--muted)" /></button>}
      </div>
      <button onClick={logout} className="sf-focus w-full mt-6 rounded-full py-3 text-sm font-bold flex items-center justify-center gap-2" style={{ color: "#C23B2E", background: "#FDE8E6" }}><LogOut size={16} /> Logout</button>
      {!user.isAdmin && <button onClick={() => nav("admin")} className="sf-focus w-full mt-3 text-center text-xs" style={{ color: "var(--muted)" }}>Store owner? <span className="sf-link font-semibold">Go to Admin Dashboard</span></button>}
    </div>
  );
}

function NotificationsPage({ user, nav, notifications, markAllRead }) {
  if (!user) return <div className="p-4"><EmptyState icon={Bell} title="Log in to see notifications" actionLabel="Log In" onAction={() => nav("auth")} /></div>;
  if (notifications.length === 0) return <div className="p-4"><EmptyState icon={Bell} title="No notifications yet" subtitle="Order and account updates will show up here." /></div>;
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4"><h1 className="sf-display font-semibold text-xl">Notifications</h1><button onClick={markAllRead} className="sf-focus text-xs font-semibold sf-link">Mark all read</button></div>
      <div className="space-y-2.5">
        {notifications.map((n) => (
          <div key={n.id} className="sf-card rounded-xl p-3.5 flex gap-3" style={{ background: n.is_read ? "var(--surface)" : "var(--primary-light)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 sf-chip"><Bell size={15} color="var(--primary-dark)" /></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold">{n.title}</p><p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>{n.message}</p><p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>{new Date(n.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  ORDERS + TRACKING + RETURNS                                         */
/* ==================================================================== */

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  const Icon = s.icon;
  return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.fg }}><Icon size={12} /> {STATUS_LABEL[status] || status}</span>;
}
const TIMELINE_STEPS = [
  { status: "pending", label: "Order Placed" }, { status: "confirmed", label: "Confirmed" }, { status: "processing", label: "Processing" },
  { status: "packed", label: "Packed" }, { status: "shipped", label: "Shipped" }, { status: "out_for_delivery", label: "Out for Delivery" }, { status: "delivered", label: "Delivered" },
];
function OrderTimeline({ status }) {
  if (status === "cancelled" || status === "returned" || status === "refunded") {
    return <div className="flex items-center gap-3 py-3 px-1"><div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: STATUS_STYLE[status].bg }}><Ban size={16} color={STATUS_STYLE[status].fg} /></div><div><p className="text-sm font-semibold" style={{ color: STATUS_STYLE[status].fg }}>Order {STATUS_LABEL[status]}</p></div></div>;
  }
  const currentIndex = STATUS_FLOW.indexOf(status);
  return (
    <div className="py-2 px-1">
      {TIMELINE_STEPS.map((s, i) => {
        const done = i <= currentIndex; const isLast = i === TIMELINE_STEPS.length - 1; const Icon = STATUS_STYLE[s.status].icon;
        return (
          <div key={s.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: done ? "var(--primary)" : "var(--paper)", border: done ? "none" : "1.5px solid var(--border)" }}><Icon size={14} color={done ? "#fff" : "var(--muted)"} /></div>
              {!isLast && <div className="w-0.5 flex-1 my-0.5" style={{ background: i < currentIndex ? "var(--primary)" : "var(--border)", minHeight: 20 }} />}
            </div>
            <div className={isLast ? "pb-0.5" : "pb-4"}><p className="text-sm font-semibold" style={{ color: done ? "var(--ink)" : "var(--muted)" }}>{s.label}</p></div>
          </div>
        );
      })}
    </div>
  );
}

function ReturnForm({ order, onSubmit, onClose }) {
  const [itemId, setItemId] = useState(order.items[0]?.productId);
  const [reason, setReason] = useState("Damaged / defective item");
  const [description, setDescription] = useState("");
  return (
    <div className="sf-card rounded-2xl p-4 space-y-2.5 sf-fade-in mt-3">
      <p className="text-sm font-bold">Request Return</p>
      <select className="sf-input" value={itemId} onChange={(e) => setItemId(e.target.value)}>{order.items.map((it) => <option key={it.productId} value={it.productId}>{it.name}</option>)}</select>
      <select className="sf-input" value={reason} onChange={(e) => setReason(e.target.value)}>
        {["Damaged / defective item", "Wrong item received", "Item not as described", "No longer needed", "Other"].map((r) => <option key={r}>{r}</option>)}
      </select>
      <textarea className="sf-input" rows={2} placeholder="Add details (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex gap-2"><button onClick={onClose} className="sf-focus sf-btn-outline flex-1 rounded-full py-2.5 text-sm font-semibold">Cancel</button>
        <button onClick={() => onSubmit(itemId, reason, description)} className="sf-focus sf-btn-primary flex-1 rounded-full py-2.5 text-sm font-semibold">Submit Request</button></div>
    </div>
  );
}

function OrdersPage({ user, orders, nav, requireAuth, cancelOrder, reorder, requestReturn, returns, showInvoice, currency }) {
  useEffect(() => { requireAuth("orders"); }, []); // eslint-disable-line
  const [expanded, setExpanded] = useState(new Set());
  const [returningOrder, setReturningOrder] = useState(null);
  const toggle = (id) => setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (!user) return <div className="p-4"><EmptyState icon={Package} title="Log in to view your orders" actionLabel="Log In" onAction={() => nav("auth")} /></div>;
  if (orders.length === 0) return <div className="p-4"><EmptyState icon={Package} title="No orders yet" subtitle="Your placed orders will show up here." actionLabel="Start Shopping" onAction={() => nav("home")} /></div>;

  return (
    <div className="p-4">
      <h1 className="sf-display font-semibold text-xl mb-4">My Orders</h1>
      <div className="space-y-3">
        {orders.map((o) => {
          const isOpen = expanded.has(o.id);
          const hasReturn = returns.some((r) => r.order_id === o.id);
          const canCancel = ["pending", "confirmed"].includes(o.status);
          const canReturn = o.status === "delivered" && !hasReturn;
          return (
            <div key={o.id} className="sf-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2"><span className="sf-mono text-xs font-bold" style={{ color: "var(--muted)" }}>#{o.orderNumber}</span><StatusBadge status={o.status} /></div>
              <div className="flex -space-x-3 mb-2">{o.items.slice(0, 4).map((it, i) => <img key={i} src={it.image} className="w-11 h-11 rounded-lg border-2 border-white object-cover" />)}{o.items.length > 4 && <div className="w-11 h-11 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold">+{o.items.length - 4}</div>}</div>
              <p className="text-xs sf-line-clamp-2" style={{ color: "var(--ink-soft)" }}>{o.items.map((i) => i.name).join(", ")}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <span className="text-[11px]" style={{ color: "var(--muted)" }}>{new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="sf-mono text-sm font-bold">{money(o.total, currency)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => toggle(o.id)} className="sf-focus flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-full sf-btn-outline"><MapPin size={13} /> {isOpen ? "Hide Tracking" : "Track Order"}</button>
                <button onClick={() => showInvoice(o.id)} className="sf-focus flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-full sf-btn-outline"><Printer size={13} /> Invoice</button>
                <button onClick={() => reorder(o)} className="sf-focus flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-full sf-btn-outline"><RotateCcw size={13} /> Reorder</button>
                {canCancel && <button onClick={() => cancelOrder(o.id)} className="sf-focus flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-full" style={{ color: "#C23B2E", background: "#FDE8E6" }}><XCircle size={13} /> Cancel</button>}
                {canReturn && <button onClick={() => setReturningOrder(returningOrder === o.id ? null : o.id)} className="sf-focus flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-full sf-btn-outline"><RotateCcw size={13} /> Return</button>}
                {hasReturn && <span className="flex items-center justify-center text-xs font-bold py-2" style={{ color: "var(--muted)" }}>Return requested</span>}
              </div>
              {isOpen && <div className="mt-1 sf-fade-in"><OrderTimeline status={o.status} /></div>}
              {returningOrder === o.id && <ReturnForm order={o} onClose={() => setReturningOrder(null)} onSubmit={(itemId, reason, desc) => { const item = o.items.find((it) => it.productId === itemId); requestReturn(o.id, item?.id, reason, desc); setReturningOrder(null); }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  INVOICE                                                             */
/* ==================================================================== */

function InvoiceModal({ order, config, onClose }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-[150] bg-black/50 flex items-end md:items-center justify-center p-0 md:p-6 sf-no-print">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sf-invoice p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="sf-display text-xl font-bold">{config.storeName}</h2><span className="text-xs" style={{ color: "var(--muted)" }}>Invoice</span></div>
          <div className="text-xs space-y-0.5 mb-4" style={{ color: "var(--ink-soft)" }}>
            <p>Order #{order.orderNumber}</p><p>Date: {new Date(order.date).toLocaleDateString("en-IN")}</p>
            <p>Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"} ({order.paymentStatus})</p>
          </div>
          <div className="text-xs mb-4 p-3 rounded-lg" style={{ background: "var(--paper)" }}>
            <p className="font-semibold mb-0.5">Deliver to:</p><p>{order.address.fullName}, {order.address.phone}</p><p>{order.address.line1}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
          </div>
          <table className="w-full text-xs mb-4"><thead><tr className="border-b" style={{ borderColor: "var(--border)" }}><th className="text-left py-1.5">Item</th><th className="text-right py-1.5">Qty</th><th className="text-right py-1.5">Price</th></tr></thead>
            <tbody>{order.items.map((it) => <tr key={it.id} className="border-b" style={{ borderColor: "var(--border)" }}><td className="py-1.5 pr-2">{it.name}</td><td className="text-right py-1.5">{it.qty}</td><td className="text-right py-1.5 sf-mono">{money(it.price * it.qty, config.currency)}</td></tr>)}</tbody>
          </table>
          <div className="space-y-1 text-xs">
            <Row label="Subtotal" value={money(order.subtotal, config.currency)} />
            {order.discount > 0 && <Row label="Discount" value={"-" + money(order.discount, config.currency)} />}
            <Row label="Tax" value={money(order.tax, config.currency)} />
            <Row label="Shipping" value={order.deliveryCharge === 0 ? "FREE" : money(order.deliveryCharge, config.currency)} />
            <div className="border-t pt-1.5 mt-1.5" style={{ borderColor: "var(--border)" }}><Row label="Total" value={money(order.total, config.currency)} bold /></div>
          </div>
        </div>
        <div className="sf-no-print p-4 pt-0 flex gap-2"><button onClick={onClose} className="sf-focus sf-btn-outline flex-1 rounded-full py-2.5 text-sm font-semibold">Close</button><button onClick={() => window.print()} className="sf-focus sf-btn-primary flex-1 rounded-full py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5"><Printer size={14} /> Print / Download</button></div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  ADDRESSES                                                           */
/* ==================================================================== */

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
      <div className="grid grid-cols-2 gap-2.5"><input className="sf-input" placeholder="City" value={form.city} onChange={set("city")} /><input className="sf-input" placeholder="State" value={form.state} onChange={set("state")} /></div>
      <input className="sf-input" placeholder="Pincode" value={form.pincode} onChange={set("pincode")} />
      <div className="flex gap-2 pt-1"><button onClick={onCancel} className="sf-focus sf-btn-outline flex-1 rounded-full py-2.5 text-sm font-semibold">Cancel</button><button disabled={!valid} onClick={() => onSave(form)} className="sf-focus sf-btn-primary flex-1 rounded-full py-2.5 text-sm font-semibold disabled:opacity-40">Save Address</button></div>
    </div>
  );
}

function AddressesPage({ addresses, setAddresses, user, nav, requireAuth, showToast, embedded, onSelect, selectedId, token }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  useEffect(() => { if (!embedded) requireAuth("addresses"); }, []); // eslint-disable-line
  if (!embedded && !user) return <div className="p-4"><EmptyState icon={MapPin} title="Log in to manage addresses" actionLabel="Log In" onAction={() => nav("auth")} /></div>;

  const save = async (addr) => {
    try {
      if (editingId) {
        await rest("sf_addresses", { method: "PATCH", token, query: `?id=eq.${editingId}`, body: { full_name: addr.fullName, phone: addr.phone, line1: addr.line1, city: addr.city, state: addr.state, pincode: addr.pincode } });
        setAddresses((a) => a.map((x) => (x.id === editingId ? { ...x, ...addr } : x)));
        setEditingId(null);
      } else {
        const rows = await rest("sf_addresses", { method: "POST", token, prefer: "return=representation", body: { user_id: user.id, full_name: addr.fullName, phone: addr.phone, line1: addr.line1, city: addr.city, state: addr.state, pincode: addr.pincode, is_default: addresses.length === 0 } });
        const newAddr = mapAddress(rows[0]);
        setAddresses((a) => [...a, newAddr]);
        if (onSelect) onSelect(newAddr.id);
      }
      setAdding(false); showToast && showToast("Address saved");
    } catch (e) { showToast && showToast("Couldn't save address.", "error"); }
  };
  const remove = async (id) => { setAddresses((a) => a.filter((x) => x.id !== id)); try { await rest("sf_addresses", { method: "DELETE", token, query: `?id=eq.${id}` }); } catch (e) {} };
  const makeDefault = async (id) => { setAddresses((a) => a.map((x) => ({ ...x, isDefault: x.id === id }))); try { await Promise.all(addresses.map((x) => rest("sf_addresses", { method: "PATCH", token, query: `?id=eq.${x.id}`, body: { is_default: x.id === id } }))); } catch (e) {} };

  return (
    <div className={embedded ? "" : "p-4"}>
      {!embedded && <h1 className="sf-display font-semibold text-xl mb-4">Saved Addresses</h1>}
      <div className="space-y-3">
        {addresses.map((a) => editingId === a.id ? <AddressForm key={a.id} initial={a} onSave={save} onCancel={() => setEditingId(null)} /> : (
          <div key={a.id} onClick={() => onSelect && onSelect(a.id)} className={"sf-card rounded-2xl p-4 " + (onSelect ? "cursor-pointer" : "")} style={selectedId === a.id ? { borderColor: "var(--primary)", boxShadow: "0 0 0 1.5px var(--primary)" } : {}}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2.5"><MapPin size={16} color="var(--primary)" className="mt-0.5 shrink-0" />
                <div><p className="text-sm font-semibold flex items-center gap-2">{a.fullName} {a.isDefault && <span className="sf-chip text-[10px] font-bold px-1.5 py-0.5 rounded-full">DEFAULT</span>}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>{a.line1}, {a.city}, {a.state} - {a.pincode}</p><p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{a.phone}</p></div>
              </div>{selectedId === a.id && <CheckCircle2 size={18} color="var(--primary)" />}
            </div>
            <div className="flex gap-4 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={(e) => { e.stopPropagation(); setEditingId(a.id); }} className="sf-focus text-xs font-semibold flex items-center gap-1 sf-link"><Pencil size={12} /> Edit</button>
              <button onClick={(e) => { e.stopPropagation(); remove(a.id); }} className="sf-focus text-xs font-semibold flex items-center gap-1" style={{ color: "#C23B2E" }}><Trash2 size={12} /> Delete</button>
              {!a.isDefault && <button onClick={(e) => { e.stopPropagation(); makeDefault(a.id); }} className="sf-focus text-xs font-semibold" style={{ color: "var(--muted)" }}>Make default</button>}
            </div>
          </div>
        ))}
      </div>
      {adding ? <div className="mt-3"><AddressForm onSave={save} onCancel={() => setAdding(false)} /></div> : <button onClick={() => setAdding(true)} className="sf-focus sf-btn-outline w-full rounded-2xl py-3 mt-3 text-sm font-semibold flex items-center justify-center gap-2"><PlusCircle size={16} /> Add New Address</button>}
      {addresses.length === 0 && !adding && <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>You have no saved addresses yet.</p>}
    </div>
  );
}

/* ==================================================================== */
/*  MULTI-STEP CHECKOUT                                                 */
/* ==================================================================== */

function CheckoutPage({ lines, addresses, setAddresses, checkoutAddressId, setCheckoutAddressId, subtotal, discount, tax, deliveryCharge, total, config, appliedCoupon, applyCoupon, removeCoupon, onPlaceOrder, processing, showToast, token }) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  useEffect(() => { if (!checkoutAddressId && addresses.length > 0) setCheckoutAddressId((addresses.find((a) => a.isDefault) || addresses[0]).id); }, [addresses]); // eslint-disable-line

  if (lines.length === 0) return <div className="p-4"><EmptyState icon={ShoppingBag} title="Nothing to checkout" subtitle="Add items to your cart first." /></div>;

  const steps = ["Address", "Delivery", "Payment", "Review"];
  const canNext = (step === 1 && checkoutAddressId) || step === 2 || (step === 3 && paymentMethod) || step === 4;

  return (
    <div className="p-4 pb-40">
      <h1 className="sf-display font-semibold text-xl mb-4">Checkout</h1>
      <div className="flex items-center gap-1.5 mb-6">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: step > i + 1 ? "var(--primary)" : step === i + 1 ? "var(--primary-light)" : "var(--paper)", color: step > i + 1 ? "#fff" : step === i + 1 ? "var(--primary-dark)" : "var(--muted)", border: step === i + 1 ? "1.5px solid var(--primary)" : "1.5px solid var(--border)" }}>{step > i + 1 ? <Check size={13} /> : i + 1}</div>
              <span className="text-[10px] font-semibold hidden sm:block" style={{ color: step >= i + 1 ? "var(--ink)" : "var(--muted)" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-0.5" style={{ background: step > i + 1 ? "var(--primary)" : "var(--border)" }} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <section>
          <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5"><MapPin size={15} color="var(--primary)" /> Delivery Address</h2>
          <AddressesPage embedded addresses={addresses} setAddresses={setAddresses} onSelect={setCheckoutAddressId} selectedId={checkoutAddressId} showToast={showToast} token={token} />
        </section>
      )}
      {step === 2 && (
        <section>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5"><Truck size={15} color="var(--primary)" /> Delivery Method</h2>
          <div className="sf-card rounded-2xl p-4 flex items-center justify-between" style={{ borderColor: "var(--primary)", boxShadow: "0 0 0 1.5px var(--primary)" }}>
            <div><p className="text-sm font-semibold">Standard Delivery</p><p className="text-xs" style={{ color: "var(--muted)" }}>Arrives in 3-5 business days</p></div>
            <span className="text-sm font-bold sf-mono">{deliveryCharge === 0 ? "FREE" : money(deliveryCharge)}</span>
          </div>
        </section>
      )}
      {step === 3 && (
        <section>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5"><CreditCard size={15} color="var(--primary)" /> Payment Method</h2>
          <div className="space-y-2">
            <PaymentOption icon={Banknote} label="Cash on Delivery" desc="Pay when your order arrives" value="cod" selected={paymentMethod} onSelect={setPaymentMethod} />
            <PaymentOption icon={Wallet} label="Demo Online Payment" desc="Simulated card / UPI payment — no real charge" value="online" selected={paymentMethod} onSelect={setPaymentMethod} />
          </div>
        </section>
      )}
      {step === 4 && (
        <section className="space-y-4">
          <div><h2 className="text-sm font-bold mb-2">Order Summary</h2>
            <div className="sf-card rounded-2xl p-4 space-y-3">
              {lines.map((l) => <div key={l.productId} className="flex items-center gap-3"><img src={l.product.image} className="w-12 h-12 rounded-lg object-cover" /><div className="flex-1 min-w-0"><p className="text-xs font-semibold sf-line-clamp-2">{l.product.name}</p><p className="text-[11px]" style={{ color: "var(--muted)" }}>Qty {l.qty}</p></div><span className="sf-mono text-xs font-bold">{money(l.product.price * l.qty)}</span></div>)}
              <div className="pt-1"><CouponBox appliedCoupon={appliedCoupon} applyCoupon={applyCoupon} removeCoupon={removeCoupon} /></div>
              <div className="border-t pt-2 space-y-1.5" style={{ borderColor: "var(--border)" }}>
                <Row label="Subtotal" value={money(subtotal)} />{discount > 0 && <Row label="Coupon Discount" value={"-" + money(discount)} highlight />}
                <Row label="Tax" value={money(tax)} /><Row label="Delivery" value={deliveryCharge === 0 ? "FREE" : money(deliveryCharge)} highlight={deliveryCharge === 0} />
                <Row label="Total" value={money(total)} bold />
              </div>
            </div>
          </div>
          <div className="sf-card rounded-2xl p-4 text-xs space-y-1" style={{ color: "var(--ink-soft)" }}>
            <p className="font-semibold" style={{ color: "var(--ink)" }}>Delivering to</p>
            <p>{addresses.find((a) => a.id === checkoutAddressId)?.fullName}, {addresses.find((a) => a.id === checkoutAddressId)?.line1}, {addresses.find((a) => a.id === checkoutAddressId)?.city}</p>
            <p className="pt-1 font-semibold" style={{ color: "var(--ink)" }}>Paying via {paymentMethod === "cod" ? "Cash on Delivery" : "Demo Online Payment"}</p>
          </div>
        </section>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t p-4" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto flex gap-3">
          {step > 1 && <button onClick={() => setStep((s) => s - 1)} className="sf-focus sf-btn-outline px-6 rounded-full py-3.5 text-sm font-bold">Back</button>}
          {step < 4 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="sf-focus sf-btn-primary flex-1 rounded-full py-3.5 text-sm font-bold disabled:opacity-40">Continue</button>
          ) : (
            <button onClick={() => onPlaceOrder({ addressId: checkoutAddressId, paymentMethod })} disabled={processing} className="sf-focus sf-btn-accent flex-1 rounded-full py-3.5 text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2">
              {processing ? <>Placing Order <Spinner light /></> : `Place Order · ${money(total)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
function PaymentOption({ icon: Icon, label, desc, value, selected, onSelect }) {
  const active = selected === value;
  return (
    <button onClick={() => onSelect(value)} className="sf-focus sf-card w-full rounded-2xl p-4 flex items-center gap-3 text-left" style={active ? { borderColor: "var(--primary)", boxShadow: "0 0 0 1.5px var(--primary)" } : {}}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center sf-chip shrink-0"><Icon size={18} color="var(--primary-dark)" /></div>
      <div className="flex-1"><p className="text-sm font-semibold">{label}</p><p className="text-xs" style={{ color: "var(--muted)" }}>{desc}</p></div>
      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: active ? "var(--primary)" : "var(--border)" }}>{active && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />}</div>
    </button>
  );
}

function OrderSuccessPage({ orderId, nav }) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 sf-fade-in" style={{ background: "var(--primary-light)" }}><CheckCircle2 size={40} color="var(--primary)" /></div>
      <h1 className="sf-display text-2xl font-semibold">Order Placed!</h1>
      <p className="text-sm mt-2" style={{ color: "var(--ink-soft)" }}>Thank you — your order has been confirmed.</p>
      <div className="flex flex-col gap-2.5 w-full max-w-xs mt-8"><button onClick={() => nav("orders")} className="sf-focus sf-btn-primary rounded-full py-3 text-sm font-bold">Track My Order</button><button onClick={() => nav("home")} className="sf-focus sf-btn-outline rounded-full py-3 text-sm font-bold">Continue Shopping</button></div>
    </div>
  );
}

/* ==================================================================== */
/*  ADMIN DASHBOARD                                                     */
/* ==================================================================== */

function AdminLogin({ onAdminLogin, nav }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault(); setError(""); setBusy(true);
    try { await onAdminLogin(email, password); } catch (e2) { setError(e2.message || "Invalid credentials."); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--ink)" }}>
      <div className="w-full max-w-sm sf-fade-in">
        <div className="text-center mb-6"><div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--primary)" }}><LayoutDashboard size={22} color="#fff" /></div>
          <h1 className="sf-display text-xl font-semibold text-white">Admin Dashboard</h1><p className="text-xs mt-1" style={{ color: "#9AAAA6" }}>Store management access</p></div>
        <div className="space-y-2.5">
          <input className="sf-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" />
          <input className="sf-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" onKeyDown={(e) => { if (e.key === "Enter") submit(e); }} />
          {error && <p className="text-xs font-medium" style={{ color: "#FF8A75" }}>{error}</p>}
          <button onClick={submit} disabled={busy} className="sf-focus sf-btn-primary w-full rounded-full py-3 text-sm font-bold flex items-center justify-center gap-2">{busy && <Spinner light />} Log In</button>
        </div>
        <p className="text-center text-[11px] mt-4" style={{ color: "#7C8B87" }}>Use your ShopFlow account — it must have admin or staff access.</p>
        <button onClick={() => nav("home")} className="sf-focus block mx-auto mt-4 text-xs font-semibold" style={{ color: "#9AAAA6" }}>← Back to store</button>
      </div>
    </div>
  );
}

function AdminDashboard({ user, onAdminLogin, onLoad, products, categories, orders, customers, returnsList, saveProduct, deleteProduct, addCategory, deleteCategory, updateOrderStatus, updateReturnStatus, nav, logout, showToast, config, saveSettings, token }) {
  const [tab, setTab] = useState("overview");
  useEffect(() => { if (user?.isAdmin) onLoad(); }, [user?.isAdmin]); // eslint-disable-line

  if (!user) return <AdminLogin onAdminLogin={onAdminLogin} nav={nav} />;
  if (!user.isAdmin) return (
    <div className="min-h-screen flex items-center justify-center p-6"><EmptyState icon={ShieldCheck} title="No admin access" subtitle={`${user.email} doesn't have admin or staff permissions on this account.`} actionLabel="Back to Store" onAction={() => nav("home")} /></div>
  );

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 }, { key: "products", label: "Products", icon: Package },
    { key: "categories", label: "Categories", icon: Grid3x3 }, { key: "orders", label: "Orders", icon: ShoppingCart },
    { key: "returns", label: "Returns", icon: RotateCcw }, { key: "customers", label: "Customers", icon: Users },
    { key: "settings", label: "Settings", icon: SettingsIcon },
  ];
  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <div className="bg-white border-b sticky top-0 z-30" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}><LayoutDashboard size={16} color="#fff" /></div><span className="sf-display font-semibold text-[17px]">{config.storeName} Admin</span></div>
          <div className="flex items-center gap-2"><button onClick={() => nav("home")} className="sf-focus sf-btn-outline px-3 py-1.5 rounded-full text-xs font-semibold">View Store</button><button onClick={logout} className="sf-focus px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1" style={{ color: "#C23B2E", background: "#FDE8E6" }}><LogOut size={13} /> Logout</button></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sf-scroll-x flex gap-1 pb-1">
          {tabs.map((t) => <button key={t.key} onClick={() => setTab(t.key)} className="sf-focus shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2" style={{ borderColor: tab === t.key ? "var(--primary)" : "transparent", color: tab === t.key ? "var(--primary-dark)" : "var(--muted)" }}><t.icon size={14} /> {t.label}</button>)}
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-4">
        {tab === "overview" && <AdminOverview products={products} orders={orders} customers={customers} categories={categories} config={config} />}
        {tab === "products" && <AdminProducts products={products} categories={categories} saveProduct={saveProduct} deleteProduct={deleteProduct} showToast={showToast} />}
        {tab === "categories" && <AdminCategories categories={categories} products={products} addCategory={addCategory} deleteCategory={deleteCategory} showToast={showToast} />}
        {tab === "orders" && <AdminOrders orders={orders} updateOrderStatus={updateOrderStatus} config={config} />}
        {tab === "returns" && <AdminReturns returnsList={returnsList} updateReturnStatus={updateReturnStatus} />}
        {tab === "customers" && <AdminCustomers customers={customers} orders={orders} />}
        {tab === "settings" && <AdminSettings config={config} saveSettings={saveSettings} />}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return <div className="sf-card rounded-2xl p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{label}</span><Icon size={15} color="var(--primary)" /></div><p className="sf-mono text-xl font-bold">{value}</p></div>;
}

function AdminOverview({ products, orders, customers, categories, config }) {
  const [range, setRange] = useState("all");
  const now = Date.now();
  const rangeMs = { today: 864e5, "7d": 7 * 864e5, "30d": 30 * 864e5, "90d": 90 * 864e5, all: Infinity }[range];
  const filteredOrders = orders.filter((o) => now - new Date(o.date).getTime() <= rangeMs && o.status !== "cancelled");

  const revenue = filteredOrders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const aov = filteredOrders.length ? revenue / filteredOrders.length : 0;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter((p) => p.stock === 0);

  const salesByDay = useMemo(() => {
    const days = 7; const arr = Array.from({ length: days }).map((_, i) => { const d = new Date(now - (days - 1 - i) * 864e5); return { key: d.toDateString(), label: d.toLocaleDateString("en-IN", { weekday: "short" }), revenue: 0 }; });
    orders.forEach((o) => { if (o.status === "cancelled") return; const key = new Date(o.date).toDateString(); const day = arr.find((d) => d.key === key); if (day) day.revenue += o.total; });
    return arr;
  }, [orders]);

  const topProducts = useMemo(() => {
    const counts = {};
    orders.forEach((o) => o.items.forEach((it) => { counts[it.name] = (counts[it.name] || 0) + it.qty; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, qty]) => ({ name: name.length > 14 ? name.slice(0, 14) + "…" : name, qty }));
  }, [orders]);

  return (
    <div className="space-y-5">
      <div className="sf-scroll-x flex gap-2">{[["today", "Today"], ["7d", "7 Days"], ["30d", "30 Days"], ["90d", "3 Months"], ["all", "All Time"]].map(([k, l]) => <FilterChip key={k} label={l} active={range === k} onClick={() => setRange(k)} />)}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue" value={money(revenue, config.currency)} icon={Banknote} />
        <StatCard label="Orders" value={filteredOrders.length} icon={ShoppingCart} />
        <StatCard label="Avg Order Value" value={money(aov, config.currency)} icon={BarChart3} />
        <StatCard label="Customers" value={customers.length} icon={Users} />
        <StatCard label="Pending Orders" value={pending} icon={Clock} />
        <StatCard label="Delivered" value={delivered} icon={PackageCheck} />
        <StatCard label="Cancelled" value={cancelled} icon={Ban} />
        <StatCard label="Products Listed" value={products.length} icon={Package} />
      </div>
      <div className="sf-card rounded-2xl p-4"><p className="text-sm font-bold mb-3">Daily Sales (Last 7 Days)</p>
        <div style={{ width: "100%", height: 200 }}><ResponsiveContainer><LineChart data={salesByDay}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} /><Line type="monotone" dataKey="revenue" stroke="#0F6D5C" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>
      </div>
      <div className="sf-card rounded-2xl p-4"><p className="text-sm font-bold mb-3">Top Selling Products</p>
        <div style={{ width: "100%", height: 220 }}><ResponsiveContainer><BarChart data={topProducts}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} /><Bar dataKey="qty" fill="#FF6B4A" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="sf-card rounded-2xl p-4"><p className="text-sm font-bold mb-3 flex items-center gap-1.5"><AlertCircle size={15} color="#B4600D" /> Stock Alerts</p>
          <div className="space-y-2">{outOfStock.map((p) => <div key={p.id} className="flex items-center justify-between text-xs"><span className="font-medium sf-line-clamp-2">{p.name}</span><span className="font-bold px-2 py-0.5 rounded-full" style={{ background: "#FDE8E6", color: "#C23B2E" }}>Out of stock</span></div>)}
            {lowStock.map((p) => <div key={p.id} className="flex items-center justify-between text-xs"><span className="font-medium sf-line-clamp-2">{p.name}</span><span className="font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF3E6", color: "#B4600D" }}>{p.stock} left</span></div>)}
          </div>
        </div>
      )}
    </div>
  );
}

function emptyProduct(categories) { return { name: "", category: categories[0]?.id || "", price: "", mrp: "", stock: "", desc: "", sku: "", image: "", featured: false, bestseller: false, newArrival: false }; }

function AdminProducts({ products, categories, saveProduct, deleteProduct, showToast }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setDraft(editing ? { ...editing, category: editing.category, image: editing.image, featured: editing.featured, bestseller: editing.bestseller, newArrival: editing.newArrival } : creating ? emptyProduct(categories) : null); }, [editing, creating]); // eslint-disable-line

  const startEdit = (p) => { setCreating(false); setEditing(p); };
  const startCreate = () => { setEditing(null); setCreating(true); };
  const close = () => { setEditing(null); setCreating(false); };
  const submit = async () => {
    if (!draft.name || !draft.price || draft.stock === "") return;
    setBusy(true);
    await saveProduct({ ...draft, price: Number(draft.price), mrp: Number(draft.mrp) || Number(draft.price), stock: Number(draft.stock) }, editing?.id);
    setBusy(false); close();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4"><p className="text-sm font-bold">{products.length} products</p><button onClick={startCreate} className="sf-focus sf-btn-primary px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5"><PlusCircle size={14} /> Add Product</button></div>
      {draft && (
        <div className="sf-card rounded-2xl p-4 mb-4 space-y-2.5 sf-fade-in">
          <p className="text-sm font-bold mb-1">{editing ? "Edit Product" : "New Product"}</p>
          <input className="sf-input" placeholder="Product name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2.5">
            <select className="sf-input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <input className="sf-input" placeholder="Stock" type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2.5"><input className="sf-input" placeholder="Price (₹)" type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /><input className="sf-input" placeholder="MRP (₹)" type="number" value={draft.mrp} onChange={(e) => setDraft({ ...draft, mrp: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2.5"><input className="sf-input" placeholder="SKU (optional)" value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} /><input className="sf-input" placeholder="Image URL" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} /></div>
          <textarea className="sf-input" placeholder="Description" rows={2} value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} />
          <div className="flex gap-4 pt-1 text-xs font-semibold">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} /> Featured</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={draft.bestseller} onChange={(e) => setDraft({ ...draft, bestseller: e.target.checked })} /> Best Seller</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={draft.newArrival} onChange={(e) => setDraft({ ...draft, newArrival: e.target.checked })} /> New Arrival</label>
          </div>
          <div className="flex gap-2 pt-1"><button onClick={close} className="sf-focus sf-btn-outline flex-1 rounded-full py-2.5 text-sm font-semibold">Cancel</button><button disabled={busy} onClick={submit} className="sf-focus sf-btn-primary flex-1 rounded-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2">{busy && <Spinner light />} Save</button></div>
        </div>
      )}
      <div className="space-y-2.5">
        {products.map((p) => (
          <div key={p.id} className="sf-card rounded-xl p-3 flex items-center gap-3">
            <img src={p.image} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold sf-line-clamp-2">{p.name}</p><p className="text-xs" style={{ color: "var(--muted)" }}>{money(p.price)} · Stock {p.stock} · {categories.find((c) => c.id === p.category)?.name}</p></div>
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
      <div className="flex gap-2 mb-4"><input className="sf-input" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} /><button onClick={() => { if (!name.trim()) return; addCategory(name.trim()); setName(""); }} className="sf-focus sf-btn-primary px-4 rounded-full text-xs font-bold shrink-0">Add</button></div>
      <div className="space-y-2.5">{categories.map((c) => <div key={c.id} className="sf-card rounded-xl p-3.5 flex items-center justify-between"><div><p className="text-sm font-semibold">{c.name}</p><p className="text-xs" style={{ color: "var(--muted)" }}>{products.filter((p) => p.category === c.id).length} products</p></div><button onClick={() => deleteCategory(c.dbId, c.id)} className="sf-focus w-8 h-8 rounded-full flex items-center justify-center active:bg-gray-100"><Trash2 size={15} color="#C23B2E" /></button></div>)}</div>
    </div>
  );
}

function AdminOrders({ orders, updateOrderStatus, config }) {
  const [q, setQ] = useState(""); const [statusFilter, setStatusFilter] = useState("all");
  const filtered = orders.filter((o) => (statusFilter === "all" || o.status === statusFilter) && (!q || o.orderNumber.toLowerCase().includes(q.toLowerCase())));
  if (orders.length === 0) return <EmptyState icon={ShoppingCart} title="No orders yet" subtitle="Orders placed by customers will appear here." />;
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input className="sf-input flex-1" placeholder="Search order number..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="sf-input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All Status</option>{[...STATUS_FLOW, "cancelled", "returned", "refunded"].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
      </div>
      <div className="space-y-3">
        {filtered.map((o) => (
          <div key={o.id} className="sf-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2"><span className="sf-mono text-xs font-bold">#{o.orderNumber}</span><StatusBadge status={o.status} /></div>
            <p className="text-xs sf-line-clamp-2 mb-1" style={{ color: "var(--ink-soft)" }}>{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{o.address.fullName} · {o.address.city}, {o.address.state} · {o.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <span className="sf-mono text-sm font-bold">{money(o.total, config.currency)}</span>
              <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="sf-input py-1.5 text-xs w-auto">{[...STATUS_FLOW, "cancelled"].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReturns({ returnsList, updateReturnStatus }) {
  if (returnsList.length === 0) return <EmptyState icon={RotateCcw} title="No return requests" subtitle="Customer return/refund requests will appear here." />;
  return (
    <div className="space-y-3">
      {returnsList.map((r) => (
        <div key={r.id} className="sf-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold" style={{ color: "var(--muted)" }}>Order #{r.order?.order_number}</span><StatusBadge status={r.status === "requested" ? "pending" : r.status === "approved" ? "confirmed" : r.status === "rejected" ? "cancelled" : "delivered"} /></div>
          <p className="text-sm font-semibold">{r.item?.product_name}</p>
          <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>{r.reason}{r.description ? ` — ${r.description}` : ""}</p>
          {r.status === "requested" && (
            <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => updateReturnStatus(r.id, "rejected")} className="sf-focus flex-1 rounded-full py-2 text-xs font-bold" style={{ color: "#C23B2E", background: "#FDE8E6" }}>Reject</button>
              <button onClick={() => updateReturnStatus(r.id, "approved", (r.item?.price || 0) * (r.item?.quantity || 1))} className="sf-focus flex-1 rounded-full py-2 text-xs font-bold sf-btn-primary">Approve &amp; Refund</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AdminCustomers({ customers, orders }) {
  return (
    <div className="space-y-2.5">
      {customers.map((c) => {
        const custOrders = orders.filter((o) => o.userId === c.id);
        const spend = custOrders.reduce((s, o) => s + o.total, 0);
        return (
          <div key={c.id} className="sf-card rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm sf-chip shrink-0">{(c.full_name || "U")[0]?.toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold flex items-center gap-2">{c.full_name || "—"} {c.role !== "customer" && <span className="sf-chip text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">{c.role}</span>}{!c.is_active && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FDE8E6", color: "#C23B2E" }}>INACTIVE</span>}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{custOrders.length} orders · {money(spend)} spent</p></div>
            <span className="text-[11px]" style={{ color: "var(--muted)" }}>Joined {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        );
      })}
    </div>
  );
}

function AdminSettings({ config, saveSettings }) {
  const [form, setForm] = useState({ store_name: config.storeName, contact_email: config.contactEmail || "", contact_phone: config.contactPhone || "", address: config.address || "", tax_percent: config.taxPercent, free_delivery_threshold: config.freeDeliveryThreshold, delivery_charge: config.deliveryCharge });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => { if (e && e.preventDefault) e.preventDefault(); setBusy(true); await saveSettings(form); setBusy(false); };
  return (
    <div className="sf-card rounded-2xl p-4 space-y-3 max-w-md">
      <p className="text-sm font-bold mb-1">Store Settings</p>
      <div><label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Store Name</label><input className="sf-input mt-1" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} /></div>
      <div><label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Contact Email</label><input className="sf-input mt-1" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
      <div><label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Contact Phone</label><input className="sf-input mt-1" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
      <div><label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Store Address</label><input className="sf-input mt-1" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      <div className="grid grid-cols-3 gap-2.5">
        <div><label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Tax %</label><input type="number" className="sf-input mt-1" value={form.tax_percent} onChange={(e) => setForm({ ...form, tax_percent: e.target.value })} /></div>
        <div><label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Free Delivery Above</label><input type="number" className="sf-input mt-1" value={form.free_delivery_threshold} onChange={(e) => setForm({ ...form, free_delivery_threshold: e.target.value })} /></div>
        <div><label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Delivery Charge</label><input type="number" className="sf-input mt-1" value={form.delivery_charge} onChange={(e) => setForm({ ...form, delivery_charge: e.target.value })} /></div>
      </div>
      <button onClick={submit} disabled={busy} className="sf-focus sf-btn-primary w-full rounded-full py-2.5 text-sm font-bold flex items-center justify-center gap-2">{busy && <Spinner light />} Save Settings</button>
    </div>
  );
}
