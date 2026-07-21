import {useEffect, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
import {Button} from '../Button/Button';
import styles from './Modal.module.css';

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showClose?: boolean;
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
  showClose = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={[styles.dialog, styles[size]].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={event => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            {description ? (
              <p className={styles.description}>{description}</p>
            ) : null}
          </div>
          {showClose ? (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Close"
              onClick={onClose}
              className={styles.close}
            >
              <X size={18} />
            </Button>
          ) : null}
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
