import ImageCard from "../components/ImageCard";
import { motion } from "framer-motion";

// Masonry-style gallery layout.
// Uses CSS columns to create a Pinterest-like image flow.

function GalleryMasonryLayout({
  // Images to display in the gallery.
  images,

  // Opens the selected image in the modal.
  onImageClick,

  // Controls whether price information should be shown.
  showPrice,

  // Favorite image IDs.
  favorites,

  // Toggles favorite state for an image.
  onToggleFavorite,
}) {
  return (
    // Responsive masonry columns.
    // Mobile: 1 column, small screens: 2 columns, large screens: 3 columns.
    <div className="columns-1 gap-1 sm:columns-2 lg:columns-3 xl:columns-3">
      {images.map((image, index) => (
        // Wrapper prevents images from breaking between columns.
        <motion.div
          key={image.id}
          className="mb-1 break-inside-avoid"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{
            duration: 0.55,

            // Small stagger based on image position.
            delay: (index % 6) * 0.04,

            ease: "easeOut",
          }}
        >
          <ImageCard
            image={image}
            onClick={() => onImageClick(image)}
            showPrice={showPrice}
            isFavorite={favorites.includes(image.id)}
            onToggleFavorite={() => onToggleFavorite(image.id)}
            showGalleryBadge={false}
            showFeaturedBadge={true}
            showHeroBadge={false}
            showInShopBadge={true}
            showFavoriteButton={true}
            // Allows natural image height for masonry layout.
            naturalImage={true}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default GalleryMasonryLayout;
