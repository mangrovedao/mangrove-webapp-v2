export const LEVELS = [
  {
    amount: 10_000,
    boost: 1.75,
    rankString: "1st",
  },
  {
    amount: 20_000,
    boost: 2.5,
    rankString: "2nd",
  },
  {
    amount: 50_000,
    boost: 3,
    rankString: "3rd",
  },
  {
    amount: 100_000,
    boost: 3.5,
    rankString: "4th",
  },
  {
    amount: 500_000,
    boost: 4,
  },
]

export function getLevels(volume?: number) {
  if (!volume) {
    return {
      nextIndex: 0,
      nextLevel: LEVELS[0],
    }
  }
  const currentIndex = LEVELS.findIndex((l) => l.amount > volume) - 1
  const nextIndex = currentIndex + 1
  return {
    nextIndex,
    nextLevel: LEVELS[nextIndex],
  }
}
