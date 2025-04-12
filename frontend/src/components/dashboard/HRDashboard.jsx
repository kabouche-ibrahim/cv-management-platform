import React, { useState, useEffect } from 'react';
import { jobOfferService } from '../../services/jobOfferService';
import CreateJobOffer from '../job-offer/CreateJobOffer';
import NavBar from '../navbar/NavBar';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const HRDashboard = () => {
  const [jobOffers, setJobOffers] = useState([]);
  const [selectedJobOffer, setSelectedJobOffer] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOffers, setFilteredOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadJobOffers();
  }, []);

  useEffect(() => {
    filterJobOffers();
  }, [searchTerm, jobOffers]);

  const handleEditJobOffer = async (jobOfferData) => {
    try {
      console.log('Updating job offer:', selectedJobOffer.id, jobOfferData); // Add logging
      const updatedOffer = await jobOfferService.updateJobOffer(selectedJobOffer.id, jobOfferData);
      console.log('Update response:', updatedOffer); // Add logging
      await loadJobOffers();
      setSelectedJobOffer(null);
      setOpenCreateDialog(false);
    } catch (error) {
      console.error('Error updating job offer:', error);
    }
  };

  const loadJobOffers = async () => {
    try {
      const data = await jobOfferService.getAllJobOffers();
      
      const formattedData = data.map(offer => ({
        id: offer.id,
        jobName: offer.jobName,
        description: offer.description,
        educationNeeded: offer.educationNeeded,
        skills: offer.offerSkills?.map(os => os.skill.skillName) || []
      }));
      setJobOffers(formattedData);
      setFilteredOffers(formattedData); 
    } catch (error) {
      console.error('Error loading job offers:', error);
    }
  };

  const handleCreateJobOffer = async (jobOfferData) => {
    try {
      await jobOfferService.createJobOffer(jobOfferData);
      await loadJobOffers(); 
      setOpenCreateDialog(false); 
    } catch (error) {
      console.error('Error creating job offer:', error);
    }
  };

  const handleDeleteJobOffer = async (id) => {
    if (window.confirm('Are you sure you want to delete this job offer? This action cannot be undone.')) {
      try {
        await jobOfferService.deleteJobOffer(id);
        await loadJobOffers();
        // Show success message
        alert('Job offer deleted successfully');
      } catch (error) {
        console.error('Error deleting job offer:', error);
        // Show error message to user
        alert(error.response?.data?.message || 'Error deleting job offer. Please try again.');
      }
    }
  };

  const filterJobOffers = () => {
    const filtered = jobOffers.filter(offer =>
      offer.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.educationNeeded.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOffers(filtered);
  };

  const handleJobOfferClick = (offerId) => {
    navigate(`/job-offer/${offerId}/cvs`);
  };

  return (
    <>
      <NavBar />
      <Box sx={{ 
        padding: '150px 20px 20px 20px', 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh' 
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h4" component="h1">
            Job Offers Management
          </Typography>
          <Button
            variant="contained"
            onClick={() => setOpenCreateDialog(true)}
            sx={{ mb: 2 }}
          >
            Create Job Offer
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search job offers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="job offers table">
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Education Required</TableCell>
                <TableCell>Skills Required</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {filteredOffers.map((offer) => (
                <TableRow 
                  key={offer.id}
                  onClick={() => handleJobOfferClick(offer.id)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <TableCell>{offer.jobName}</TableCell>
                  <TableCell>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {offer.description}
                    </ReactMarkdown>
                  </TableCell>
                  <TableCell>{offer.educationNeeded}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {offer.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteJobOffer(offer.id)}}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          setSelectedJobOffer(offer);
                          setOpenCreateDialog(true);
                        }}
                      >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <CreateJobOffer
          open={openCreateDialog}
          handleClose={() => {
            setOpenCreateDialog(false);
            setSelectedJobOffer(null);
          }}
          onSubmit={selectedJobOffer ? handleEditJobOffer : handleCreateJobOffer}
          initialData={selectedJobOffer}
        />
      </Box>
    </>
  );
};

export default HRDashboard;