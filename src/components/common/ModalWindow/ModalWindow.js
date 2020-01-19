import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import cn from 'clsx';
import noop from 'lodash/noop';
import styles from './styles.module.scss';
import { useEscKeyHandler } from '@/utils/hooks';

const ModalWindow = ({
  hasBackdrop = true,
  canEscapeKeyClose = true,
  canOutsideClickClose = true,
  onClose = noop,
  isOpen,
  children,
}) => {
  const handleMouseDownOverlay = useCallback(
    e => {
      if (canOutsideClickClose) {
        onClose(e);
      }
    },
    [canOutsideClickClose, onClose],
  );

  const handleMouseDownWindow = useCallback(e => {
    e.stopPropagation();
  }, []);

  useEscKeyHandler({ onKeyPress: onClose, active: canEscapeKeyClose });

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className={cn(styles.overlay, { [styles.overlayWithBackdrop]: hasBackdrop })}
      onMouseDown={handleMouseDownOverlay}
    >
      <div role="presentation" className={styles.modalWindow} onMouseDown={handleMouseDownWindow}>
        {children}
      </div>
    </div>
  );
};

ModalWindow.protoTypes = {
  /** Состояние диалога: открыт */
  isOpen: PropTypes.bool.isRequired,

  /** Действие при закрытии окна */
  onClose: PropTypes.func,

  /** Затенение фона */
  hasBackdrop: PropTypes.bool,

  /** Можно закрыть через нажатие ESC */
  canEscapeKeyClose: PropTypes.bool,

  /** Можно закрыть кликом на оверлее */
  canOutsideClickClose: PropTypes.bool,
};

export default ModalWindow;
