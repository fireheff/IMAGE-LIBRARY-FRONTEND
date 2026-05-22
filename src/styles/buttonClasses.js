export function getButtonClasses(theme = "light") {
  return {
    primary:
      theme === "light"
        ? "rounded-2xl bg-slate-400 text-sm font-medium text-slate-950 px-4 py-3 opacity-70 hover:bg-amber-100"
        : "rounded-2xl bg-slate-500 text-slate-50 text-sm font-medium px-4 py-3 opacity-70 hover:bg-amber-600/50",

    secondary:
      theme === "light"
        ? "rounded-2xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-700 opacity-90 hover:bg-orange-300"
        : "rounded-2xl bg-slate-400 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-yellow-50",

    edit:
      theme === "light"
        ? "rounded-2xl bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-400"
        : "rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-400",

    delete:
      theme === "light"
        ? "rounded-2xl bg-orange-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-orange-400"
        : "rounded-2xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600",

    cancel:
      theme === "light"
        ? "rounded-2xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        : "rounded-2xl border border-white/10 px-4 py-2 font-medium text-slate-200 hover:bg-white/10",

    compact:
      theme === "light"
        ? "rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
        : "rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10",

    chip:
      theme === "light"
        ? "rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        : "rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10",

    chipActive:
      theme === "light"
        ? "rounded-2xl border border-slate-900 bg-slate-300 px-3 py-2 text-sm font-medium text-white"
        : "rounded-2xl border border-white bg-slate-300 px-3 py-2 text-sm font-medium text-slate-900",
  };
}

export function getPanelClasses(theme = "light") {
  return {
    upload:
      theme === "light"
        ? "bg-slate-100 border-slate-200 shadow-sm"
        : "bg-slate-900 border-white/10 shadow-sm",

    existing:
      theme === "light"
        ? "bg-indigo-100 border-slate-200 shadow-sm"
        : "bg-slate-700 border-white/10 shadow-sm",

    modalCard:
      theme === "light" ? "bg-white text-slate-900" : "bg-slate-900 text-white",
  };
}

export function getTextClasses(theme = "light") {
  return {
    muted: theme === "light" ? "text-slate-600" : "text-slate-300",
    soft: theme === "light" ? "text-slate-500" : "text-slate-400",
    title: theme === "light" ? "text-slate-900" : "text-white",
  };
}

export function getInputClasses(theme = "light") {
  return {
    default:
      theme === "light"
        ? "w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 hover:bg-slate-100 hover:border-slate-400 text-slate-900"
        : "w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 hover:bg-white/10 hover:border-white/30 text-white",

    compact:
      theme === "light"
        ? "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        : "rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white",
  };
}

export function getConfirmClasses(theme = "light", variant = "default") {
  const textMuted = theme === "light" ? "text-slate-600" : "text-slate-300";

  return {
    button:
      variant === "danger"
        ? "rounded-2xl bg-red-600 px-4 py-2 font-medium text-white hover:opacity-90"
        : variant === "warning"
        ? "rounded-2xl bg-amber-500 px-4 py-2 font-medium text-white hover:opacity-90"
        : theme === "light"
        ? "rounded-2xl bg-slate-900 px-4 py-2 font-medium text-white hover:opacity-90"
        : "rounded-2xl bg-white px-4 py-2 font-medium text-slate-900 hover:opacity-90",

    tone:
      variant === "danger"
        ? theme === "light"
          ? "bg-red-100 text-red-600"
          : "bg-red-500/20 text-red-300"
        : variant === "warning"
        ? theme === "light"
          ? "bg-amber-100 text-amber-600"
          : "bg-amber-500/20 text-amber-300"
        : theme === "light"
        ? "bg-slate-100 text-slate-600"
        : "bg-slate-800 text-slate-200",

    toneLabelClass:
      variant === "danger"
        ? theme === "light"
          ? "text-red-600"
          : "text-red-300"
        : variant === "warning"
        ? theme === "light"
          ? "text-amber-600"
          : "text-amber-300"
        : textMuted,

    icon: variant === "danger" ? "⚠️" : variant === "warning" ? "⚠" : "ℹ️",

    label:
      variant === "danger"
        ? "Danger"
        : variant === "warning"
        ? "Please review"
        : "Confirmation",
  };
}

export function getGalleryClasses(theme = "light") {
  const ui = {
    card:
      theme === "light"
        ? "bg-white border-slate-200 shadow-sm"
        : "bg-slate-900 border-white/10 shadow-sm",

    panel:
      theme === "light"
        ? "bg-white/80 border-slate-200"
        : "bg-slate-900/80 border-white/10",

    textTitle: theme === "light" ? "text-slate-500" : "text-white",

    input:
      theme === "light"
        ? "border-slate-300 bg-white text-slate-900 hover:bg-slate-100 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
        : "border-white/10 bg-slate-950 text-white hover:bg-white/10 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400",

    buttonSecondary:
      theme === "light"
        ? "border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400"
        : "border-white/10 text-slate-200 hover:bg-white/20 hover:border-white/30",
  };

  return {
    ...ui,
    compactInput: `h-9 rounded-xl border px-3 text-sm ${ui.input}`,
    compactButton: `h-9 rounded-xl border px-3 text-sm font-medium transition ${ui.buttonSecondary}`,
  };
}

// buttons for individual edit in ImageModal

export function getToggleButtonClasses(theme = "light") {
  return {
    base: "rounded-lg px-2 py-2 text-center text-xs font-medium transition",

    inactive:
      theme === "light"
        ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        : "border border-white/10 bg-slate-900 text-slate-200 hover:bg-white/10",

    gallery:
      "bg-amber-200 text-amber-900 border border-amber-300 hover:bg-amber-300",
    featured:
      "bg-yellow-100 text-emerald-900 border border-yellow-300 hover:bg-yellow-300",
    hero: "bg-sky-200 text-violet-900 border border-sky-300 hover:bg-sky-300",
    shop: "bg-lime-200 text-sky-900 border border-lime-300 hover:bg-lime-300",
    intro:
      "bg-violet-200 text-rose-900 border border-violet-300 hover:bg-violet-300",
  };
}

export function getFilterClasses(theme = "light") {
  return {
    base: "w-full rounded-2xl border px-4 py-3 text-sm font-medium transition",

    input:
      theme === "light"
        ? "border-slate-300 bg-white text-slate-900 hover:bg-slate-100 hover:border-slate-400"
        : "border-white/10 bg-slate-950 text-white hover:bg-white/10 hover:border-white/30",

    category:
      "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200",

    gallery: "bg-amber-200 text-amber-800 border-amber-300 hover:bg-amber-300",

    hero: "bg-sky-200 text-sky-800 border-sky-300 hover:bg-sky-300",

    featured:
      "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200",

    shop: "bg-lime-200 text-lime-800 border-lime-300 hover:bg-lime-300",

    intro:
      "bg-violet-200 text-violet-800 border-violet-300 hover:bg-violet-300",
  };
}

export function getStatusClasses(theme = "light", variant = "default") {
  return {
    tone:
      variant === "success"
        ? theme === "light"
          ? "bg-green-100 text-green-700"
          : "bg-green-500/20 text-green-300"
        : variant === "error"
        ? theme === "light"
          ? "bg-red-100 text-red-700"
          : "bg-red-500/20 text-red-300"
        : variant === "warning"
        ? theme === "light"
          ? "bg-amber-100 text-amber-700"
          : "bg-amber-500/20 text-amber-300"
        : theme === "light"
        ? "bg-slate-100 text-slate-700"
        : "bg-slate-800 text-slate-200",

    icon:
      variant === "success"
        ? "✅"
        : variant === "error"
        ? "⚠️"
        : variant === "warning"
        ? "⚠"
        : "ℹ️",
  };
}
