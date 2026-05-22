import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/ui/logo.png";

// Main layout wrapper used around all pages.
// Adds global header, footer, theme toggle, and page spacing.

export default function Layout({
  // Page content.
  children,

  // Current page name, used to highlight active nav links.
  page,

  // Current role: "user" or "admin".
  isAdmin = false,
  onLogoutAdmin,

  // Theme controls.
  theme = "light",
  onToggleTheme,

  // Header badge data.
  showBadge = false,
  favoritesCount = 0,
  totalCartItems = 0,
  cartTotal = 0,

  // Header visibility, used especially on Home scroll behavior.
  showHeader = true,

  // Optional reset when navigating to Gallery.
  onResetGalleryFilters,
}) {
  return (
    // Global app background and text colors.
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === "light"
          ? "bg-slate-50 text-slate-900"
          : "bg-slate-950 text-slate-100"
      }`}
    >
      {/* Fixed site header */}
      <SiteHeader
        page={page}
        isAdmin={isAdmin}
        onLogoutAdmin={onLogoutAdmin}
        theme={theme}
        showBadge={showBadge}
        favoritesCount={favoritesCount}
        totalCartItems={totalCartItems}
        cartTotal={cartTotal}
        showHeader={showHeader}
        onResetGalleryFilters={onResetGalleryFilters}
      />

      {/* Main page area.
          Home has custom full-screen sections, other pages get padding. */}
      <main className={page === "home" ? "flex-1" : "flex-1 p-6 md:p-10"}>
        <div className="w-full">{children}</div>
      </main>

      {/* Global footer */}
      <SiteFooter theme={theme} />

      {/* Floating theme toggle */}
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </div>
  );
}

// Fixed responsive site header.
// Contains logo, navigation, role buttons, mobile menu, and optional cart/favorites badge.

function SiteHeader({
  page,
  isAdmin = false,
  onLogoutAdmin,
  theme,
  showBadge = false,
  favoritesCount = 0,
  totalCartItems = 0,
  cartTotal = 0,
  showHeader = true,
  onResetGalleryFilters,
}) {
  // Tracks mobile menu visibility.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to close mobile menu after navigation.
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md transition-all duration-500 ease-out ${
        showHeader
          ? "translate-y-0 opacity-90"
          : "-translate-y-full opacity-0 pointer-events-none"
      } ${
        theme === "light"
          ? "bg-white/80 border-slate-200"
          : "bg-slate-950/70 border-white/10"
      }`}
    >
      <div className="w-full px-4 py-4 md:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          {/* Brand / logo area */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="My Gallery logo"
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-20 md:w-20 object-contain"
            />

            <div>
              <p
                className={`text-[10px] uppercase tracking-[0.28em] sm:text-xs ${
                  theme === "light" ? "text-slate-500" : "text-white/50"
                }`}
              >
                Renée Fiedler Photography
              </p>

              <h1
                className={`text-base font-bold sm:text-lg md:text-xl ${
                  theme === "light" ? "text-slate-900" : "text-white"
                }`}
              >
                Creative Image Library
              </h1>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:grid lg:flex-1 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div />

            <nav className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6">
              <HeaderLink to="/" active={page === "home"} theme={theme}>
                Home
              </HeaderLink>

              <HeaderLink
                to="/gallery"
                active={page === "gallery"}
                theme={theme}
                onClick={onResetGalleryFilters}
              >
                Gallery
              </HeaderLink>

              <HeaderLink
                to="/featured"
                active={page === "featured"}
                theme={theme}
              >
                Featured
              </HeaderLink>

              <HeaderLink
                to="/favorites"
                active={page === "favorites"}
                theme={theme}
              >
                Favorites
              </HeaderLink>

              <HeaderLink to="/shop" active={page === "shop"} theme={theme}>
                Shop
              </HeaderLink>

              <HeaderLink to="/about" active={page === "about"} theme={theme}>
                About
              </HeaderLink>

              <HeaderLink
                to="/contact"
                active={page === "contact"}
                theme={theme}
              >
                Contact
              </HeaderLink>

              {/* Admin-only navigation link */}
              {isAdmin && (
                <HeaderLink
                  to="/manager"
                  active={page === "manage"}
                  theme={theme}
                >
                  Manage
                </HeaderLink>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    theme === "light"
                      ? "text-red-500 hover:bg-slate-100"
                      : "text-red-400 hover:bg-white/10"
                  }`}
                >
                  Log out
                </button>
              )}
            </nav>

            {/* Desktop right-side controls */}
            <div className="flex items-center justify-end gap-2">
              {/* Favorites/cart summary */}
              {showBadge && (
                <HeaderBadge
                  theme={theme}
                  favoritesCount={favoritesCount}
                  totalCartItems={totalCartItems}
                  cartTotal={cartTotal}
                />
              )}
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className={`inline-flex items-center mr-8 justify-center rounded-2xl border px-3 py-2 lg:hidden ${
              theme === "light"
                ? "bg-white text-slate-900 border-slate-300"
                : "bg-slate-900 text-white border-white/10"
            }`}
          >
            <span className="text-lg leading-none">
              {mobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className={`mt-3 flex flex-col items-end gap-1 lg:hidden`}>
            {/* Mobile nav links */}
            <nav className="flex flex-col items-end gap-1">
              <MobileHeaderLink
                to="/"
                active={page === "home"}
                theme={theme}
                onNavigate={closeMobileMenu}
              >
                Home
              </MobileHeaderLink>

              <MobileHeaderLink
                to="/gallery"
                active={page === "gallery"}
                theme={theme}
                onNavigate={() => {
                  onResetGalleryFilters?.();
                  closeMobileMenu();
                }}
              >
                Gallery
              </MobileHeaderLink>

              <MobileHeaderLink
                to="/featured"
                active={page === "featured"}
                theme={theme}
                onNavigate={closeMobileMenu}
              >
                Featured
              </MobileHeaderLink>

              <MobileHeaderLink
                to="/favorites"
                active={page === "favorites"}
                theme={theme}
                onNavigate={closeMobileMenu}
              >
                Favorites
              </MobileHeaderLink>

              <MobileHeaderLink
                to="/shop"
                active={page === "shop"}
                theme={theme}
                onNavigate={closeMobileMenu}
              >
                Shop
              </MobileHeaderLink>

              <MobileHeaderLink
                to="/about"
                active={page === "about"}
                theme={theme}
                onNavigate={closeMobileMenu}
              >
                About
              </MobileHeaderLink>

              <MobileHeaderLink
                to="/contact"
                active={page === "contact"}
                theme={theme}
                onNavigate={closeMobileMenu}
              >
                Contact
              </MobileHeaderLink>

              {/* Admin-only mobile link */}
              {isAdmin && (
                <MobileHeaderLink
                  to="/manager"
                  active={page === "manage"}
                  theme={theme}
                  onNavigate={closeMobileMenu}
                >
                  Manage
                </MobileHeaderLink>
              )}
            </nav>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onLogoutAdmin?.();
                  closeMobileMenu();
                }}
                className={`rounded-2xl px-3 py-1.5 text-right text-sm font-medium transition ${
                  theme === "light"
                    ? "text-slate-700 hover:bg-white/10"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Logout
              </button>
            )}

            {/* Mobile favorites/cart summary */}
            {showBadge && (
              <div className="mt-4">
                <HeaderBadge
                  theme={theme}
                  favoritesCount={favoritesCount}
                  totalCartItems={totalCartItems}
                  cartTotal={cartTotal}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

// Desktop navigation link.
// Uses the active prop from the parent to apply current-page styling.

function HeaderLink({ to, active, children, theme, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`relative px-1 py-2 text-sm font-medium uppercase tracking-[0.18em] transition duration-300 ${
        active
          ? theme === "light"
            ? "text-slate-900"
            : "text-white"
          : theme === "light"
          ? "text-slate-400 hover:text-slate-700"
          : "text-slate-500 hover:text-slate-200"
      }`}
    >
      {children}

      {active && (
        <span
          className={`absolute bottom-0 left-0 h-px w-full ${
            theme === "light" ? "bg-slate-900" : "bg-white"
          }`}
        />
      )}
    </NavLink>
  );
}

// Mobile navigation link.
// Closes the mobile menu after navigating.

function MobileHeaderLink({ to, active, children, theme, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={`rounded-2xl px-3 py-1.5 text-right text-sm font-medium transition ${
        active
          ? theme === "light"
            ? "bg-slate-900/70 text-white"
            : "bg-white/70 text-slate-900"
          : theme === "light"
          ? "bg-white/5 text-slate-700 hover:bg-white/10"
          : "bg-white/5 text-white hover:bg-white/10"
      }`}
    >
      {children}
    </NavLink>
  );
}

// Small header summary for favorites, cart item count, and cart total.

function HeaderBadge({ theme, favoritesCount, totalCartItems, cartTotal }) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-4 ${
        theme === "light"
          ? "bg-slate-100 text-slate-900"
          : "bg-slate-800 text-white"
      }`}
    >
      <span>❤️ {favoritesCount}</span>

      <div className="flex items-center gap-2">
        <span>🛒</span>

        <span
          className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${
            theme === "light"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-900"
          }`}
        >
          {totalCartItems}
        </span>
      </div>

      <span>€{cartTotal}</span>
    </div>
  );
}

// Site footer with secondary navigation links.

function SiteFooter({ theme }) {
  const navigate = useNavigate();

  return (
    <footer
      className={`pt-10 pb-10 border-t ${
        theme === "light"
          ? "bg-indigo-300 border-blue-200"
          : "bg-indigo-950 border-blue-800"
      }`}
    >
      <div
        className={`w-full flex flex-col gap-4 px-6 py-6 text-2xl md:flex-row md:items-center md:justify-between md:px-10 ${
          theme === "light" ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {/* Footer brand text */}
        <div>
          <p
            className={
              theme === "light"
                ? "font-medium text-slate-700"
                : "font-medium text-slate-300"
            }
          >
            Creative Image Gallery
          </p>

          <p className="mt-5 text-xl">Renée Fiedler Photography</p>
          <p className="mt-6 text-sm">All Images © Renée Fiedler</p>
        </div>

        {/* Footer navigation */}
        <div className="flex flex-wrap gap-5 text-base">
          <button onClick={() => navigate("/")} className="hover:text-inherit">
            Home
          </button>

          <button
            onClick={() => navigate("/gallery")}
            className="hover:text-inherit"
          >
            Gallery
          </button>

          <button
            onClick={() => navigate("/shop")}
            className="hover:text-inherit"
          >
            Shop
          </button>

          <button
            onClick={() => navigate("/featured")}
            className="hover:text-inherit"
          >
            Featured Images
          </button>

          <button
            onClick={() => navigate("/favorites")}
            className="hover:text-inherit"
          >
            Favorites
          </button>

          <button
            onClick={() => navigate("/about")}
            className="hover:text-inherit"
          >
            About
          </button>

          <button
            onClick={() => navigate("/contact")}
            className="hover:text-inherit"
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
}
