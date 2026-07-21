import styles from './Avatar.module.css';

type AvatarProps = {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Avatar({name, src, size = 'md', className = ''}: AvatarProps) {
  return (
    <div
      className={[styles.avatar, styles[size], className].filter(Boolean).join(' ')}
      aria-label={name}
      title={name}
    >
      {src ? (
        <img src={src} alt="" className={styles.image} />
      ) : (
        <span className={styles.initials}>{getInitials(name)}</span>
      )}
    </div>
  );
}
