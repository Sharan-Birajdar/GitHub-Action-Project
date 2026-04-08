import styles from './TaskCard.module.css';

const PRIORITY_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const STATUSES = ['todo', 'in-progress', 'done'];

export default function TaskCard({ task, onEdit, onDelete, onStatus }) {
  const next = STATUSES[STATUSES.indexOf(task.status) + 1];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span
          className={styles.priority}
          style={{ background: PRIORITY_COLOR[task.priority] + '22', color: PRIORITY_COLOR[task.priority] }}
        >
          {task.priority}
        </span>
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={onEdit} title="Edit">✏️</button>
          <button className={styles.iconBtn} onClick={onDelete} title="Delete">🗑️</button>
        </div>
      </div>

      <h3 className={styles.title}>{task.title}</h3>
      {task.description && <p className={styles.desc}>{task.description}</p>}

      <div className={styles.footer}>
        <span className={styles.date}>
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
        {next && (
          <button className={styles.moveBtn} onClick={() => onStatus(next)}>
            → {next === 'in-progress' ? 'Start' : 'Complete'}
          </button>
        )}
      </div>
    </div>
  );
}
