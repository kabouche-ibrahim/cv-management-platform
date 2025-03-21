import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import UploadCVDialog from '../upload/UploadCVDialog';

const NavBar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleDashboardClick = () => {
    const userRole = authService.getUserRole();
    switch(userRole) {
      case 'ADMIN':
        navigate('/dashboard/admin');
        break;
      case 'HR':
        navigate('/dashboard/hr');
        break;
      default:
        navigate('/dashboard/hr');  
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  //background: 'linear-gradient(to right, #000046, #1CB5E0)','#1a237e', background: 'linear-gradient(to right, #2C3E50, #3F5973)',

  return (
    <>
      <AppBar position="fixed" sx={{ background: 'linear-gradient(to right, #2C3E50, #3F5973)' }}> 
        <Toolbar>
        <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            }}
            onClick={handleDashboardClick}
          >
            CV Management
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, color: '#ECF0F1' }}>
            <Button sx={{ color: '#ECF0F1' }} onClick={() => navigate('/test-builder')}>Create Test</Button>
            <Button color="inherit" onClick={() => navigate('/tests')}>Tests</Button>
            <Button sx={{ color: '#ECF0F1'}} onClick={handleLogout}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <UploadCVDialog 
        open={openUploadDialog}
        handleClose={() => setOpenUploadDialog(false)}
        isHR={true}
      />
    </>
  );
};

export default NavBar;