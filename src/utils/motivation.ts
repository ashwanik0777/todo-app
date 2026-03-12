const MESSAGES = [
  'Great job! One step closer to your goals.',
  'Momentum matters. Keep going!',
  'Task completed. You are making real progress.',
  'Nice win. Small actions build big results.',
  'Excellent focus. Let’s keep the streak alive.',
];

export const getMotivationalMessage = () => {
  const index = Math.floor(Math.random() * MESSAGES.length);
  return MESSAGES[index];
};
