import React from 'react';
import './ControlButtons.css';

const ControlButtons = ({ onNext, onClear, onNextCharacter }) => {
  return (
    <div className="control-buttons">
      <button onClick={onClear}>クリア</button>
      <button onClick={onNext}>次へ</button>
      <button onClick={onNextCharacter}>次の文字</button>
    </div>
  );
};

export default ControlButtons;