// DEPRECATED: This file provides backward compatibility for SampleButton imports
// Please migrate to: import { Button } from "@/components/ui/button"

import { Button, buttonVariants, type ButtonProps } from "./button";

// Export aliases for backward compatibility
export { Button as SampleButton, buttonVariants, type ButtonProps };

// Default export for legacy imports
export default Button;
