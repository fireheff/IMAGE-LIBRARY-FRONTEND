import {
  getButtonClasses,
  getPanelClasses,
  getTextClasses,
  getInputClasses,
} from "/src/styles/buttonClasses";

// Modal for editing a single image.
// This component receives all form state and save/close handlers from the parent.

export default function EditImageModal({
  // The image currently being edited.
  // If this is null, the modal is not shown.
  editingImage,

  // Modal actions.
  closeEditModal,
  handleSaveEdit,

  // Available image categories.
  categories,

  // Current theme and shared style classes.
  theme,

  // Loading state while saving.
  isSavingEdit,

  // Editable image fields.
  editTitle,
  setEditTitle,
  editPriceS,
  setEditPriceS,
  editPriceM,
  setEditPriceM,
  editPriceL,
  setEditPriceL,

  // Category state.
  editCategory,
  setEditCategory,
  editCategoryMode,
  setEditCategoryMode,
  editCustomCategory,
  setEditCustomCategory,

  // Image visibility / role flags.
  editGallery,
  setEditGallery,
  editFeatured,
  setEditFeatured,
  editHero,
  setEditHero,
  editInShop,
  setEditInShop,
  editIntro,
  setEditIntro,
}) {
  // Do not render the modal if no image is selected for editing.
  if (!editingImage) return null;

  const buttons = getButtonClasses(theme);
  const panel = getPanelClasses(theme);
  const text = getTextClasses(theme);
  const inputs = getInputClasses(theme);

  return (
    // Modal overlay.
    // Clicking the dark background closes the modal.
    <div
      className="fixed inset-0 z-120 flex items-center justify-center bg-black/60 p-4"
      onClick={closeEditModal}
    >
      {/* Modal card. stopPropagation prevents clicks inside from closing modal. */}
      <div
        className={`w-full max-w-2xl rounded-3xl p-6 shadow-2xl ${panel.modalCard}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold">Edit image</h3>

        <p className={`mt-1 text-sm ${text.muted}`}>
          Update the image data below.
        </p>

        {/* Edit form */}
        <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
          {/* Image title */}
          <TextInput
            label="Title"
            value={editTitle}
            onChange={setEditTitle}
            inputClass={inputs.default}
            textMutedClass={text.muted}
          />

          {/* Main medium price field */}
          <TextInput
            label="Price M"
            type="number"
            value={editPriceM}
            onChange={setEditPriceM}
            inputClass={inputs.default}
            textMutedClass={text.muted}
          />

          {/* Variant price fields are only shown when the image has variants. */}
          {editingImage?.variants && (
            <div
              className={`space-y-4 rounded-2xl border p-4 ${
                theme === "light"
                  ? "border-slate-200 bg-slate-50"
                  : "border-white/10 bg-slate-950"
              }`}
            >
              <div>
                <p
                  className={`text-sm font-semibold ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  }`}
                >
                  Variant Prices
                </p>

                <p className={`mt-1 text-xs ${text.soft}`}>
                  Update prices for S, M, and L.
                </p>
              </div>

              {/* Responsive grid for S / M / L prices */}
              <div className="grid gap-4 md:grid-cols-3">
                <TextInput
                  label="Price S"
                  type="number"
                  value={editPriceS}
                  onChange={setEditPriceS}
                  inputClass={inputs.default}
                  textMutedClass={text.muted}
                />

                <TextInput
                  label="Price M"
                  type="number"
                  value={editPriceM}
                  onChange={setEditPriceM}
                  inputClass={inputs.default}
                  textMutedClass={text.muted}
                />

                <TextInput
                  label="Price L"
                  type="number"
                  value={editPriceL}
                  onChange={setEditPriceL}
                  inputClass={inputs.default}
                  textMutedClass={text.muted}
                />
              </div>
            </div>
          )}

          {/* Category selector */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${text.muted}`}>
              Category
            </label>

            <select
              value={editCategoryMode === "existing" ? editCategory : "__new__"}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  // Switch to new category mode.
                  setEditCategoryMode("new");
                  setEditCategory("");
                } else {
                  // Use selected existing category.
                  setEditCategoryMode("existing");
                  setEditCategory(e.target.value);
                  setEditCustomCategory("");
                }
              }}
              className={inputs.default}
            >
              {/* Existing categories, excluding the filter-only "all" category */}
              {categories
                .filter((cat) => cat !== "all")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}

              <option value="__new__">+ New category</option>
            </select>

            {/* Custom category input shown only in "new category" mode */}
            {editCategoryMode === "new" && (
              <input
                type="text"
                value={editCustomCategory}
                onChange={(e) => setEditCustomCategory(e.target.value)}
                placeholder="Enter new category"
                className={`${inputs.default} mt-2`}
              />
            )}
          </div>

          {/* Image placement / visibility options */}
          <EditCheckbox
            label="Gallery"
            checked={editGallery}
            onChange={setEditGallery}
            textMutedClass={text.muted}
          />

          <EditCheckbox
            label="Featured"
            checked={editFeatured}
            onChange={setEditFeatured}
            textMutedClass={text.muted}
          />

          <EditCheckbox
            label="Hero image"
            checked={editHero}
            onChange={setEditHero}
            textMutedClass={text.muted}
          />

          <EditCheckbox
            label="In Shop"
            checked={editInShop}
            onChange={setEditInShop}
            textMutedClass={text.muted}
          />

          <EditCheckbox
            label="Intro"
            checked={editIntro}
            onChange={setEditIntro}
            textMutedClass={text.muted}
          />

          {/* Modal action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeEditModal}
              className={buttons.secondary}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSavingEdit || !editTitle.trim()}
              className={`${buttons.primary} ${
                isSavingEdit || !editTitle.trim()
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              {isSavingEdit ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable text/number input used inside the edit modal.
function TextInput({
  label,
  value,
  onChange,
  inputClass,
  inputStyle,
  textMutedClass,
  type = "text",
}) {
  return (
    <div>
      <label className={`mb-2 block text-sm font-medium ${textMutedClass}`}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        style={inputStyle}
      />
    </div>
  );
}

// Reusable checkbox used for image flags like Gallery, Featured, Hero, etc.
function EditCheckbox({ label, checked, onChange, textMutedClass }) {
  return (
    <label className={`flex items-center gap-3 ${textMutedClass}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />

      {label}
    </label>
  );
}
