import ImageCard from "../components/ImageCard";
import { getTextClasses, getPanelClasses } from "/src/styles/buttonClasses";

// Featured page.
// Shows all images marked as featured/curated by the artist.

export default function Featured({
  // Featured image objects to display.
  images = [],

  // Favorite image IDs.
  favorites = [],

  // Favorite toggle handler.
  onToggleFavorite,

  // Opens selected image in modal.
  onImageClick,

  // Current app theme.
  theme = "light",
}) {
  // Theme-based muted text.
  const textMutedClass =
    theme === "light" ? "text-slate-600" : "text-slate-300";

  const text = getTextClasses(theme);
  const panel = getPanelClasses(theme);

  return (
    // Main featured section.
    <section className="space-y-6 mt-25">
      {/* Page heading */}
      <div>
        <p
          className={`text-2xl md:text-4xl font-bold tracking-widest opacity-60 ${
            theme === "light" ? "text-slate-900" : "text-white"
          }`}
        >
          Featured Images
        </p>

        <p className={`mt-2 ${textMutedClass}`}>
          This page shows all images curated by the artist.
        </p>
      </div>

      {/* Featured content panel */}
      <div className={`border p-5 ${panel.panel}`}>
        {/* Featured image count */}
        <p className={`mb-4 text-sm ${text.soft}`}>
          Featured selection: {images.length}
        </p>

        {images.length === 0 ? (
          // Empty state
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
              No featured images yet
            </p>
          </div>
        ) : (
          // Featured image grid
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onClick={() =>
                  onImageClick(image, images, "Featured", "/featured")
                }
                showPrice={true}
                theme={theme}
                isFavorite={favorites.includes(image.id)}
                onToggleFavorite={() => onToggleFavorite(image.id)}
                showFeaturedBadge={true}
                showHeroBadge={false}
                showInShopBadge={true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
