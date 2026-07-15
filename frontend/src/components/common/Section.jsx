import { useScrollFadeIn } from "../../hooks/useScrollFadeIn";

function Section({ children }) {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"   // scroll down → visible
          : "opacity-0 translate-y-10 scale-95"    // scroll up → fade out + slide down + scale down
      }`}
    >
      {children}
    </div>
  );
}

export default Section;
