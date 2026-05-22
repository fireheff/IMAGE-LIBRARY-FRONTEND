import { AnimatePresence, motion } from "framer-motion";
import { getStatusClasses } from "../styles/buttonClasses";

export default function Toast({ toast, onClose, theme = "light" }) {
  if (!toast) return null;

  const status = getStatusClasses(theme, toast.variant);

  const baseClass =
    theme === "light"
      ? "bg-white text-slate-900 border-slate-200"
      : "bg-slate-900 text-white border-white/10";

  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className={`fixed top-8 right-8 w-full max-w-lg rounded-3xl border shadow-2xl ${baseClass}`}
        style={{ zIndex: 2147483647 }}
      >
        <div className="flex items-start gap-4 p-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg ${status.tone}`}
          >
            {status.icon}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold">{toast.title}</h3>

            {toast.message && (
              <p
                className={`mt-1 text-sm ${
                  theme === "light" ? "text-slate-600" : "text-slate-300"
                }`}
              >
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className={`rounded-full px-2 py-1 text-sm ${
              theme === "light"
                ? "text-slate-500 hover:bg-slate-100"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
