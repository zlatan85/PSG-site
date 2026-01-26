const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const KEYWORDS = ['psg', 'paris saint-germain', 'paris saint germain', 'paris sg'];

export const isPsgTopic = (title: string) => {
  const normalized = normalize(title);
  return KEYWORDS.some((keyword) => normalized.includes(keyword));
};
