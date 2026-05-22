require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const crypto = require("crypto");

// Creates the Express backend app.
const app = express();

// Backend port.
const PORT = process.env.PORT || 4000;

// Admin secret used to protect upload/edit/delete routes.
const jwt = require("jsonwebtoken");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-this-password";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

// Compression quality for generated WebP images.
const WEBP_QUALITY = 80;

// Image variants generated for every uploaded image.
// Each variant has a different width and default price.
const IMAGE_VARIANTS = {
  s: { width: 600, price: 15 },
  m: { width: 1200, price: 25 },
  l: { width: 2000, price: 40 },
};

// Middleware.
app.use(cors());
app.use(express.json());

// Makes uploaded images publicly available.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/admin/login", (req, res) => {
  console.log("LOGIN BODY:", req.body);
  console.log("ADMIN_PASSWORD EXISTS:", Boolean(process.env.ADMIN_PASSWORD));
  console.log("ADMIN_PASSWORD LENGTH:", process.env.ADMIN_PASSWORD?.length);
  console.log("ENTERED PASSWORD LENGTH:", req.body?.password?.length);

  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid admin password" });
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, {
    expiresIn: "2h",
  });

  res.json({ token });
});

// File and folder paths used by the backend.
const uploadDir = path.join(__dirname, "uploads");
const dataFile = path.join(__dirname, "images.json");
const favoritesFile = path.join(__dirname, "favorites.json");
const featuredFile = path.join(__dirname, "featured.json");
const cartFile = path.join(__dirname, "cart.json");

// =====================================================
// AUTH
// =====================================================

// Protects admin-only routes.
// The frontend must send the correct x-admin-secret header.
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Admin login required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin session" });
  }
}

// =====================================================
// FILE HELPERS
// =====================================================

// Safely reads a JSON file.
// Returns fallback data if the file does not exist or cannot be parsed.
function readJsonFile(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;

    const raw = fs.readFileSync(filePath, "utf8");

    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return fallback;
  }
}

// Safely writes data to a JSON file.
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Creates a SHA-256 hash from a file.
// Used to detect duplicate image uploads.
function createFileHash(filePath) {
  const buffer = fs.readFileSync(filePath);

  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// Image database helpers.
function readImages() {
  return readJsonFile(dataFile, []);
}

function writeImages(images) {
  writeJsonFile(dataFile, images);
}

// Favorites database helpers.
function readFavorites() {
  return readJsonFile(favoritesFile, []);
}

function writeFavorites(favorites) {
  writeJsonFile(favoritesFile, favorites);
}

// Featured database helpers.
// Currently kept for compatibility.
function readFeatured() {
  return readJsonFile(featuredFile, [1, 2, 3, 4, 5]);
}

function writeFeatured(data) {
  writeJsonFile(featuredFile, data);
}

// Cart database helpers.
// Currently available if cart persistence is needed server-side.
function readCart() {
  return readJsonFile(cartFile, []);
}

function writeCart(data) {
  writeJsonFile(cartFile, data);
}

// =====================================================
// UPLOAD CONFIGURATION
// =====================================================

// Multer storage setup.
// Uploaded files are temporarily stored in /uploads before processing.
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),

  filename: (_, file, cb) => {
    // Clean original file name to make it filesystem-safe.
    const baseName = path.parse(file.originalname).name;
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const ext = path.extname(file.originalname) || ".jpg";

    // Add a unique ID to avoid filename collisions.
    const uniqueName = `${crypto.randomUUID()}-${safeBaseName}${ext}`;

    cb(null, uniqueName);
  },
});

// Multer upload middleware.
const upload = multer({ storage });

// Generates S, M, and L WebP variants for an uploaded image.
// The original uploaded file is removed after variants are created.
async function generateImageVariants(filePath) {
  const parsed = path.parse(filePath);
  const baseOutputPath = path.join(parsed.dir, parsed.name);

  // autoOrient respects camera/phone rotation metadata.
  const input = sharp(filePath).autoOrient();

  const variants = {};

  await Promise.all(
    Object.entries(IMAGE_VARIANTS).map(async ([sizeKey, config]) => {
      const outputPath = `${baseOutputPath}-${sizeKey}.webp`;

      await input
        .clone()
        .resize({
          width: config.width,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: WEBP_QUALITY,
        })
        .toFile(outputPath);

      variants[sizeKey] = {
        file: path.basename(outputPath),
        url: `http://localhost:${PORT}/uploads/${path.basename(outputPath)}`,
        price: config.price,
      };
    })
  );

  // Remove original uploaded file after variants are generated.
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return variants;
}

// =====================================================
// ROUTES: READ DATA
// =====================================================

// Returns all images.
app.get("/images", (req, res) => {
  res.json(readImages());
});

// Returns favorite image IDs.
app.get("/favorites", (req, res) => {
  res.json(readFavorites());
});

// =====================================================
// ROUTES: FAVORITES
// =====================================================

// Adds an image ID to favorites.
app.post("/favorites/:id", (req, res) => {
  const id = req.params.id;
  const favorites = readFavorites();

  if (!favorites.includes(id)) {
    favorites.push(id);
    writeFavorites(favorites);
  }

  res.json(favorites);
});

// Removes an image ID from favorites.
app.delete("/favorites/:id", (req, res) => {
  const id = req.params.id;
  const favorites = readFavorites().filter((favId) => favId !== id);

  writeFavorites(favorites);

  res.json(favorites);
});

// =====================================================
// ROUTES: UPLOAD IMAGE
// =====================================================

// Uploads a new image.
// Admin-only route.
// Generates variants, prevents duplicates, and saves metadata.
app.post("/images", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const images = readImages();

    // Read original image metadata.
    const metadata = await sharp(req.file.path).metadata();

    const originalFilename = req.file.originalname;
    const originalTitle = path.parse(originalFilename).name;

    // Hash file before processing to detect exact duplicates.
    const fileHash = createFileHash(req.file.path);

    const duplicateImage = images.find((img) => img.fileHash === fileHash);

    // Stop upload if the exact same image already exists.
    if (duplicateImage) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(409).json({
        error: "Duplicate image",
        message: "This image already exists in the gallery.",
        duplicate: {
          id: duplicateImage.id,
          title: duplicateImage.title,
          originalFilename: duplicateImage.originalFilename,
        },
      });
    }

    // Generate S/M/L image variants.
    const variants = await generateImageVariants(req.file.path);

    // New image object stored in images.json.
    const newImage = {
      id: crypto.randomUUID(),

      title: req.body.title || originalTitle,
      originalTitle,
      originalFilename,

      uploadedAt: new Date().toISOString(),

      width: metadata.width,
      height: metadata.height,

      fileHash,

      category: req.body.category || "uploaded",

      gallery: req.body.gallery === "true",
      galleryOrder: null,
      featured: req.body.featured === "true",
      hero: req.body.hero === "true",
      inShop: req.body.inShop === "true",
      intro: req.body.intro === "true",

      // Medium variant is used as default display image.
      file: variants.m.file,
      url: variants.m.url,

      variants,
    };

    images.push(newImage);
    writeImages(images);

    res.status(201).json(newImage);
  } catch (error) {
    console.error("Image upload/variant generation failed:", error);

    // Clean up temporary uploaded file if processing fails.
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: "Image processing failed" });
  }
});

// =====================================================
// ROUTES: UPDATE IMAGE
// =====================================================

// Updates image metadata.
// Admin-only route.
app.put("/images/:id", requireAdmin, (req, res) => {
  const id = req.params.id;
  const images = readImages();

  const imageIndex = images.findIndex((img) => String(img.id) === String(id));

  if (imageIndex === -1) {
    return res.status(404).json({ error: "Image not found" });
  }

  const currentImage = images[imageIndex];

  // Converts string/boolean values into real booleans.
  function parseBoolean(value, fallback) {
    if (value === undefined) return fallback;
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;

    return fallback;
  }

  // Base image updates.
  const updatedImage = {
    ...currentImage,
    title: req.body.title ?? currentImage.title,
    category: req.body.category ?? currentImage.category,

    gallery:
      typeof req.body.gallery === "boolean"
        ? req.body.gallery
        : currentImage.gallery ?? false,

    galleryOrder:
      req.body.galleryOrder !== undefined
        ? Number(req.body.galleryOrder)
        : currentImage.galleryOrder ?? null,

    intro: parseBoolean(req.body.intro, currentImage.intro),
    featured: parseBoolean(req.body.featured, currentImage.featured),
    hero: parseBoolean(req.body.hero, currentImage.hero),
    inShop: parseBoolean(req.body.inShop, currentImage.inShop),
  };

  // Legacy single price support.
  if (req.body.price !== undefined) {
    updatedImage.price = Number(req.body.price);
  }

  // Variant price support.
  // Keeps existing variant data and only overwrites provided fields.
  if (req.body.variants && typeof req.body.variants === "object") {
    updatedImage.variants = {
      ...currentImage.variants,

      s: req.body.variants.s
        ? {
            ...currentImage.variants?.s,
            ...req.body.variants.s,
            price:
              req.body.variants.s.price !== undefined
                ? Number(req.body.variants.s.price)
                : currentImage.variants?.s?.price,
          }
        : currentImage.variants?.s,

      m: req.body.variants.m
        ? {
            ...currentImage.variants?.m,
            ...req.body.variants.m,
            price:
              req.body.variants.m.price !== undefined
                ? Number(req.body.variants.m.price)
                : currentImage.variants?.m?.price,
          }
        : currentImage.variants?.m,

      l: req.body.variants.l
        ? {
            ...currentImage.variants?.l,
            ...req.body.variants.l,
            price:
              req.body.variants.l.price !== undefined
                ? Number(req.body.variants.l.price)
                : currentImage.variants?.l?.price,
          }
        : currentImage.variants?.l,
    };
  }

  images[imageIndex] = updatedImage;
  writeImages(images);

  res.json(updatedImage);
});

// =====================================================
// ROUTES: REORDER GALLERY
// =====================================================

// Updates galleryOrder based on an ordered list of image IDs.
// Admin-only route.
app.put("/images/reorder/gallery", requireAdmin, (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: "orderedIds must be an array" });
  }

  const images = readImages();

  // Maps each image ID to its new order index.
  const orderMap = new Map(orderedIds.map((id, index) => [String(id), index]));

  const updatedImages = images.map((img) => {
    if (!orderMap.has(img.id)) {
      return img;
    }

    return {
      ...img,
      galleryOrder: orderMap.get(img.id),
    };
  });

  writeImages(updatedImages);

  res.json(updatedImages);
});

// =====================================================
// ROUTES: DELETE IMAGE
// =====================================================

// Deletes image metadata and removes all related uploaded files.
// Admin-only route.
app.delete("/images/:id", requireAdmin, (req, res) => {
  const id = req.params.id;
  const images = readImages();

  const imageToDelete = images.find((img) => String(img.id) === String(id));

  if (!imageToDelete) {
    return res.status(404).json({ error: "Image not found" });
  }

  // Remove image from images.json.
  const updatedImages = images.filter((img) => String(img.id) !== String(id));
  writeImages(updatedImages);

  // Collect all files belonging to this image.
  const filesToDelete = new Set();

  if (imageToDelete.file) {
    filesToDelete.add(imageToDelete.file);
  }

  if (imageToDelete.variants) {
    Object.values(imageToDelete.variants).forEach((variant) => {
      if (variant?.file) {
        filesToDelete.add(variant.file);
      }
    });
  }

  // Delete image files from uploads folder.
  for (const fileName of filesToDelete) {
    const filePath = path.join(uploadDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  res.json({ success: true });
});

// =====================================================
// START SERVER
// =====================================================

// Starts the backend server.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
