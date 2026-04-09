import { useState } from 'react';
import { Search, Filter, Download, Eye, XCircle } from 'lucide-react';
import { mockOrders } from '../../store/mockData';
import type { Order, OrderStatus } from '../../types';
import { useToast } from '../../components/layout/AdminLayout';
import { format, formatDistanceToNow } from 'date-fns';

const statusTabs: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'refunded', label: 'Refunded' },
];

export default function OrdersPage() {
  const { addToast } = useToast();
  const [ordersData] = useState<Order[]>(mockOrders);
  const [activeStatus, setActiveStatus] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const filtered = ordersData
    .filter(o => activeStatus === 'all' || o.status === activeStatus)
    .filter(o =>
      o.userName.toLowerCase().includes(search.toLowerCase()) ||
      o.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    );

  const totalRevenue = ordersData.filter(o => o.status === 'completed').reduce((s, o) => s + o.amount, 0);
  const totalRefunds = ordersData.filter(o => o.status === 'refunded').reduce((s, o) => s + o.amount, 0);

  const paymentColors: Record<string, string> = {
    'Razorpay': 'var(--color-blue)',
    'UPI': 'var(--color-green)',
    'Card': 'var(--color-purple)',
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>Orders</h1>
            <p>Track all book purchases, refunds and payment records.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" id="export-orders-btn"
              onClick={() => addToast('Orders exported to CSV!', 'success')}>
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-md)' }}>
        {[
          { label: 'Total Orders', value: ordersData.length, color: 'var(--color-blue)', dim: 'var(--color-blue-dim)' },
          { label: 'Completed', value: ordersData.filter(o => o.status === 'completed').length, color: 'var(--color-green)', dim: 'var(--color-green-dim)' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'var(--color-gold)', dim: 'var(--color-gold-dim)' },
          { label: 'Refunds', value: `₹${totalRefunds.toLocaleString('en-IN')}`, color: 'var(--color-red)', dim: 'var(--color-red-dim)' },
        ].map((s, i) => (
          <div key={s.label} className={`stat-card animate-fade-in-up stagger-${i + 1}`}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ fontSize: '1.5rem', color: s.color }}>{s.value}</div>
            <div className="stat-card-glow" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)', alignItems: 'center' }}>
        <div className="filter-tabs">
          {statusTabs.map(t => (
            <button key={t.key} className={`filter-tab${activeStatus === t.key ? ' active' : ''}`}
              onClick={() => setActiveStatus(t.key)} id={`order-tab-${t.key}`}>{t.label}</button>
          ))}
        </div>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search />
          <input className="search-input" placeholder="Search by user, book or order ID…"
            value={search} onChange={e => setSearch(e.target.value)} id="orders-search" />
        </div>
      </div>

      {/* Table */}
      <div className="section-card animate-fade-in">
        <div className="table-wrapper" style={{ border: 'none' }}>
          {filtered.length === 0 ? (
            <div className="empty-state"><Filter size={40} /><p>No orders found.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Book</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <tr key={order.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        #{order.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm avatar-blue">{order.userName[0]}</div>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {order.userName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{order.bookTitle}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-gold)', fontSize: '0.95rem' }}>
                        ₹{order.amount}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 600,
                        color: paymentColors[order.paymentMethod] || 'var(--text-secondary)',
                        background: 'var(--bg-elevated)', padding: '3px 8px',
                        borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)'
                      }}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      <div>{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                      <div style={{ fontSize: '0.68rem' }}>{format(new Date(order.createdAt), 'HH:mm')}</div>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => setViewOrder(order)} id={`view-order-${order.id}`}>
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="pagination">
          <button className="page-btn" disabled>←</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">→</button>
        </div>
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="modal-backdrop" onClick={() => setViewOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div>
                <h3>Order Details</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>#{viewOrder.id}</div>
              </div>
              <button className="btn-icon" onClick={() => setViewOrder(null)} id="close-order-modal">
                <XCircle size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { label: 'Customer', value: viewOrder.userName },
                { label: 'Book', value: viewOrder.bookTitle },
                { label: 'Amount', value: `₹${viewOrder.amount}` },
                { label: 'Payment Method', value: viewOrder.paymentMethod },
                { label: 'Status', value: viewOrder.status },
                { label: 'Order Date', value: format(new Date(viewOrder.createdAt), 'PPPp') },
                { label: 'Time Since', value: formatDistanceToNow(new Date(viewOrder.createdAt), { addSuffix: true }) },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  {item.label === 'Status' ? (
                    <span className={`badge badge-${viewOrder.status}`}>{viewOrder.status}</span>
                  ) : (
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{item.value}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              {viewOrder.status === 'completed' && (
                <button className="btn btn-danger btn-sm"
                  onClick={() => { addToast('Refund initiated.', 'info'); setViewOrder(null); }}>
                  Initiate Refund
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setViewOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
