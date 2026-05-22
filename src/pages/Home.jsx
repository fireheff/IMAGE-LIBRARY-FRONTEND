import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImageCard from "../components/ImageCard";
import Spinner from "../components/Spinner";
import { fixLocalhost } from "../utils/api"; // AI help
import { motion } from "framer-motion";
import { getButtonClasses } from "../styles/buttonClasses";

function ScrollingBanner({ title }) {
  const items = Array.from({ length: 6 });

  return (
    <div className="relative m-4 w-full max-w-full overflow-hidden py-3 md:mb-6 md:py-6">
      <div className="marquee-track flex w-max whitespace-nowrap">
        <div className="flex shrink-0 gap-16 pr-16 sm:gap-24 sm:pr-24 md:gap-32 md:pr-32 lg:gap-40 lg:pr-40">
          {items.map((_, index) => (
            <span
              key={`a-${index}`}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light uppercase tracking-[0.35em] opacity-15"
            >
              {title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home({
  images = [],
  loading,
  error,
  featuredImages = [],
  onNavigateToGallery,
  onNavigateToShop,
  onNavigateToFavorites,
  onNavigateToFeatured,
  onNavigateToAbout,
  onNavigateToContact,
  onImageClick,
  theme = "light",
  setShowHeader,
}) {
  // Controls the visibility of the global header on the Home page.
  // The header is hidden at the top of the page and shown again after scrolling.

  useEffect(() => {
    // hide header initially
    setShowHeader(false);

    const handleScroll = () => {
      if (window.scrollY > 900) {
        setShowHeader(true);
      } else {
        setShowHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      setShowHeader(true); // restore when leaving page
    };
  }, [setShowHeader]);

  // Returns the best available image URL for hero display.
  // Large variant is preferred.

  const getHeroImageUrl = (img) => {
    if (!img) return "";

    return fixLocalhost(
      img.variants?.l?.url ||
        img.variants?.m?.url ||
        img.variants?.s?.url ||
        img.url ||
        img.src ||
        img.image ||
        ""
    );
  };

  // Selects the images used in the hero slider.
  // Images marked as "hero" are preferred.

  const buttons = getButtonClasses(theme);

  const heroImages = useMemo(() => {
    const heroes = images.filter((img) => img.hero && getHeroImageUrl(img));
    const source = heroes.length > 0 ? heroes : images;

    return [...source]
      .filter((img) => getHeroImageUrl(img))
      .sort((a, b) => {
        const orderA = a.galleryOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.galleryOrder ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
  }, [images]);

  // Chooses the background image for the intro section.
  // Priority: intro image, hero image, then first available image.

  const introHeroImage = useMemo(() => {
    const withUrl = images.filter((img) => getHeroImageUrl(img));

    return (
      withUrl.find((img) => img.intro) ||
      withUrl.find((img) => img.hero) ||
      withUrl[0] ||
      null
    );
  }, [images]);

  // Gets the most 8 recently uploaded images for the "Latest Images" section.

  const latestImages = useMemo(() => {
    return [...images]
      .filter((img) => img.url)
      .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
      .slice(0, 8);
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [scrollY, setScrollY] = useState(0);

  const transitionTimeoutRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  // Preloads hero slider images before transitions.
  // This avoids showing blank images during the fade animation.

  useEffect(() => {
    if (!heroImages.length) return;

    let isMounted = true;

    heroImages.forEach((img) => {
      const imageUrl = getHeroImageUrl(img);

      if (!imageUrl || loadedImages[imageUrl]) return;

      const preload = new Image();
      preload.src = imageUrl;
      preload.onload = () => {
        if (isMounted) {
          setLoadedImages((prev) => ({ ...prev, [imageUrl]: true }));
        }
      };
    });

    return () => {
      isMounted = false;
    };
  }, [heroImages, loadedImages]);

  // Resets the slider index if the available hero images change.

  useEffect(() => {
    if (!heroImages.length || activeIndex >= heroImages.length) {
      const frameId = requestAnimationFrame(() => {
        setActiveIndex(0);
        setIncomingIndex(null);
        setIsTransitioning(false);
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [heroImages.length, activeIndex]);

  // Clears pending transition timers when the component unmounts. AI help

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Tracks scroll position to create the parallax effect on the intro section. AI help

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Starts a controlled transition between hero images.
  // The next image is only shown if it has already been loaded.

  const startTransition = useCallback(
    (nextIndex) => {
      if (
        heroImages.length <= 1 ||
        nextIndex === activeIndex ||
        isTransitioning
      ) {
        return;
      }

      const nextImage = heroImages[nextIndex];
      const nextImageUrl = getHeroImageUrl(nextImage);

      if (!nextImageUrl || !loadedImages[nextImageUrl]) return;

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      setIncomingIndex(nextIndex);
      setIsTransitioning(true);

      transitionTimeoutRef.current = setTimeout(() => {
        setActiveIndex(nextIndex);
        setIncomingIndex(null);
        setIsTransitioning(false);
      }, 500);
    },
    [heroImages, activeIndex, isTransitioning, loadedImages]
  );

  const goToNext = () => {
    if (!heroImages.length) return;
    startTransition((activeIndex + 1) % heroImages.length);
  };

  const goToPrevious = () => {
    if (!heroImages.length) return;
    startTransition((activeIndex - 1 + heroImages.length) % heroImages.length);
  };

  // Automatically advances the hero slider.
  // The slider pauses on hover, touch interaction, or during transitions.

  useEffect(() => {
    if (heroImages.length <= 1 || isPaused || isTransitioning) return;

    const interval = setInterval(() => {
      startTransition((activeIndex + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [
    heroImages,
    activeIndex,
    isPaused,
    isTransitioning,
    loadedImages,
    startTransition,
  ]);

  const currentImage = heroImages[activeIndex] || null;
  const incomingImage =
    incomingIndex !== null ? heroImages[incomingIndex] : null;

  const currentImageUrl = getHeroImageUrl(currentImage);
  const incomingImageUrl = getHeroImageUrl(incomingImage);
  const introHeroImageUrl = getHeroImageUrl(introHeroImage);

  //Design Helpers for buttons // AI design

  const textMutedClass =
    theme === "light" ? "text-slate-600" : "text-slate-300";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <Spinner loading={loading} />
        <p className="mt-4">Loading gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black text-center px-6">
        {error}
      </div>
    );
  }

  return (
    <main>
      <section className="relative min-h-screen overflow-hidden bg-black">
        <div
          className="absolute inset-x-0 -top-32 -bottom-32 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: introHeroImageUrl
              ? `url(${introHeroImageUrl})`
              : "none",
            transform: `translateY(${-scrollY * 0.12}px)`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `
      linear-gradient(to right,
        rgba(0,0,0,0.8) 0%,
        transparent 20%,
        transparent 80%,
        rgba(0,0,0,0.8) 100%
      ),
      linear-gradient(to bottom,
        rgba(0,0,0,0.8) 0%,
        transparent 20%,
        transparent 80%,
        rgba(0,0,0,0.8) 100%
      )
    `,
          }}
        />

        <div
          className="relative z-10 flex min-h-screen items-center justify-center px-6 text-center text-white"
          style={{
            opacity: Math.max(1 - scrollY / 1000, 0),
            transform: `translateY(${-scrollY * 0.08}px) scale(${
              1 + scrollY * 0.0001
            })`,
          }}
        >
          <div className="mx-auto max-w-6xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-20 text-sm uppercase tracking-[0.35em]"
            >
              Renée Fiedler Photography
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 0.95, delay: 0.08, ease: "easeOut" }}
              className="overline mb-20 mt-4 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
            >
              Creative Image Library
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.95, delay: 0.16, ease: "easeOut" }}
              className="mx-auto mt-6 max-w-2xl text-base md:text-xl"
            >
              Discover curated photography and digital art in a calm, immersive
              visual experience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: "easeOut" }}
              className="mt-8"
            >
              <button
                onClick={() => {
                  document.getElementById("slider-section")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className={`rounded-2xl px-6 py-3 font-medium transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] ${buttons.primary}`}
              >
                Discover more
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="slider-section"
        className="relative flex min-h-screen items-center overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(e) => {
          touchStartXRef.current = e.touches[0].clientX;
          touchEndXRef.current = e.touches[0].clientX;
        }}
        onTouchMove={(e) => {
          touchEndXRef.current = e.touches[0].clientX;
        }}
        onTouchEnd={() => {
          const distance = touchStartXRef.current - touchEndXRef.current;
          if (Math.abs(distance) < 50) return;
          if (distance > 0) goToNext();
          else goToPrevious();
        }}
      >
        {currentImage && (
          <img
            key={currentImage.id}
            src={fixLocalhost(currentImageUrl)}
            alt={currentImage.title}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
            draggable={false}
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/1200x800?text=Image+not+found";
            }}
          />
        )}

        {incomingImage && (
          <img
            src={fixLocalhost(incomingImageUrl)}
            alt={incomingImage.title}
            loading="eager"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              isTransitioning ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/1200x800?text=Image+not+found";
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/0" />

        {heroImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous hero image"
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 px-4 py-2 text-white transition duration-600 hover:bg-black/45 hover:scale-[1.03]"
            >
              ←
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Next hero image"
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 px-4 py-2 text-white transition hover:bg-black/60"
            >
              →
            </button>
          </>
        )}

        <div className="relative mb-20 z-20 max-w-4xl px-10 py-10 text-white">
          <p className="text-sm uppercase tracking-[0.25em] opacity-80">
            Digital Art Platform
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
            Discover and collect beautiful images
          </h1>

          <p className="mt-5 mb-20 text-xl opacity-90">
            Explore my gallery and shop your favorites images — all in one
            place.
          </p>

          <div className="mt-40 flex flex-wrap gap-4">
            <button
              onClick={onNavigateToGallery}
              className={`rounded-2xl px-6 py-3 font-medium transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] ${buttons.primary}`}
            >
              Explore Gallery
            </button>

            <button
              onClick={onNavigateToShop}
              className={`rounded-2xl px-6 py-3 font-medium bg-slate-100 ${buttons.primary}`}
            >
              Visit Shop
            </button>
          </div>
        </div>

        {heroImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {heroImages.map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => startTransition(index)}
                aria-label={`Show hero image ${index + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === activeIndex
                    ? "scale-110 bg-white"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </section>

      <div className="space-y-8 sm:space-y-12 md:space-y-20">
        {featuredImages.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`space-y-6 border p-6 ${
              theme === "light"
                ? "bg-emerald-50 border-emerald-50"
                : "bg-slate-700/50 border-slate-700/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="mt-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                <ScrollingBanner title="Featured Images" />
              </div>
            </div>
            <div className="flex justify-center">
              <p className={`mt-1 text-2xl opacity-60 ${textMutedClass}`}>
                A curated selection from my library.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onNavigateToFeatured}
                className={`text-sm font-medium underline ${
                  theme === "light" ? "text-slate-700" : "text-slate-300"
                }`}
              >
                View all
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredImages.slice(0, 8).map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onClick={() =>
                    onImageClick(
                      image,
                      featuredImages.slice(0, 8),
                      "Featured Images"
                    )
                  }
                  theme={theme}
                  showPrice={false}
                  showFeaturedBadge={true}
                  showHeroBadge={false}
                  showGalleryBadge={false}
                />
              ))}
            </div>
          </motion.section>

          // Reusable navigation cards used for Home page shortcuts.
        )}
        <section className="mx-3 my-6 sm:mx-6 sm:my-8 md:mx-10 md:my-10">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
            <FeatureCard
              title="Gallery"
              description="Browse, explore, filter and set favorites of all images in one place."
              onClick={onNavigateToGallery}
              theme={theme}
            />

            <FeatureCard
              title="Webshop"
              description="Add images to your cart and manage purchases."
              onClick={onNavigateToShop}
              theme={theme}
            />

            <FeatureCard
              title="Favorites"
              description="Show my favorite images and purchase them with one click."
              onClick={onNavigateToFavorites}
              theme={theme}
            />
          </div>
        </section>

        {latestImages.length > 0 && (
          <section
            className={`border p-3 sm:p-4 md:p-6 ${
              theme === "light"
                ? "bg-purple-100 border-purple-100"
                : "bg-slate-900 border-slate-900/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="mt-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                <ScrollingBanner title="Latest Images" />
              </div>
            </div>

            <div className="flex justify-center">
              <p
                className={`my-4 text-lg sm:my-6 sm:text-2xl opacity-60 ${textMutedClass}`}
              >
                Recently added to the library.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {latestImages.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onClick={() =>
                    onImageClick(image, latestImages, "Latest Images")
                  }
                  theme={theme}
                  showPrice={false}
                  showFeaturedBadge={false}
                  showHeroBadge={false}
                  showGalleryBadge={false}
                  showFavoriteButton={false}
                />
              ))}
            </div>
          </section>
        )}
        <section className="mx-3 my-6 sm:mx-6 sm:my-8 md:mx-10 md:my-10">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-2 sm:gap-8">
            <FeatureCard
              title="About"
              onClick={onNavigateToAbout}
              theme={theme}
            />

            <FeatureCard
              title="Contact"
              onClick={onNavigateToContact}
              theme={theme}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, onClick, theme }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-3xl border px-5 py-6 sm:px-6 sm:py-7 md:p-8 transition-all duration-500 hover:-translate-y-1 ${
        theme === "light"
          ? "border-slate-200/70 bg-white/30 hover:bg-white/60"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      <p
        className={`w-full text-center text-xl sm:text-2xl md:text-3xl font-light uppercase tracking-[0.18em] sm:tracking-[0.25em] md:tracking-[0.35em] transition ${
          theme === "light"
            ? "text-slate-500/70 group-hover:text-slate-700"
            : "text-white/50 group-hover:text-white/75"
        }`}
      >
        {title}
      </p>

      {description && (
        <p
          className={`mt-3 sm:mt-4 w-full text-center text-xs sm:text-sm leading-5 sm:leading-6 transition ${
            theme === "light" ? "text-slate-500/70" : "text-slate-300/60"
          }`}
        >
          {description}
        </p>
      )}
    </button>
  );
}
