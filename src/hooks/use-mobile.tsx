import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(mql.matches)
    }
    
    // Set initial state based on mql
    setIsMobile(mql.matches);

    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, []) // Empty dependency array is correct

  return !!isMobile // Coerce undefined to false for SSR, true/false on client after mount
}
