export default function IconButton({
  icon,
  onClick,
  label,
  disabled,
}: {
  icon: string;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    // a circular button with icon, the label is placed on the right side of the button
    // and is visible only if there is enough space, theb button should only
    // use the space it needs and not all the available width of the screen
    // the element has to be placed inside a div

    <div
      onClick={onClick}
      className="inline-flex items-center space-x-2 mx-2  transition duration-200 hover:opacity-70 select-none"
    >
      <button
        className="flex items-center justify-center w-10 h-10 p-4 bg-secondary-container text-on-secondary-container rounded-full"
        aria-label={label}
        disabled={disabled}
      >
        <span className="material-symbols-rounded">{icon}</span>
      </button>
      <span className="hidden sm:inline text-on-background font-medium">
        {label}
      </span>
    </div>
  );
}
