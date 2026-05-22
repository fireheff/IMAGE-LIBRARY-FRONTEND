import { motion } from "framer-motion";
import { getTextClasses } from "../styles/buttonClasses";

// About page.
// Introduces the project concept, photography style, and design philosophy.

export default function About({ theme = "light" }) {
  // Theme-based text colors.

  // Standard fade-up animation.
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  // Slightly delayed fade-up animation for staggered entrance.
  const fadeUpDelayed = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.15, ease: "easeOut" },
    },
  };

  const text = getTextClasses(theme);

  return (
    // Main page wrapper.
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
      {/* Two-column layout on large screens */}
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left text column */}
        <motion.div
          className="lg:col-span-5 flex flex-col justify-between"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="space-y-6 mt-20">
            {/* Small section label */}
            <p className={`text-lg uppercase tracking-[0.58em] ${text.soft}`}>
              About
            </p>

            {/* Main heading */}
            <p
              className={`max-w-md text-4xl font-semibold leading-tight md:text-4xl opacity-60 ${text.title}`}
            >
              A space for light, form, and atmosphere.
            </p>

            {/* Main description text */}
            <p className={`max-w-md text-base leading-8 ${text.soft}`}>
              This project brings together my interest in photography and web
              development. The goal was to create a calm, intuitive space where
              images can be explored without distraction. Each photograph is
              presented with attention to composition, light, and visual
              balance. Beyond the visual aspect, the application also focuses on
              functionality — allowing images to be managed, filtered, and
              organized efficiently through a custom-built interface. The
              project reflects both a creative and technical process, combining
              design, structure, and data management in one application.
            </p>
          </div>
        </motion.div>

        {/* Right image column */}
        <motion.div
          className="lg:col-span-7"
          variants={fadeUpDelayed}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Image container */}
          <div
            className="overflow-hidden border-indigo-900 rounded-4xl
           mt-20"
          >
            {/* About page image */}
            <img
              src="src/assets/ui/poppies.jpg"
              alt="Gallery atmosphere"
              className="h-105 w-full object-cover transition duration-700 hover:scale-[1.08] md:h-140"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
