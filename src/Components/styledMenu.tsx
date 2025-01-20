import React, { forwardRef, useState } from "react";
import { alpha, styled } from "@material-ui/core/styles";
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { MenuItemProps } from "../interfaces";
import { Grow } from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions/transition";

// Add custom transition component
const GrowTransition = forwardRef<HTMLElement, TransitionProps>((props, ref) => {
  const { children, ...other } = props;
  return (
    <Grow ref={ref} {...other}>
      {children as React.ReactElement}
    </Grow>
  );
});

const StyledMenu = styled((props: MenuProps) => (
    <Menu
      elevation={0}
      getContentAnchorEl={null} 
      TransitionComponent={GrowTransition}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}
    />
  ))(({ theme }) => ({
    '& .MuiPaper-root': {
      borderRadius: 6,
      marginTop: theme.spacing(1),
      minWidth: 180,
      color: 'rgb(55, 65, 81)',
      boxShadow:
        'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
      '& .MuiMenu-list': {
        padding: '4px 0',
      },
      '& .MuiMenuItem-root': {
        '& .MuiSvgIcon-root': {
          fontSize: 18,
          color: theme.palette.text.secondary,
          marginRight: theme.spacing(1.5),
        },
        '&:active': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
  }));

  const CustomizedMenus = ({ menuItems }: { menuItems: MenuItemProps[] }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    return (
      <div>
        <IconButton 
        color="primary"
        id="demo-customized-button"
          aria-controls={open ? 'demo-customized-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
                    <MoreVertIcon />   
        </IconButton>
        <StyledMenu
          id="demo-customized-menu"
          MenuListProps={{
            'aria-labelledby': 'demo-customized-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          {menuItems.map((item) => (
            <MenuItem key={item.label} onClick={item.onClick} disableRipple>
              {item.label}
            </MenuItem>
          ))}
        </StyledMenu>
      </div>
    )
}

export default CustomizedMenus;