import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  delay?: number; // Delay in milliseconds before typing starts
  speed?: number; // Typing speed in milliseconds per character
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, delay = 0, speed = 60 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!hasStarted) {
      timeout = setTimeout(() => {
        setHasStarted(true);
        setIsTyping(true);
      }, delay);
      return () => clearTimeout(timeout);
    }

    if (displayedText.length < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
    } else {
      setIsTyping(false);
    }

    return () => clearTimeout(timeout);
  }, [text, delay, speed, displayedText, hasStarted]);

  return (
    <span>
      {displayedText}
      <span
        className={`inline-block w-[6px] h-[1em] ml-1 bg-current align-text-bottom ${
          isTyping ? 'animate-pulse' : 'animate-[pulse_1s_infinite]'
        }`}
        style={{ opacity: hasStarted ? 1 : 0 }}
      ></span>
    </span>
  );
};

export default TypewriterText;
