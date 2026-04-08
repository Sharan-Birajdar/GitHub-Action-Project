import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import styles from './Dashboard.module.css';

const STATUSES  = ['todo', 'in-progress', 'done'];
const STATUS_LABEL = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const STATUS_COLOR = { todo: '#6366f1', 'in-progress': '#f59e0b', done: '#22c55e' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [modal,   setModal]   = useState(null); // null | 'new' | task object

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = async (payload) => {
    if (modal === 'new') {
      const { data } = await api.post('/tasks', payload);
      setTasks(t => [data, ...t]);
    } else {
      const { data } = await api.put(`/tasks/${modal._id}`, payload);
      setTasks(t => t.map(x => x._id === data._id ? data : x));
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(t => t.filter(x => x._id !== id));
  };

  const handleStatus = async (task, status) => {
    const { data } = await api.put(`/tasks/${task._id}`, { status });
    setTasks(t => t.map(x => x._id === data._id ? data : x));
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const columns = STATUSES.map(s => ({
    status: s,
    tasks:  filtered.filter(t => t.status === s),
  }));

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s).length;
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.navLogo}>✅</span>
          <span className={styles.navTitle}>TaskApp</span>
        </div>
        <div className={styles.navRight}>
          <span className={styles.navUser}>👋 {user?.name}</span>
          <button className={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </nav>

      <main className={styles.main}>
        {/* ── Stats row ── */}
        <div className={styles.stats}>
          {STATUSES.map(s => (
            <div key={s} className={styles.statCard} style={{ borderTopColor: STATUS_COLOR[s] }}>
              <span className={styles.statNum}>{counts[s]}</span>
              <span className={styles.statLabel}>{STATUS_LABEL[s]}</span>
            </div>
          ))}
          <div className={styles.statCard} style={{ borderTopColor: '#818cf8' }}>
            <span className={styles.statNum}>{tasks.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {['all', ...STATUSES].map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
          <button className={styles.newBtn} onClick={() => setModal('new')}>
            + New Task
          </button>
        </div>

        {/* ── Kanban board ── */}
        {loading ? (
          <div className={styles.empty}>Loading tasks…</div>
        ) : (
          <div className={styles.board}>
            {columns.map(col => (
              <div key={col.status} className={styles.column}>
                <div className={styles.colHeader}>
                  <span className={styles.colDot} style={{ background: STATUS_COLOR[col.status] }} />
                  <span className={styles.colTitle}>{STATUS_LABEL[col.status]}</span>
                  <span className={styles.colCount}>{col.tasks.length}</span>
                </div>
                <div className={styles.colBody}>
                  {col.tasks.length === 0 && (
                    <div className={styles.colEmpty}>No tasks here</div>
                  )}
                  {col.tasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={() => setModal(task)}
                      onDelete={() => handleDelete(task._id)}
                      onStatus={(s) => handleStatus(task, s)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ── */}
      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
