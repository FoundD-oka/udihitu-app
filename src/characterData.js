// characterData.js
export const loadCharacterData = async () => {
  try {
    const response = await fetch('/Mac_19_Hitu_Dictionary.txt');
    const text = await response.text();
    const lines = text.split('\n');
    const data = {};

    lines.forEach(line => {
      const match = line.match(/"([^"]+)","([^"]+) ([^"]+)","([^"]+)"/);
      if (match) {
        const [, reading, kanji, components, type] = match;
        data[reading] = components.split(' ');
      }
    });

    return data;
  } catch (error) {
    console.error('Error loading character data:', error);
    return {};
  }
};

export const getRandomCharacter = (characterData) => {
  const characters = Object.keys(characterData);
  return characters[Math.floor(Math.random() * characters.length)];
};

export const getStrokeCount = (char, characterData) => {
  return characterData[char] ? characterData[char].length : 0;
};