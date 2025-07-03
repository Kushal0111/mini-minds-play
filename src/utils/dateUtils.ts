
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getDayOfWeek = (date: Date): string => {
  return DAYS[date.getDay()];
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDate = (date: Date): string => {
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const suffix = getOrdinalSuffix(day);
  return `${day}${suffix} ${month}`;
};

const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export const generateRandomDate = (): Date => {
  const start = new Date(2024, 0, 1);
  const end = new Date(2024, 11, 31);
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
};

export const generateWrongOptions = (correctDate: Date, correctDay: string): Array<{date: string, day: string}> => {
  const options: Array<{date: string, day: string}> = [];
  const usedDates = new Set([formatDate(correctDate)]);
  
  while (options.length < 3) {
    const randomDays = Math.floor(Math.random() * 10) + 1;
    const wrongDate = addDays(correctDate, randomDays);
    const wrongDateStr = formatDate(wrongDate);
    
    if (!usedDates.has(wrongDateStr)) {
      usedDates.add(wrongDateStr);
      options.push({
        date: wrongDateStr,
        day: getDayOfWeek(wrongDate)
      });
    }
  }
  
  return options;
};
