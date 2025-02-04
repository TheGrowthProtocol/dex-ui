import { forwardRef } from "react";
import { Snackbar, styled, Box, Typography } from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { useSnackbarContext } from "../Contexts/snackbarContext";

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  "&.MuiSnackbar-anchorOriginTopRight": {
    top: "80px",
  },
  "& .MuiAlert-root": {
    width: "100%",
    alignItems: "center",
    background:
      "radial-gradient(86.33% 299.52% at 13.67% 23.12%, #272727 0%, #0E0E0E 100%)",
    
    borderRadius: "16px",
  },
  "& .MuiAlert-message": {
    fontSize: "0.875rem",
    padding: "8px 0",
    width: "100%",
  },
  "& .MuiAlert-icon": {
    fontSize: "1.5rem",
  },
  "& .MuiAlert-action": {
    padding: "0 8px",
    color: theme.palette.primary.main,
  },
  "& .MuiAlert-standardSuccess, & .MuiAlert-filledSuccess": {
    "& .MuiAlert-message": {
      color: "#4caf50"
    },
    "& .MuiAlert-icon": {
      color: "#4caf50"
    }
  },
  "& .MuiAlert-standardError, & .MuiAlert-filledError": {
    "& .MuiAlert-message": {
      color: "#f44336"
    },
    "& .MuiAlert-icon": {
      color: "#f44336"
    }
  },
  "& .MuiAlert-standardWarning, & .MuiAlert-filledWarning": {
    "& .MuiAlert-message": {
      color: "#ff9800"
    },
    "& .MuiAlert-icon": {
      color: "#ff9800"
    }
  },
  "& .MuiAlert-standardInfo, & .MuiAlert-filledInfo": {
    "& .MuiAlert-message": {
      color: "#2196f3"
    },
    "& .MuiAlert-icon": {
      color: "#2196f3"
    }
  }
}));

const StyledContent = styled(Box)(({ theme }) => ({
  padding: "1px",
  background:
      "linear-gradient(90deg, #926128 0%, #B99A45 25%, #E3D6B4 50%, #B99A45 79%, #916027 100%)",
  borderRadius: "16px",
}));

export const CustomSnackbar = () => {
  const { open, content, severity, hideSnackbar } = useSnackbarContext();

  return (
    <div>
      <StyledSnackbar
        open={open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <StyledContent>
        <Alert
          onClose={hideSnackbar}
          severity={severity}
          style={{
            minWidth: "300px",
            maxWidth: "600px",
            boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          
            {typeof content === "string" ? (
              <Typography>{content}</Typography>
            ) : (
              content
            )}
          
        </Alert>
        </StyledContent>
      </StyledSnackbar>
    </div>
  );
};
