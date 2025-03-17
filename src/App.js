import React, { useEffect } from "react";
import "./App.css";
import { SnackbarProvider } from "./Contexts/snackbarContext";
import { ProviderContextProvider } from "./Contexts/providerContext";
import { createTheme, ThemeProvider } from "@material-ui/core";
import ReactGA from 'react-ga4'
import { useLocation } from "react-router-dom";


/**
 * Import Header
 */
import Header from "./Components/header";
import Main from "./Pages/main";

const theme = createTheme({
  typography: {
    fontFamily: "'Exo Variable', sans-serif",
  },
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

ReactGA.initialize('G-KV98335QBH');

const App = () => {

  const location = useLocation();
  useEffect(() => {
    // Send pageview with a custom path
    if(process.env.REACT_APP_ENV === "development") {
      return;
    }
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

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
