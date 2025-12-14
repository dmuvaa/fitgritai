export function getWeekRanges(
  startDate: Date,
  numWeeks: number,
): Array<{ start: Date; end: Date; weekNumber: number }> {
  const ranges = []

  // Week 1: Today to Sunday
  const week1Start = new Date(startDate)
  const week1End = new Date(startDate)
  const daysUntilSunday = 7 - week1End.getDay() // 0 = Sunday, so we need days until next Sunday
  week1End.setDate(week1End.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday))

  ranges.push({
    start: week1Start,
    end: week1End,
    weekNumber: 1,
  })

  // Subsequent weeks: Monday to Sunday
  let previousEnd = new Date(week1End)
  for (let i = 2; i <= numWeeks; i++) {
    const weekStart = new Date(previousEnd)
    weekStart.setDate(weekStart.getDate() + 1) // Monday after previous Sunday

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6) // Sunday (6 days later)

    ranges.push({
      start: weekStart,
      end: weekEnd,
      weekNumber: i,
    })

    previousEnd = weekEnd
  }

  return ranges
}

export function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`
}

export function getDayOfWeek(date: Date): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]
}

export function getTodayInNairobi(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" }))
}
