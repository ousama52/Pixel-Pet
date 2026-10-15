import { useEffect, useRef, useState } from 'react'

/**
 * Steps an index 0..frames-1 at `fps`. Driven by rAF rather than setInterval so
 * every sprite on screen swaps frames on the same tick and pauses in background tabs.
 */
export function useFrameIndex(frames: number, fps: number, playing = true): number {
  const [index, setIndex] = useState(0)
  const raf = useRef(0)
  const last = useRef(0)

  useEffect(() => {
    if (!playing || frames <= 1) {
      setIndex(0)
      return
    }
    const step = 1000 / fps
    const loop = (t: number) => {
      if (t - last.current >= step) {
        last.current = t
        setIndex((i) => (i + 1) % frames)
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [frames, fps, playing])

  return index
}
