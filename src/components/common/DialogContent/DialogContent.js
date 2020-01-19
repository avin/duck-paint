import React from 'react';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const DialogContent = ({
  title,
  text,
  icon,
  cancelLabel,
  confirmLabel,
  onCancel = noop,
  onConfirm = noop,
}) => {
  return (
    <div className={styles.dialogContent} data-testid="dialog-content">
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        {text && <div className={styles.text}>{text}</div>}
      </div>
      <div className={styles.buttons}>
        {cancelLabel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            data-testid="button-dialog-cancel"
          >
            {cancelLabel}
          </button>
        )}

        {confirmLabel && (
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
            data-testid="button-dialog-confirm"
          >
            {confirmLabel}
          </button>
        )}
      </div>
    </div>
  );
};

DialogContent.protoTypes = {
  /** Иконка окна */
  icon: PropTypes.string,

  /** Заголовок окна */
  title: PropTypes.node,

  /** Основной текст окна */
  text: PropTypes.node,

  /** Надпись на кнопке отмены */
  cancelLabel: PropTypes.node,

  /** Действие при отмене */
  onCancel: PropTypes.func,

  /** Надпись на кнопке подтверждении */
  confirmLabel: PropTypes.node,

  /** Действие при подтверждении */
  onConfirm: PropTypes.func,
};

export default DialogContent;
