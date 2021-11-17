import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/styles';
import Route from './Route';
import { navigate } from 'hookrouter';


const useStyle = makeStyles({
  appbar: {
    height: '8%',
    marginBottom: '5px'
  },
  container: {
    height: '90%'
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