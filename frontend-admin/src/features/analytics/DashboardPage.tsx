import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, TrendingUp, ShoppingCart,
  Clock, CheckCircle, XCircle, Star,
  ArrowUpRight, ArrowRight, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { mockBooks, mockUsers, mockOrders, revenueChartData, getDashboardStats } from '../../store/mockData';
import { format } from 'date-fns';

const stats = getDashboardStats();

// ── Stat Card ───────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color, dim, delay = 0
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; dim: string; delay?: number;
}) {
  return (
    <div className="stat-card animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
      <div className="stat-card-icon" style={{ background: dim }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-sub" dangerouslySetInnerHTML={{ __html: sub }} />
      </div>
      <div className="stat-card-glow" style={{ background: color }} />
    </div>
  );
}

// ── Custom Tooltip ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-gold)', fontFamily: 'var(--font-heading)' }}>
        ₹{payload[0].value.toLocaleString('en-IN')}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{payload[1]?.value} orders</div>
    </div>
  );
}

// ── Book Row ─────────────────────────────────────────────────────
function BookRow({ book }: { book: typeof mockBooks[0] }) {
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="book-cover-thumb book-cover-placeholder" style={{ background: book.coverColor }}>
            <span style={{ color: '#fff', fontSize: '0.55rem', fontWeight: 800 }}>
              {book.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{book.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.author}</div>
          </div>
        </div>
      </td>
      <td style={{ color: 'var(--text-secondary)' }}>{book.genre}</td>
      <td>
        <span className={`badge badge-${book.status}`}>{book.status}</span>
      </td>
      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
        ₹{book.price}
      </td>
      <td style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>{book.sales.toLocaleString()}</td>
    </tr>
  );
}

export default function DashboardPage() {
  const [chartView] = useState<'revenue' | 'orders'>('revenue');
  const pendingBooks = mockBooks.filter(b => b.status === 'pending');
  const recentOrders = mockOrders.slice(0, 4);
  const topBooks = [...mockBooks].filter(b => b.status === 'approved').sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, Ringsenvy. Here's what's happening on Lehkhabu.</p>
          </div>
          {pendingBooks.length > 0 && (
            <Link to="/books?tab=pending" className="btn btn-primary" id="review-pending-btn">
              <Clock size={15} />
              {pendingBooks.length} Pending Review
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Books" value={stats.totalBooks} sub={`<span class="up">↑ ${stats.publishedBooks} published</span> · ${stats.pendingBooks} pending`} icon={BookOpen} color="var(--color-gold)" dim="var(--color-gold-dim)" delay={0.05} />
        <StatCard label="Total Users" value={stats.totalUsers} sub={`<span class="up">↑ 3 new this week</span>`} icon={Users} color="var(--color-blue)" dim="var(--color-blue-dim)" delay={0.1} />
        <StatCard label="Revenue" value={`₹${(stats.totalRevenue/1000).toFixed(0)}K`} sub={`<span class="up">↑ ₹3,190 this month</span>`} icon={TrendingUp} color="var(--color-green)" dim="var(--color-green-dim)" delay={0.15} />
        <StatCard label="Total Orders" value={stats.totalOrders} sub={`<span class="up">↑ 12%</span> from last week`} icon={ShoppingCart} color="var(--color-purple)" dim="var(--color-purple-dim)" delay={0.2} />
      </div>

      {/* Quick actions: Pending Reviews */}
      {pendingBooks.length > 0 && (
        <div className="announcement-banner animate-fade-in-up stagger-3" style={{ marginBottom: 'var(--space-md)' }}>
          <Zap size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            <strong style={{ color: 'var(--color-gold)' }}>{pendingBooks.length} books</strong> are waiting for your review —&nbsp;
          </span>
          <Link to="/books?tab=pending" style={{ color: 'var(--color-gold)', fontWeight: 600, textDecoration: 'underline' }}>
            Review now →
          </Link>
        </div>
      )}

      {/* Revenue Chart + Pending */}
      <div className="content-grid-3 animate-fade-in-up stagger-4" style={{ marginBottom: 'var(--space-md)' }}>
        {/* Revenue Chart */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">Revenue — Last 7 Days</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-green)' }}>
              <ArrowUpRight size={14} style={{ display: 'inline' }} /> ₹{revenueChartData.reduce((s, d) => s + d.revenue, 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="section-card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-gold)" strokeWidth={2.5} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="orders" stroke="var(--color-blue)" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">Pending Review</span>
            <Link to="/books?tab=pending" style={{ fontSize: '0.78rem', color: 'var(--color-gold)' }}>See all</Link>
          </div>
          <div style={{ padding: 'var(--space-sm) var(--space-md)' }}>
            {pendingBooks.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <CheckCircle size={32} />
                <p>All caught up!</p>
              </div>
            ) : (
              pendingBooks.map(book => (
                <div key={book.id} style={{
                  display: 'flex', gap: 10, padding: '10px 0',
                  borderBottom: '1px solid var(--border-subtle)', alignItems: 'center'
                }}>
                  <div className="book-cover-thumb book-cover-placeholder" style={{ background: book.coverColor, width: 32, height: 44, borderRadius: '3px 5px 5px 3px' }}>
                    <span style={{ color: '#fff', fontSize: '0.5rem', fontWeight: 800 }}>{book.title.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{book.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{book.author}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" style={{ width: 28, height: 28, background: 'var(--color-green-dim)', border: 'none', color: 'var(--color-green)' }} id={`approve-${book.id}`}>
                      <CheckCircle size={13} />
                    </button>
                    <button className="btn-icon" style={{ width: 28, height: 28, background: 'var(--color-red-dim)', border: 'none', color: 'var(--color-red)' }} id={`reject-${book.id}`}>
                      <XCircle size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Books + Recent Orders */}
      <div className="content-grid animate-fade-in-up stagger-5">
        {/* Top Performing Books */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">Top Performing Books</span>
            <Link to="/books" style={{ fontSize: '0.78rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Genre</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Sales</th>
                </tr>
              </thead>
              <tbody>
                {topBooks.map(book => <BookRow key={book.id} book={book} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">Recent Orders</span>
            <Link to="/orders" style={{ fontSize: '0.78rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ padding: '0 var(--space-md)' }}>
            {recentOrders.map((order, i) => (
              <div key={order.id} className={`animate-fade-in-up stagger-${i + 1}`} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
                borderBottom: i < recentOrders.length - 1 ? '1px solid var(--border-subtle)' : 'none'
              }}>
                <div className={`avatar avatar-sm avatar-${['gold','blue','green','purple'][i % 4]}`}>
                  {order.userName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{order.userName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }} className="truncate">{order.bookTitle}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-gold)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                    ₹{order.amount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {format(new Date(order.createdAt), 'MMM d')}
                  </div>
                </div>
                <span className={`badge badge-${order.status}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Authors */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">Top Authors</span>
            <Link to="/authors" style={{ fontSize: '0.78rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ padding: '0 var(--space-md)' }}>
            {[...mockBooks].filter(b => b.status === 'approved').reduce((acc: any[], b) => {
              const ex = acc.find(a => a.author === b.author);
              if (ex) { ex.revenue += b.revenue; ex.sales += b.sales; }
              else acc.push({ author: b.author, revenue: b.revenue, sales: b.sales, color: ['gold','blue','green','purple','red'][acc.length % 5] });
              return acc;
            }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 4).map((a, i) => (
              <div key={a.author} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
                borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none'
              }}>
                <div className={`avatar avatar-sm avatar-${a.color}`}>{a.author[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{a.author}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.sales} sales</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-gold)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  ₹{(a.revenue/1000).toFixed(1)}K
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Health */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">Platform Health</span>
            <span className="badge badge-approved">All systems normal</span>
          </div>
          <div className="section-card-body">
            {[
              { label: 'API Uptime', value: 99.9, color: 'var(--color-green)' },
              { label: 'Storage Used', value: 62, color: 'var(--color-blue)' },
              { label: 'CDN Performance', value: 94, color: 'var(--color-gold)' },
              { label: 'Email Delivery', value: 98, color: 'var(--color-purple)' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: item.color, fontFamily: 'var(--font-mono)' }}>{item.value}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
