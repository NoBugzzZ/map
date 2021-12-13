import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { makeStyles } from '@mui/styles';
import Route from './Route';
import { navigate } from 'hookrouter';


const useStyle = makeStyles({
  appbar: {
    height: '64px',
    marginBottom: '5px'
  },
  container: {
    height: '92%',
    padding:'0px'
  },
  link: {
    'text-decoration': 'blink'
  }
})

export default function Layout() {
  const classes = useStyle();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null)
  };

  return (
    <>
      <div className={classes.appbar}>
        <AppBar>
          <Toolbar>
            <IconButton
              color="inherit"
              onClick={handleClick}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          getcontentanchorel={null}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={()=>{
            navigate('/')
            handleClose()
          }}>home</MenuItem>
          <MenuItem onClick={()=>{
            navigate('/map')
            handleClose()
          }}>map</MenuItem>
        </Menu>
      </div>
      <div className={classes.container}>
        <Route/>
      </div>
    </>
  )
}