import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import './DeleteConfirmationModal.css';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  title = 'Delete Prompt',
  description = 'Are you sure you want to delete this prompt? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay-wrapper">
          {/* Overlay background */}
          <motion.div
            className="modal-overlay-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal Container */}
          <motion.div
            className="delete-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            <div className="delete-modal-icon-wrapper">
              <AlertTriangle className="delete-modal-icon" size={28} />
            </div>

            <h3 className="delete-modal-title">{title}</h3>
            <p className="delete-modal-description">{description}</p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-btn cancel"
                disabled={isDeleting}
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="delete-modal-btn confirm"
                disabled={isDeleting}
                onClick={onConfirm}
              >
                {isDeleting ? 'Deleting...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
