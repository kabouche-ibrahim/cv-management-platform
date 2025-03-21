import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import UploadCVDialog from '../upload/UploadCVDialog';

const NavBarUser = () => {
  const navigate = useNavigate();
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  //background: 'linear-gradient(to right, #000046, #1CB5E0)','#1a237e', background: 'linear-gradient(to right, #2C3E50, #3F5973)',

  return (
    <>
      <AppBar position="fixed" sx={{ background: 'linear-gradient(to right, #2C3E50, #3F5973)' }}> 
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CV Management
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, color: '#ECF0F1' }}>
            <Button 
              sx={{ color: '#ECF0F1'}}
              onClick={() => setOpenUploadDialog(true)}
            >
              Upload CV
            </Button>
            <Button sx={{ color: '#ECF0F1'}} onClick={handleLogout}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <UploadCVDialog 
        open={openUploadDialog}
        handleClose={() => setOpenUploadDialog(false)}
        isHR={false}
      />
    </>
  );
};

export default NavBarUser;

