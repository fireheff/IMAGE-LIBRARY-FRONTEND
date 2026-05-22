import { fixLocalhost } from "../../utils/api";
import { getButtonClasses } from "/src/styles/buttonClasses";
import { getTextClasses } from "/src/styles/buttonClasses";

// List of images shown in the Manager page.
// Handles loading, error, empty state, image selection, preview, edit, and delete.

export default function ManagerImageList({
  // Loading and error states from the parent.
  loading,
  error,

  // Images currently visible after manager filters/search.
  managerListImages,

  // Selected image IDs for batch actions.
  selectedImageIds,

  // Selection handlers.
  handleImageSelection,
  toggleImageSelection,

  // Opens image preview modal.
  onImageClick,

  // Edit/delete handlers.
  openEditModal,
  onDeleteImage,

  // Theme and shared style classes.
  theme,
  textMutedClass,
}) {
  const buttons = getButtonClasses(theme);
  const text = getTextClasses(theme);
  return (
    // Scrollable list container.
    <div className="max-h-128 space-y-3 overflow-auto pr-2">
      {loading ? (
        // Loading state
        <div
          className={`rounded-3xl border border-dashed p-8 text-center ${
            theme === "light"
              ? "border-slate-300 bg-slate-50"
              : "border-white/10 bg-slate-950"
          }`}
        >
          <p className={theme === "light" ? "text-slate-900" : "text-white"}>
            Loading images...
          </p>
        </div>
      ) : error ? (
        // Error state
        <div
          className={`rounded-3xl border border-dashed p-8 text-center ${
            theme === "light"
              ? "border-red-300 bg-red-50"
              : "border-red-500/30 bg-red-950/40"
          }`}
        >
          <p className="font-medium text-red-500">{error}</p>
        </div>
      ) : managerListImages.length === 0 ? (
        // Empty state when filters/search return no images
        <div
          className={`rounded-3xl border border-dashed p-8 text-center ${
            theme === "light"
              ? "border-slate-300 bg-slate-50"
              : "border-white/10 bg-slate-950"
          }`}
        >
          <p
            className={`font-medium ${
              theme === "light" ? "text-slate-900" : "text-white"
            }`}
          >
            No images match your filters
          </p>

          <p className={`mt-2 text-sm ${textMutedClass}`}>
            Try another search or reset the filters.
          </p>
        </div>
      ) : (
        // Render filtered manager image list
        managerListImages.map((image, index) => {
          const isSelected = selectedImageIds.includes(image.id);

          return (
            <div
              key={image.id}
              onClick={(e) => handleImageSelection(image.id, index, e)}
              className={`relative flex cursor-pointer items-center gap-4 rounded-3xl border p-4 transition-all duration-200 hover:-translate-y-px ${
                isSelected
                  ? theme === "light"
                    ? "border-blue-500 bg-blue-50"
                    : "border-blue-400 bg-blue-500/10"
                  : theme === "light"
                  ? "border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md"
                  : "border-white/10 bg-slate-950 hover:bg-white/5 hover:shadow-md"
              }`}
            >
              {/* Selected marker */}
              {isSelected && (
                <div className="absolute right-3 top-3 rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
                  ✓
                </div>
              )}

              {/* Selection checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onClick={(e) => e.stopPropagation()}
                onChange={() => toggleImageSelection(image.id)}
                className="h-5 w-5 shrink-0 cursor-pointer"
              />

              {/* Thumbnail button opens larger preview */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick?.(image, managerListImages);
                }}
                className="shrink-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                title="Open larger preview"
              >
                <img
                  src={fixLocalhost(image.url)}
                  alt={image.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/150?text=Error";
                  }}
                  className="h-28 w-28 cursor-zoom-in rounded-lg object-cover"
                />
              </button>

              {/* Main image info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Image title */}
                  <p
                    className={`font-medium ${
                      theme === "light" ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {image.title}
                  </p>
                  {/* Image dimensions and megapixels */}
                  {image.width && image.height && (
                    <p className={`text-xs ${textMutedClass}`}>
                      {image.width} × {image.height}px (
                      {((image.width * image.height) / 1_000_000).toFixed(1)}{" "}
                      MP)
                      {image.width < image.height && (
                        <span className="ml-2 text-red-500">Portrait</span>
                      )}
                    </p>
                  )}

                  {/* Status badges */}
                  <StatusBadge
                    show={image.gallery}
                    label="Gallery"
                    theme={theme}
                    color="amber"
                  />
                  <StatusBadge
                    show={image.featured}
                    label="Featured"
                    theme={theme}
                    color="yellow"
                  />
                  <StatusBadge
                    show={image.hero}
                    label="Hero"
                    theme={theme}
                    color="sky"
                  />
                  <StatusBadge
                    show={image.inShop}
                    label="In Shop"
                    theme={theme}
                    color="lime"
                  />
                  <StatusBadge
                    show={image.intro}
                    label="Intro"
                    theme={theme}
                    color="purple"
                  />
                </div>

                {/* Category and price info */}
                <div className={`mt-1 text-sm ${text.soft}`}>
                  <p>{image.category || "uncategorized"}</p>

                  <p>
                    {image.variants
                      ? `S €${image.variants?.s?.price ?? "-"} / M €${
                          image.variants?.m?.price ?? "-"
                        } / L €${image.variants?.l?.price ?? "-"}`
                      : image.price != null
                      ? `€${image.price}`
                      : "No price"}
                  </p>
                </div>
              </div>

              {/* Row action buttons */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(image);
                  }}
                  className={buttons.edit}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(image.id);
                  }}
                  className={buttons.delete}
                >
                  Erase
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// Small status badge for image flags like Gallery, Featured, Hero, etc.
function StatusBadge({ show, label, theme, color }) {
  // Do not render badge if the status is false.
  if (!show) return null;

  // Badge color mapping.
  const classes =
    color === "amber"
      ? theme === "light"
        ? "bg-amber-200 text-amber-700"
        : "bg-amber-200 text-amber-700"
      : color === "sky"
      ? theme === "light"
        ? "bg-sky-200 text-sky-700"
        : "bg-sky-200 text-sky-700"
      : color === "lime"
      ? theme === "light"
        ? "bg-lime-200 text-emerald-700"
        : "bg-lime-200 text-emerald-700"
      : color === "purple"
      ? theme === "light"
        ? "bg-purple-200 text-purple-700"
        : "bg-purple-200 text-purple-700"
      : color === "violet"
      ? theme === "light"
        ? "bg-violet-200 text-violet-700"
        : "bg-violet-200 text-violet-700"
      : color === "yellow"
      ? theme === "light"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-yellow-100 text-yellow-700"
      : theme === "light"
      ? "bg-slate-100 text-slate-700"
      : "bg-white/10 text-slate-300";

  return (
    <span
      className={`rounded-md px-1 py-0 text-sm border font-light ${classes}`}
    >
      {label}
    </span>
  );
}
