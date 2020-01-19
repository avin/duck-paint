import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

let isTouch = false;

const ClickOutside = ({ children, onClickOutside, ...props }) => {
  const container = useRef(null);

  const handle = useCallback(
    e => {
      if (e.type === 'touchend') {
        isTouch = true;
      }
      if (e.type === 'click' && isTouch) {
        return;
      }

      const el = container.current;
      if (el && !el.contains(e.target)) {
        onClickOutside(e);
      }
    },
    [onClickOutside],
  );

  useEffect(() => {
    document.addEventListener('touchend', handle, true);
    document.addEventListener('click', handle, true);

    return () => {
      document.removeEventListener('touchend', handle, true);
      document.removeEventListener('click', handle, true);
    };
  }, [handle]);

  return (
    <div {...props} ref={container}>
      {children}
    </div>
  );
};

ClickOutside.protoTypes = {
  onClickOutside: PropTypes.func.isRequired,
};

export default ClickOutside;
