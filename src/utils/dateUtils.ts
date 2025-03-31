export function getMoscowTime(date: Date = new Date()): Date {
  // Get current date in UTC
  const utcDate = new Date(date.toUTCString());
  
  // Add 3 hours for Moscow time (UTC+3)
  return new Date(utcDate.getTime() + (3 * 60 * 60 * 1000));
}

export function getTimeUntilDate(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = getMoscowTime();
  const target = new Date(targetDate);
  const difference = target.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000)
  };
}