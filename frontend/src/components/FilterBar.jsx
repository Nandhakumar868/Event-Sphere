const FilterBar = ({ onFilterChange }) => {
  return (
    <div className="p-4 border-b">
      <input
        type="text"
        placeholder="Search events..."
        onChange={(e) => onFilterChange(e.target.value)}
        className="border p-2 w-full"
      />
    </div>
  );
};

export default FilterBar;
