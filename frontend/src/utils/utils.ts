export const minute2Text = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min${minutes > 1 ? "s" : ""}`;
  } else {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs} hr${hrs > 1 ? "s" : ""}${mins > 0 ? ` ${mins} min${mins > 1 ? "s" : ""}` : ""}`;
  }
};

export const category2Icon = (category: string) => {
  switch (category) {
    case "dessert":
      return "🍰";
    case "main_course":
      return "🍽️";
    case "appetizer":
      return "🥗";
    default:
      return `🍽️`;
  }
};
