const DEFAULT_COLORS = [
  '#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C',
  '#38D9A9', '#4DABF7', '#748FFC', '#DA77F2',
  '#F783AC', '#20C997', '#845EF7', '#FCC419',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="color-picker">
      {DEFAULT_COLORS.map(color => (
        <button
          key={color}
          type="button"
          className={`color-swatch ${value === color ? '--selected' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}
