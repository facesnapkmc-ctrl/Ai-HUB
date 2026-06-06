import './Tag.css';

interface TagProps {
  label: string;
  variant?: 'default' | 'outline' | 'gradient' | 'outline-purple' | 'solid-cyan';
}

export function Tag({ label, variant = 'default' }: TagProps) {
  return (
    <span className={`tag tag-${variant}`}>
      {label}
    </span>
  );
}
