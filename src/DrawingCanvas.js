import React, { useRef, useState, useEffect, useImperativeHandle, useCallback } from 'react';

const DrawingCanvas = React.forwardRef(({ stage, character, components }, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [randomOrder, setRandomOrder] = useState([]);

  useEffect(() => {
    // Generate a random order when components change
    setRandomOrder(Array.from({ length: components.length }, (_, i) => i).sort(() => Math.random() - 0.5));
  }, [components]);

  const drawCharacters = useCallback((context) => {
    context.font = '120px UDHituAStd-E12';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    if (stage === 0) {
      // 全ての構成要素をグレーで描画
      context.fillStyle = '#E0E0E0';
      components.forEach((comp) => {
        context.fillText(comp, 150, 150);
      });
    } else {
      // stage 1以降: ランダムに画を削除し、残りを黒で描画
      const remainingStrokes = components.length - stage;
      if (remainingStrokes > 0) {
        context.fillStyle = '#000000';
        randomOrder.slice(0, remainingStrokes).forEach((index) => {
          context.fillText(components[index], 150, 150);
        });
      }
    }
  }, [components, stage, randomOrder]);

  const clearAndRedraw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawCharacters(context);
  }, [drawCharacters]);

  useEffect(() => {
    const loadFont = async () => {
      await document.fonts.load('120px UDHituAStd-E12');
      setFontLoaded(true);
    };
    loadFont();
  }, []);

  useEffect(() => {
    if (fontLoaded) {
      clearAndRedraw();
    }
  }, [stage, character, components, fontLoaded, clearAndRedraw]);

  const startDrawing = (e) => {
    e.preventDefault(); // デフォルトの動作を防ぐ
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(x, y);
    context.strokeStyle = '#000000';
    context.lineWidth = 8;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // デフォルトの動作を防ぐ
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const context = canvas.getContext('2d');
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startDrawing({
      preventDefault: () => {},
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    draw({
      preventDefault: () => {},
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  };

  useImperativeHandle(ref, () => ({
    clearAndRedraw,
    getCanvasImage: () => canvasRef.current
  }));

  return (
    <div className="drawing-canvas">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={stopDrawing}
        style={{ touchAction: 'none' }} // タッチ操作によるスクロールを無効化
      />
    </div>
  );
});

export default DrawingCanvas;