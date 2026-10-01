"use client";

type SwitchProps = {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** What the switch turns on, for screen readers. */
  label: string;
};

/** On/off switch built on a real checkbox, so it submits with the form. */
export function Switch({ name, checked, onChange, label }: SwitchProps) {
  return (
    <label className="relative inline-flex h-11 w-14 cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        role="switch"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={label}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="h-7 w-12 rounded-full border border-ink/30 bg-cream transition-colors duration-300 peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
      />
      <span
        aria-hidden="true"
        className="absolute left-2 size-5 rounded-full bg-paper shadow-[0_1px_3px_rgb(17_17_17/0.25)] transition-transform duration-300 ease-soft peer-checked:translate-x-5"
      />
    </label>
  );
}
