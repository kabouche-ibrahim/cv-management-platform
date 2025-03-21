import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';

const CreateJobOffer = ({ open, handleClose, onSubmit, initialData = null }) => {
  const [jobOffer, setJobOffer] = useState({
    jobName: '',
    description: '',
    educationNeeded: ''
  });

  useEffect(() => {
    if (initialData) {
      setJobOffer({
        jobName: initialData.jobName,
        description: initialData.description,
        educationNeeded: initialData.educationNeeded
      });
    } else {
      setJobOffer({
        jobName: '',
        description: '',
        educationNeeded: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setJobOffer({
      ...jobOffer,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    onSubmit(jobOffer);
    handleClose();
    setJobOffer({
      jobName: '',
      description: '',
      educationNeeded: ''
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Update Job Offer' : 'Create New Job Offer'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Job Title"
            name="jobName"
            value={jobOffer.jobName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            name="description"
            value={jobOffer.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Education Required"
            name="educationNeeded"
            value={jobOffer.educationNeeded}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateJobOffer;