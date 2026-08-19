import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // The initialiser runs on the client only — on the server there is no window,
  // so this starts false and the first client render corrects it. Reading it here
  // rather than setting state inside the effect avoids an extra render pass.
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth < MOBILE_BREAKPOINT,
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
