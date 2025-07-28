import * as Font from "expo-font";

export const loadFonts = async () => {
  await Font.loadAsync({
    "Poppins-Black": require("../../assets/fonts/poppins/Poppins-Black.ttf"),
    "Poppins-BlackItalic": require("../../assets/fonts/poppins/Poppins-BlackItalic.ttf"),
    "Poppins-Bold": require("../../assets/fonts/poppins/Poppins-Bold.ttf"),
    "Poppins-BoldItalic": require("../../assets/fonts/poppins/Poppins-BoldItalic.ttf"),
    "Poppins-ExtraBold": require("../../assets/fonts/poppins/Poppins-ExtraBold.ttf"),
    "Poppins-Italic": require("../../assets/fonts/poppins/Poppins-Italic.ttf"),
    "Poppins-Light": require("../../assets/fonts/poppins/Poppins-Light.ttf"),
    "Poppins-Regular": require("../../assets/fonts/poppins/Poppins-Regular.ttf"),
  });
};



