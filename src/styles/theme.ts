import { createTheme, MantineColorsTuple } from '@mantine/core';

// Bronze color palette from the original CSS
const bronze: MantineColorsTuple = [
  '#f4e6d3',
  '#e6d2b8', 
  '#d4b896',
  '#c9a876',
  '#b89956',
  '#a67c52',
  '#8b6541',
  '#6b4d32',
  '#4a3624',
  '#2c1f15',
];

// Ancient bronze theme
export const ancientTheme = createTheme({
  fontFamily: 'Georgia, serif',
  fontFamilyMonospace: 'Cinzel, Trajan Pro, Times New Roman, serif',
  
  colors: {
    bronze,
  },
  
  primaryColor: 'bronze',
  

  
  other: {
    // Custom color values used throughout the app
    museumBlack: '#000000',
    bronzeGradient: `linear-gradient(
      45deg,
      #2c2c2c 0%,
      #4a4a4a 10%,
      #6b6b6b 20%,
      #8b6541 30%,
      #a67c52 40%,
      #c9a876 50%,
      #a67c52 60%,
      #8b6541 70%,
      #6b6b6b 80%,
      #4a4a4a 90%,
      #2c2c2c 100%
    )`,
    panelBackground: `linear-gradient(
      135deg,
      rgba(20, 16, 12, 1.0) 0%,
      rgba(32, 26, 20, 1.0) 25%,
      rgba(44, 36, 28, 1.0) 50%,
      rgba(58, 48, 38, 1.0) 75%,
      rgba(70, 58, 46, 1.0) 100%
    )`,
    tooltipBackground: 'rgba(42, 33, 17, 0.95)',
    legendBackground: 'rgba(0, 0, 0, 0.2)',
  }
}); 