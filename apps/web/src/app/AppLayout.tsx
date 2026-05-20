import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/", label: "工作台" },
  { to: "/projects", label: "项目" },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#dedbd2] bg-white px-5 py-6 lg:block">
        <div>
          <p className="text-sm font-medium text-[#7a756a]">AI Video Editor</p>
          <h1 className="mt-2 text-xl font-semibold">爆款结构迁移引擎</h1>
        </div>
        <nav className="mt-8 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  isActive ? "bg-[#20201e] text-white" : "text-[#4b4943] hover:bg-[#efede8]",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <Outlet />
      </main>
    </div>
  );
}
