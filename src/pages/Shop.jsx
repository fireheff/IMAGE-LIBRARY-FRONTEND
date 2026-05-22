import ImageCard from "../components/ImageCard";
import { useMemo, useState } from "react";
import {
  getButtonClasses,
  getInputClasses,
  getTextClasses,
} from "../styles/buttonClasses";

// Shop page.
// Displays images available for purchase, with search, sorting, favorites filter,
// cart summary, size selection, and add-to-cart actions.

function Shop({
  // Shop image data.
  images = [],

  // Cart state.
  cart = [],
  cartTotal = 0,
  currencySymbol = "€",

  // Cart actions.
  clearCart,
  onOpenCart,
  onAddToCart,

  // Favorites state and actions.
  favorites = [],
  onToggleFavorite,

  // Opens selected image in modal.
  onImageClick,

  // Current app theme.
  theme = "light",
}) {
  // Local shop filter/sort state.
  const [shopSearchTerm, setShopSearchTerm] = useState("");
  const [shopSortBy, setShopSortBy] = useState("title-asc");
  const [showShopFavoritesOnly, setShowShopFavoritesOnly] = useState(false);

  // Stores selected size per image ID.
  const [selectedSizes, setSelectedSizes] = useState({});

  // Button styles
  const buttons = getButtonClasses(theme);
  const text = getTextClasses(theme);
  const inputs = getInputClasses(theme);

  // Filter and sort shop images.
  const visibleShopImages = useMemo(() => {
    let result = [...images];

    // Search by title or category.
    if (shopSearchTerm.trim()) {
      const term = shopSearchTerm.toLowerCase();

      result = result.filter(
        (img) =>
          img.title?.toLowerCase().includes(term) ||
          img.category?.toLowerCase().includes(term)
      );
    }

    // Optional favorites-only filter.
    if (showShopFavoritesOnly) {
      result = result.filter((img) =>
        favorites.some((favId) => String(favId) === String(img.id))
      );
    }

    // Sort result list.
    result.sort((a, b) => {
      if (shopSortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }

      if (shopSortBy === "title-desc") {
        return b.title.localeCompare(a.title);
      }

      if (shopSortBy === "price-asc") {
        return (a.price ?? 0) - (b.price ?? 0);
      }

      if (shopSortBy === "price-desc") {
        return (b.price ?? 0) - (a.price ?? 0);
      }

      if (shopSortBy === "newest") {
        return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
      }

      return 0;
    });

    return result;
  }, [images, shopSearchTerm, shopSortBy, showShopFavoritesOnly, favorites]);

  // Returns all available variant sizes for an image.
  // Falls back to "default" for old/non-variant images.
  function getAvailableSizes(image) {
    if (image.variants && typeof image.variants === "object") {
      return Object.keys(image.variants);
    }

    return ["default"];
  }

  // Returns the selected size for an image.
  // Defaults to M if available, otherwise first available size.
  function getSelectedSize(image) {
    const availableSizes = getAvailableSizes(image);

    if (selectedSizes[image.id]) {
      return selectedSizes[image.id];
    }

    return availableSizes.includes("m") ? "m" : availableSizes[0];
  }

  // Gets the price for the selected size.
  function getSelectedPrice(image, size) {
    if (image.variants?.[size]?.price != null) {
      return image.variants[size].price;
    }

    return image.price ?? 0;
  }

  // Total number of cart items, including quantities.
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Theme-based helper classes.

  return (
    // Main shop wrapper.
    <div className="p-6 space-y-6 mt-25">
      {/* Sticky shop toolbar */}
      <div
        className={`sticky top-30 z-30 flex flex-col gap-4 rounded-3xl border p-4 shadow-sm md:flex-row md:items-center md:justify-between ${
          theme === "light"
            ? "border-slate-200 bg-slate-50/95 backdrop-blur"
            : "border-white/10 bg-slate-950/95 backdrop-blur"
        }`}
      >
        {/* Shop title */}
        <div>
          <p
            className={`text-4xl font-bold opacity-60 tracking-widest ${
              theme === "light" ? "text-slate-900" : "text-white"
            }`}
          >
            Shop
          </p>

          <p className={`mt-1 ${text.muted}`}>
            Browse images available for purchase.
          </p>
        </div>

        {/* Search, sort, and filter controls */}
        <div className="mb-5 flex flex-wrap gap-3">
          <input
            type="text"
            value={shopSearchTerm}
            onChange={(e) => setShopSearchTerm(e.target.value)}
            placeholder="Search shop images..."
            className={buttons.compact}
          />

          <select
            value={shopSortBy}
            onChange={(e) => setShopSortBy(e.target.value)}
            className={buttons.compact}
          >
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price low-high</option>
            <option value="price-desc">Price high-low</option>
          </select>

          {/* Favorites-only shop filter */}
          <button
            type="button"
            onClick={() => setShowShopFavoritesOnly((prev) => !prev)}
            className={buttons.compact}
          >
            {showShopFavoritesOnly ? "Showing favorites" : "Favorites only"}
          </button>

          {/* Reset shop filters */}
          <button
            type="button"
            onClick={() => {
              setShopSearchTerm("");
              setShopSortBy("title-asc");
              setShowShopFavoritesOnly(false);
            }}
            className={buttons.compact}
          >
            Reset
          </button>
        </div>

        {/* Cart summary and actions */}
        <div className="flex flex-wrap gap-3">
          <div className={`rounded-2xl border px-4 py-3 ${text.panel}`}>
            <p className={`text-sm ${text.muted}`}>Cart items</p>
            <p className="text-lg font-semibold">{totalCartItems}</p>
          </div>

          <div className={`rounded-2xl border px-4 py-3 ${text.panel}`}>
            <p className={`text-sm ${text.muted}`}>Cart total</p>
            <p className="text-lg font-semibold">
              {currencySymbol}
              {cartTotal}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            className={buttons.primary}
          >
            Show Cart
          </button>

          <button
            type="button"
            onClick={clearCart}
            className={buttons.secondary}
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Result count */}
      <p className={`mb-4 text-sm ${text.muted}`}>
        {visibleShopImages.length} result(s)
        {shopSearchTerm && ` for "${shopSearchTerm}"`}
      </p>

      {visibleShopImages.length === 0 ? (
        // Empty shop state
        <div
          className={`rounded-3xl border p-8 text-center ${text.panel} ${text.muted}`}
        >
          No shop images match your filters.
        </div>
      ) : (
        // Shop product grid
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
          {visibleShopImages.map((image) => {
            const isFav = favorites.includes(image.id);
            const availableSizes = getAvailableSizes(image);
            const selectedSize = getSelectedSize(image);
            const selectedPrice = getSelectedPrice(image, selectedSize);
            const hasVariants = availableSizes[0] !== "default";

            // Override displayed card price with selected variant price.
            const displayImage = {
              ...image,
              price: hasVariants
                ? selectedPrice
                : image.price ?? image.variants?.s?.price,
            };

            return (
              <div
                key={image.id}
                className={`space-y-3 rounded-3xl border p-3 ${
                  theme === "light"
                    ? "border-slate-200 bg-white"
                    : "border-white/10 bg-slate-900"
                }`}
              >
                {/* Image card */}
                <ImageCard
                  image={displayImage}
                  shopCard={true}
                  onClick={() => onImageClick?.(image)}
                  onToggleFavorite={() => onToggleFavorite?.(image.id)}
                  isFavorite={isFav}
                  showAddToCart={false}
                  showFavoriteButton={true}
                  showGalleryBadge={false}
                  showFeaturedBadge={true}
                  showHeroBadge={false}
                  showInShopBadge={false}
                  showHoverMeta={true}
                />

                {hasVariants ? (
                  // Variant size selection
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((sizeKey) => {
                        const isSelected = selectedSize === sizeKey;

                        return (
                          <button
                            key={sizeKey}
                            type="button"
                            onClick={() =>
                              setSelectedSizes((prev) => ({
                                ...prev,
                                [image.id]: sizeKey,
                              }))
                            }
                            className={
                              isSelected ? buttons.chipActive : buttons.chip
                            }
                          >
                            {sizeKey.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected price and size */}
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${
                          theme === "light" ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {currencySymbol}
                        {selectedPrice}
                      </p>

                      <p className={`text-xs ${text.soft}`}>
                        Selected size: {selectedSize.toUpperCase()}
                      </p>
                    </div>

                    <p className={`text-xs ${text.soft}`}>
                      Choose a size before adding to cart.
                    </p>
                  </div>
                ) : (
                  // Non-variant price display
                  <p className={`text-sm font-medium ${text.muted}`}>
                    {currencySymbol}
                    {image.price ?? 0}
                  </p>
                )}

                {/* Add selected image/size to cart */}
                <button
                  type="button"
                  onClick={() => onAddToCart?.(image, selectedSize)}
                  disabled={hasVariants && !selectedSize}
                  className={`w-full ${
                    hasVariants && !selectedSize
                      ? theme === "light"
                        ? "cursor-not-allowed rounded-2xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-500"
                        : "cursor-not-allowed rounded-2xl bg-slate-800 px-4 py-3 text-sm font-medium text-slate-500"
                      : buttons.primary
                  }`}
                >
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Shop;
