function colorLog(message, color) {

     color = color || "black";
     let background = "transparent";
     let padding = "5px 10px";
     let fontSize = '1em';
     let fontWeight = '900';
     let letterSpacing = '3em';

     switch (color) {
          case "success":
               color = "Green";
               background = "#00800050";
               break;
          case "info":
               color = "DodgerBlue";
               background = "#1e90ff50";
               break;
          case "error":
               color = "Red";
               background = "#ff000030";
               break;
          case "warning":
               color = "Orange";
               background = "#ffa50050";
               break;
          default:
               color = color;
     }

     console.log("%c" + message,
          `color: ${color}; 
    background-color: ${background}; 
    padding: ${padding}; 
    font-size: ${fontSize}; 
    font-weight: ${fontWeight};
    letter-spacing: ${letterSpacing};`);
}

/* colorLog('Success', 'success')
colorLog('Info', 'info')
colorLog('Error', 'error')
colorLog('Warning', 'warning') */

module.exports = { colorLog };