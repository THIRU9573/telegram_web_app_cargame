import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Avatar from '@mui/material/Avatar';
import profile from "../../assets/profile1.png";
import task from "../../assets/task1.png";
import drive from "../../Assets/drive1.png";
import friend from "../../assets/friend1.png";
import about from "../../assets/about1.png";
import { styled } from '@mui/material/styles';

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  width: '100%',
  height: '50px',
  position: 'fixed',
  background: '#121212',
  backdropFilter: 'blur(12px)',
  bottom: 0,
  left: 0,
  right: 0,
  borderRadius: '24px 24px 0 0',
 '& .Mui-selected': {
    '& .MuiBottomNavigationAction-label': {
      color: '#ff5500 !important',
      fontSize: '12px !important',
      opacity: '1 !important',
    },
    '& .MuiSvgIcon-root': {
      color: '#ff5500 !important',
    },
    color: '#ff5500 !important',
    '& .MuiAvatar-root': {
      transform: 'translateY(-27px)',
      transition: 'all 0.3s ease',
      position: 'relative',
      width: '35px !important',
      height: '35px !important',
      zIndex: 1,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-5px',
        left: '-35px',
        width: '30px',
        height: '30px',
        background: 'transparent',
        borderRadius: '50%',
        boxShadow: '25px 25px #121212',
        zIndex: -1,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '-5px',
        right: '-35px',
        width: '50px',
        height: '50px',
        background: 'transparent',
        borderRadius: '50%',
        boxShadow: '-25px 25px #121212',
        zIndex: -1,
      },
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-30px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '70px',
      height: '70px',
      backgroundColor: '#121212',
      borderRadius: '50%',
      zIndex: 0,
    }
  },
  '& .MuiBottomNavigationAction-root': {
    color: '#ffffff',
    '& .MuiBottomNavigationAction-label': {
      color: '#ffffff',
      fontSize: '10px',
      opacity: 1,
      transition: 'color 0.3s ease', 
    },
    '& .MuiAvatar-root': {
      width: 30,
      height: 30,
      transition: 'all 0.3s ease',
    },
    '&:focus': {
      outline: 'none',
    },
    minWidth: 'unset',
    padding: '6px 0',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
}));

export default function LabelBottomNavigation() {
  const location = useLocation();
  const [value, setValue] = React.useState(location.pathname);

  React.useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <StyledBottomNavigation 
      value={value} 
      onChange={handleChange}
      showLabels
    >
      <BottomNavigationAction 
        component={Link}
        to="/profile"
        label="Profile" 
        value="/profile" 
        icon={<Avatar src={profile} />}
      />
      <BottomNavigationAction
        component={Link}
        to="/task"
        label="Tasks"
        value="/task"
        icon={<Avatar src={task} />}
      />
      <BottomNavigationAction
        component={Link}
        to="/"
        label="Games"
        value="/"
        icon={<Avatar src={drive} />}
      />
      <BottomNavigationAction
        component={Link}
        to="/refer"
        label="Refer"
        value="/refer"
        icon={<Avatar src={friend} />}
      />
      {/* <BottomNavigationAction
        component={Link}
        to="/ads"
        label="Ads"
        value="/ads"
        icon={<Avatar src={about} />}
      /> */}
    </StyledBottomNavigation>
  );
}

