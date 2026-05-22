import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GalleryMasonryLayout from "../layouts/GalleryMasonryLayout";
import Spinner from "../components/Spinner";
import { getGalleryClasses } from "../styles/buttonClasses";

export default function Gallery({
  images,
  loading,
  error,
  showPrice,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalResults,
  onImageClick,
  favorites,
  onToggleFavorite,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  theme = "light",
}) {
  const [showSearch, setShowSearch] = useState(false);

  const ui = getGalleryClasses(theme);

  const visibleImages = useMemo(() => {
    return images;
  }, [images]);

  const resetSearch = () => {
    onSearchChange("");
  };

  return (
    <section className="mt-25 space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p
            className={`text-2xl font-bold md:text-4xl tracking-widest ${ui.textTitle}`}
          >
            Gallery
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className={`text-sm ${ui.textSoft}`}>
            {totalResults} image(s) found
          </p>

          {!showSearch && (
            <motion.button
              type="button"
              onClick={() => setShowSearch(true)}
              whileTap={{ scale: 0.97 }}
              className={ui.compactInput}
            >
              Search
            </motion.button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="border-b border-slate-200/40 pb-3 dark:border-white/10">
        {/* Mobile dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`w-full rounded-xl border px-3 py-2 text-sm sm:hidden ${ui.input}`}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All" : category}
            </option>
          ))}
        </select>

        {/* Desktop tabs */}
        <div className="hidden overflow-x-auto sm:block" role="tablist">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-max items-center gap-8">
              {categories.map((category) => {
                const isActive = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onCategoryChange(category)}
                    className={`relative shrink-0 pb-3 text-sm uppercase tracking-[0.22em] transition duration-300 ${
                      isActive
                        ? theme === "light"
                          ? "text-slate-900"
                          : "text-white"
                        : theme === "light"
                        ? "text-slate-400 hover:text-slate-700"
                        : "text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {category === "all" ? "All" : category}

                    {isActive && (
                      <motion.span
                        layoutId="gallery-tab-indicator"
                        className={`absolute bottom-0 left-0 h-px w-full ${
                          theme === "light" ? "bg-slate-900" : "bg-white"
                        }`}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onToggleFavoritesOnly}
              className={`shrink-0 text-sm uppercase tracking-[0.22em] transition ${
                showFavoritesOnly
                  ? theme === "light"
                    ? "text-red-500"
                    : "text-red-400"
                  : theme === "light"
                  ? "text-slate-400 hover:text-slate-700"
                  : "text-slate-500 hover:text-slate-200"
              }`}
            >
              ♥ Favorites
            </button>
          </div>
        </div>
      </div>

      {/* Search panel */}
      <AnimatePresence initial={false}>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className={`rounded-2xl border px-4 py-3 backdrop-blur-md ${ui.panel}`}
            >
              <div className="flex justify-end">
                <div className="flex w-full max-w-md gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search title"
                    className={`flex-1 ${ui.compactInput}`}
                  />

                  <button
                    type="button"
                    onClick={resetSearch}
                    className={ui.compactInput}
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetSearch();
                      setShowSearch(false);
                    }}
                    className={ui.compactInput}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery states */}
      {loading ? (
        <div
          className={`rounded-3xl border p-8 text-center ${ui.card} ${ui.textSoft}`}
        >
          <Spinner loading={loading} />
          <p className="mt-4">Loading images...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border p-8 text-center text-red-500">
          Backend is not available. Please start the server.
        </div>
      ) : visibleImages.length === 0 ? (
        <div
          className={`rounded-3xl border p-8 text-center ${ui.card} ${ui.textSoft}`}
        >
          No images found.
        </div>
      ) : (
        <GalleryMasonryLayout
          images={visibleImages}
          onImageClick={onImageClick}
          showPrice={showPrice}
          theme={theme}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </section>
  );
}
