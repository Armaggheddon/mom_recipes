import { useState, useEffect, useMemo } from "react";

interface RecipeGenerationProps {
  status?: "generating" | "success" | "error";
  errorMessage?: string;
}

export default function RecipeGeneration({
  status,
  errorMessage,
}: RecipeGenerationProps) {
  // simulaet recipe generation progress with some fun descriptions
  // The descriptions must be relevant to cooking and food preparation
  // and not be in a fixed order, but rather cycle through them randomly.
  const progressSteps = useMemo(
    () => [
      "Chopping fresh ingredients...",
      "Sautéing vegetables to perfection...",
      "Simmering the sauce slowly...",
      "Baking to a golden brown...",
      "Mixing flavors together...",
      "Garnishing with fresh herbs...",
      "Plating the dish beautifully...",
      "Adding the final touches...",
      "Preparing a delightful meal...",
      "Cooking up something special...",
    ],
    [],
  );
  const beginEmoji = "🔍🖼️";
  const beginDescription = "Analyzing your images...";
  const successEmoji = "🥳🍽️";
  const successDescription = "Recipe generated successfully!";
  const errorEmoji = "😞";
  const errorDescription = "Failed to generate recipe. Please try again.";
  // emojis of food used to keep user entertained
  const progressEmoji = useMemo(
    () => [
      "🍕",
      "🍔",
      "🌮",
      "🍣",
      "🍰",
      "🍜",
      "🥗",
      "🍩",
      "🍤",
      "🍛",
      "🍞",
      "🧁",
      "🍿",
      "🍗",
      "🍳",
      "🥘",
      "🍝",
      "🍪",
      "🍉",
      "🍦",
    ],
    [],
  );

  const [isStarted, setIsStarted] = useState<boolean>(false);

  const [currentDescription, setCurrentDescription] = useState<string>(
    progressSteps[0],
  );
  const [currentEmoji, setCurrentEmoji] = useState<string>(progressEmoji[0]);

  useEffect(() => {
    if (status === "generating") {
      if (!isStarted) {
        setIsStarted(true);
        setCurrentDescription(beginDescription);
        setCurrentEmoji(beginEmoji);
        // after 3 seconds, start cycling through progress steps
        setTimeout(() => {
          setCurrentDescription(progressSteps[0]);
          setCurrentEmoji(progressEmoji[0]);
        }, 3000);
      }

      let stepIndex = 0;
      const interval = setInterval(() => {
        stepIndex = (stepIndex + 1) % progressSteps.length;
        const emojiIndex = Math.floor(Math.random() * progressEmoji.length);
        setCurrentDescription(progressSteps[stepIndex]);
        setCurrentEmoji(progressEmoji[emojiIndex]);
      }, 2000);
      return () => clearInterval(interval);
    } else if (status === "success") {
      setCurrentDescription(successDescription);
      setCurrentEmoji(successEmoji);
    } else if (status === "error") {
      setCurrentDescription(errorMessage || errorDescription);
      setCurrentEmoji(errorEmoji);
    }
  }, [status, isStarted, progressSteps, progressEmoji, errorMessage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-6xl mb-4">{currentEmoji}</p>
      <p className="text-lg text-on-background">{currentDescription}</p>
    </div>
  );
}
