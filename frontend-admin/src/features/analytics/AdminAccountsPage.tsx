import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, XCircle, RefreshCw, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { fetchAdminAccounts, createAdminAccount, toggleAdminActive } from '../../services/users.service';
import { useToast } from '../../components/layout/AdminLayout';
import { format, formatDistanceToNow } from 'date-fns';

const avatarColors = ['gold', 'blue', 'green', 'purple', 'red'];

export default function AdminAccountsPage() {
  const { addToast } = useToast();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', fullName: '', role: 'admin' as 'admin' | 'super_admin' });
  const [saving, setSaving] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAccounts();
      setAdmins(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.email.trim() || !form.fullName.trim()) {
      addToast('Email and full name are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await createAdminAccount(form.email, form.fullName, form.role);
      addToast(`Admin account for ${form.fullName} created!`, 'success');
      setShowModal(false);
      setForm({ email: '', fullName: '', role: 'admin' });
      await load();
    } catch (e: any) {
      addToast(e.message ?? 'Failed to create admin account.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(admin: any) {
    setMutatingId(admin.id);
    try {
      await toggleAdminActive(admin.id, !admin.is_active);
      addToast(admin.is_active ? 'Admin account deactivated.' : 'Admin account activated!', admin.is_active ? 'error' : 'success');
      await load();
    } catch {
      addToast('Failed to toggle admin status.', 'error');
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>Admin Accounts</h1>
            <p>Manage admin and super-admin accounts separately from regular users.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={load} id="refresh-admins-btn">
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-admin-btn">
              <Plus size={16} /> Add Admin
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="announcement-banner" style={{ marginBottom: 'var(--space-md)', borderColor: 'var(--color-red)', background: 'rgba(239,68,68,0.06)' }}>
          <AlertCircle size={16} style={{ color: 'var(--color-red)', flexShrink: 0 }} />
          <span style={{ color: 'var(--color-red)' }}>{error}</span>
          <button className="btn btn-secondary btn-sm" onClick={load}>Retry</button>
        </div>
      )}

      {/* Info Banner */}
      <div className="announcement-banner" style={{ marginBottom: 'var(--space-md)' }}>
        <Shield size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Admin accounts are tracked in a separate <code style={{ color: 'var(--color-gold)', background: 'var(--color-gold-dim)', padding: '1px 6px', borderRadius: 4 }}>admin_accounts</code> table, 
          independent from the main <code style={{ color: 'var(--color-blue)', background: 'var(--color-blue-dim)', padding: '1px 6px', borderRadius: 4 }}>users</code> table for better security and auditability.
        </span>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-md)' }}>
        {[
          { label: 'Total Admins', value: loading ? '…' : admins.length, color: 'var(--color-gold)' },
          { label: 'Active Admins', value: loading ? '…' : admins.filter(a => a.is_active).length, color: 'var(--color-green)' },
          { label: 'Super Admins', value: loading ? '…' : admins.filter(a => a.role === 'super_admin').length, color: 'var(--color-purple)' },
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

      {/* Admin List */}
      <div className="section-card animate-fade-in">
        <div className="table-wrapper" style={{ border: 'none' }}>
          {loading ? (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading admin accounts…</div>
          ) : admins.length === 0 ? (
            <div className="empty-state"><Shield size={40} /><p>No admin accounts found.<br />Create the first admin above.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, i) => (
                  <tr key={admin.id} style={{ opacity: mutatingId === admin.id ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`avatar avatar-md avatar-${avatarColors[i % avatarColors.length]}`}>
                          {(admin.full_name ?? admin.email ?? '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{admin.full_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${admin.role === 'super_admin' ? 'badge-admin' : 'badge-featured'}`}>
                        {admin.role === 'super_admin' ? '⭐ Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${admin.is_active ? 'approved' : 'rejected'}`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {admin.last_login_at
                        ? formatDistanceToNow(new Date(admin.last_login_at), { addSuffix: true })
                        : '—'
                      }
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {format(new Date(admin.created_at), 'MMM d, yyyy')}
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        disabled={mutatingId === admin.id}
                        onClick={() => handleToggle(admin)}
                        id={`toggle-admin-${admin.id}`}
                        title={admin.is_active ? 'Deactivate' : 'Activate'}
                        style={{ color: admin.is_active ? 'var(--color-green)' : 'var(--text-muted)' }}
                      >
                        {admin.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>Add Admin Account</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)} id="close-admin-modal"><XCircle size={16} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
              This adds the email to the <strong>admin_accounts</strong> whitelist.{' '}
              To allow login, the email must also exist as a Supabase auth user — run this SQL in your database:
            </p>
            <pre style={{
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '10px 14px', fontSize: '0.72rem',
              color: '#a3e635', overflowX: 'auto', marginBottom: 'var(--space-md)', lineHeight: 1.6,
            }}>
{`-- 1. Create the auth user (replace values as needed)
DO $$
DECLARE v_uid uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token)
  VALUES (
    '00000000-0000-0000-0000-000000000000', v_uid,
    'authenticated', 'authenticated', 'email@domain.com',
    crypt('their_password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '');
  -- Required: add identity row or login will fail
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data,
    provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(), v_uid, 'email@domain.com',
    jsonb_build_object('sub', v_uid::text,
      'email', 'email@domain.com', 'email_verified', true),
    'email', now(), now(), now());
END;$$;

-- 2. Whitelist in admin_accounts
INSERT INTO admin_accounts (email, full_name, role)
VALUES ('email@domain.com', 'Full Name', 'admin');`}
            </pre>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" placeholder="e.g. Ringsenvy Admin"
                value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} id="admin-name-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-control" type="email" placeholder="admin@lehkhabu.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} id="admin-email-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="filter-tabs">
                {(['admin', 'super_admin'] as const).map(r => (
                  <button key={r} className={`filter-tab${form.role === r ? ' active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, role: r }))} id={`role-${r}`}>
                    {r === 'super_admin' ? '⭐ Super Admin' : 'Admin'}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving} id="save-admin-btn">
                {saving ? 'Creating…' : 'Create Admin Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
