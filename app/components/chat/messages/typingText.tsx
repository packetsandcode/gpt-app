import { useEffect, useState } from "react";
import { Markdown } from "../../common/markdown";

export function TypingTextMarkdown({ text }: { text: string }) {
  const [visibleText, setVisibleText] = useState("");
  const typingSpeed = 10; // ms

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setVisibleText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, typingSpeed);
    return () => clearInterval(interval);
  }, [text]);

  return <Markdown>{visibleText}</Markdown>;
}
