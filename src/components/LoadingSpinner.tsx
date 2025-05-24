/**
 * LoadingSpinner component that displays a customizable loading animation
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (sm, md, lg, xl)
 * @param {string} props.color - Color of the spinner (any Tailwind color class)
 * @param {string} props.thickness - Border thickness (1-4)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Accessibility label
 * @returns {JSX.Element} LoadingSpinner component
 */
interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    color?: string;
    thickness?: "1" | "2" | "3" | "4";
    className?: string;
    label?: string;
  }
  
  const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "md",
    color = "blue-500",
    thickness = "2",
    className = "",
    label = "Loading..."
  }) => {
    // Size mapping
    const sizeMap: Record<"sm" | "md" | "lg" | "xl", string> = {
      sm: "h-6 w-6",
      md: "h-12 w-12",
      lg: "h-16 w-16",
      xl: "h-24 w-24"
    };
  
    // Border thickness mapping
    const borderMap: Record<"1" | "2" | "3" | "4", string> = {
      "1": "border-t-1 border-b-1",
      "2": "border-t-2 border-b-2",
      "3": "border-t-3 border-b-3",
      "4": "border-t-4 border-b-4"
    };
  
    const spinnerSize = sizeMap[size];
    const borderThickness = borderMap[thickness];
  
    return (
      <div className={`flex justify-center items-center ${className}`} role="status">
        <div 
          className={`animate-spin rounded-full ${spinnerSize} ${borderThickness} border-${color}`}
          aria-hidden="true"
        ></div>
        {label && (
          <span className="sr-only">{label}</span>
        )}
      </div>
    );
  };
  
  export default LoadingSpinner;
  