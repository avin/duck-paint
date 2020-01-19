import React, { useState } from 'react';
import ModalWindow from './ModalWindow';

export default () => {
  const [isOpen, setOpen] = useState(false);
  const changeOpen = () => setOpen(!isOpen);

  return (
    <div>
      <button onClick={changeOpen} type="button">
        Open window
      </button>

      <ModalWindow isOpen={isOpen} onClose={changeOpen}>
        <div style={{ padding: 20, backgroundColor: '#fff' }}>
          <p>Modal window content here!</p>
        </div>
      </ModalWindow>
    </div>
  );
};
