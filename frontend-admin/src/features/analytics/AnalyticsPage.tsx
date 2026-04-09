import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { revenueChartData, genreData, mockBooks, mockUsers, mockOrders } from '../../store/mockData';
import { TrendingUp, Users, BookOpen, ShoppingCart } from 'lucide-react';

const weeklyUsers = [
  { day: 'Mon', new: 3, returning: 18 },
  { day: 'Tue', new: 5, returning: 22 },
  { day: 'Wed', new: 2, returning: 15 },
  { day: 'Thu', new: 7, returning: 31 },
  { day: 'Fri', new: 9, returning: 28 },
  { day: 'Sat', new: 11, returning: 35 },
  { day: 'Sun', new: 6, returning: 24 },
];

const monthlyRevenue = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 58000 },
  { month: 'Mar', revenue: 71000 },
  { month: 'Apr', revenue: 103520, current: true },
];

function CustomTooltipRevenue({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '10px 14px', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ fontSize: '0.9rem', fontWeight: 700, color: p.color }}>
          {p.name}: {p.dataKey === 'revenue' ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const totalRevenue = mockBooks.reduce((s, b) => s + b.revenue, 0);
  const avgOrderValue = mockOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.amount, 0) /
    Math.max(1, mockOrders.filter(o => o.status === 'completed').length);
  const activeUsers = mockUsers.filter(u => u.status === 'active').length;
  const conversionRate = ((mockOrders.filter(o => o.status === 'completed').length / mockUsers.length) * 100).toFixed(1);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>Analytics</h1>
            <p>Platform-wide revenue, user growth, and book performance insights.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid animate-fade-in-up">
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}K`, sub: '↑ 23% from last month', icon: TrendingUp, color: 'var(--color-gold)', dim: 'var(--color-gold-dim)' },
          { label: 'Avg. Order Value', value: `₹${avgOrderValue.toFixed(0)}`, sub: '↑ 4% from last month', icon: ShoppingCart, color: 'var(--color-green)', dim: 'var(--color-green-dim)' },
          { label: 'Active Users', value: activeUsers, sub: '↑ 3 new this week', icon: Users, color: 'var(--color-blue)', dim: 'var(--color-blue-dim)' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, sub: 'Users → Buyers', icon: BookOpen, color: 'var(--color-purple)', dim: 'var(--color-purple-dim)' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`stat-card animate-fade-in-up stagger-${i + 1}`}>
              <div className="stat-card-icon" style={{ background: s.dim }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-sub" style={{ color: 'var(--color-green)' }}>{s.sub}</div>
              </div>
              <div className="stat-card-glow" style={{ background: s.color }} />
            </div>
          );
        })}
      </div>

      {/* Revenue Over Time (daily) */}
      <div className="content-grid animate-fade-in-up stagger-3" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">Daily Revenue — This Week</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-green)' }}>
              ₹{revenueChartData.reduce((s, d) => s + d.revenue, 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="section-card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltipRevenue />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-gold)" strokeWidth={2.5} fill="url(#revGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre Distribution Pie */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">Genre Distribution</span>
          </div>
          <div className="section-card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={genreData} dataKey="count" nameKey="genre" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number, name: string) => [`${val} books`, name]} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Legend formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Growth Bar + Monthly Revenue */}
      <div className="content-grid animate-fade-in-up stagger-4" style={{ marginBottom: 'var(--space-md)' }}>
        {/* User Activity This Week */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">User Activity — This Week</span>
          </div>
          <div className="section-card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyUsers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltipRevenue />} />
                <Bar dataKey="returning" name="Returning" fill="var(--color-blue)" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Bar dataKey="new" name="New" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">Monthly Revenue</span>
          </div>
          <div className="section-card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltipRevenue />} formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}
                  fill="var(--color-green)" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Books Table */}
      <div className="section-card animate-fade-in-up stagger-5">
        <div className="section-card-header">
          <span className="section-card-title">Top Performing Books</span>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Book</th>
                <th>Genre</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Rating</th>
                <th>Market Share</th>
              </tr>
            </thead>
            <tbody>
              {[...mockBooks]
                .filter(b => b.status === 'approved')
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 6)
                .map((book, i) => {
                  const maxRevenue = Math.max(...mockBooks.map(b => b.revenue));
                  const share = ((book.revenue / totalRevenue) * 100).toFixed(1);
                  return (
                    <tr key={book.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', width: 40 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 38, borderRadius: '2px 5px 5px 2px', background: book.coverColor, flexShrink: 0, boxShadow: '2px 2px 6px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontSize: '0.42rem', fontWeight: 800 }}>{book.title.slice(0, 2)}</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{book.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{book.genre}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{book.sales.toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)', fontWeight: 700 }}>₹{book.revenue.toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.85rem' }}>{'★'.repeat(Math.round(book.rating))} {book.rating}</td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className="progress-fill" style={{ width: `${(book.revenue / maxRevenue) * 100}%` }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
