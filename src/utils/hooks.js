import { useState, useEffect } from 'react';

/**
 * Обработчик смены фокуса окна
 * @returns {*}
 */
export function useWindowFocus() {
  const [isFocused, setIsFocused] = useState(document.hasFocus());

  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
    };
    const handleBlur = () => {
      setIsFocused(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [setIsFocused]);

  return isFocused;
}

/**
 * Обраточик нажатия кнопки
 * @param onKeyPress
 */
export function useKeyPressHandler(onKeyPress) {
  useEffect(() => {
    function downHandler(e) {
      onKeyPress(e, e.key, e.which === 32);
    }

    window.addEventListener('keydown', downHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
    };
  }, [onKeyPress]);
}
