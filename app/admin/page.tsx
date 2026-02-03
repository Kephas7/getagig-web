import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

export default function AdminPage() {
  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, change: "+12%" },
    { label: "Active Events", value: "56", icon: Calendar, change: "+5%" },
    { label: "Revenue", value: "$45,231", icon: DollarSign, change: "+8%" },
    { label: "Growth", value: "23%", icon: TrendingUp, change: "+2%" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-[var(--foreground)/60] mt-1">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl bg-[var(--foreground)/5] border border-[var(--foreground)/10] hover:border-[var(--foreground)/20] transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-[var(--background)] shadow-sm">
                <stat.icon size={20} className="text-[var(--foreground)]" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-sm text-[var(--foreground)/60] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[var(--foreground)/5] border border-[var(--foreground)/10] h-[300px] flex items-center justify-center">
            <p className="text-[var(--foreground)/40]">Chart / Activity Placeholder</p>
        </div>
         <div className="p-6 rounded-2xl bg-[var(--foreground)/5] border border-[var(--foreground)/10] h-[300px] flex items-center justify-center">
            <p className="text-[var(--foreground)/40]">Recent Users Placeholder</p>
        </div>
      </div>
    </div>
  );
}
