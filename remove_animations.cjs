const fs = require('fs');

function removeAnimations(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let newLines = [];
  let inKeyframes = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Skip keyframes blocks
    if (line.includes('@keyframes')) {
      inKeyframes = true;
      continue;
    }
    if (inKeyframes) {
      if (line.trim() === '}') {
        inKeyframes = false;
      }
      continue;
    }
    
    // Remove transitions and animations
    if (line.includes('transition:') || line.includes('animation:') || line.includes('transform-origin:')) {
      continue;
    }
    
    // Remove transforms used for hover scaling/moving, but keep centering
    if (line.includes('transform:') && !line.includes('translateY(-50%)')) {
      continue;
    }
    
    newLines.push(line);
  }
  
  fs.writeFileSync(filePath, newLines.join('\n'));
}

removeAnimations('src/screens/Settings/SettingsScreen.css');
removeAnimations('src/screens/Settings/SettingsSubScreens.css');
console.log('Removed transitions and animations from both CSS files.');
