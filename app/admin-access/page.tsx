import Link from "next/link";

const menus = [
  {
    title: "Admin Dashboard",
    description: "Dashboard utama dan kontrol data VARTANA.",
    href: "/admin/dashboard",
    number: "01",
    icon: "▦",
  },
  {
    title: "Admin Operations",
    description: "Administrasi dan aktivitas operasional.",
    href: "/admin/operations",
    number: "02",
    icon: "⚙",
  },
];

export default function AdminAccessPage() {
  return (
    <main className="min-h-screen bg-[#0b2119] px-5 py-12 text-[#f5f0e5] md:px-10">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center">
        <header className="mb-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c5a66b] text-xl text-[#d7bd77]">
              V
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[0.2em]">VARTANA</p>
              <p className="text-[9px] tracking-[0.22em] text-[#b5c1b8]">
                ROOTED IN EARTH, BUILT FOR GROWTH
              </p>
            </div>
          </div>
          <p className="mb-3 text-xs tracking-[0.3em] text-[#d7bd77]">
            PRIVATE ACCESS
          </p>
          <h1 className="font-serif text-4xl md:text-5xl">
            Admin Control Center
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#b5c1b8]">
            Pusat akses internal VARTANA untuk dashboard dan operasional.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="group rounded-2xl border border-[#365344] bg-[#112e23] p-6 transition duration-200 hover:border-[#c5a66b] hover:bg-[#173a2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d7bd77]"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-3xl text-[#d7bd77]">{menu.icon}</span>
                <span className="text-xs tracking-widest text-[#849b8c]">
                  {menu.number}
                </span>
              </div>
              <h2 className="text-xl font-semibold">{menu.title}</h2>
              <p className="mt-3 min-h-12 text-sm leading-6 text-[#b5c1b8]">
                {menu.description}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-[#365344] pt-4">
                <span className="text-xs text-[#d7bd77]">Open workspace</span>
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </section>

        <footer className="mt-12 border-t border-[#294436] pt-5 text-xs text-[#849b8c]">
          <p>VARTANA INTERNAL ACCESS</p>
          <p className="mt-2">
            Authorized use only · VARTANA Botanical Wellness
          </p>
        </footer>
      </div>
    </main>
  );
}
