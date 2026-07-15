import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../../../hooks/useApi";

// Memoized Category Card component
const CategoryCard = memo(function CategoryCard({ category, index, onExplore, onLearnMore }) {
  return (
    <div
      className={`flex flex-col ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} bg-white overflow-hidden transition-all duration-500 ease-luxury group border-b border-stone-200 pb-6 last:border-b-0 last:pb-0 hover:bg-stone-50/50`}
    >
      {/* Image Section */}
      <div className="md:w-2/5 w-full h-48 sm:h-56 md:h-64 lg:h-80 overflow-hidden rounded-luxury-lg">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-700 ease-luxury group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Details Section */}
      <div className="md:w-3/5 w-full p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center">
        <span className="text-xs uppercase tracking-widest text-amber-600 font-medium mb-2">
          Category
        </span>
        <h3 className="text-2xl md:text-3xl font-serif text-slate-800 mb-4">
          {category.name}
        </h3>

        <p className="text-stone-600 text-base leading-relaxed mb-8">
          {category.description}
        </p>

        {/* Buttons */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => onExplore(category.name)}
            className="text-slate-700 font-medium border-b border-slate-400 pb-1 hover:border-orange-500 hover:text-orange-700 transition-all duration-300"
          >
            Explore
          </button>

          <button
            onClick={() => onLearnMore(category.name)}
            className="bg-slate-800 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-slate-700 hover:shadow-soft-md hover:-translate-y-0.5"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
});

function Categories() {
  const navigate = useNavigate();
  const { data: categories, loading, error } = useCategories();

  const handleExplore = useCallback((categoryName) => {
    navigate(`/explore/${categoryName}`);
  }, [navigate]);

  const handleLearnMore = useCallback((categoryName) => {
    navigate(`/category/${categoryName}`);
  }, [navigate]);

  if (loading) {
    return (
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading categories...</p>
        </div>
      </section>
    );
  }

  if (error || !categories?.length) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
      {/* Section Header */}
      <div className="text-center mb-20">
        <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
          Browse By
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-800 mt-3">
          Wedding Categories
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-6"></div>
      </div>

      {/* Categories List */}
      <div className="max-w-6xl mx-auto flex flex-col gap-4 md:gap-6">
        {categories.map((category, index) => (
          <CategoryCard
            key={category._id}
            category={category}
            index={index}
            onExplore={handleExplore}
            onLearnMore={handleLearnMore}
          />
        ))}
      </div>
    </section>
  );
}

export default memo(Categories);
