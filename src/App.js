import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import DrawingCanvas from './DrawingCanvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser, faForward, faRedo, faCheck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function App() {
  const [characters, setCharacters] = useState([]);
  const [componentMap, setComponentMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [evaluation, setEvaluation] = useState('');
  const drawingCanvasRef = useRef();

  useEffect(() => {
    Promise.all([
      fetch('/1nen_kanji.txt').then(response => response.text()),
      fetch('/Mac_19_Hitu_Dictionary.txt').then(response => response.text())
    ]).then(([kanjiText, dictionaryText]) => {
      const kanjiLines = kanjiText.split('\n').slice(1);
      const parsedKanji = kanjiLines.map(line => {
        const [char, strokes, onYomi, kunYomi] = line.split('\t');
        return { char, strokes, onYomi, kunYomi };
      }).filter(Boolean);

      const dictionaryLines = dictionaryText.split('\n');
      const parsedDictionary = {};
      dictionaryLines.forEach(line => {
        const match = line.match(/"([^"]+)","([^"]+)","[^"]+"/);
        if (match) {
          const [, , charsAndComponents] = match;
          const [char, ...components] = charsAndComponents.split(' ');
          if (!parsedDictionary[char]) {
            parsedDictionary[char] = components.join('').split('');
          }
        }
      });

      setCharacters(parsedKanji);
      setComponentMap(parsedDictionary);

      const initialIndex = Math.floor(Math.random() * parsedKanji.length);
      setCurrentIndex(initialIndex);
    });
  }, []);

  const handleNext = useCallback(() => {
    const currentChar = characters[currentIndex];
    if (currentChar) {
      setStage(prevStage => {
        const components = componentMap[currentChar.char] || [];
        const nextStage = prevStage + 1;
        return nextStage > components.length ? 0 : nextStage;
      });
    }
  }, [characters, currentIndex, componentMap]);

  const handleClear = useCallback(() => {
    if (drawingCanvasRef.current) {
      drawingCanvasRef.current.clearAndRedraw();
    }
    setEvaluation('');
  }, []);

  const handleNextCharacter = useCallback(() => {
    setCurrentIndex(prevIndex => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * characters.length);
      } while (newIndex === prevIndex && characters.length > 1);
      return newIndex;
    });
    setStage(0);
    setShowHint(false);
    setEvaluation('');
  }, [characters]);

  const toggleHint = useCallback(() => {
    setShowHint(prev => !prev);
  }, []);

  const handleEvaluate = useCallback(async () => {
    if (!drawingCanvasRef.current) return;
  
    const canvas = drawingCanvasRef.current.getCanvasImage();
    const imageDataUrl = canvas.toDataURL('image/png');
  
    console.log('Image Data URL (first 100 chars):', imageDataUrl.substring(0, 100));
  
    try {
      const currentChar = characters[currentIndex] || { char: '' };
      const requestBody = {
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `システム: あなたは6歳の子供向けに漢字の評価を行う優しい先生です。簡単な言葉を使い、励ましながら評価してください。
      
      ユーザー: キャンパスの文字が「${currentChar.char}」と同じか厳密にジャッジして。「すばらしい」、「おしい！」、「お手本をよく見て！」のどれか1つを回答してから簡単なアドバイスをお願い。`
              },
              {
                type: "image",
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ]
      };
  
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
  
      const response = await axios.post(
        'http://localhost:3001/api/anthropic',
        requestBody
      );
  
      console.log('Response:', JSON.stringify(response.data, null, 2));
  
      setEvaluation(response.data.content[0].text);
    } catch (error) {
      console.error('Error evaluating kanji:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setEvaluation('評価中にエラーが発生しました。もう一度お試しください。');
    }
  }, [characters, currentIndex, drawingCanvasRef]);

  const currentChar = characters[currentIndex] || { char: '', strokes: '0', onYomi: '', kunYomi: '' };
  const currentComponents = componentMap[currentChar.char] || [];

  return (
    <div className="App">
      <header className="App-header">
        <h1>UDHituAStd 漢字学習アプリ</h1>
      </header>
      <main>
        <div className="character-info">
          <h2>音読み: {currentChar.onYomi} / 訓読み: {currentChar.kunYomi}</h2>
          <p>画数: {currentChar.strokes}</p>
          <button onClick={toggleHint} className="hint-button">
            {showHint ? 'ヒントを隠す' : 'ヒントを表示'}
          </button>
          {showHint && (
            <div className="hint">
              <p>正解: <span className="udhitu-font">{currentChar.char}</span></p>
            </div>
          )}
        </div>
        <DrawingCanvas 
          ref={drawingCanvasRef} 
          stage={stage} 
          character={currentChar.char} 
          components={currentComponents}
        />
        <div className="controls">
          <button onClick={handleClear} className="control-button">
            <FontAwesomeIcon icon={faEraser} /> クリア
          </button>
          <button onClick={handleNext} className="control-button">
            <FontAwesomeIcon icon={faForward} /> 次へ
          </button>
          <button onClick={handleNextCharacter} className="control-button">
            <FontAwesomeIcon icon={faRedo} /> 次の文字
          </button>
          <button onClick={handleEvaluate} className="control-button evaluate-button">
            <FontAwesomeIcon icon={faCheck} /> 判定
          </button>
        </div>
        {evaluation && (
          <div className="evaluation">
            <h3>評価結果:</h3>
            <p>{evaluation}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;