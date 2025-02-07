import React from "react";
import "./App.css";
import { SnackbarProvider } from "./Contexts/snackbarContext";
import { ProviderContextProvider } from "./Contexts/providerContext";
import { createTheme, ThemeProvider } from "@material-ui/core";

/**
 * Import Header
 */
import Header from "./Components/header";
import Main from "./Pages/main";

const theme = createTheme({
  palette: {
    primary: {
      main: "#DDCDA4",
      contrastText: "#81776B",
    },
    secondary: {
      main: "#9e9e9e",
      contrastText: "#ffffff",
    },
    background: {
      paper: "#0C0C0C", //background color of the app
      default: "#0C0C0C", //background color of the app
    },
    text: {
      primary: "#ffffff",
      secondary: "#9e9e9e",
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <ProviderContextProvider>
        <div className="App">
          <Header />
          <div className="main-container">
            <Main />
            </div>
          </div>
        </ProviderContextProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
