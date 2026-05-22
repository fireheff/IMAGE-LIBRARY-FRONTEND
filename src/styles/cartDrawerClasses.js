export function getCartDrawerClasses(theme = "light") {
  return {
    drawer:
      theme === "light" ? "bg-white text-slate-900" : "bg-slate-900 text-white",

    border: theme === "light" ? "border-slate-200" : "border-white/10",

    closeButton:
      theme === "light"
        ? "rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        : "rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20",

    quantityBox:
      theme === "light"
        ? "min-w-[2.5rem] px-3 py-2 text-center text-sm font-medium text-slate-900 border-x border-slate-300"
        : "min-w-[2.5rem] px-3 py-2 text-center text-sm font-medium text-white border-x border-white/10",

    checkoutButton:
      theme === "light"
        ? "w-full rounded-2xl bg-sky-600 py-3 font-medium text-white hover:opacity-80"
        : "w-full rounded-2xl bg-white py-3 font-medium text-slate-900 hover:opacity-80",

    card:
      theme === "light"
        ? "bg-white border-slate-200"
        : "bg-slate-950 border-white/10",
  };
}
