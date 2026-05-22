import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { API_URL } from "./utils/api";

// =========================================================
// PAGE / FEATURE COMPONENTS
// =========================================================
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Shop from "./pages/Shop";
import Featured from "./pages/Featured";
import Manager from "./pages/Manager";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";

// =========================================================
// SHARED UI COMPONENTS
// =========================================================
import ImageModal from "./components/ImageModal";
import CartDrawer from "./components/CartDrawer";
import ConfirmModal from "./components/ConfirmModal";
import Toast from "./components/Toast";
import Layout from "./layouts/Layout";

// =========================================================
// LOCAL DATA
// =========================================================
import imagesData from "./data/images.json";

// Dynamically imports all local image assets
// so they can be converted into gallery image objects.

const imageModules = import.meta.glob(
  "./assets/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
  { eager: true }
);

const metadataByFile = Object.fromEntries(
  imagesData.map((img) => [img.file, img])
);

// Creates the initial local image dataset by combining
// imported assets with metadata from images.json.

const startImages = Object.entries(imageModules).map(
  ([path, module], index) => {
    const fileName = path.split("/").pop();
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const meta = metadataByFile[fileName];

    return {
      id: meta?.id ?? index + 1,
      title: meta?.title ?? nameWithoutExt,
      url: module.default,
      price: meta?.price ?? 25,
      galleryOrder: meta?.galleryOrder ?? null,
      category: meta?.category ?? "uncategorized",
      file: fileName,
      featured: meta?.featured ?? false,
      hero: meta?.hero ?? false,
      inShop: meta?.inShop ?? false,
    };
  }
);

// =========================================================
// PAGE TRANSITIONS
// =========================================================
const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

// Automatically scrolls to the top whenever the route changes.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

// =======================================================
// MAIN APPLICATION CONTAINER
// Handles:
// - global state
// - routing
// - backend communication
// - modals
// - cart logic
// - favorites
// - image management
// =======================================================

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Stores the current user role.
  // Persisted in localStorage.
  const [role, setRole] = useState(() => {
    try {
      const stored = localStorage.getItem("role");
      return stored ? JSON.parse(stored) : "user";
    } catch {
      return "user";
    }
  });

  const ADMIN_SECRET = "my-admin-secret";

  // ADMIN ACCESS

  const [adminToken, setAdminToken] = useState(() =>
    sessionStorage.getItem("adminToken")
  );

  function loginAdmin(token) {
    sessionStorage.setItem("adminToken", token);
    setAdminToken(token);
  }

  function logoutAdmin() {
    sessionStorage.removeItem("adminToken");
    setAdminToken(null);
    navigate("/");
  }

  const [images, setImages] = useState(startImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Loads persisted cart data from localStorage.
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        return Array.isArray(parsedCart) ? parsedCart : [];
      }
      return [];
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      return [];
    }
  });

  const [favorites, setFavorites] = useState([]);
  const [showHeader, setShowHeader] = useState(true);

  // =======================================================
  // THEME STATE
  // =======================================================
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      return stored ? JSON.parse(stored) : "light";
    } catch {
      return "light";
    }
  });

  // =======================================================
  // GALLERY / FILTER STATE
  // =======================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("title-asc");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // =======================================================
  // MODAL / DRAWER STATE
  // =======================================================
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalContext, setModalContext] = useState("");

  // =======================================================
  // CONFIRM / TOAST STATE
  // =======================================================
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    variant: "default",
    action: null,
  });

  const [toast, setToast] = useState(null);

  // =======================================================
  // APP CONSTANTS
  // =======================================================
  const currencySymbol = "€";

  // =======================================================
  // CURRENT PAGE FROM ROUTE
  // =======================================================
  const pathname = location.pathname;

  // Converts the current route pathname into
  // a simplified page identifier used by Layout.
  const page =
    pathname === "/"
      ? "home"
      : pathname === "/gallery"
      ? "gallery"
      : pathname === "/shop"
      ? "shop"
      : pathname === "/featured"
      ? "featured"
      : pathname === "/favorites"
      ? "favorites"
      : pathname === "/manager"
      ? "manage"
      : pathname === "/about"
      ? "about"
      : pathname === "/contact"
      ? "contact"
      : "home";

  // =======================================================
  // EFFECTS: LOAD LOCAL CART
  // =======================================================
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // =======================================================
  // EFFECTS: KEEP FAVORITES VALID WHEN IMAGES CHANGE
  // =======================================================
  useEffect(() => {
    if (images.length === 0) return;

    const validImageIds = new Set(images.map((img) => img.id));

    setFavorites((prev) => {
      const cleanedFavorites = [...new Set(prev)].filter((id) =>
        validImageIds.has(id)
      );

      if (cleanedFavorites.length === prev.length) {
        return prev;
      }

      return cleanedFavorites;
    });
  }, [images]);

  // =======================================================
  // EFFECTS: SHOW HEADER
  // =======================================================
  useEffect(() => {
    if (page !== "home") {
      setShowHeader(true);
    }
  }, [page]);

  // =======================================================
  // EFFECTS: PERSIST LOCAL STORAGE
  // =======================================================
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("role", JSON.stringify(role));
  }, [role]);

  // =======================================================
  // EFFECTS: FETCH IMAGES FROM BACKEND
  // =======================================================

  // Loads image data from the backend API
  // and normalizes the returned image structure.
  useEffect(() => {
    async function fetchImages() {
      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 600));

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/images`);

        if (!response.ok) {
          throw new Error(`Backend responded with ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Backend did not return an image array");
        }

        const normalizedBackendImages = data.map((img, index) => ({
          id: img.id ?? `backend-${index}`,
          title: img.title ?? "Untitled",
          url: img.url ?? img.imageUrl ?? img.path ?? "",
          price: img.price ?? 25,
          category: img.category ?? "uncategorized",
          file: img.file ?? "",
          gallery: img.gallery ?? false,
          galleryOrder: img.galleryOrder ?? null,
          featured: img.featured ?? false,
          hero: img.hero ?? false,
          inShop: img.inShop ?? false,
          intro: img.intro ?? false,
          variants: img.variants ?? null,
          width: img.width ?? null,
          height: img.height ?? null,
          uploadedAt: img.uploadedAt ?? null,
          updatedAt: img.updatedAt ?? null,
        }));

        await minLoadingTime;
        setImages(normalizedBackendImages);
      } catch (error) {
        console.error("Failed to fetch images:", error);

        await minLoadingTime;
        setError("Backend is not available. Please start the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  // Loads persisted favorite image IDs from backend storage.
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch(`${API_URL}/favorites`);

        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const data = await response.json();

        setFavorites(data);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    }

    fetchFavorites();
  }, []);

  // =======================================================
  // DERIVED VALUES
  // Computed values generated from application state.
  // =======================================================
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const favoriteImages = useMemo(
    () =>
      images.filter((img) =>
        favorites.some((favId) => String(favId) === String(img.id))
      ),
    [images, favorites]
  );

  const featuredImages = useMemo(
    () => images.filter((img) => img.featured),
    [images]
  );

  const shopImages = useMemo(
    () => images.filter((img) => img.inShop),
    [images]
  );

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        images
          .filter((img) => img.gallery)
          .map((img) => String(img.category || "").trim())
          .filter((cat) => cat && cat !== "uploaded")
      ),
    ];

    return ["all", ...uniqueCategories.sort((a, b) => a.localeCompare(b))];
  }, [images]);

  const filteredImages = useMemo(() => {
    let result = images.filter((img) => img.gallery);

    // Applies gallery search, category,
    // favorites filtering, and sorting.

    if (searchTerm.trim()) {
      result = result.filter((img) =>
        img.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (img) =>
          String(img.category || "")
            .trim()
            .toLowerCase() ===
          String(selectedCategory || "")
            .trim()
            .toLowerCase()
      );
    }

    if (showFavoritesOnly) {
      result = result.filter((img) =>
        favorites.some((favId) => String(favId) === String(img.id))
      );
    }

    result.sort((a, b) => {
      const orderA = a.galleryOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.galleryOrder ?? Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.title.localeCompare(b.title);
    });

    return result;
  }, [images, searchTerm, selectedCategory, showFavoritesOnly, favorites]);

  // Displays temporary toast notifications.

  function showToast(title, message = "", variant = "default") {
    const id = Date.now();
    setToast({ id, title, message, variant });

    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2500);
  }

  function closeToast() {
    setToast(null);
  }

  // Toggles between light and dark theme modes.
  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  // Ensures the modal displays the highest available image variant.
  function getModalVersion(image) {
    if (!image) return image;

    if (image.variants?.l?.url) {
      return {
        ...image,
        url: image.variants.l.url,
        price: image.variants.l.price ?? image.price,
        selectedVariant: "l",
      };
    }

    return image;
  }

  // Opens the fullscreen image modal
  // and prepares modal navigation images.
  function openImageModal(image, imageList, context = "") {
    const modalReadyImages = imageList.map((img) => getModalVersion(img));
    const modalReadySelectedImage = getModalVersion(image);

    setSelectedImage(modalReadySelectedImage);
    setModalImages(modalReadyImages);
    setModalContext(context);
  }

  // Opens an image modal while syncing the image ID to the URL.
  function openImageRoute(
    image,
    imageList,
    context = "",
    basePath = "/gallery"
  ) {
    openImageModal(image, imageList, context);
    navigate(`${basePath}?image=${image.id}`);
  }

  function closeImageModal() {
    setSelectedImage(null);
    navigate(location.pathname);
  }

  // Syncs image modal state with the current URL query parameter.
  // Allows direct linking to modal images.

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const imageId = params.get("image");

    const isHome = location.pathname === "/";
    const isManager = location.pathname === "/manager";

    if (!imageId) {
      if (!isHome && !isManager) {
        setSelectedImage(null);
      }
      return;
    }

    if (selectedImage && String(selectedImage.id) === String(imageId)) {
      return;
    }

    let sourceImages = [];
    let context = "";

    if (location.pathname === "/") {
      return;
    } else if (location.pathname === "/gallery") {
      sourceImages = filteredImages;
      context = "Gallery";
    } else if (location.pathname === "/shop") {
      sourceImages = shopImages;
      context = "Shop";
    } else if (location.pathname === "/featured") {
      sourceImages = featuredImages;
      context = "Featured";
    } else if (location.pathname === "/favorites") {
      sourceImages = favoriteImages;
      context = "Favorites";
    } else {
      return;
    }

    const matchedImage = sourceImages.find(
      (img) => String(img.id) === String(imageId)
    );

    if (!matchedImage) return;

    setSelectedImage(getModalVersion(matchedImage));
    setModalImages(sourceImages.map((img) => getModalVersion(img)));
    setModalContext(context);
  }, [
    location.pathname,
    location.search,
    filteredImages,
    shopImages,
    featuredImages,
    favoriteImages,
    selectedImage,
  ]);

  // Uploads a new image to the backend API.
  async function addImageToBackend({
    title,
    category,
    file,
    gallery,
    featured,
    hero,
    inShop,
    intro,
  }) {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category || "uploaded");
      formData.append("gallery", gallery ? "true" : "false");
      formData.append("featured", featured ? "true" : "false");
      formData.append("hero", hero ? "true" : "false");
      formData.append("inShop", inShop ? "true" : "false");
      formData.append("image", file);
      formData.append("intro", intro ? "true" : "false");

      const response = await fetch(`${API_URL}/images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 403) {
        showToast(
          "Admin access required",
          "You must be admin to upload images.",
          "error"
        );
        throw new Error("Admin access required");
      }

      if (response.status === 409) {
        showToast(
          "Duplicate image",
          data.duplicate?.title
            ? `Already uploaded as "${data.duplicate.title}".`
            : data.message || "This image already exists in the gallery.",
          "warning"
        );

        return null;
      }

      if (!response.ok) {
        showToast(
          "Upload failed",
          data.error || data.message || "The image could not be uploaded.",
          "error"
        );

        throw new Error(data.error || "Upload failed");
      }

      setImages((prev) => [...prev, data]);

      showToast(
        "Image uploaded",
        `"${data.title || title}" was uploaded.`,
        "success"
      );

      return data;
    } catch (error) {
      console.error("Upload request failed:", error);

      showToast(
        "Backend unavailable",
        "The image could not be uploaded because the backend is not running.",
        "error"
      );

      throw error;
    }
  }

  // Deletes an image from backend and removes
  // related cart/favorite/modal references.
  async function deleteImage(id) {
    try {
      const response = await fetch(`${API_URL}/images/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.status === 403) {
        throw new Error("Admin access required");
      }

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setImages((prev) => prev.filter((img) => String(img.id) !== String(id)));
      setCart((prev) => prev.filter((item) => item.id !== id));
      setFavorites((prev) => prev.filter((favId) => favId !== id));

      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error(error);
      showToast("Delete failed", "The image could not be deleted.", "error");
    }
  }

  // Updates image metadata and synchronizes
  // all related frontend state.
  async function updateImageInBackend(id, updatedFields) {
    const existingImage = images.find((img) => String(img.id) === String(id));

    if (!existingImage) return;

    const normalizeValue = (value) => {
      if (value === undefined || value === null) return "";
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return String(value);
      if (typeof value === "string") return value.trim();
      return JSON.stringify(value);
    };

    const getVariantPrice = (variants, size) => {
      const price = variants?.[size]?.price;
      return price === undefined || price === null ? "" : String(price);
    };

    const changes = Object.entries(updatedFields).map(([key, value]) => {
      if (key === "price" && existingImage.variants) {
        return {
          key,
          changed: false,
        };
      }

      if (key === "variants") {
        const variantChanges = ["s", "m", "l"].filter((size) => {
          return (
            getVariantPrice(existingImage.variants, size) !==
            getVariantPrice(value, size)
          );
        });

        return {
          key,
          changed: variantChanges.length > 0,
        };
      }

      const oldValue = normalizeValue(existingImage[key]);
      const newValue = normalizeValue(value);

      return {
        key,
        changed: oldValue !== newValue,
      };
    });

    const hasRealChanges = changes.some((item) => item.changed);

    if (!hasRealChanges) {
      showToast(
        "No changes",
        "Nothing was changed, so no update was saved.",
        "warning"
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(updatedFields),
      });

      if (response.status === 403) {
        throw new Error("Admin access required");
      }

      if (!response.ok) {
        throw new Error("Update failed");
      }

      const updatedImage = await response.json();

      setImages((prev) =>
        prev.map((img) =>
          String(img.id) === String(id) ? { ...img, ...updatedImage } : img
        )
      );

      setSelectedImage((prev) =>
        prev && String(prev.id) === String(id)
          ? { ...prev, ...updatedImage }
          : prev
      );

      setModalImages((prev) =>
        prev.map((img) =>
          String(img.id) === String(id) ? { ...img, ...updatedImage } : img
        )
      );

      showToast(
        "Image updated",
        `"${updatedImage.title}" was updated.`,
        "success"
      );
    } catch (error) {
      console.error(error);
      showToast("Update failed", "The image could not be updated.", "error");
      throw error;
    }
  }

  // Saves gallery image ordering to backend storage.
  async function reorderGalleryInBackend(orderedIds) {
    try {
      const response = await fetch(`${API_URL}/images/reorder/gallery`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ orderedIds }),
      });

      if (response.status === 403) {
        throw new Error("Admin access required");
      }

      if (!response.ok) {
        throw new Error("Gallery reorder failed");
      }

      const updatedImages = await response.json();

      if (Array.isArray(updatedImages)) {
        const normalizedImages = updatedImages.map((img, index) => ({
          id: img.id ?? `backend-${index}`,
          title: img.title ?? "Untitled",
          url: img.url ?? img.imageUrl ?? img.path ?? "",
          price: img.price ?? 25,
          category: img.category ?? "uncategorized",
          file: img.file ?? "",
          gallery: img.gallery ?? false,
          galleryOrder: img.galleryOrder ?? null,
          featured: img.featured ?? false,
          hero: img.hero ?? false,
          inShop: img.inShop ?? false,
          variants: img.variants ?? null,
          uploadedAt: img.uploadedAt ?? null,
          updatedAt: img.updatedAt ?? null,
          width: img.width ?? null,
          height: img.height ?? null,
          intro: img.intro ?? false,
        }));

        setImages(normalizedImages);
      }

      showToast("Gallery order updated", "", "success");
    } catch (error) {
      console.error(error);
      showToast(
        "Gallery order failed",
        "Could not save the new order.",
        "error"
      );
      throw error;
    }
  }

  // Adds an item to cart without showing a toast notification.
  function addToCartSilently(image, size = "default") {
    const hasVariants = image.variants && typeof image.variants === "object";
    const normalizedSize = hasVariants ? size : "default";
    const variant = hasVariants ? image.variants?.[normalizedSize] : null;

    if (hasVariants && !variant) return;

    const unitPrice = variant?.price ?? image.price ?? 0;
    const unitUrl = variant?.url ?? image.url;

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === image.id && item.size === normalizedSize
      );

      if (existing) {
        return prev.map((item) =>
          item.id === image.id && item.size === normalizedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          ...image,
          url: unitUrl,
          price: unitPrice,
          size: normalizedSize,
          quantity: 1,
        },
      ];
    });
  }

  // Adds an item to cart and shows confirmation feedback.
  function addToCart(image, size = "default") {
    addToCartSilently(image, size);

    const sizeLabel = size !== "default" ? ` (${size.toUpperCase()})` : "";

    showToast(
      "Added to cart",
      `"${image.title}"${sizeLabel} was added to your cart.`,
      "success"
    );
  }

  // Cart quantity controls.
  function increaseCartItem(imageId, size = "default") {
    setCart((prev) =>
      prev.map((item) =>
        item.id === imageId && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseCartItem(imageId, size = "default") {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === imageId && item.size === size
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function updateCartItemSize(imageId, oldSize, newSize) {
    setCart((prev) => {
      const currentItem = prev.find(
        (item) => String(item.id) === String(imageId) && item.size === oldSize
      );

      if (!currentItem) return prev;

      const image = images.find((img) => String(img.id) === String(imageId));
      const variant = image?.variants?.[newSize];

      if (!variant) return prev;

      const existingTargetItem = prev.find(
        (item) => String(item.id) === String(imageId) && item.size === newSize
      );

      if (existingTargetItem) {
        return prev
          .filter(
            (item) =>
              !(String(item.id) === String(imageId) && item.size === oldSize)
          )
          .map((item) =>
            String(item.id) === String(imageId) && item.size === newSize
              ? {
                  ...item,
                  quantity: item.quantity + currentItem.quantity,
                  price: variant.price ?? item.price,
                  url: variant.url ?? item.url,
                }
              : item
          );
      }

      return prev.map((item) =>
        String(item.id) === String(imageId) && item.size === oldSize
          ? {
              ...item,
              size: newSize,
              price: variant.price ?? item.price,
              url: variant.url ?? item.url,
            }
          : item
      );
    });
  }

  function clearCartNow() {
    setCart([]);
    setIsCartOpen(false);

    showToast(
      "Cart cleared",
      "All items were removed from your cart.",
      "success"
    );
  }

  function clearCart() {
    if (cart.length === 0) return;

    openConfirm({
      title: "Clear cart?",
      message: "Do you really want to remove all items from your cart?",
      confirmText: "Clear cart",
      variant: "danger",
      action: clearCartNow,
    });
  }

  // Adds or removes an image from favorites.
  async function toggleFavorite(imageId) {
    const image = images.find((img) => img.id === imageId);
    const isFavorite = isImageFavorite(imageId);

    try {
      const response = await fetch(`${API_URL}/favorites/${imageId}`, {
        method: isFavorite ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Favorite update failed");
      }

      setFavorites((prev) =>
        isFavorite ? prev.filter((id) => id !== imageId) : [...prev, imageId]
      );

      if (image) {
        showToast(
          isFavorite ? "Removed from favorites" : "Added to favorites",
          `"${image.title}" ${
            isFavorite ? "was removed from" : "was added to"
          } favorites.`,
          isFavorite ? "warning" : "success"
        );
      }
    } catch (error) {
      console.error(error);
      showToast(
        "Favorite update failed",
        "Could not update favorites.",
        "error"
      );
    }
  }

  // Adds all purchasable favorite images to the cart.
  function buyAllFavorites(size = "m") {
    const purchasableFavorites = favoriteImages.filter((image) => image.inShop);

    if (purchasableFavorites.length === 0) {
      showToast(
        "No shop favorites",
        "None of your favorites are currently available in the shop.",
        "warning"
      );
      return;
    }

    openConfirm({
      title: `Add ${purchasableFavorites.length} shop favorites to cart?`,
      message: `Only ${purchasableFavorites.length} of ${favoriteImages.length} favorite image(s) are available in the shop.`,
      confirmText: `Add as ${size.toUpperCase()}`,
      variant: "warning",
      action: () => {
        purchasableFavorites.forEach((image) => {
          const hasVariants =
            image.variants && typeof image.variants === "object";

          const selectedSize = hasVariants
            ? image.variants[size]
              ? size
              : Object.keys(image.variants)[0]
            : "default";

          addToCartSilently(image, selectedSize);
        });

        setIsCartOpen(true);

        showToast(
          "Favorites added",
          `${purchasableFavorites.length} of ${
            favoriteImages.length
          } favorite image(s) were available in the shop and added to your cart as ${size.toUpperCase()}.`,
          "success"
        );
      },
    });
  }

  // =======================================================
  // CONFIRM MODAL HELPERS
  // =======================================================
  function openConfirm({
    title,
    message,
    confirmText = "Confirm",
    variant = "default",
    action,
  }) {
    setConfirmState({
      isOpen: true,
      title,
      message,
      confirmText,
      variant,
      action,
    });
  }

  function closeConfirm() {
    setConfirmState({
      isOpen: false,
      title: "",
      message: "",
      confirmText: "Confirm",
      variant: "default",
      action: null,
    });
  }

  function handleConfirm() {
    if (typeof confirmState.action === "function") {
      confirmState.action();
    }
    closeConfirm();
  }

  function confirmDeleteImage(id) {
    openConfirm({
      title: "Delete image?",
      message:
        "This will remove the image from your collection, featured, cart, and favorites.",
      confirmText: "Delete",
      variant: "danger",
      action: () => deleteImage(id),
    });
  }

  function confirmDeleteSelectedImages(imageIds) {
    if (!imageIds.length) return;

    openConfirm({
      title: "Delete selected images?",
      message: `This will permanently remove ${imageIds.length} selected image(s) from your collection, cart, favorites, and featured items.`,
      confirmText: "Delete selected",
      variant: "danger",
      action: async () => {
        for (const id of imageIds) {
          await deleteImage(id);
        }

        showToast(
          "Images deleted",
          `${imageIds.length} image(s) removed.`,
          "success"
        );
      },
    });
  }

  function confirmToggleFavorite(imageId) {
    const isFavorite = isImageFavorite(imageId);

    if (!isFavorite) {
      toggleFavorite(imageId);
      return;
    }

    const image = images.find((img) => img.id === imageId);

    openConfirm({
      title: "Remove favorite?",
      message: `Do you want to remove "${
        image?.title || "this image"
      }" from favorites?`,
      confirmText: "Remove",
      variant: "danger",
      action: () => toggleFavorite(imageId),
    });
  }

  // =======================================================
  // IMAGE MODAL NAVIGATION
  // =======================================================
  function showPreviousImage() {
    if (!selectedImage || modalImages.length === 0) return;

    const currentIndex = modalImages.findIndex(
      (img) => img.id === selectedImage.id
    );
    if (currentIndex === -1) return;

    const previousIndex =
      currentIndex === 0 ? modalImages.length - 1 : currentIndex - 1;

    const previousImage = modalImages[previousIndex];
    setSelectedImage(previousImage);

    const params = new URLSearchParams(location.search);
    params.set("image", previousImage.id);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }

  function showNextImage() {
    if (!selectedImage || modalImages.length === 0) return;

    const currentIndex = modalImages.findIndex(
      (img) => img.id === selectedImage.id
    );
    if (currentIndex === -1) return;

    const nextIndex =
      currentIndex === modalImages.length - 1 ? 0 : currentIndex + 1;

    const nextImage = modalImages[nextIndex];
    setSelectedImage(nextImage);

    const params = new URLSearchParams(location.search);
    params.set("image", nextImage.id);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }

  function selectModalImage(image) {
    if (!image) return;

    setSelectedImage(image);

    const params = new URLSearchParams(location.search);
    params.set("image", image.id);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }

  const blockingError = images.length === 0 ? error : null;
  const blockingLoading = loading && images.length === 0;

  // Returns true if the image exists in favorites.
  function isImageFavorite(imageId) {
    return favorites.some((favId) => String(favId) === String(imageId));
  }

  // =======================================================
  // RENDER
  // =======================================================
  return (
    <>
      <Layout
        page={page}
        isAdmin={!!adminToken}
        onLogoutAdmin={logoutAdmin}
        theme={theme}
        onToggleTheme={toggleTheme}
        showBadge={page !== "home"}
        showThemeToggle={page === "home"}
        favoritesCount={favoriteImages.length}
        totalCartItems={totalCartItems}
        cartTotal={cartTotal}
        showHeader={showHeader}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* ===================================================
            APPLICATION ROUTES
            =================================================== */}
            <Routes location={location}>
              <Route
                path="/"
                element={
                  <Home
                    images={images}
                    loading={blockingLoading}
                    error={blockingError}
                    featuredImages={featuredImages}
                    theme={theme}
                    onNavigateToGallery={() => navigate("/gallery")}
                    onNavigateToShop={() => navigate("/shop")}
                    onNavigateToFeatured={() => navigate("/featured")}
                    onNavigateToFavorites={() => navigate("/favorites")}
                    onNavigateToManage={() => navigate("/manager")}
                    onNavigateToAbout={() => navigate("/about")}
                    onNavigateToContact={() => navigate("/contact")}
                    setShowHeader={setShowHeader}
                    onImageClick={(
                      image,
                      imageList = images,
                      context = "Home"
                    ) => openImageModal(image, imageList, context)}
                  />
                }
              />

              <Route
                path="/gallery"
                element={
                  <Gallery
                    images={filteredImages}
                    loading={blockingLoading}
                    error={blockingError}
                    showPrice={false}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    categories={categories}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    totalResults={filteredImages.length}
                    onImageClick={(image) =>
                      openImageRoute(
                        image,
                        filteredImages,
                        "Gallery",
                        "/gallery"
                      )
                    }
                    favorites={favorites}
                    onToggleFavorite={confirmToggleFavorite}
                    showFavoritesOnly={showFavoritesOnly}
                    onToggleFavoritesOnly={() =>
                      setShowFavoritesOnly((prev) => !prev)
                    }
                    onResetGalleryFilters={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setShowFavoritesOnly(false);
                    }}
                    theme={theme}
                  />
                }
              />

              <Route
                path="/shop"
                element={
                  <Shop
                    images={shopImages}
                    cart={cart}
                    cartTotal={cartTotal}
                    currencySymbol={currencySymbol}
                    clearCart={clearCart}
                    onOpenCart={() => setIsCartOpen(true)}
                    onAddToCart={addToCart}
                    favorites={favorites}
                    onToggleFavorite={confirmToggleFavorite}
                    onImageClick={(image) =>
                      openImageRoute(image, shopImages, "Shop", "/shop")
                    }
                    theme={theme}
                  />
                }
              />

              <Route
                path="/featured"
                element={
                  <Featured
                    images={featuredImages}
                    favorites={favorites}
                    onToggleFavorite={confirmToggleFavorite}
                    onImageClick={(image) =>
                      openImageRoute(
                        image,
                        featuredImages,
                        "Featured",
                        "/featured"
                      )
                    }
                    theme={theme}
                  />
                }
              />

              <Route
                path="/favorites"
                element={
                  <Favorites
                    images={favoriteImages}
                    favorites={favorites}
                    onToggleFavorite={confirmToggleFavorite}
                    onImageClick={(image) =>
                      openImageRoute(
                        image,
                        favoriteImages,
                        "Favorites",
                        "/favorites"
                      )
                    }
                    onAddToCart={addToCart}
                    onBuyAllFavorites={buyAllFavorites}
                    theme={theme}
                  />
                }
              />

              <Route path="/about" element={<About theme={theme} />} />

              <Route
                path="/contact"
                element={<Contact theme={theme} showToast={showToast} />}
              />
              <Route
                path="/manager"
                element={
                  adminToken ? (
                    <Manager
                      images={images}
                      loading={blockingLoading}
                      error={blockingError}
                      onAddImage={addImageToBackend}
                      onDeleteImage={confirmDeleteImage}
                      onDeleteSelectedImages={confirmDeleteSelectedImages}
                      onUpdateImage={updateImageInBackend}
                      onReorderGallery={reorderGalleryInBackend}
                      onImageClick={(
                        image,
                        imageList = images,
                        context = "Manager"
                      ) => openImageModal(image, imageList, context)}
                      showToast={showToast}
                      theme={theme}
                      adminToken={adminToken}
                    />
                  ) : (
                    <AdminLogin onLogin={loginAdmin} theme={theme} />
                  )
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>

        {/* ===================================================
    GLOBAL OVERLAY COMPONENTS
=================================================== */}
        <ImageModal
          image={selectedImage}
          images={modalImages}
          context={modalContext}
          onClose={closeImageModal}
          onPrevious={showPreviousImage}
          onNext={showNextImage}
          onSelectImage={selectModalImage}
          favorites={favorites}
          onToggleFavorite={confirmToggleFavorite}
          onToggleGallery={async (imageId, nextGalleryValue) => {
            await updateImageInBackend(imageId, { gallery: nextGalleryValue });
          }}
          onUpdateImage={updateImageInBackend}
          categories={categories}
          showToast={showToast}
          theme={theme}
        />

        <CartDrawer
          isOpen={isCartOpen}
          cart={cart}
          cartTotal={cartTotal}
          currencySymbol={currencySymbol}
          onClose={() => setIsCartOpen(false)}
          onIncreaseItem={increaseCartItem}
          onDecreaseItem={decreaseCartItem}
          clearCart={clearCart}
          showToast={showToast}
          onUpdateItemSize={updateCartItemSize}
          theme={theme}
        />

        <ConfirmModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText="Cancel"
          variant={confirmState.variant}
          onConfirm={handleConfirm}
          onCancel={closeConfirm}
          theme={theme}
        />
      </Layout>

      <Toast toast={toast} onClose={closeToast} theme={theme} />
    </>
  );
}

// Root application wrapper with router setup.
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
