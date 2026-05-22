import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getButtonClasses,
  getGalleryClasses,
  getConfirmClasses,
} from "../styles/buttonClasses";

// Reusable confirmation modal.
// Used for actions like delete, warning prompts, and general confirmations.

export default function ConfirmModal({
  // Controls modal visibility.
  isOpen,

  // Modal content.
  title = "Are you sure?",
  message = "",

  // Button labels.
  confirmText = "Confirm",
  cancelText = "Cancel",

  // Action handlers.
  onConfirm,
  onCancel,

  // Current theme.
  theme = "light",

  // Modal tone:
  // "default" | "warning" | "danger"
  variant = "default",
}) {
  // Close modal when pressing Escape.
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  const buttons = getButtonClasses(theme);
  const gallery = getGalleryClasses(theme);
  const confirm = getConfirmClasses(theme, variant);

  return (
    <AnimatePresence>
      {isOpen && (
        // Modal overlay
        <motion.div
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={onCancel}
        >
          {/* Modal card */}
          <motion.div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${gallery.panel}`}
            initial={{ opacity: 0, scale: 0.96, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 14 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header content */}
            <div className="flex items-start gap-4">
              {/* Icon container */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${confirm.tone}`}
              >
                {confirm.icon}
              </div>

              {/* Title + message */}
              <div className="flex-1">
                <p className={`text-sm font-medium ${confirm.label}`}>
                  {confirm.label}
                </p>

                <h2 className="mt-1 text-2xl font-bold">{title}</h2>

                <p className={`mt-3 ${confirm.toneLabelClass}`}>{message}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-end gap-3">
              {/* Cancel button */}
              <button onClick={onCancel} className={buttons.cancel}>
                {cancelText}
              </button>

              {/* Confirm button */}
              <button onClick={onConfirm} className={confirm.button}>
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
