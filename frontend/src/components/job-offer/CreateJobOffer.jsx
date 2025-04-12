import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack, 
  Chip,
  Typography    
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MDEditor from '@uiw/react-md-editor';


const CreateJobOffer = ({ open, handleClose, onSubmit, initialData = null }) => {
  const [jobOffer, setJobOffer] = useState({
    jobName: '',
    description: '',
    educationNeeded: '',
    skills: []
  });
  const [currentSkill, setCurrentSkill] = useState('');

  useEffect(() => {
    if (initialData) {
      // Safely handle offerSkills whether they exist or not
      const skillsList = initialData.offerSkills 
        ? initialData.offerSkills.map(item => item.skill?.skillName || '') 
        : initialData.skills || [];
        
      setJobOffer({
        jobName: initialData.jobName || '',
        description: initialData.description || '',
        educationNeeded: initialData.educationNeeded || '',
        skills: skillsList
      });
    } else {
      setJobOffer({
        jobName: '',
        description: '',
        educationNeeded: '',
        skills: []
      });
    }
  }, [initialData]);


  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      setJobOffer({
        ...jobOffer,
        skills: [...jobOffer.skills, currentSkill.trim()]
      });
      setCurrentSkill('');
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setJobOffer({
      ...jobOffer,
      skills: jobOffer.skills.filter(skill => skill !== skillToDelete)
    });
  };

  const handleChange = (e) => {
    if (e && e.target) {
      
      setJobOffer({
        ...jobOffer,
        [e.target.name]: e.target.value
      });
    } else {
     
      setJobOffer({
        ...jobOffer,
        description: e
      });
    }
  };

  const handleSubmit = () => {
    onSubmit(jobOffer);
    handleClose();
    setJobOffer({
      jobName: '',
      description: '',
      educationNeeded: '',
      skills: []
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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

          <Box data-color-mode="light" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Description:
            </Typography>
            <MDEditor
              value={jobOffer.description}
              onChange={handleChange}
              height={200}
            />
            <Typography variant="caption" color="text.secondary">
              Use the toolbar above for formatting or write Markdown directly
            </Typography>
          </Box>

          <Box sx={{ 
              border: '1px solid #ccc', 
              borderRadius: '4px', 
              p: 2, 
              mb: 2,
              minHeight: '100px'
            }}> 
              <Typography variant="subtitle2" gutterBottom>
                Preview:
              </Typography>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {jobOffer.description || '*Nothing to preview*'}
              </ReactMarkdown>
          </Box>

          <TextField
            fullWidth
            label="Education Required"
            name="educationNeeded"
            value={jobOffer.educationNeeded}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Add Skills"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            onKeyPress={handleAddSkill}
            placeholder="Type a skill and press Enter"
            sx={{ mb: 2 }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {jobOffer.skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                onDelete={() => handleDeleteSkill(skill)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Stack>
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