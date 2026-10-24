"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const menus = [
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
    title: "Kemitraan Konsinyasi",
    description: "Pengelolaan mitra, stok titipan, dan dokumen konsinyasi.",
    href: "/admin/konsinyasi",
    number: "03",
    symbol: "◇",
  },
];

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

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-16">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c5a66b]/40 bg-[#c5a66b]/10 px-4 py-2 text-[10px] tracking-[0.24em] text-[#e3c981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9bd72]" />
              PRIVATE ACCESS
            </div>

            <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {authenticated
                ? "Admin Control Center"
                : "Welcome to VARTANA"}
            </h1>

            <div className="mt-5 h-px w-24 bg-gradient-to-r from-[#d8b76c] to-transparent" />

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#d0d9d0] sm:text-base">
              {authenticated
                ? "Satu pintu untuk mengelola dashboard, operasional, dan kemitraan VARTANA."
                : "Akses ruang kerja internal VARTANA untuk mengelola operasional, data, dan pertumbuhan bisnis."}
            </p>

            <div className="mt-9 grid max-w-md grid-cols-3 gap-3">
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

            <p className="mt-10 max-w-md text-xs leading-6 text-[#a9b9ad]">
              More than wellness. A better future for farmers.
            </p>
          </div>

          <div className="w-full max-w-xl justify-self-center lg:justify-self-end">
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

                <div className="space-y-3">
                  {menus.map((menu) => (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#d7bd77]/70 hover:bg-[#c5a66b]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d7bd77]"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#c5a66b]/40 bg-[#c5a66b]/10 font-serif text-2xl text-[#e0c47b]">
                        {menu.symbol}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold sm:text-base">
                          {menu.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[#b9c8bd]">
                          {menu.description}
                        </span>
                      </span>
                      <span className="text-lg text-[#d7bd77] transition-transform group-hover:translate-x-1">
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