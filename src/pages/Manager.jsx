import { useEffect, useMemo, useState } from "react";
import UploadPanel from "../components/Manager/UploadPanel";
import ManagerImageList from "../components/Manager/ManagerImageList";
import BatchEditModal from "../components/Manager/BatchEditModal";
import EditImageModal from "../components/Manager/EditImageModal";
import GalleryOrderPanel from "../components/Manager/GalleryOrderPanel";
import { Upload, Image, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getButtonClasses,
  getTextClasses,
  getFilterClasses,
} from "../styles/buttonClasses";

export default function Manager({
  images,
  loading,
  error,
  onAddImage,
  onDeleteImage,
  onUpdateImage,
  onReorderGallery,
  onImageClick,
  showToast,
  theme = "light",
  onDeleteSelectedImages,
}) {
  const buttons = getButtonClasses(theme);
  const text = getTextClasses(theme);
  const filters = getFilterClasses(theme);

  // =========================================================
  // UPLOAD FORM STATE
  // =========================================================
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("uploaded");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadGallery, setUploadGallery] = useState(false);
  const [uploadFeatured, setUploadFeatured] = useState(false);
  const [uploadHero, setUploadHero] = useState(false);
  const [uploadInShop, setUploadInShop] = useState(false);
  const [uploadIntro, setUploadIntro] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploadCategoryMode, setUploadCategoryMode] = useState("existing");
  const [uploadCustomCategory, setUploadCustomCategory] = useState("");

  // =========================================================
  // SINGLE EDIT STATE
  // =========================================================
  const [editingImage, setEditingImage] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPriceS, setEditPriceS] = useState("");
  const [editPriceM, setEditPriceM] = useState("");
  const [editPriceL, setEditPriceL] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCategoryMode, setEditCategoryMode] = useState("existing");
  const [editCustomCategory, setEditCustomCategory] = useState("");
  const [editGallery, setEditGallery] = useState(false);
  const [editFeatured, setEditFeatured] = useState(false);
  const [editHero, setEditHero] = useState(false);
  const [editInShop, setEditInShop] = useState(false);
  const [editIntro, setEditIntro] = useState(false);

  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // =========================================================
  // FILTER STATE
  // =========================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [heroFilter, setHeroFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [shopFilter, setShopFilter] = useState("all");
  const [introFilter, setIntroFilter] = useState("all");

  // =========================================================
  // MULTI-SELECTION STATE
  // =========================================================
  const [selectedImageIds, setSelectedImageIds] = useState([]);

  // =========================================================
  // BATCH EDIT STATE
  // =========================================================
  const [isBatchEditOpen, setIsBatchEditOpen] = useState(false);
  const [batchTitle, setBatchTitle] = useState("");
  const [batchPrice, setBatchPrice] = useState("");
  const [batchPriceS, setBatchPriceS] = useState("");
  const [batchPriceM, setBatchPriceM] = useState("");
  const [batchPriceL, setBatchPriceL] = useState("");
  const [batchCategory, setBatchCategory] = useState("");
  const [batchCategoryMode, setBatchCategoryMode] = useState("existing");
  const [batchCustomCategory, setBatchCustomCategory] = useState("");
  const [batchGalleryEnabled, setBatchGalleryEnabled] = useState(false);
  const [batchGalleryValue, setBatchGalleryValue] = useState(false);
  const [batchFeaturedEnabled, setBatchFeaturedEnabled] = useState(false);
  const [batchFeaturedValue, setBatchFeaturedValue] = useState(false);
  const [batchHeroEnabled, setBatchHeroEnabled] = useState(false);
  const [batchHeroValue, setBatchHeroValue] = useState(false);
  const [batchInShopEnabled, setBatchInShopEnabled] = useState(false);
  const [batchInShopValue, setBatchInShopValue] = useState(false);
  const [isSavingBatchEdit, setIsSavingBatchEdit] = useState(false);

  const [movePositions, setMovePositions] = useState({});

  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // =========================================================
  // MANAGER TAB STATE
  // Controls which manager panel is currently visible.
  // Saved to localStorage so the last active tab is restored.
  // =========================================================

  const [activeManagerTab, setActiveManagerTab] = useState(() => {
    return localStorage.getItem("managerTab") || "upload";
  });

  useEffect(() => {
    localStorage.setItem("managerTab", activeManagerTab);
  }, [activeManagerTab]);

  // =========================================================
  // IMAGE SELECTION HELPERS
  // Handles single and multi-image selection behavior.
  // Supports Shift-click range selection.
  // =========================================================

  function toggleImageSelection(imageId) {
    setSelectedImageIds((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  }
  // Shift-click selects a range of visible images.

  function handleImageSelection(imageId, index, event) {
    if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);

      const idsToSelect = managerListImages
        .slice(start, end + 1)
        .map((img) => img.id);

      setSelectedImageIds((prev) => [...new Set([...prev, ...idsToSelect])]);
    } else {
      toggleImageSelection(imageId);
    }

    setLastSelectedIndex(index);
  }

  // Moves an image up or down inside the filtered gallery list.
  // The reordered visible list is merged back into the full gallery list
  // so hidden items keep their positions unchanged.

  async function moveGalleryImage(imageId, direction) {
    const currentIndex = filteredGalleryOrderList.findIndex(
      (img) => img.id === imageId
    );
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= filteredGalleryOrderList.length)
      return;

    const visibleIds = filteredGalleryOrderList.map((img) => img.id);
    const reorderedVisible = [...filteredGalleryOrderList];

    [reorderedVisible[currentIndex], reorderedVisible[targetIndex]] = [
      reorderedVisible[targetIndex],
      reorderedVisible[currentIndex],
    ];

    const reorderedVisibleIds = reorderedVisible.map((img) => img.id);

    let visiblePointer = 0;

    const reorderedFullList = galleryOrderList.map((img) => {
      if (visibleIds.includes(img.id)) {
        const replacementId = reorderedVisibleIds[visiblePointer];
        visiblePointer += 1;
        return (
          galleryOrderList.find((item) => item.id === replacementId) ?? img
        );
      }

      return img;
    });

    const reorderedWithOrder = reorderedFullList.map((img, index) => ({
      ...img,
      galleryOrder: index,
    }));

    try {
      await onReorderGallery?.(reorderedWithOrder.map((img) => img.id));
    } catch (error) {
      console.error("Failed to reorder gallery:", error);
      showToast?.(
        "Gallery order failed",
        "Could not save the new order.",
        "error"
      );
    }
  }

  // Moves an image directly to a target position entered by the user.
  // Only visible filtered images are reordered.

  async function moveGalleryImageToPosition(imageId, targetPosition) {
    const currentIndex = filteredGalleryOrderList.findIndex(
      (img) => img.id === imageId
    );
    if (currentIndex === -1) return;

    const parsedTarget = Number(targetPosition);
    if (Number.isNaN(parsedTarget)) {
      showToast?.(
        "Invalid position",
        "Please enter a valid number.",
        "warning"
      );
      return;
    }

    if (parsedTarget < 1 || parsedTarget > filteredGalleryOrderList.length) {
      showToast?.(
        "Invalid position",
        `Please enter a number between 1 and ${filteredGalleryOrderList.length}.`,
        "warning"
      );
      return;
    }

    const normalizedTargetIndex = parsedTarget - 1;

    if (normalizedTargetIndex === currentIndex) return;

    const visibleIds = filteredGalleryOrderList.map((img) => img.id);
    const reorderedVisible = [...filteredGalleryOrderList];

    const [movedImage] = reorderedVisible.splice(currentIndex, 1);
    reorderedVisible.splice(normalizedTargetIndex, 0, movedImage);

    const reorderedVisibleIds = reorderedVisible.map((img) => img.id);

    let visiblePointer = 0;

    const reorderedFullList = galleryOrderList.map((img) => {
      if (visibleIds.includes(img.id)) {
        const replacementId = reorderedVisibleIds[visiblePointer];
        visiblePointer += 1;
        return galleryOrderList.find((item) => item.id === replacementId);
      }

      return img;
    });

    const reorderedWithOrder = reorderedFullList.map((img, index) => ({
      ...img,
      galleryOrder: index,
    }));

    try {
      await onReorderGallery?.(reorderedWithOrder.map((img) => img.id));

      setMovePositions((prev) => ({
        ...prev,
        [imageId]: normalizedTargetIndex + 1,
      }));
    } catch (error) {
      console.error("Failed to move gallery image:", error);
      showToast?.(
        "Gallery order failed",
        "Could not save the new order.",
        "error"
      );
    }
  }

  // Creates a sorted category list used by filters and forms.

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(images.map((img) => img.category).filter(Boolean)),
    ];
    return ["all", ...uniqueCategories.sort((a, b) => a.localeCompare(b))];
  }, [images]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const galleryOrderList = useMemo(() => {
    return [...images]
      .filter((img) => img.gallery)
      .sort((a, b) => {
        const orderA = a.galleryOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.galleryOrder ?? Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title);
      });
  }, [images]);

  // Applies all active manager filters to the image list.

  const filteredImages = useMemo(() => {
    let result = [...images];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter((img) => img.title?.toLowerCase().includes(query));
    }

    if (galleryFilter === "gallery") {
      result = result.filter((img) => img.gallery);
    } else if (galleryFilter === "not-gallery") {
      result = result.filter((img) => !img.gallery);
    }

    if (heroFilter === "hero") {
      result = result.filter((img) => img.hero);
    } else if (heroFilter === "not-hero") {
      result = result.filter((img) => !img.hero);
    }

    if (featuredFilter === "featured") {
      result = result.filter((img) => img.featured);
    } else if (featuredFilter === "not-featured") {
      result = result.filter((img) => !img.featured);
    }

    if (shopFilter === "in-shop") {
      result = result.filter((img) => img.inShop);
    } else if (shopFilter === "not-in-shop") {
      result = result.filter((img) => !img.inShop);
    }

    if (introFilter === "intro") {
      result = result.filter((img) => img.intro);
    } else if (introFilter === "not-intro") {
      result = result.filter((img) => !img.intro);
    }

    if (categoryFilter !== "all") {
      result = result.filter((img) => img.category === categoryFilter);
    }

    return result.sort((a, b) => a.title.localeCompare(b.title));
  }, [
    images,
    searchTerm,
    galleryFilter,
    heroFilter,
    featuredFilter,
    categoryFilter,
    shopFilter,
    introFilter,
  ]);

  // Builds the ordered gallery list.
  // Images without a galleryOrder are pushed to the end.

  // Applies filters specifically to the gallery ordering panel.

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const filteredGalleryOrderList = useMemo(() => {
    let result = [...galleryOrderList];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter((img) => img.title?.toLowerCase().includes(query));
    }

    if (categoryFilter !== "all") {
      result = result.filter((img) => img.category === categoryFilter);
    }

    if (heroFilter === "hero") {
      result = result.filter((img) => img.hero);
    } else if (heroFilter === "not-hero") {
      result = result.filter((img) => !img.hero);
    }

    if (featuredFilter === "featured") {
      result = result.filter((img) => img.featured);
    } else if (featuredFilter === "not-featured") {
      result = result.filter((img) => !img.featured);
    }

    if (shopFilter === "in-shop") {
      result = result.filter((img) => img.inShop);
    } else if (shopFilter === "not-in-shop") {
      result = result.filter((img) => !img.inShop);
    }

    if (introFilter === "intro") {
      result = result.filter((img) => img.intro);
    } else if (introFilter === "not-intro") {
      result = result.filter((img) => !img.intro);
    }

    return result;
  }, [
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    galleryOrderList,
    searchTerm,
    categoryFilter,
    heroFilter,
    featuredFilter,
    shopFilter,
    introFilter,
  ]);

  const managerListImages =
    galleryFilter === "gallery" ? filteredGalleryOrderList : filteredImages;

  const areAllVisibleSelected =
    managerListImages.length > 0 &&
    managerListImages.every((img) => selectedImageIds.includes(img.id));

  // =========================================================
  // THEME / STYLE HELPERS
  // =========================================================

  const textMutedClass =
    theme === "light" ? "text-slate-600" : "text-slate-300";

  // =========================================================
  // EFFECTS
  // =========================================================
  // Generates temporary preview URLs for uploaded files.
  // URLs are cleaned up when files change or component unmounts.

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedImageIds([]);
  }, [
    searchTerm,
    galleryFilter,
    heroFilter,
    featuredFilter,
    shopFilter,
    categoryFilter,
    introFilter,
  ]);

  useEffect(() => {
    const previews = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedFiles]);

  // =========================================================
  // UPLOAD HELPERS
  // =========================================================
  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  }

  function removeSelectedFile(indexToRemove) {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }

  function clearSelectedFiles() {
    setSelectedFiles([]);
  }
  // Drag & drop upload handlers.

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) {
      showToast?.(
        "No valid images",
        "Please drop one or more image files.",
        "warning"
      );
      return;
    }

    setSelectedFiles(files);
  }

  // Validates optional numeric price inputs.

  function isInvalidPrice(value) {
    if (value === "") return false;

    const num = Number(value);

    return !Number.isFinite(num) || num < 0;
  }

  // Uploads all selected images with the current upload settings.
  async function handleSubmit(e) {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showToast?.(
        "No files selected",
        "Please select at least one image.",
        "warning"
      );
      return;
    }

    try {
      const finalCategory =
        uploadCategoryMode === "new"
          ? uploadCustomCategory.trim() || "uploaded"
          : category || "uploaded";

      for (const file of selectedFiles) {
        await onAddImage({
          title: title.trim() || file.name.replace(/\.[^/.]+$/, ""),
          category: finalCategory,
          file,
          gallery: uploadGallery,
          featured: uploadFeatured,
          hero: uploadHero,
          inShop: uploadInShop,
          intro: uploadIntro,
        });
      }

      setTitle("");
      setCategory("uploaded");
      setUploadCategoryMode("existing");
      setUploadCustomCategory("");
      setSelectedFiles([]);
      setUploadGallery(false);
      setUploadFeatured(false);
      setUploadHero(false);
      setUploadInShop(false);
      setUploadIntro(false);
      e.target.reset();
    } catch (error) {
      console.error("Upload error:", error);
    }
  }

  // Opens the single image edit modal
  // and pre-fills all editable fields.
  function openEditModal(image) {
    setEditingImage(image);
    setEditTitle(image.title || "");
    setEditPrice(String(image.price ?? ""));
    setEditPriceS(String(image.variants?.s?.price ?? ""));
    setEditPriceM(String(image.variants?.m?.price ?? ""));
    setEditPriceL(String(image.variants?.l?.price ?? ""));
    setEditCategory(image.category || "uploaded");
    setEditCategoryMode("existing");
    setEditCustomCategory("");
    setEditGallery(!!image.gallery);
    setEditFeatured(!!image.featured);
    setEditHero(!!image.hero);
    setEditInShop(!!image.inShop);
    setEditIntro(!!image.intro);
  }

  function closeEditModal() {
    setEditingImage(null);
    setEditTitle("");
    setEditPrice("");
    setEditPriceS("");
    setEditPriceM("");
    setEditPriceL("");
    setEditCategory("");
    setEditCategoryMode("existing");
    setEditCustomCategory("");
    setEditGallery(false);
    setEditFeatured(false);
    setEditHero(false);
    setEditInShop(false);
    setEditIntro(false);
    setIsSavingEdit(false);
  }

  // Saves changes made in the single image edit modal.
  async function handleSaveEdit(e) {
    e.preventDefault();

    if (isSavingEdit) return;

    if (!editingImage) return;

    if (!editTitle.trim()) {
      showToast?.(
        "Title required",
        "Please enter a title before saving.",
        "warning"
      );
      return;
    }

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
      setIsSavingEdit(true);

      const updates = {
        title: editTitle.trim(),
        category:
          editCategoryMode === "new"
            ? editCustomCategory.trim() || "uploaded"
            : editCategory,
        gallery: editGallery,
        featured: editFeatured,
        hero: editHero,
        inShop: editInShop,
        intro: editIntro,
      };

      if (editPrice !== "") {
        updates.price = Number(editPrice);
      }

      if (editingImage.variants) {
        updates.variants = {
          ...editingImage.variants,
          s: editingImage.variants.s
            ? {
                ...editingImage.variants.s,
                price:
                  editPriceS !== ""
                    ? Number(editPriceS)
                    : editingImage.variants.s.price,
              }
            : undefined,
          m: editingImage.variants.m
            ? {
                ...editingImage.variants.m,
                price:
                  editPriceM !== ""
                    ? Number(editPriceM)
                    : editingImage.variants.m.price,
              }
            : undefined,
          l: editingImage.variants.l
            ? {
                ...editingImage.variants.l,
                price:
                  editPriceL !== ""
                    ? Number(editPriceL)
                    : editingImage.variants.l.price,
              }
            : undefined,
        };
      }

      await onUpdateImage(editingImage.id, updates);

      closeEditModal();
    } catch (error) {
      console.error("Update error:", error);

      showToast?.(
        "Update failed",
        "The image could not be saved. Please check the backend.",
        "error"
      );

      setIsSavingEdit(false);
    }
  }

  // Multi-selection helpers.
  function clearSelection() {
    setSelectedImageIds([]);
  }

  function selectAllVisible() {
    setSelectedImageIds(managerListImages.map((img) => img.id));
  }

  function handleDeleteSelected() {
    if (selectedImageIds.length === 0) return;

    const idsToDelete = [...selectedImageIds];

    onDeleteSelectedImages?.(idsToDelete);
  }

  // Builds a reusable updates object for batch editing.
  // Only enabled or filled fields are included.

  function buildBatchUpdates() {
    const updates = {};

    if (batchTitle.trim() !== "") {
      updates.title = batchTitle.trim();
    }

    if (batchPrice !== "") {
      updates.price = Number(batchPrice);
    }

    if (batchCategoryMode === "new" && batchCustomCategory.trim() !== "") {
      updates.category = batchCustomCategory.trim();
    } else if (batchCategoryMode === "existing" && batchCategory !== "") {
      updates.category = batchCategory;
    }

    if (batchGalleryEnabled) {
      updates.gallery = batchGalleryValue;
    }

    if (batchFeaturedEnabled) {
      updates.featured = batchFeaturedValue;
    }

    if (batchHeroEnabled) {
      updates.hero = batchHeroValue;
    }

    if (batchInShopEnabled) {
      updates.inShop = batchInShopValue;
    }

    if (batchPriceS !== "" || batchPriceM !== "" || batchPriceL !== "") {
      updates.variantPrices = {
        s: batchPriceS !== "" ? Number(batchPriceS) : undefined,
        m: batchPriceM !== "" ? Number(batchPriceM) : undefined,
        l: batchPriceL !== "" ? Number(batchPriceL) : undefined,
      };
    }

    return updates;
  }

  function openBatchEditModal() {
    if (selectedImageIds.length === 0) return;

    setBatchTitle("");
    setBatchPrice("");
    setBatchPriceS("");
    setBatchPriceM("");
    setBatchPriceL("");
    setBatchCategory("");
    setBatchCategoryMode("existing");
    setBatchCustomCategory("");
    setBatchGalleryEnabled(false);
    setBatchGalleryValue(false);
    setBatchFeaturedEnabled(false);
    setBatchFeaturedValue(false);
    setBatchHeroEnabled(false);
    setBatchHeroValue(false);
    setBatchInShopEnabled(false);
    setBatchInShopValue(false);
    setIsBatchEditOpen(true);
  }

  function closeBatchEditModal() {
    setIsBatchEditOpen(false);
    setBatchTitle("");
    setBatchPrice("");
    setBatchPriceS("");
    setBatchPriceM("");
    setBatchPriceL("");
    setBatchCategory("");
    setBatchCategoryMode("existing");
    setBatchCustomCategory("");
    setBatchGalleryEnabled(false);
    setBatchGalleryValue(false);
    setBatchFeaturedEnabled(false);
    setBatchFeaturedValue(false);
    setBatchHeroEnabled(false);
    setBatchHeroValue(false);
    setBatchInShopEnabled(false);
    setBatchInShopValue(false);
    setIsSavingBatchEdit(false);
  }

  // Applies batch updates to all selected images.
  async function handleBatchEditSave(e) {
    e.preventDefault();

    if (selectedImageIds.length === 0) return;

    if (
      isInvalidPrice(batchPrice) ||
      isInvalidPrice(batchPriceS) ||
      isInvalidPrice(batchPriceM) ||
      isInvalidPrice(batchPriceL)
    ) {
      showToast?.(
        "Invalid price",
        "Please enter valid positive numbers for prices.",
        "warning"
      );
      return;
    }

    const updates = buildBatchUpdates();
    if (Object.keys(updates).length === 0) {
      showToast?.(
        "No changes selected",
        "Please enter or enable at least one field before saving.",
        "warning"
      );
      return;
    }

    try {
      setIsSavingBatchEdit(true);

      for (const imageId of selectedImageIds) {
        const image = images.find((img) => img.id === imageId);
        if (!image) continue;

        const updatesForImage = { ...updates };

        if (batchTitle.trim() !== "") {
          updatesForImage.title = batchTitle.trim();
        }

        if (updates.variantPrices && image.variants) {
          updatesForImage.variants = {
            ...image.variants,
            s: image.variants.s
              ? {
                  ...image.variants.s,
                  price: updates.variantPrices.s ?? image.variants.s.price,
                }
              : undefined,
            m: image.variants.m
              ? {
                  ...image.variants.m,
                  price: updates.variantPrices.m ?? image.variants.m.price,
                }
              : undefined,
            l: image.variants.l
              ? {
                  ...image.variants.l,
                  price: updates.variantPrices.l ?? image.variants.l.price,
                }
              : undefined,
          };
        }

        delete updatesForImage.variantPrices;

        await onUpdateImage(imageId, updatesForImage);
      }

      closeBatchEditModal();
      setSelectedImageIds([]);
    } catch (error) {
      console.error("Batch update error:", error);
      setIsSavingBatchEdit(false);
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <section className="mt-25 space-y-6">
        <div>
          <p
            className={`text-2xl font-bold md:text-4xl tracking-widest opacity-60 ${
              theme === "light" ? "text-slate-900" : "text-white"
            }`}
          >
            Manage Images
          </p>
          <p className={`mt-2 ${textMutedClass}`}>
            Upload new images and manage existing image data.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            ["upload", "Upload", Upload],
            ["manage", "Manage", Image],
            ["order", "Order", SlidersHorizontal],
          ].map(([tab, label, Icon]) => {
            const isActive = activeManagerTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveManagerTab(tab)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200
          ${
            isActive
              ? theme === "light"
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "bg-white/10 text-white ring-1 ring-white/10"
              : theme === "light"
              ? "text-slate-500 hover:bg-white/60 hover:text-slate-900"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
              >
                {Icon && (
                  <span
                    className={`transition-all duration-200 ${
                      isActive
                        ? "scale-150 opacity-100"
                        : "scale-100 opacity-70"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                )}

                {label}

                {/* Active underline */}
                {isActive && (
                  <motion.span
                    layoutId="manager-tab-underline"
                    className={`absolute bottom-0 left-7/12 h-0.5 w-10 -translate-x-1/2 rounded-full ${
                      theme === "light" ? "bg-pink-300" : "bg-white"
                    }`}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          {/* =================================================
              UPLOAD FORM
          ================================================== */}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeManagerTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {activeManagerTab === "upload" && (
                <UploadPanel
                  loading={loading}
                  error={error}
                  title={title}
                  setTitle={setTitle}
                  category={category}
                  categories={categories}
                  setCategory={setCategory}
                  selectedFiles={selectedFiles}
                  filePreviews={filePreviews}
                  uploadCategoryMode={uploadCategoryMode}
                  setUploadCategoryMode={setUploadCategoryMode}
                  uploadCustomCategory={uploadCustomCategory}
                  setUploadCustomCategory={setUploadCustomCategory}
                  uploadGallery={uploadGallery}
                  setUploadGallery={setUploadGallery}
                  uploadFeatured={uploadFeatured}
                  setUploadFeatured={setUploadFeatured}
                  uploadHero={uploadHero}
                  setUploadHero={setUploadHero}
                  uploadInShop={uploadInShop}
                  setUploadInShop={setUploadInShop}
                  uploadIntro={uploadIntro}
                  setUploadIntro={setUploadIntro}
                  isDragOver={isDragOver}
                  handleSubmit={handleSubmit}
                  handleFileChange={handleFileChange}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                  clearSelectedFiles={clearSelectedFiles}
                  removeSelectedFile={removeSelectedFile}
                  theme={theme}
                  textMutedClass={textMutedClass}
                />
              )}
              {/* =================================================
              EXISTING IMAGES PANEL
          ================================================== */}
              {activeManagerTab === "manage" && (
                <div
                  className={`rounded-3xl border p-6 ${buttons.existingPanel}`}
                >
                  <div className="mb-4">
                    <h3
                      className={`text-xl font-semibold ${
                        theme === "light" ? "text-slate-900" : "text-white"
                      }`}
                    >
                      Existing images. Filter states to show number of images.
                    </h3>
                    <p className={`mt-1 text-sm ${text.soft}`}>
                      {managerListImages.length} of {images.length} image(s)
                    </p>
                  </div>

                  {/* =================================================
                          FILTER CONTROLS
                  ================================================== */}

                  <div className="mb-3 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${filters.base} ${filters.input}`}
                      placeholder="Search title..."
                    />

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className={`${filters.base} ${filters.category}`}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === "all" ? "All categories" : cat}
                        </option>
                      ))}
                    </select>

                    <select
                      value={galleryFilter}
                      onChange={(e) => setGalleryFilter(e.target.value)}
                      className={`${filters.base} ${filters.gallery}`}
                    >
                      <option value="all">Gallery States</option>
                      <option value="gallery">Only Gallery</option>
                      <option value="not-gallery">Only Non-Gallery</option>
                    </select>

                    <select
                      value={heroFilter}
                      onChange={(e) => setHeroFilter(e.target.value)}
                      className={`${filters.base} ${filters.hero}`}
                    >
                      <option value="all">Hero states</option>
                      <option value="hero">Hero only</option>
                      <option value="not-hero">Not hero</option>
                    </select>

                    <select
                      value={featuredFilter}
                      onChange={(e) => setFeaturedFilter(e.target.value)}
                      className={`${filters.base} ${filters.featured}`}
                    >
                      <option value="all">Featured states</option>
                      <option value="featured">Featured only</option>
                      <option value="not-featured">Not featured</option>
                    </select>

                    <select
                      value={shopFilter}
                      onChange={(e) => setShopFilter(e.target.value)}
                      className={`${filters.base} ${filters.shop}`}
                    >
                      <option value="all">Shop states</option>
                      <option value="in-shop">In Shop only</option>
                      <option value="not-in-shop">Not in Shop</option>
                    </select>

                    <select
                      value={introFilter}
                      onChange={(e) => setIntroFilter(e.target.value)}
                      className={`${filters.base} ${filters.intro}`}
                    >
                      <option value="all">Intro states</option>
                      <option value="intro">Intro only</option>
                      <option value="not-intro">Not intro</option>
                    </select>
                  </div>
                  {/* ===== Filter action bar ===== */}
                  <div className="mb-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setGalleryFilter("all");
                        setHeroFilter("all");
                        setFeaturedFilter("all");
                        setShopFilter("all");
                        setCategoryFilter("all");
                        setIntroFilter("all");
                      }}
                      className={buttons.secondary}
                    >
                      Reset filters
                    </button>

                    <button
                      type="button"
                      onClick={
                        areAllVisibleSelected
                          ? clearSelection
                          : selectAllVisible
                      }
                      className={buttons.secondary}
                    >
                      {areAllVisibleSelected
                        ? "Clear Visible Selection"
                        : "Select All Visible"}
                    </button>
                  </div>

                  {/* =================================================
                          MULTI-SELECTION ACTIONS
                  ================================================== */}

                  {selectedImageIds.length > 0 && (
                    <div
                      className={`mb-5 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 ${
                        theme === "light"
                          ? "border-blue-200 bg-blue-50"
                          : "border-blue-500/20 bg-blue-500/10"
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {selectedImageIds.length} image(s) selected
                      </p>

                      <button
                        type="button"
                        onClick={clearSelection}
                        className={buttons.secondary}
                      >
                        Clear Selection
                      </button>

                      <button
                        type="button"
                        onClick={openBatchEditModal}
                        className={buttons.edit}
                      >
                        Edit Selected
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        className={buttons.delete}
                      >
                        Delete Selected
                      </button>
                    </div>
                  )}

                  <ManagerImageList
                    managerListImages={managerListImages}
                    loading={loading}
                    error={error}
                    selectedImageIds={selectedImageIds}
                    handleImageSelection={handleImageSelection}
                    toggleImageSelection={toggleImageSelection}
                    onImageClick={(image) =>
                      onImageClick(image, managerListImages, "Manager")
                    }
                    openEditModal={openEditModal}
                    onDeleteImage={onDeleteImage}
                    theme={theme}
                    textMutedClass={textMutedClass}
                  />
                </div>
              )}

              {activeManagerTab === "order" && (
                <GalleryOrderPanel
                  filteredGalleryOrderList={filteredGalleryOrderList}
                  loading={loading}
                  error={error}
                  galleryOrderList={galleryOrderList}
                  movePositions={movePositions}
                  setMovePositions={setMovePositions}
                  moveGalleryImage={moveGalleryImage}
                  moveGalleryImageToPosition={moveGalleryImageToPosition}
                  theme={theme}
                  textMutedClass={textMutedClass}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* =================================================
            MODALS
      ================================================== */}

      <BatchEditModal
        isOpen={isBatchEditOpen}
        selectedImageIds={selectedImageIds}
        categories={categories}
        theme={theme}
        textMutedClass={textMutedClass}
        closeBatchEditModal={closeBatchEditModal}
        handleBatchEditSave={handleBatchEditSave}
        isSavingBatchEdit={isSavingBatchEdit}
        batchTitle={batchTitle}
        setBatchTitle={setBatchTitle}
        batchPrice={batchPrice}
        setBatchPrice={setBatchPrice}
        batchPriceS={batchPriceS}
        setBatchPriceS={setBatchPriceS}
        batchPriceM={batchPriceM}
        setBatchPriceM={setBatchPriceM}
        batchPriceL={batchPriceL}
        setBatchPriceL={setBatchPriceL}
        batchCategory={batchCategory}
        setBatchCategory={setBatchCategory}
        batchCategoryMode={batchCategoryMode}
        setBatchCategoryMode={setBatchCategoryMode}
        batchCustomCategory={batchCustomCategory}
        setBatchCustomCategory={setBatchCustomCategory}
        batchGalleryEnabled={batchGalleryEnabled}
        setBatchGalleryEnabled={setBatchGalleryEnabled}
        setBatchGalleryValue={setBatchGalleryValue}
        batchFeaturedEnabled={batchFeaturedEnabled}
        setBatchFeaturedEnabled={setBatchFeaturedEnabled}
        batchFeaturedValue={batchFeaturedValue}
        setBatchFeaturedValue={setBatchFeaturedValue}
        batchHeroEnabled={batchHeroEnabled}
        setBatchHeroEnabled={setBatchHeroEnabled}
        batchHeroValue={batchHeroValue}
        setBatchHeroValue={setBatchHeroValue}
        batchInShopEnabled={batchInShopEnabled}
        setBatchInShopEnabled={setBatchInShopEnabled}
        batchInShopValue={batchInShopValue}
        setBatchInShopValue={setBatchInShopValue}
      />
      <EditImageModal
        editingImage={editingImage}
        closeEditModal={closeEditModal}
        handleSaveEdit={handleSaveEdit}
        categories={categories}
        theme={theme}
        textMutedClass={textMutedClass}
        isSavingEdit={isSavingEdit}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
        editPriceS={editPriceS}
        setEditPriceS={setEditPriceS}
        editPriceM={editPriceM}
        setEditPriceM={setEditPriceM}
        editPriceL={editPriceL}
        setEditPriceL={setEditPriceL}
        editCategory={editCategory}
        setEditCategory={setEditCategory}
        editCategoryMode={editCategoryMode}
        setEditCategoryMode={setEditCategoryMode}
        editCustomCategory={editCustomCategory}
        setEditCustomCategory={setEditCustomCategory}
        editGallery={editGallery}
        setEditGallery={setEditGallery}
        editFeatured={editFeatured}
        setEditFeatured={setEditFeatured}
        editHero={editHero}
        setEditHero={setEditHero}
        editInShop={editInShop}
        setEditInShop={setEditInShop}
        editIntro={editIntro}
        setEditIntro={setEditIntro}
      />
    </>
  );
}
