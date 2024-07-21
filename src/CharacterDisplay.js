import React, { useMemo } from 'react';
import './CharacterDisplay.css';

const CharacterDisplay = ({ character, stage, maxStage, characterData }) => {
  const displayChars = useMemo(() => {
    if (!characterData[character]) return [];
    return characterData[character].slice(0, stage + 1);
  }, [character, stage, characterData]);

  return (
    <div className="character-display">
      <div className="character-layers">
        {displayChars.map((char, index) => (
          <div 
            key={index} 
            className="character-layer"
            style={{
              opacity: (index + 1) / displayChars.length,
              color: index === stage ? '#000' : '#888',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '120px',
              fontFamily: 'UDHituAStd-E12, sans-serif'
            }}
          >
            {char}
          </div>
        ))}
      </div>
      <div className="character-info">
        <p>文字: {character}</p>
        <p>進捗: {stage + 1} / {maxStage}</p>
      </div>
    </div>
  );
};

export default React.memo(CharacterDisplay);