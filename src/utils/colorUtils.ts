
export const COLORS = [
  { name: 'Red', hex: '#EF4444', rgb: 'rgb(239, 68, 68)' },
  { name: 'Blue', hex: '#3B82F6', rgb: 'rgb(59, 130, 246)' },
  { name: 'Green', hex: '#10B981', rgb: 'rgb(16, 185, 129)' },
  { name: 'Yellow', hex: '#F59E0B', rgb: 'rgb(245, 158, 11)' },
  { name: 'Purple', hex: '#8B5CF6', rgb: 'rgb(139, 92, 246)' },
  { name: 'Orange', hex: '#F97316', rgb: 'rgb(249, 115, 22)' },
  { name: 'Pink', hex: '#EC4899', rgb: 'rgb(236, 72, 153)' },
  { name: 'Cyan', hex: '#06B6D4', rgb: 'rgb(6, 182, 212)' },
];

export const getRandomColor = () => {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
};

export const getRandomColors = (count: number) => {
  const shuffled = [...COLORS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateColorQuestion = () => {
  const textColor = getRandomColor();
  const displayColors = getRandomColors(6);
  
  // Ensure the correct color is in the display colors
  if (!displayColors.find(c => c.name === textColor.name)) {
    displayColors[Math.floor(Math.random() * displayColors.length)] = textColor;
  }
  
  const correctColorIndex = displayColors.findIndex(c => c.name === textColor.name);
  
  // Pick a different color name to display as text
  const wrongTextColor = COLORS.find(c => c.name !== textColor.name) || COLORS[0];
  
  return {
    text: wrongTextColor.name,
    textColor: textColor.hex,
    displayColors,
    correctColorIndex
  };
};
