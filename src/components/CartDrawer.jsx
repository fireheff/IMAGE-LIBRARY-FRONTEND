import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fixLocalhost } from "../utils/api";
import { getButtonClasses, getTextClasses } from "../styles/buttonClasses";
import { getCartDrawerClasses } from "../styles/cartDrawerClasses";

// Slide-out shopping cart drawer.
// Displays cart items, quantity controls, totals, and checkout actions.

export default function CartDrawer({
  // Drawer visibility state.
  isOpen,

  // Cart items array.
  cart,

  // Calculated cart total.
  cartTotal,

  // Currency symbol used in pricing display.
  currencySymbol,

  // Drawer actions.
  onClose,
  onIncreaseItem,
  onDecreaseItem,
  clearCart,

  // Toast notification helper.
  showToast,

  // Updates selected size for a cart item.
  onUpdateItemSize,

  // Current app theme.
  theme = "light",
}) {
  // Close drawer when pressing Escape.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const buttons = getButtonClasses(theme);
  const text = getTextClasses(theme);
  const drawer = getCartDrawerClasses(theme);

  // Total quantity of all cart items.
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Framer Motion stagger animation for cart items.
  const containerStagger = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.05,
      },
    },
  };

  // Fade-up animation for drawer sections and items.
  const itemFadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  // Decreases item quantity.
  // Shows a warning toast if removing the final item.
  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      showToast?.(
        "Last item removed",
        "This was the last copy of this image in your cart.",
        "warning"
      );
    }

    onDecreaseItem(item.id, item.size);
  };

  // Sort sizes consistently: S → M → L → default.
  const sizeOrder = {
    s: 1,
    m: 2,
    l: 3,
    default: 4,
  };

  // Sort cart alphabetically, then by size.
  const sortedCart = [...cart].sort((a, b) => {
    const titleCompare = a.title.localeCompare(b.title);

    if (titleCompare !== 0) {
      return titleCompare;
    }

    return (sizeOrder[a.size] ?? 99) - (sizeOrder[b.size] ?? 99);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        // Background overlay
        <motion.div
          className="fixed inset-0 z-110 bg-black/45 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onClose}
        >
          {/* Sliding drawer panel */}
          <motion.aside
            className={`absolute right-0 top-0 h-full w-full max-w-md flex flex-col shadow-2xl ${drawer.drawer}`}
            initial={{ x: "100%", opacity: 0.98 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 28,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <motion.div
              variants={itemFadeUp}
              initial="hidden"
              animate="show"
              className={`flex items-center justify-between border-b px-6 py-5 ${drawer.border}`}
            >
              <div>
                <p
                  className={`text-2xl font-bold tracking-widest opacity-60 ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  }`}
                >
                  Your Cart
                </p>

                <p className={`mt-1 text-sm ${text.soft}`}>
                  {totalItems} item(s)
                </p>
              </div>

              {/* Close drawer button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className={drawer.closeButton}
              >
                ✕
              </motion.button>
            </motion.div>

            {/* Cart item list */}
            <motion.div
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
              variants={containerStagger}
              initial="hidden"
              animate="show"
            >
              {cart.length === 0 ? (
                // Empty cart state
                <motion.div
                  variants={itemFadeUp}
                  className={`rounded-3xl border p-6 ${drawer.card} ${text.soft}`}
                >
                  Your cart is empty.
                </motion.div>
              ) : (
                // Render sorted cart items
                sortedCart.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.size}`}
                    variants={itemFadeUp}
                    className={`flex gap-4 rounded-3xl border p-4 ${drawer.card}`}
                  >
                    {/* Product image */}
                    <img
                      src={fixLocalhost(item.url)}
                      alt={item.title}
                      loading="lazy"
                      className="h-20 w-20 rounded-2xl object-cover"
                    />

                    {/* Product info */}
                    <div className="flex-1">
                      <h3
                        className={`font-semibold text-s ${
                          theme === "light" ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {item.title}
                      </h3>

                      {/* Size + category badges */}
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            theme === "light"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-white/10 text-slate-200"
                          }`}
                        >
                          {item.size === "default"
                            ? "Standard"
                            : `Size ${item.size.toUpperCase()}`}
                        </span>

                        {item.category && (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs ${
                              theme === "light"
                                ? "bg-slate-50 text-slate-500"
                                : "bg-white/5 text-slate-400"
                            }`}
                          >
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Quantity × price */}
                      <p className={`mt-2 text-sm ${text.muted}`}>
                        {currencySymbol}
                        {item.price} × {item.quantity}
                      </p>

                      {/* Variant size selector */}
                      {item.size !== "default" && (
                        <select
                          value={item.size}
                          onChange={(e) =>
                            onUpdateItemSize(item.id, item.size, e.target.value)
                          }
                          className="rounded-xl border px-2 py-1 text-sm"
                        >
                          <option value="s">S</option>
                          <option value="m">M</option>
                          <option value="l">L</option>
                        </select>
                      )}

                      {/* Item subtotal */}
                      <p
                        className={`mt-1 font-medium ${
                          theme === "light" ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {currencySymbol}
                        {item.price * item.quantity}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className={`flex items-center rounded-2xl border overflow-hidden ${
                          theme === "light"
                            ? "border-slate-300"
                            : "border-white/10"
                        }`}
                      >
                        {/* Decrease quantity */}
                        <button
                          onClick={() => handleDecrease(item)}
                          className={`w-7 h-7 flex items-center justify-center text-lg font-bold ${
                            theme === "light"
                              ? "text-slate-500 hover:text-slate-900"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          −
                        </button>

                        {/* Current quantity */}
                        <span className={drawer.quantityBox}>
                          {item.quantity}
                        </span>

                        {/* Increase quantity */}
                        <button
                          onClick={() => onIncreaseItem(item.id, item.size)}
                          className={`w-7 h-7 flex items-center justify-center text-lg font-bold ${
                            theme === "light"
                              ? "text-slate-500 hover:text-slate-900"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove one item shortcut */}
                      <button
                        onClick={() => handleDecrease(item)}
                        className={`text-xs ${
                          theme === "light"
                            ? "text-slate-500 hover:text-slate-900"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Remove one
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Cart footer */}
            <motion.div
              variants={itemFadeUp}
              initial="hidden"
              animate="show"
              className={`border-t px-6 py-5 space-y-4 ${drawer.border}`}
            >
              {/* Total price */}
              <div className="flex items-center justify-between">
                <span className={`font-medium ${text.muted}`}>Total</span>

                <span
                  className={`text-xl font-bold ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  }`}
                >
                  {currencySymbol}
                  {cartTotal}
                </span>
              </div>

              {/* Placeholder checkout button */}
              <button
                type="button"
                className={drawer.checkoutButton}
                onClick={() => {
                  showToast?.(
                    "Checkout coming soon",
                    "Checkout is not available yet. Your cart is saved locally for now.",
                    "warning"
                  );
                }}
              >
                Checkout
              </button>

              {/* Clear entire cart */}
              <button onClick={clearCart} className={buttons.secondary}>
                Clear Cart
              </button>
            </motion.div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
