import { useState } from "react";
import { fixLocalhost } from "../../utils/api";
import { getButtonClasses, getTextClasses } from "/src/styles/buttonClasses";

// Panel for manually controlling the order of Gallery images.
// Images can be moved up/down or moved directly to a specific position.

export default function GalleryOrderPanel({
  // Loading and error states from the parent.
  loading,
  error,

  // Images currently included in the gallery order list.
  filteredGalleryOrderList,
  galleryOrderList,

  // Temporary input values for manually moving images to a position.
  movePositions,
  setMovePositions,

  // Move handlers passed from the parent.
  moveGalleryImage,
  moveGalleryImageToPosition,

  // Theme and shared style classes.
  theme,
  textMutedClass,
}) {
  // Keeps the panel closed by default to reduce visual clutter.
  const [isCollapsed, setIsCollapsed] = useState(false);

  const buttons = getButtonClasses(theme);
  const text = getTextClasses(theme);

  return (
    <div className={`rounded-3xl border p-6 ${buttons.orderPanel}`}>
      {/* Panel header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3
            className={`text-xl font-semibold ${
              theme === "light" ? "text-slate-900" : "text-white"
            }`}
          >
            Gallery order
          </h3>

          <p className={`mt-1 text-sm ${text.soft}`}>
            Control the display order of images shown in Gallery.
          </p>

          <p className={`mt-1 text-xs ${text.soft}`}>
            When filters are active, ordering changes only the visible filtered
            images.
          </p>
        </div>

        {/* Show / hide panel content */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={buttons.secondary}
        >
          {isCollapsed ? "Show" : "Hide"}
        </button>
      </div>

      {/* Panel body is only rendered when expanded. */}
      {!isCollapsed && (
        <>
          {/* Loading state */}
          {loading ? (
            <div
              className={`rounded-3xl border border-dashed p-6 text-center ${
                theme === "light"
                  ? "border-slate-300 bg-slate-50"
                  : "border-white/10 bg-slate-950"
              }`}
            >
              <p
                className={theme === "light" ? "text-slate-900" : "text-white"}
              >
                Loading gallery images...
              </p>
            </div>
          ) : error ? (
            // Error state
            <div
              className={`rounded-3xl border border-dashed p-6 text-center ${
                theme === "light"
                  ? "border-red-300 bg-red-50"
                  : "border-red-500/30 bg-red-950/40"
              }`}
            >
              <p className="font-medium text-red-500">{error}</p>
            </div>
          ) : filteredGalleryOrderList.length === 0 ? (
            // Empty state
            <div
              className={`rounded-3xl border border-dashed p-6 text-center ${
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
                No gallery images yet
              </p>

              <p className={`mt-2 text-sm ${textMutedClass}`}>
                Mark images as “Gallery” first to order them here.
              </p>
            </div>
          ) : (
            // Gallery order list
            <div className="space-y-3">
              {filteredGalleryOrderList.map((image, index) => {
                const allGalleryIndex = galleryOrderList.findIndex(
                  (img) => img.id === image.id
                );

                return (
                  <div
                    key={image.id}
                    className={`flex items-center gap-4 rounded-3xl border p-4 transition-all duration-200 hover:-translate-y-px ${
                      theme === "light"
                        ? "border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md"
                        : "border-white/10 bg-slate-950 hover:bg-white/5 hover:shadow-md"
                    }`}
                  >
                    {/* Image thumbnail */}
                    <img
                      src={fixLocalhost(image.url)}
                      alt={image.title}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    {/* Image title and category */}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          theme === "light" ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {image.title}
                      </p>

                      <p className={`mt-1 text-sm ${text.soft}`}>
                        {image.category || "uncategorized"}
                      </p>
                    </div>

                    {/* display of position of all images */}
                    <div
                      className={`w-10 text-center text-xs font-semibold ${
                        theme === "light" ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      All: {allGalleryIndex + 1}
                    </div>

                    {/* Order controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          theme === "light"
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        Pos.
                      </span>

                      {/* Manual target position input */}
                      <input
                        type="number"
                        min={1}
                        max={filteredGalleryOrderList.length}
                        value={movePositions[image.id] ?? index + 1}
                        onChange={(e) =>
                          setMovePositions((prev) => ({
                            ...prev,
                            [image.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          // Pressing Enter moves the image to the typed position.
                          if (e.key === "Enter") {
                            e.preventDefault();
                            moveGalleryImageToPosition(
                              image.id,
                              movePositions[image.id] ?? index + 1
                            );
                          }
                        }}
                        className={`w-14 rounded-lg border px-2 py-1 text-center text-sm ${
                          theme === "light"
                            ? "border-slate-300 bg-white text-slate-900"
                            : "border-white/10 bg-slate-950 text-white"
                        }`}
                      />

                      {/* Move directly to typed position */}
                      <button
                        type="button"
                        onClick={() =>
                          moveGalleryImageToPosition(
                            image.id,
                            movePositions[image.id] ?? index + 1
                          )
                        }
                        className={buttons.secondary}
                      >
                        Move
                      </button>

                      {/* Move image one position up */}
                      <button
                        type="button"
                        onClick={() => moveGalleryImage(image.id, "up")}
                        disabled={index === 0}
                        className={`${buttons.secondary} ${
                          index === 0 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        ↑
                      </button>

                      {/* Move image one position down */}
                      <button
                        type="button"
                        onClick={() => moveGalleryImage(image.id, "down")}
                        disabled={index === filteredGalleryOrderList.length - 1}
                        className={`${buttons.secondary} ${
                          index === filteredGalleryOrderList.length - 1
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
