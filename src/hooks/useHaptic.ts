export function useHaptic() {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    pickup: () => vibrate(30),
    tick: () => vibrate(15),
    drop: () => vibrate([20, 30, 20]),
  };
}
