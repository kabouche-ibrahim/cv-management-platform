import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  Box,
  AppBar,
  Toolbar,
  Typography
} from '@mui/material';
import Register from '../auth/Register';
import { authService } from '../../services/authService';

const AdminDashboard = () => {
  const [hrUsers, setHrUsers] = useState([]);
  const [openRegister, setOpenRegister] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchHRUsers();
  }, []);

  const fetchHRUsers = async () => {
    try {
      const response = await authService.getHRUsers();
      setHrUsers(response.data);
    } catch (error) {
      console.error('Error fetching HR users:', error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await authService.deleteUser(userId);
      setHrUsers(hrUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setOpenRegister(true);
  };

  const handleClose = () => {
    setOpenRegister(false);
    setEditUser(null);
    fetchHRUsers(); 
  };

  return (
    <Box>
      <AppBar position="fixed" sx={{ background: 'linear-gradient(to right, #2C3E50, #3F5973)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CV Management - Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3, mt: 8 }}> 
        <Button 
          variant="contained" 
          onClick={() => setOpenRegister(true)}
          sx={{ mb: 2 }}
        >
          Create HR User
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hrUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button 
                      onClick={() => handleEdit(user)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => handleDelete(user.id)}
                      color="error"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog 
          open={openRegister} 
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
        >
          <Register 
            isHRCreation={true}
            editUser={editUser}
            onClose={handleClose}
          />
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminDashboard;