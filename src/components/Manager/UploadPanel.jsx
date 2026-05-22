import { Upload, Check } from "lucide-react";
import {
  getButtonClasses,
  getPanelClasses,
  getTextClasses,
  getToggleButtonClasses,
  getInputClasses,
} from "../../styles/buttonClasses";

// Upload panel used in the Manager page.
// Handles image uploads, previews, categories, and default image flags.

export default function UploadPanel({
  // Upload category mode ("existing" or "new").
  uploadCategoryMode,
  setUploadCategoryMode,
  setUploadCustomCategory,
  uploadCustomCategory,

  // Existing categories.
  categories = [],

  // Shared title/category for uploaded images.
  title,
  setTitle,
  category,
  setCategory,

  // Selected upload files and preview data.
  selectedFiles,
  filePreviews,

  // Upload flags / default image settings.
  uploadGallery,
  setUploadGallery,
  uploadFeatured,
  setUploadFeatured,
  uploadHero,
  setUploadHero,
  uploadInShop,
  setUploadInShop,
  uploadIntro,
  setUploadIntro,

  // Drag & drop state.
  isDragOver,

  // Upload handlers.
  handleFileChange,
  handleSubmit,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  clearSelectedFiles,
  removeSelectedFile,

  // Theme and shared style classes.
  theme,
  textMutedClass,
}) {
  // Dynamic dropzone styling depending on drag state and theme.
  const dropzoneClass = `block w-full rounded-2xl border-2 border-dashed px-4 py-6 text-center font-medium transition transform ${
    isDragOver ? "scale-[1.02]" : ""
  } ${
    isDragOver
      ? theme === "light"
        ? "border-slate-900 bg-slate-100 text-slate-900"
        : "border-white bg-white/10 text-white"
      : theme === "light"
      ? "border-slate-300 bg-white text-slate-900 hover:bg-slate-100 hover:border-slate-400"
      : "border-white/20 bg-slate-950 text-white hover:bg-white/10 hover:border-white/30"
  }`;

  const buttons = getButtonClasses(theme);
  const panel = getPanelClasses(theme);
  const text = getTextClasses(theme);
  const toggleButtons = getToggleButtonClasses(theme);
  const inputs = getInputClasses(theme);

  return (
    // Main upload form
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 rounded-3xl border p-6 ${panel.upload}`}
    >
      {/* Panel title */}
      <h3
        className={`text-xl font-semibold ${
          theme === "light" ? "text-slate-900" : "text-white"
        }`}
      >
        Upload new image(s)
      </h3>

      <p className={`text-sm ${text.soft}`}>
        Upload one or more images and apply shared defaults.
      </p>

      {/* Title and category row */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Shared image title */}
        <div className="flex-1 min-w-45 max-w-100">
          <label className={`mb-1 block text-xs ${text.soft}`}>Title</label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full ${inputs.default}`}
            placeholder="Enter title"
          />
        </div>

        {/* Category selector */}
        <div className="w-auto min-w-45">
          <label className={`mb-1 block text-xs ${textMutedClass}`}>
            Category
          </label>

          <select
            value={uploadCategoryMode === "new" ? "__new__" : category}
            onChange={(e) => {
              if (e.target.value === "__new__") {
                // Switch to new category mode.
                setUploadCategoryMode("new");
                setUploadCustomCategory("");
              } else {
                // Use existing category.
                setUploadCategoryMode("existing");
                setCategory(e.target.value);
                setUploadCustomCategory("");
              }
            }}
            className={inputs.default}
          >
            {/* Default upload category */}
            <option value="uploaded">uploaded</option>

            {/* Existing categories */}
            {categories
              .filter((cat) => cat !== "all" && cat !== "uploaded")
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}

            {/* Create new category option */}
            <option value="__new__">+ Create new category</option>
          </select>

          {/* Custom category input */}
          {uploadCategoryMode === "new" && (
            <input
              type="text"
              value={uploadCustomCategory}
              onChange={(e) => setUploadCustomCategory(e.target.value)}
              placeholder="Enter new category"
              className={`${inputs.default} mt-2 w-full`}
            />
          )}
        </div>
      </div>

      {/* Upload/dropzone section */}
      <div>
        <label className={`mb-2 block text-sm font-medium ${textMutedClass}`}>
          Import/upload image(s)
        </label>

        {/* Drag & drop upload area */}
        <label
          htmlFor="file-upload"
          role="button"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={dropzoneClass}
        >
          <span className="flex flex-col items-center justify-center gap-3">
            {/* Upload icon changes after files are selected */}
            {selectedFiles.length > 0 ? (
              <Check size={28} />
            ) : (
              <Upload size={28} />
            )}

            {/* Upload status text */}
            <span className="text-sm font-semibold">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} image(s) selected`
                : "Drag & drop images here or click to select"}
            </span>

            {/* File type info */}
            <span
              className={`text-xs ${
                theme === "light" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              JPG, PNG • Multiple files supported
            </span>
          </span>
        </label>

        {/* Hidden native file input */}
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Selected file count */}
        {selectedFiles.length > 0 && (
          <p className={`mt-2 text-sm ${text.soft}`}>
            {selectedFiles.length} file(s) selected
          </p>
        )}

        {/* Image previews */}
        {filePreviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${textMutedClass}`}>Preview</p>

              {/* Remove all selected files */}
              <button
                type="button"
                onClick={clearSelectedFiles}
                className={buttons.secondary}
              >
                Clear all
              </button>
            </div>

            {/* Preview grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-6">
              {filePreviews.map((preview, index) => (
                <div
                  key={`${preview.file.name}-${preview.file.size}-${index}`}
                  className={`relative overflow-hidden rounded-2xl border ${
                    theme === "light"
                      ? "border-slate-200 bg-white"
                      : "border-white/10 bg-slate-950"
                  }`}
                >
                  {/* Preview image */}
                  <img
                    src={preview.url}
                    alt={preview.file.name}
                    className="h-28 w-full object-cover"
                  />

                  {/* File info */}
                  <div className="p-2">
                    <p
                      className={`truncate text-xs font-medium ${
                        theme === "light" ? "text-slate-900" : "text-white"
                      }`}
                      title={preview.file.name}
                    >
                      {preview.file.name}
                    </p>

                    <p className={`mt-1 text-xs ${text.soft}`}>
                      {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Remove single file */}
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${
                      theme === "light"
                        ? "bg-white/90 text-slate-900"
                        : "bg-black/70 text-white"
                    }`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload flags/buttons */}
      <div className="flex flex-wrap mt-5 items-center gap-2 text-xs">
        {[
          ["Gallery", uploadGallery, setUploadGallery, "gallery"],
          ["Featured", uploadFeatured, setUploadFeatured, "featured"],
          ["Hero", uploadHero, setUploadHero, "hero"],
          ["Shop", uploadInShop, setUploadInShop, "shop"],
          ["Intro", uploadIntro, setUploadIntro, "intro"],
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

      {/* Submit upload button */}
      <button
        type="submit"
        className={`w-full rounded-2xl py-3 font-medium hover:opacity-90 ${buttons.primary}`}
      >
        Upload image(s)
      </button>
    </form>
  );
}

// Reusable upload checkbox component.
// Currently unused, but kept for future upload toggle options.
function UploadCheckbox({ checked, onChange, textMutedClass }) {
  return (
    <label className={`flex items-center gap-3 ${textMutedClass}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
