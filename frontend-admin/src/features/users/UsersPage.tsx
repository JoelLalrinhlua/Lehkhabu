import { useState } from 'react';
import { Search, UserPlus, MoreVertical, ShieldBan, UserCheck, Trash2, Eye, XCircle, Mail, Activity } from 'lucide-react';
import { mockUsers } from '../../store/mockData';
import type { User, UserStatus } from '../../types';
import { useToast } from '../../components/layout/AdminLayout';
import { format, formatDistanceToNow } from 'date-fns';

const roleTabs: { key: 'all' | User['role']; label: string }[] = [
  { key: 'all', label: 'All Users' },
  { key: 'user', label: 'Readers' },
  { key: 'author', label: 'Authors' },
  { key: 'admin', label: 'Admins' },
];

export default function UsersPage() {
  const { addToast } = useToast();
  const [usersData, setUsersData] = useState<User[]>(mockUsers);
  const [activeRole, setActiveRole] = useState<'all' | User['role']>('all');
  const [activeStatus, setActiveStatus] = useState<'all' | UserStatus>('all');
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const filtered = usersData
    .filter(u => activeRole === 'all' || u.role === activeRole)
    .filter(u => activeStatus === 'all' || u.status === activeStatus)
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  function toggleSuspend(id: string) {
    setUsersData(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
      : u));
    const user = usersData.find(u => u.id === id);
    addToast(user?.status === 'active' ? 'User suspended.' : 'User reactivated!', user?.status === 'active' ? 'error' : 'success');
    setOpenMenuId(null);
  }

  function changeRole(id: string, role: User['role']) {
    setUsersData(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    addToast(`Role updated to ${role}`, 'success');
    setOpenMenuId(null);
  }

  const avatarColors = ['gold', 'blue', 'green', 'purple', 'red', 'cyan'];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>Users</h1>
            <p>Manage platform users, authors and administrators.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" id="add-user-btn">
              <UserPlus size={16} /> Add User
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-md)' }}>
        {[
          { label: 'Total Users', value: usersData.length, color: 'var(--color-blue)', dim: 'var(--color-blue-dim)' },
          { label: 'Active', value: usersData.filter(u => u.status === 'active').length, color: 'var(--color-green)', dim: 'var(--color-green-dim)' },
          { label: 'Suspended', value: usersData.filter(u => u.status === 'suspended').length, color: 'var(--color-red)', dim: 'var(--color-red-dim)' },
          { label: 'Authors', value: usersData.filter(u => u.role === 'author').length, color: 'var(--color-gold)', dim: 'var(--color-gold-dim)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 8px ${s.color}` }} />
            <div>
              <div className="stat-card-label">{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)', alignItems: 'center' }}>
        <div className="filter-tabs">
          {roleTabs.map(t => (
            <button key={t.key} className={`filter-tab${activeRole === t.key ? ' active' : ''}`}
              onClick={() => setActiveRole(t.key)} id={`role-tab-${t.key}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="filter-tabs">
          {(['all', 'active', 'suspended'] as const).map(s => (
            <button key={s} className={`filter-tab${activeStatus === s ? ' active' : ''}`}
              onClick={() => setActiveStatus(s)} id={`status-tab-${s}`}>
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <Search />
          <input className="search-input" placeholder="Search name or email…"
            value={search} onChange={e => setSearch(e.target.value)} id="users-search" />
        </div>
      </div>

      {/* Table */}
      <div className="section-card animate-fade-in">
        <div className="table-wrapper" style={{ border: 'none' }}>
          {filtered.length === 0 ? (
            <div className="empty-state"><Search size={40} /><p>No users found.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Country</th>
                  <th>Books</th>
                  <th>Total Spent</th>
                  <th>Joined</th>
                  <th>Last Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          className={`avatar avatar-md avatar-${avatarColors[i % avatarColors.length]}`}
                        >
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{user.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge badge-${user.role === 'admin' ? 'admin' : user.role === 'author' ? 'featured' : 'active'}`}>{user.role}</span></td>
                    <td><span className={`badge badge-${user.status}`}>{user.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{user.country}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{user.booksOwned}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)', fontWeight: 600 }}>
                      {user.totalSpent > 0 ? `₹${user.totalSpent.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {format(new Date(user.joinedAt), 'MMM d, yyyy')}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                    </td>
                    <td>
                      <div className="dropdown" style={{ position: 'relative' }}>
                        <button className="btn-icon" id={`user-menu-${user.id}`}
                          onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === user.id ? null : user.id); }}>
                          <MoreVertical size={15} />
                        </button>
                        {openMenuId === user.id && (
                          <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                            <div className="dropdown-item" onClick={() => { setViewUser(user); setOpenMenuId(null); }}>
                              <Eye size={14} /> View Profile
                            </div>
                            <div className="dropdown-item"><Mail size={14} /> Send Email</div>
                            <div className="dropdown-item"><Activity size={14} /> View Activity</div>
                            <div className="dropdown-divider" />
                            {user.role !== 'admin' && (
                              <div className="dropdown-item" onClick={() => changeRole(user.id, 'admin')}>
                                <UserCheck size={14} /> Make Admin
                              </div>
                            )}
                            {user.role === 'user' && (
                              <div className="dropdown-item" onClick={() => changeRole(user.id, 'author')}>
                                <UserCheck size={14} /> Make Author
                              </div>
                            )}
                            {user.role !== 'user' && (
                              <div className="dropdown-item" onClick={() => changeRole(user.id, 'user')}>
                                <UserCheck size={14} /> Demote to Reader
                              </div>
                            )}
                            <div className="dropdown-divider" />
                            <div className="dropdown-item danger" onClick={() => toggleSuspend(user.id)}>
                              <ShieldBan size={14} /> {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                            </div>
                            {user.role !== 'admin' && (
                              <div className="dropdown-item danger"><Trash2 size={14} /> Delete Account</div>
                            )}
                          </div>
                        )}
                      </div>
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

      {/* User Profile Modal */}
      {viewUser && (
        <div className="modal-backdrop" onClick={() => setViewUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Profile</h3>
              <button className="btn-icon" onClick={() => setViewUser(null)} id="close-user-modal"><XCircle size={16} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
              <div className="avatar avatar-lg avatar-gold" style={{ width: 56, height: 56, fontSize: '1.3rem' }}>
                {viewUser.name[0]}
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem' }}>{viewUser.name}</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{viewUser.email}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <span className={`badge badge-${viewUser.role === 'admin' ? 'admin' : viewUser.role === 'author' ? 'featured' : 'active'}`}>{viewUser.role}</span>
                  <span className={`badge badge-${viewUser.status}`}>{viewUser.status}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Country', value: viewUser.country },
                { label: 'Books Owned', value: viewUser.booksOwned },
                { label: 'Total Spent', value: `₹${viewUser.totalSpent.toLocaleString('en-IN')}` },
                { label: 'Joined', value: format(new Date(viewUser.joinedAt), 'PPP') },
                { label: 'Last Active', value: formatDistanceToNow(new Date(viewUser.lastActive), { addSuffix: true }) },
                { label: 'User ID', value: viewUser.id },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: typeof item.value === 'string' && item.value.startsWith('₹') ? 'var(--font-mono)' : undefined }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger btn-sm" onClick={() => { toggleSuspend(viewUser.id); setViewUser(null); }}>
                <ShieldBan size={14} /> {viewUser.status === 'active' ? 'Suspend' : 'Reactivate'}
              </button>
              <button className="btn btn-secondary" onClick={() => setViewUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
