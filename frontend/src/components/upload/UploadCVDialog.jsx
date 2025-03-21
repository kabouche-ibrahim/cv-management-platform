import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadCVDialog = ({ open, handleClose, isHR, jobOfferId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    if (isHR) {
      setFiles(Array.from(event.target.files));
    } else {
      setFiles([event.target.files[0]]);
    }
  };

  const handleUpload = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isHR && files.length > 0) {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });
        
        // Fix: Use correct parameter name 'files' instead of 'file'
        await axios.post(`http://localhost:8000/upload-resumes-hr/${jobOfferId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      } else if (!isHR && files.length === 1) {
        const formData = new FormData();
        formData.append('file', files[0]);
        
        await axios.post('http://localhost:8000/upload-resume', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      }
  
      handleClose();
      setFiles([]);
    } catch (err) {
      setError('Failed to upload CV(s). Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{isHR ? 'Upload CVs' : 'Upload CV'}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            padding: 2,
            border: '2px dashed #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f1f1f1',
            },
          }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: '#1976d2' }} />
          <Typography variant="body1">
            {isHR ? 'Select files to upload' : 'Select a file to upload'}
          </Typography>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx"
            multiple={isHR}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {files.length > 0 && (
            <Typography variant="body2" color="textSecondary">
              {files.length} file(s) selected
            </Typography>
          )}
          {error && <Typography variant="body2" color="error">{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleUpload} 
          disabled={files.length === 0 || loading}
          variant="contained"
          color="primary"
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadCVDialog;