// app/styles/sharedScreenStyles.ts
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const sharedStyles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  container: {
    padding: 30,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heading: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
  },

  // NEW:
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
  },
  inputBox: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#000",
    marginVertical: 10,
    fontFamily: "Poppins_400Regular",
  },
  dropdown: {
    width: "100%",
    backgroundColor: "#ffffffb0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    fontFamily: "Poppins_400Regular",
  },
});
