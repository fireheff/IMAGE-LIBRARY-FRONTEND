import { API_URL, fixLocalhost } from "../utils/api";
import { motion } from "framer-motion";

// Reusable image card component.
// Used for gallery, featured images, favorites, shop cards, and image previews.

function ImageCard({
  // Image object with title, url, variants, category, price, badges, etc.
  image,

  // Opens image modal or preview.
  onClick,

  // Cart and favorite actions.
  onAddToCart,
  onToggleFavorite,

  // Favorite state.
  isFavorite = false,

  // Controls which buttons/badges are shown.
  showAddToCart = false,
  showFavoriteButton = true,
  showFeaturedBadge = false,
  showHeroBadge = false,
  showInShopBadge = false,

  // Layout options.
  naturalImage = false,
  shopCard = false,
}) {
  // Finds the best available image URL.
  // Small variant is preferred for cards to keep the gallery fast.
  const imageUrl =
    fixLocalhost(image.variants?.s?.url) ||
    fixLocalhost(image.src) ||
    fixLocalhost(image.url) ||
    fixLocalhost(image.image) ||
    (image.filename ? `${API_URL}/uploads/${image.filename}` : "");

  // Price shown on hover.
  // Variant price S is preferred, then M, then legacy image.price.
  const displayPrice =
    image.variants?.s?.price ?? image.variants?.m?.price ?? image.price;

  return (
    // Animated card wrapper.
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group overflow-hidden cursor-pointer bg-white shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:bg-gray-900"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className="relative overflow-hidden">
        {/* Main image */}
        <img
          src={imageUrl}
          alt={image.title}
          loading="lazy"
          decoding="async"
          className={`w-full transition duration-700 ease-out group-hover:scale-[1.02] group-hover:brightness-[1.03] ${
            shopCard
              ? "aspect-square object-cover"
              : naturalImage
              ? "block h-auto"
              : "h-100 object-cover"
          }`}
        />

        {/* Hover overlay with image details */}
        <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/60 via-black/15 to-transparent opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="w-full translate-y-2 p-4 text-white transition duration-500 group-hover:translate-y-0">
            <h3 className="text-base font-semibold">{image.title}</h3>

            {image.category && (
              <p className="text-sm text-white/80">{image.category}</p>
            )}

            {displayPrice && (
              <p className="mt-1 text-sm font-medium">
                {image.variants ? `from €${displayPrice}` : `€${displayPrice}`}
              </p>
            )}
          </div>
        </div>

        {/* Image status badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {/* Featured badge */}
          {showFeaturedBadge && image.featured && (
            <span className="rounded-full border border-white/30 bg-rose-400/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md backdrop-blur-sm">
              Featured
            </span>
          )}

          {/* Hero badge */}
          {showHeroBadge && image.hero && (
            <span className="rounded-full border border-white/30 bg-violet-600/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md backdrop-blur-sm">
              Hero
            </span>
          )}

          {/* Shop badge */}
          {showInShopBadge && image.inShop && (
            <span className="rounded-full border border-white/30 bg-emerald-600/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md backdrop-blur-sm">
              Shop
            </span>
          )}
        </div>

        {/* Favorite button area */}
        <div
          className="absolute top-2 right-2 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {showFavoriteButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              className={`rounded-lg bg-white/90 px-3 py-1 text-sm font-bold dark:bg-black/70 ${
                isFavorite ? "text-red-500" : "text-black dark:text-white"
              }`}
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          )}
        </div>
      </div>

      {/* Optional action area below image */}
      <div className="p-0">
        {showAddToCart && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
            className="w-full rounded-lg bg-black py-2 text-white transition hover:opacity-90 dark:bg-white dark:text-black"
          >
            Add to Cart
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default ImageCard;
