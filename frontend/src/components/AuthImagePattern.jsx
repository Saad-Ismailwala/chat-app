import { useState, useEffect } from "react";

const words = ["YOU", "ME", "WE"];
const colors = ["#ff4d4d", "#ffbd4d", "#4dffbd", "#4db8ff", "#bd4dff"];

const AuthImagePattern = ({ title, subtitle }) => {
  const [gridLetters, setGridLetters] = useState(Array(9).fill(""));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true); // for fade-in/out

  useEffect(() => {
    const word = words[currentWordIndex];
    let letterIndex = 0;
    let gridCopy = Array(9).fill("");

    // Function to show letters one by one
    const showLetters = () => {
      if (letterIndex >= word.length) {
        // All letters shown, wait 3s, then fade out
        setTimeout(() => setIsVisible(false), 3000);
        return;
      }

      // Pick random empty block
      const emptyIndices = gridCopy
        .map((l, i) => (l === "" ? i : null))
        .filter((v) => v !== null);
      const randomIndex =
        emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

      gridCopy[randomIndex] = word[letterIndex];
      setGridLetters([...gridCopy]);
      letterIndex++;

      setTimeout(showLetters, 500); // 0.5s per letter
    };

    showLetters();
  }, [currentWordIndex]);

  // Handle fade-out and next word
  useEffect(() => {
    if (!isVisible) {
      // Fade out duration
      const timeout = setTimeout(() => {
        setGridLetters(Array(9).fill(""));
        setIsVisible(true);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }, 1000); // match transition duration

      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  const getLetterColor = (letter) => {
    if (!letter) return "transparent";
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="flex items-center justify-center bg-base-200 p-12 h-full">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {gridLetters.map((letter, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-white/10 flex items-center justify-center relative overflow-hidden"
            >
              {/* Skeleton pulse */}
              <div className="absolute inset-0 w-full h-full bg-white/10 animate-pulse rounded-2xl" />

              {/* Letter with smooth fade-in/out */}
              {letter && (
                <span
                  className={`relative text-2xl font-bold transition-opacity duration-1000 ease-in-out`}
                  style={{
                    color: getLetterColor(letter),
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  {letter}
                </span>
              )}
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
