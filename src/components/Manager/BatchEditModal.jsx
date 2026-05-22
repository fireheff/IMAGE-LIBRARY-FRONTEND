import {
  getButtonClasses,
  getPanelClasses,
  getTextClasses,
  getInputClasses,
} from "/src/styles/buttonClasses";

// Batch edit modal for updating multiple selected images at once.
// Only fields that are enabled or filled will be applied to the selected images.

export default function BatchEditModal({
  // Controls modal visibility.
  isOpen,

  // Array of selected image IDs to update.
  selectedImageIds,

  // Available image categories.
  categories,

  // Current app theme ("light" or "dark").
  theme,

  // Modal actions.
  closeBatchEditModal,
  handleBatchEditSave,

  // Loading state while saving updates.
  isSavingBatchEdit,

  // Batch title update state.
  batchTitle,
  setBatchTitle,

  // Main/base price update state.
  batchPrice,
  setBatchPrice,

  // Variant price states (S / M / L).
  batchPriceS,
  setBatchPriceS,
  batchPriceM,
  setBatchPriceM,
  batchPriceL,
  setBatchPriceL,

  // Category update state.
  batchCategory,
  setBatchCategory,
  batchCategoryMode,
  setBatchCategoryMode,
  batchCustomCategory,
  setBatchCustomCategory,

  // Gallery toggle update state.
  batchGalleryEnabled,
  setBatchGalleryEnabled,
  setBatchGalleryValue,

  // Featured toggle update state.
  batchFeaturedEnabled,
  setBatchFeaturedEnabled,
  batchFeaturedValue,
  setBatchFeaturedValue,

  // Hero toggle update state.
  batchHeroEnabled,
  setBatchHeroEnabled,
  batchHeroValue,
  setBatchHeroValue,

  // Shop visibility update state.
  batchInShopEnabled,
  setBatchInShopEnabled,
  batchInShopValue,
  setBatchInShopValue,
}) {
  // Do not render modal when closed.
  if (!isOpen) return null;

  const buttons = getButtonClasses(theme);
  const panel = getPanelClasses(theme);
  const text = getTextClasses(theme);
  const inputs = getInputClasses(theme);

  return (
    // Modal overlay background.
    // Clicking outside the card closes the modal.
    <div
      className="fixed inset-0 z-120 flex items-center justify-center bg-black/60 p-4"
      onClick={closeBatchEditModal}
    >
      {/* Modal content card */}
      <div
        className={`w-full max-w-2xl rounded-3xl p-6 shadow-2xl ${panel.modalCard}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold">Batch edit images</h3>

        {/* Info text */}
        <p className={`mt-1 text-sm ${text.soft}`}>
          Update {selectedImageIds.length} selected image(s). Only filled or
          enabled fields will be changed.
        </p>

        {/* Main batch edit form */}
        <form onSubmit={handleBatchEditSave} className="mt-5 space-y-4">
          {/* Title update */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${text.soft}`}>
              Title
            </label>

            <input
              type="text"
              value={batchTitle}
              onChange={(e) => setBatchTitle(e.target.value)}
              placeholder="Leave empty to keep current title"
              className={inputs.default}
            />
          </div>

          {/* Base price update */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${text.soft}`}>
              Price
            </label>

            <input
              type="number"
              value={batchPrice}
              onChange={(e) => setBatchPrice(e.target.value)}
              placeholder="Leave empty to keep current price"
              className={inputs.default}
            />
          </div>

          {/* Variant pricing section */}
          <div
            className={`rounded-2xl border p-4 space-y-4 ${
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
                Only filled fields will be updated for selected images.
              </p>
            </div>

            {/* Variant price inputs */}
            <div className="grid gap-4 md:grid-cols-3">
              <VariantPriceInput
                label="Price S"
                value={batchPriceS}
                onChange={setBatchPriceS}
                inputClass={inputs.default}
                textMutedClass={text.soft}
              />

              <VariantPriceInput
                label="Price M"
                value={batchPriceM}
                onChange={setBatchPriceM}
                inputClass={inputs.default}
                textMutedClass={text.soft}
              />

              <VariantPriceInput
                label="Price L"
                value={batchPriceL}
                onChange={setBatchPriceL}
                inputClass={inputs.default}
                textMutedClass={text.soft}
              />
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${text.soft}`}>
              Category
            </label>

            {/* Existing category selector */}
            <select
              value={
                batchCategoryMode === "existing" ? batchCategory : "__new__"
              }
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  // Switch to new category mode.
                  setBatchCategoryMode("new");
                  setBatchCategory("");
                } else {
                  // Use existing category.
                  setBatchCategoryMode("existing");
                  setBatchCategory(e.target.value);
                  setBatchCustomCategory("");
                }
              }}
              className={inputs.default}
            >
              <option value="">Keep current category</option>

              {/* Existing categories */}
              {categories
                .filter((cat) => cat !== "all")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}

              {/* Option to create new category */}
              <option value="__new__">+ New category</option>
            </select>

            {/* New category input */}
            {batchCategoryMode === "new" && (
              <input
                type="text"
                value={batchCustomCategory}
                onChange={(e) => setBatchCustomCategory(e.target.value)}
                placeholder="Enter new category"
                className={`${inputs.default} mt-2`}
              />
            )}
          </div>

          {/* Boolean/toggle updates */}
          <div className="space-y-3">
            {/* Gallery toggle */}
            <BatchToggle
              label="Update Gallery"
              checked={batchGalleryEnabled}
              onChange={(checked) => {
                setBatchGalleryEnabled(checked);

                // Default enabled value to true.
                if (checked) setBatchGalleryValue(true);
              }}
              textMutedClass={text.soft}
            />

            {/* Featured toggle */}
            <BatchToggle
              label="Update Featured"
              checked={batchFeaturedEnabled}
              onChange={(checked) => {
                setBatchFeaturedEnabled(checked);

                if (checked) setBatchFeaturedValue(true);
              }}
              textMutedClass={text.soft}
            />

            {/* Featured true/false selector */}
            {batchFeaturedEnabled && (
              <BooleanSelect
                value={batchFeaturedValue}
                onChange={setBatchFeaturedValue}
                trueLabel="Set Featured"
                falseLabel="Remove Featured"
                inputClass={inputs.default}
              />
            )}

            {/* Hero toggle */}
            <BatchToggle
              label="Update Hero"
              checked={batchHeroEnabled}
              onChange={(checked) => {
                setBatchHeroEnabled(checked);

                if (checked) setBatchHeroValue(true);
              }}
              textMutedClass={text.soft}
            />

            {/* Hero true/false selector */}
            {batchHeroEnabled && (
              <BooleanSelect
                value={batchHeroValue}
                onChange={setBatchHeroValue}
                trueLabel="Set Hero"
                falseLabel="Remove Hero"
                inputClass={inputs.default}
              />
            )}

            {/* Shop visibility toggle */}
            <BatchToggle
              label="Update In Shop"
              checked={batchInShopEnabled}
              onChange={(checked) => {
                setBatchInShopEnabled(checked);

                if (checked) setBatchInShopValue(true);
              }}
              textMutedClass={text.soft}
            />

            {/* Shop visibility selector */}
            {batchInShopEnabled && (
              <BooleanSelect
                value={batchInShopValue}
                onChange={setBatchInShopValue}
                trueLabel="Add to Shop"
                falseLabel="Remove from Shop"
                inputClass={inputs.default}
              />
            )}
          </div>

          {/* Modal action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            {/* Cancel button */}
            <button
              type="button"
              onClick={closeBatchEditModal}
              className={buttons.secondary}
            >
              Cancel
            </button>

            {/* Save button */}
            <button
              type="submit"
              disabled={isSavingBatchEdit}
              className={`rounded-2xl px-4 py-2 text-sm font-medium hover:opacity-90 ${
                buttons.primary
              } ${isSavingBatchEdit ? "opacity-60" : ""}`}
            >
              {isSavingBatchEdit ? "Saving..." : "Apply to Selected"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable input component for variant prices.
function VariantPriceInput({
  label,
  value,
  onChange,
  inputClass,
  textMutedClass,
}) {
  return (
    <div>
      <label className={`mb-2 block text-sm font-medium ${textMutedClass}`}>
        {label}
      </label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Leave empty"
        className={inputClass}
      />
    </div>
  );
}

// Reusable checkbox toggle component used in batch update sections.
function BatchToggle({ label, checked, onChange, textMutedClass }) {
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

// Reusable true/false select component for batch boolean updates.
function BooleanSelect({ value, onChange, trueLabel, falseLabel, inputClass }) {
  return (
    <select
      value={value ? "true" : "false"}
      onChange={(e) => onChange(e.target.value === "true")}
      className={inputClass}
    >
      <option value="true">{trueLabel}</option>
      <option value="false">{falseLabel}</option>
    </select>
  );
}
