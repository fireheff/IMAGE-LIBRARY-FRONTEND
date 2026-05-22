import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, fixLocalhost } from "../utils/api";
import { getToggleButtonClasses } from "/src/styles/buttonClasses";

// Fullscreen/lightbox-style image modal.
// Also includes a compact manager edit panel when opened from Manager context.

export default function ImageModal({
  // Current image shown in the modal.
  image,

  // Full image list used for previous/next navigation and thumbnails.
  images = [],

  // Tells the modal where it was opened from, for example "Manager".
  context = "",

  // Modal navigation and close actions.
  onClose,
  onPrevious,
  onNext,
  onSelectImage,

  // Favorites state and action.
  favorites = [],
  onToggleFavorite,

  // Manager edit save handler.
  onUpdateImage,

  // Available categories for manager editing.
  categories = [],

  // Toast helper for warnings/errors.
  showToast,

  // Current app theme.
  theme = "light",
}) {
  // Manager context enables inline editing controls.
  const isManagerContext = context === "Manager";

  // Manager edit form state.
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPriceS, setEditPriceS] = useState("");
  const [editPriceM, setEditPriceM] = useState("");
  const [editPriceL, setEditPriceL] = useState("");

  // Image flags editable from Manager.
  const [editGallery, setEditGallery] = useState(false);
  const [editFeatured, setEditFeatured] = useState(false);
  const [editHero, setEditHero] = useState(false);
  const [editInShop, setEditInShop] = useState(false);
  const [editIntro, setEditIntro] = useState(false);

  // Category mode: existing category or new custom category.
  const [editCategoryMode, setEditCategoryMode] = useState("existing");
  const [editCustomCategory, setEditCustomCategory] = useState("");

  // UI state.
  const [isSaving, setIsSaving] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Touch refs for swipe navigation.
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const activeThumbnailRef = useRef(null);

  // Current image position in the provided image list.
  const currentIndex = image
    ? images.findIndex((img) => img.id === image.id)
    : -1;

  const hasMultiple = images.length > 1;

  // create colored backgrounds for toggle buttons

  const toggleButtons = getToggleButtonClasses(theme);

  // Close modal and reset temporary view states.
  const handleClose = useCallback(() => {
    setIsFullscreen(false);
    setIsZoomed(false);
    onClose();
  }, [onClose]);

  // Text shown as "current / total".
  const imageCounter =
    currentIndex >= 0 && images.length > 0
      ? `${currentIndex + 1} / ${images.length}`
      : "";

  // Shared input styling for Manager edit fields.
  const baseInputClass = `w-full rounded-lg border px-2 py-1.5 text-sm ${
    theme === "light"
      ? "border-slate-300 bg-white text-slate-900"
      : "border-white/10 bg-slate-900 text-white"
  }`;

  // When opening an image from Manager, copy image data into edit form state.
  useEffect(() => {
    if (!image || !isManagerContext) return;

    setEditTitle(image.title || "");
    setEditCategory(image.category || "");
    setEditCategoryMode("existing");
    setEditCustomCategory("");
    setEditPrice(String(image.price ?? ""));
    setEditPriceS(String(image.variants?.s?.price ?? ""));
    setEditPriceM(String(image.variants?.m?.price ?? ""));
    setEditPriceL(String(image.variants?.l?.price ?? ""));
    setEditGallery(!!image.gallery);
    setEditFeatured(!!image.featured);
    setEditHero(!!image.hero);
    setEditInShop(!!image.inShop);
    setEditIntro(!!image.intro);
  }, [image, isManagerContext]);

  // Keyboard shortcuts:
  // ArrowLeft / ArrowRight browse images.
  // Escape closes the modal.
  // Shortcuts are ignored while typing in inputs/selects.
  useEffect(() => {
    if (!image) return;

    function handleKeyDown(e) {
      const tagName = document.activeElement?.tagName?.toLowerCase();
      const isTyping =
        tagName === "input" || tagName === "textarea" || tagName === "select";

      if (isTyping) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrevious?.();
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext?.();
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [image, onPrevious, onNext, handleClose]);

  // Preload previous and next images for smoother modal navigation.
  useEffect(() => {
    if (!image || images.length <= 1 || currentIndex === -1) return;

    const previousImage =
      images[(currentIndex - 1 + images.length) % images.length];
    const nextImage = images[(currentIndex + 1) % images.length];

    [previousImage, nextImage].forEach((img) => {
      const url =
        img?.src ||
        img?.url ||
        img?.image ||
        (img?.filename ? `${API_URL}/uploads/${img.filename}` : "");

      if (!url) return;

      const preload = new Image();
      preload.src = url;
    });
  }, [image, images, currentIndex]);

  // Reset zoom whenever a different image is shown.
  useEffect(() => {
    setIsZoomed(false);
  }, [image?.id]);

  // Thumbnail focus for image in viewer
  useEffect(() => {
    if (!activeThumbnailRef.current || isFullscreen) return;

    activeThumbnailRef.current.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [image?.id, isFullscreen]);

  // Do not render modal if no image is selected.
  if (!image) return null;

  // Check whether current image is already in favorites.
  const isFavorite = favorites.includes(image.id);

  // Theme-based classes.
  const bgClass =
    theme === "light" ? "bg-white text-slate-900" : "bg-slate-900 text-white";

  const subTextClass = theme === "light" ? "text-slate-600" : "text-slate-300";

  const thumbBorderClass =
    theme === "light"
      ? "border-slate-300 hover:border-slate-500"
      : "border-white/10 hover:border-white/40";

  // Helper for preventing invalid or negative price entries.
  function isInvalidPrice(value) {
    if (value === "" || value === null) return false;

    const num = Number(value);

    return Number.isNaN(num) || num < 0;
  }

  // Save edits made from Manager context.
  async function handleManagerSave() {
    if (!image || !onUpdateImage || isSaving) return;

    // Validate price fields before saving.
    if (
      isInvalidPrice(editPrice) ||
      isInvalidPrice(editPriceS) ||
      isInvalidPrice(editPriceM) ||
      isInvalidPrice(editPriceL)
    ) {
      showToast?.(
        "Invalid price",
        "Please enter valid positive numbers for prices.",
        "warning"
      );
      return;
    }

    try {
      setIsSaving(true);

      // Build update object from form state.
      const updates = {
        title: editTitle.trim(),
        category:
          editCategoryMode === "new"
            ? editCustomCategory.trim() || "uncategorized"
            : editCategory,
        gallery: editGallery,
        featured: editFeatured,
        hero: editHero,
        inShop: editInShop,
        intro: editIntro,
      };

      // Only update legacy/base price if a value was entered.
      if (editPrice !== "") {
        updates.price = Number(editPrice);
      }

      // Preserve variant data and only replace edited prices.
      if (image.variants) {
        updates.variants = {
          ...image.variants,
          s: image.variants.s
            ? {
                ...image.variants.s,
                price:
                  editPriceS !== ""
                    ? Number(editPriceS)
                    : image.variants.s.price,
              }
            : undefined,
          m: image.variants.m
            ? {
                ...image.variants.m,
                price:
                  editPriceM !== ""
                    ? Number(editPriceM)
                    : image.variants.m.price,
              }
            : undefined,
          l: image.variants.l
            ? {
                ...image.variants.l,
                price:
                  editPriceL !== ""
                    ? Number(editPriceL)
                    : image.variants.l.price,
              }
            : undefined,
        };
      }

      // Send updates to parent/API.
      await onUpdateImage(image.id, updates);

      // Sync local form state with saved data.
      setEditTitle(updates.title);
      setEditCategory(updates.category);
      setEditGallery(updates.gallery);
      setEditFeatured(updates.featured);
      setEditHero(updates.hero);
      setEditInShop(updates.inShop);
      setEditIntro(updates.intro);

      if (updates.variants) {
        setEditPriceS(String(updates.variants.s?.price ?? ""));
        setEditPriceM(String(updates.variants.m?.price ?? ""));
        setEditPriceL(String(updates.variants.l?.price ?? ""));
      }
    } catch (error) {
      console.error("Modal manager save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }

  // Store initial touch position for swipe.
  function handleTouchStart(e) {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  }

  // Track latest touch position during swipe.
  function handleTouchMove(e) {
    touchEndXRef.current = e.touches[0].clientX;
  }

  // Decide whether swipe was strong enough to navigate.
  function handleTouchEnd() {
    const distance = touchStartXRef.current - touchEndXRef.current;

    if (Math.abs(distance) < 50) return;

    if (distance > 0) {
      onNext?.();
    } else {
      onPrevious?.();
    }
  }

  return (
    // Modal overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleClose}
    >
      {/* Modal container */}
      <div
        className={`relative w-full overflow-hidden ${
          isFullscreen
            ? "h-screen max-h-screen max-w-none rounded-none bg-black p-0 text-white"
            : `max-w-7xl max-h-[92vh] overflow-y-auto rounded-3xl p-3 md:p-4 ${bgClass}`
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fullscreen toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="absolute right-16 top-4 z-30 rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/80"
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-30 rounded-full bg-black/60 px-3 py-2 text-white backdrop-blur-sm transition hover:bg-black/80"
        >
          ✕
        </button>

        {/* Previous / next buttons */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={onPrevious}
              className={`absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full text-white transition hover:bg-white/15 ${
                isFullscreen
                  ? "bg-white/10 px-5 py-4 text-3xl backdrop-blur-sm"
                  : "bg-black/70 px-4 py-3"
              }`}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={onNext}
              className={`absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full text-white transition hover:bg-white/15 ${
                isFullscreen
                  ? "bg-white/10 px-5 py-4 text-3xl backdrop-blur-sm"
                  : "bg-black/70 px-4 py-3"
              }`}
            >
              ›
            </button>
          </>
        )}

        <div className="flex flex-col gap-3">
          {/* Manager edit panel */}
          {isManagerContext && !isFullscreen && (
            <div
              className={`rounded-2xl border p-4 ${
                theme === "light"
                  ? "border-slate-200 bg-slate-50"
                  : "border-white/10 bg-slate-950"
              }`}
            >
              <div className="grid gap-3">
                {/* Title and category row */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Title
                    </label>

                    <input
                      type="text"
                      value={editTitle}
                      className={baseInputClass}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Category
                    </label>

                    <select
                      className={baseInputClass}
                      value={
                        editCategoryMode === "existing"
                          ? editCategory
                          : "__new__"
                      }
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setEditCategoryMode("new");
                          setEditCustomCategory("");
                        } else {
                          setEditCategoryMode("existing");
                          setEditCategory(e.target.value);
                          setEditCustomCategory("");
                        }
                      }}
                    >
                      {categories
                        .filter((cat) => cat !== "all")
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      <option value="__new__">+ New category</option>
                    </select>

                    {/* Custom category input */}
                    {editCategoryMode === "new" && (
                      <input
                        type="text"
                        value={editCustomCategory}
                        className={baseInputClass}
                        onChange={(e) => setEditCustomCategory(e.target.value)}
                        placeholder="Enter new category"
                      />
                    )}
                  </div>
                </div>

                {/* Variant price row */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Price S
                    </label>

                    <input
                      type="number"
                      value={editPriceS}
                      className={baseInputClass}
                      onChange={(e) => setEditPriceS(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Price M
                    </label>

                    <input
                      type="number"
                      className={baseInputClass}
                      value={editPriceM}
                      onChange={(e) => setEditPriceM(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Price L
                    </label>

                    <input
                      type="number"
                      value={editPriceL}
                      className={baseInputClass}
                      onChange={(e) => setEditPriceL(e.target.value)}
                    />
                  </div>
                </div>

                {/* Image flag buttons */}
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {[
                    ["Gallery", editGallery, setEditGallery, "gallery"],
                    ["Featured", editFeatured, setEditFeatured, "featured"],
                    ["Hero", editHero, setEditHero, "hero"],
                    ["Shop", editInShop, setEditInShop, "shop"],
                    ["Intro", editIntro, setEditIntro, "intro"],
                  ].map(([label, active, setter, color]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setter((prev) => !prev)}
                      className={`${toggleButtons.base} ${
                        active ? toggleButtons[color] : toggleButtons.inactive
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Save manager edits */}
                <button
                  type="button"
                  onClick={handleManagerSave}
                  disabled={isSaving}
                  className={`w-full rounded-xl px-4 py-2 text-sm font-medium ${
                    theme === "light"
                      ? "bg-blue-200 text-white"
                      : "bg-white text-slate-900"
                  } ${isSaving ? "opacity-60" : ""}`}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          )}

          {/* Main image viewer */}
          <div
            className={`relative flex w-full items-center justify-center overflow-hidden ${
              isFullscreen
                ? "h-screen bg-black"
                : "h-[70vh] rounded-2xl bg-black/5 dark:bg-white/5"
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image counter */}
            {hasMultiple && (
              <div className="absolute left-4 top-4 z-20 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {imageCounter}
              </div>
            )}

            {/* Fullscreen title pill */}
            {isFullscreen && (
              <div className="absolute left-4 top-14 z-20 max-w-[70%] rounded-full bg-black/45 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm md:text-sm">
                {image.title || image.originalTitle || "Untitled"}
              </div>
            )}

            {/* Main modal image. Click toggles zoom. */}
            <img
              key={image.id}
              src={fixLocalhost(image.url)}
              alt={image.title || "Image"}
              loading="eager"
              decoding="sync"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed((prev) => !prev);
              }}
              className={`max-h-full max-w-full object-contain ${
                isZoomed
                  ? "scale-150 cursor-zoom-out"
                  : "scale-100 cursor-zoom-in"
              }`}
            />

            {/* Keyboard hint */}
            {hasMultiple && (
              <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/45 px-4 py-1.5 text-xs text-white/90 backdrop-blur-sm">
                ← / → browse · Esc close
              </div>
            )}
          </div>

          {/* Image details and favorite button under viewer */}
          {!isFullscreen && (
            <div
              className={`flex flex-wrap mb-4 items-center gap-x-4 gap-y-2 text-sm ${subTextClass}`}
            >
              <span className="font-medium">
                {image.title || image.originalTitle || "Untitled"}
              </span>

              {image.category && <span>Category: {image.category}</span>}

              <span>
                {context ? `${context} • ` : ""}
                Image {currentIndex + 1} of {images.length}
              </span>

              {image.intro && <span>Intro image</span>}

              {image.price && (
                <span className="font-semibold text-inherit">
                  €{image.price}
                </span>
              )}

              {!isManagerContext && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite?.(image.id)}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition hover:opacity-70 ${
                    theme === "light"
                      ? "bg-blue-500 text-white"
                      : "bg-blue-400 text-slate-900"
                  }`}
                >
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {hasMultiple && !isFullscreen && (
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-1">
              {images.map((img) => {
                const thumbUrl =
                  img.src ||
                  img.url ||
                  img.image ||
                  (img.filename ? `${API_URL}/uploads/${img.filename}` : "");

                const isActive = img.id === image.id;

                return (
                  <button
                    key={img.id}
                    ref={isActive ? activeThumbnailRef : null}
                    type="button"
                    onClick={() => onSelectImage(img)}
                    className={`shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                      isActive
                        ? "border-blue-500 ring-2 ring-blue-400"
                        : thumbBorderClass
                    }`}
                  >
                    <img
                      src={fixLocalhost(thumbUrl)}
                      alt={img.title || "Thumbnail"}
                      className="h-20 w-20 object-cover md:h-24 md:w-24"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
