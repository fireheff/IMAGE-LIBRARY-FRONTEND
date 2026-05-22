import ImageCard from "../components/ImageCard";
import {
  getTextClasses,
  getPanelClasses,
  getButtonClasses,
} from "/src/styles/buttonClasses";

// Favorites page.
// Shows all saved favorite images and allows adding all favorites to the cart by size.

export default function Favorites({
  // Favorite image objects to display.
  images,

  // Array of favorite image IDs.
  favorites,

  // Favorite toggle handler.
  onToggleFavorite,

  // Opens selected image in modal.
  onImageClick,

  // Current app theme.
  theme = "light",

  // Adds all favorite images to the cart in selected size.
  onBuyAllFavorites,
}) {
  // Theme-based helper classes.

  const textMutedClass =
    theme === "light" ? "text-slate-600" : "text-slate-300";

  const text = getTextClasses(theme);
  const panel = getPanelClasses(theme);
  const buttons = getButtonClasses(theme);

  return (
    // Main favorites section.
    <section className="space-y-6 mt-25">
      {/* Header row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          {/* Page title */}
          <p
            className={`text-2xl md:text-4xl font-bold tracking-widest opacity-60 ${
              theme === "light" ? "text-slate-900" : "text-white"
            }`}
          >
            Favorites
          </p>

          <p className={`mt-2 ${textMutedClass}`}>
            Your saved favorite images.
          </p>
        </div>

        {/* Bulk add-to-cart buttons */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onBuyAllFavorites("s")}
              className={`bg-sky-200 ${buttons.secondary}`}
            >
              Add all <span style={{ color: "red" }}>S</span> size images to{" "}
              <span>🛒</span>
            </button>

            <button
              onClick={() => onBuyAllFavorites("m")}
              className={`bg-violet-200 ${buttons.secondary}`}
            >
              Add all <span style={{ color: "red" }}>M</span> size images to{" "}
              <span>🛒</span>
            </button>

            <button
              onClick={() => onBuyAllFavorites("l")}
              className={`bg-indigo-200 ${buttons.secondary}`}
            >
              Add all <span style={{ color: "red" }}>L</span> size images to{" "}
              <span>🛒</span>
            </button>
          </div>
        )}
      </div>

      {/* Favorites content panel */}
      <div className={`border p-5 ${panel.panel}`}>
        {/* Favorite count */}
        <p className={`mb-4 text-sm ${text.soft}`}>
          Your favorites: {images.length}
        </p>

        {images.length === 0 ? (
          // Empty favorites state
          <div
            className={`rounded-3xl border border-dashed p-10 text-center ${
              theme === "light"
                ? "border-slate-300 bg-slate-50"
                : "border-white/10 bg-slate-950"
            }`}
          >
            <p
              className={`text-lg font-medium ${
                theme === "light" ? "text-slate-900" : "text-white"
              }`}
            >
              No favorites yet
            </p>

            <p className={`mt-2 text-sm ${textMutedClass}`}>
              Click the ♥ icon on images to add them here.
            </p>
          </div>
        ) : (
          // Favorite image grid
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onClick={() => onImageClick(image)}
                showPrice={true}
                theme={theme}
                isFavorite={favorites.includes(image.id)}
                onToggleFavorite={() => onToggleFavorite(image.id)}
                showGalleryBadge={false}
                showFeaturedBadge={true}
                showHeroBadge={false}
                showInShopBadge={true}
                showFavoriteButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
