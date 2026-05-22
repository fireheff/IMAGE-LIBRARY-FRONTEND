import { ClipLoader } from "react-spinners";

// Custom inline styles for the spinner container.
// Centers the loader horizontally with vertical spacing.
const override = {
  display: "block",
  margin: "100px auto",
};

// Simple reusable loading spinner component.
// Used while images or pages are loading.

const Spinner = () => {
  return (
    <ClipLoader
      // Spinner color.
      color="#fb2c36"
      // Always active when component is rendered.
      loading={true}
      // Spinner size in pixels.
      size={150}
      // Custom inline styles.
      cssOverride={override}
    />
  );
};

export default Spinner;
