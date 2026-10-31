"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const menus = [
 {title:'Produksi / PPIC',description:'Resep, rencana produksi, pemakaian aktual dan hasil kemasan jual.',href:'/admin/production',number:'07',symbol:''},
 {title:'Stok Opname Tim',description:'Daftar SKU Master Product dan stok fisik barang jual.',href:'/admin/stocktake',number:'08',symbol:''},
 {title:'Laporan Direksi',description:'Penjualan, P&L, persediaan dan produksi dalam PDF / PowerPoint.',href:'/admin/reports',number:'09',symbol:''},
  { title: "Stok Bahan & Barang Jadi", description: "Stok tersedia, nilai persediaan, produksi, dan pengingat stok menipis.", href: "/admin/dashboard?view=stock", number: "06", symbol: "" },
  {
    title: "Setting Promo",
    description: "Atur kode promo checkout, potongan harga, ongkir, dan periode berlaku.",
    href: "/admin/promos",
    number: "05",
    symbol: "%",
  },
  {
    title: "Admin Dashboard",
    description: "Dashboard utama dan kontrol data VARTANA.",
    href: "/admin/dashboard",
    number: "01",
    symbol: "▦",
  },
  {
    title: "Admin Operations",
    description: "Administrasi dan aktivitas operasional.",
    href: "/admin/operations",
    number: "02",
    symbol: "⚙",
  },
  {
    title: "Master Product",
    description: "Pengelolaan SKU, varian, harga, dan data produk VARTANA.",
    href: "/admin/master-product",
    number: "03",
    symbol: "◇",
  },
  {
    title: "Kemitraan Konsinyasi",
    description: "Pengelolaan mitra, stok titipan, dan dokumen konsinyasi.",
    href: "/admin/konsinyasi",
    number: "04",
    symbol: "◇",
  },
];

function MenuIcon({ href }: { href: string }) {
  const paths: Record<string, React.ReactNode> = {
    "/admin/promos": <><path d="M20 13 13 20a2 2 0 0 1-3 0l-7-7V4h9l8 6a2 2 0 0 1 0 3Z"/><circle cx="7.5" cy="8" r="1"/><path d="m11 10 5 5m0-5-5 5"/></>,
    "/admin/dashboard": <><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/></>,
    "/admin/operations": <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10l1 1 2-2m2 1h2m-7 6 1 1 2-2m2 1h2"/></>,
    "/admin/master-product": <><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10v9M3 8l9 5 9-5M8 5l9 5v4"/></>,
    "/admin/konsinyasi": <><path d="M3 10V6l4-3h10l4 3v4M3 10h18M5 10v11h14V10M9 21v-7h6v7M3 6h18"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">{paths[href] || <><path d="M4 7h16v14H4zM2 3h20v4H2zM9 11h6"/></>}</svg>;
}

export default function AdminAccessPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/auth/session", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => ({
        ok: response.ok,
        data: await response.json(),
      }))
      .then(({ ok, data }) => {
        if (active) {
          setAuthenticated(ok && data.authenticated === true);
        }
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });

      if (!response.headers.get("content-type")?.includes("application/json")) {
        setError("Endpoint login belum siap. Restart server website lalu coba lagi.");
        return;
      }
      const data = await response.json();

      if (!response.ok || (data.ok !== true && data.authenticated !== true)) {
        setError(data.message || "Username atau password salah.");
        return;
      }

      setPassword("");
      setAuthenticated(true);
    } catch {
      setError("Server tidak dapat dihubungi. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        setError("Logout gagal. Silakan coba lagi.");
        return;
      }

      setAuthenticated(false);
      setUsername("");
      setPassword("");
    } catch {
      setError("Tidak dapat menghubungi server untuk logout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071a13] text-[#f7f2e7]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(5,24,17,.97) 0%, rgba(5,24,17,.88) 48%, rgba(5,24,17,.72) 100%), url('/vartana-spices-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-[#b68a3c]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-emerald-700/10 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-7 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Image
              src="/Logo%20Vartana%20Bulat.png"
              alt="Logo resmi VARTANA"
              width={76}
              height={76}
              priority
              className="h-14 w-14 shrink-0 rounded-full border border-[#c9a45f] bg-[#fbf5e6] object-contain p-0.5 sm:h-[76px] sm:w-[76px]"
            />
            <div>
              <p className="text-base font-semibold tracking-[0.24em] sm:text-xl">
                VARTANA
              </p>
              <p className="mt-1 text-[8px] tracking-[0.16em] text-[#d4cbb6] sm:text-[10px] sm:tracking-[0.24em]">
                ROOTED IN EARTH, BUILT FOR GROWTH
              </p>
            </div>
          </div>

          <div className="hidden rounded-full border border-[#c5a66b]/40 bg-black/20 px-4 py-2 text-[10px] tracking-[0.2em] text-[#e2c77f] sm:block">
            INTERNAL PORTAL
          </div>
        </header>

        <section className={authenticated ? "flex flex-1 flex-col items-center gap-9 py-10 sm:py-12" : "grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-16"}>
          <div className={authenticated ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c5a66b]/40 bg-[#c5a66b]/10 px-4 py-2 text-[10px] tracking-[0.24em] text-[#e3c981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9bd72]" />
              PRIVATE ACCESS
            </div>

            <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {authenticated
                ? "Admin Control Center"
                : "Welcome to VARTANA"}
            </h1>

            <div className={`mt-5 h-px w-24 bg-gradient-to-r from-[#d8b76c] to-transparent ${authenticated ? "mx-auto" : ""}`} />

            <p className={`mt-5 max-w-lg text-sm leading-7 text-[#d0d9d0] sm:text-base ${authenticated ? "mx-auto" : ""}`}>
              {authenticated
                ? "Satu pintu untuk mengelola dashboard, operasional, dan kemitraan VARTANA."
                : "Akses ruang kerja internal VARTANA untuk mengelola operasional, data, dan pertumbuhan bisnis."}
            </p>

            <div className={`${authenticated ? "hidden" : "mt-9 grid max-w-md grid-cols-3 gap-3"}`}>
              {[
                { value: "01", label: "DASHBOARD" },
                { value: "02", label: "OPERATIONS" },
                { value: "03", label: "PARTNERSHIP" },
              ].map((item) => (
                <div
                  key={item.value}
                  className="border-l border-[#c5a66b]/60 pl-3"
                >
                  <p className="font-serif text-2xl text-[#dfc27b]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[8px] tracking-[0.12em] text-[#b9c8bd] sm:text-[9px]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <p className={`${authenticated ? "hidden" : "mt-10 max-w-md text-xs leading-6 text-[#a9b9ad]"}`}>
              More than wellness. A better future for farmers.
            </p>
          </div>

          <div className={authenticated ? "w-full max-w-5xl" : "w-full max-w-xl justify-self-center lg:justify-self-end"}>
            {checking ? (
              <div className="rounded-3xl border border-white/15 bg-[#102a20]/90 p-8 text-sm text-[#c5d0c7] shadow-2xl backdrop-blur-xl">
                Memeriksa sesi admin...
              </div>
            ) : authenticated ? (
              <div className="rounded-3xl border border-white/15 bg-[#102a20]/90 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-[#dfc27b]">
                      YOUR WORKSPACE
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Pilih Menu
                    </h2>
                    <p className="mt-2 text-sm text-[#bdcabe]">
                      Mau mengelola bagian yang mana hari ini?
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-200">
                    Signed in
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 lg:grid-cols-3">
                  {menus.map((menu) => (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      className="group relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-7 text-center transition duration-200 hover:-translate-y-1 hover:border-[#d7bd77]/70 hover:bg-[#c5a66b]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d7bd77] motion-reduce:transform-none"
                    >
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#c5a66b]/40 bg-gradient-to-br from-[#d9bd72]/20 to-[#c5a66b]/5 text-[#e0c47b] shadow-[0_4px_20px_#0002] transition group-hover:text-[#f4dda1]">
                        <MenuIcon href={menu.href}/>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold sm:text-base">
                          {menu.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[#b9c8bd]">
                          {menu.description}
                        </span>
                      </span>
                      <span aria-hidden="true" className="absolute right-4 top-3 text-lg text-[#d7bd77] transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  ))}
                </div>

                {error && (
                  <p role="alert" className="mt-4 text-sm text-red-300">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={logout}
                  disabled={busy}
                  className="mt-5 min-h-11 w-full rounded-xl border border-white/15 text-sm text-[#d6dfd7] transition hover:border-[#d7bd77] hover:text-[#e4ca84] disabled:opacity-50"
                >
                  {busy ? "Memproses..." : "Logout dari Admin"}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleLogin}
                className="rounded-3xl border border-white/15 bg-[#102a20]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
              >
                <div className="mb-7">
                  <p className="text-[10px] tracking-[0.24em] text-[#dfc27b]">
                    SECURE ADMIN LOGIN
                  </p>
                  <h2 className="mt-3 font-serif text-3xl">
                    Sign in
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#bdcabe]">
                    Masuk dengan akun admin untuk melanjutkan ke workspace.
                  </p>
                </div>

                <label
                  htmlFor="admin-username"
                  className="mb-2 block text-sm text-[#e5e9e3]"
                >
                  Username
                </label>
                <input
                  id="admin-username"
                  name="username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Masukkan username"
                  className="mb-5 min-h-12 w-full rounded-xl border border-white/15 bg-[#071a13]/80 px-4 text-base text-white outline-none transition placeholder:text-[#829589] focus:border-[#d7bd77] focus:ring-1 focus:ring-[#d7bd77]"
                />

                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="admin-password"
                    className="block text-sm text-[#e5e9e3]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-xs text-[#dfc27b] hover:text-white"
                  >
                    {showPassword ? "Sembunyikan" : "Lihat password"}
                  </button>
                </div>

                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  className="min-h-12 w-full rounded-xl border border-white/15 bg-[#071a13]/80 px-4 text-base text-white outline-none transition placeholder:text-[#829589] focus:border-[#d7bd77] focus:ring-1 focus:ring-[#d7bd77]"
                />

                {error && (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d2b36a] to-[#ead79d] px-4 font-semibold text-[#10251a] shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Memverifikasi..." : "Login ke Workspace"}
                  {!busy && <span>→</span>}
                </button>

                <div className="mt-5 flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-[#aebdb1]">
                  <span className="text-[#dfc27b]">◆</span>
                  <p>Akses terbatas untuk pengguna admin yang berwenang.</p>
                </div>
              </form>
            )}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 py-5 text-[10px] tracking-[0.12em] text-[#a9b9ad] sm:flex-row sm:items-center sm:justify-between">
          <span>VARTANA BOTANICAL WELLNESS</span>
          <span>ROOTED IN EARTH, BUILT FOR GROWTH</span>
        </footer>
      </div>
    </main>
  );
}


