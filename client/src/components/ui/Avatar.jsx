const colors = [
  'bg-primary-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-indigo-500',
];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({ name = '?', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold ${getColor(name)} ${sizeClasses[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
