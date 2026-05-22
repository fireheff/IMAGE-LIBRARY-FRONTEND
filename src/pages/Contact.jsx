import { useState } from "react";
import { motion } from "framer-motion";
import { getTextClasses } from "../styles/buttonClasses";

// About page.

// Contact page.
// Displays contact text and a simple local contact form with toast feedback.

export default function Contact({ theme = "light", showToast }) {
  // Form state for all contact fields.
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const text = getTextClasses(theme);

  // Shared input styling for all form fields.
  const inputClass =
    theme === "light"
      ? "w-full border-b border-slate-300 bg-transparent px-0 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
      : "w-full border-b border-white/20 bg-transparent px-0 py-3 text-white placeholder:text-slate-500 focus:outline-none";

  // Standard fade-up animation.
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  // Delayed fade-up animation for staggered page entrance.
  const fadeUpDelayed = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.15, ease: "easeOut" },
    },
  };

  // Form is only valid when all fields contain text.
  const isFormValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.message.trim() !== "";

  // Updates the matching form field by input name.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handles local form submission.
  // Currently this does not send to a backend; it only shows toast feedback.
  function handleSubmit(e) {
    e.preventDefault();

    if (!isFormValid) {
      showToast?.(
        "Missing information",
        "Please fill in all fields before sending.",
        "warning"
      );
      return;
    }

    showToast?.(
      "Message sent",
      "Thanks for your message — I’ll get back to you soon.",
      "success"
    );

    // Reset form after successful submit.
    setForm({
      name: "",
      email: "",
      message: "",
    });
  }

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
              Contact
            </p>

            {/* Main heading */}
            <h2
              className={`max-w-md text-4xl font-semibold leading-tight md:text-5xl opacity-60 ${text.title}`}
            >
              A conversation begins here.
            </h2>

            {/* Intro text */}
            <p className={`max-w-md text-base leading-7 ${text.soft}`}>
              For inquiries, collaborations, or simply a shared interest — feel
              free to reach out.
            </p>
          </div>

          {/* Small supporting note */}
          <div className="pt-8 md:pt-12">
            <p className={`max-w-sm text-sm leading-6 ${text.soft}`}>
              Even a few words are enough — I’ll respond as soon as possible.
            </p>
          </div>
        </motion.div>

        {/* Right form column */}
        <motion.div
          className="lg:col-span-7 mt-20"
          variants={fadeUpDelayed}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name field */}
            <div>
              <input
                name="name"
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Email field */}
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Message field */}
            <div>
              <textarea
                name="message"
                rows="5"
                placeholder="Message"
                value={form.message}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                  isFormValid
                    ? theme === "light"
                      ? "bg-slate-900 text-white hover:opacity-90"
                      : "bg-white text-slate-900 hover:opacity-90"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                Send Message
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
