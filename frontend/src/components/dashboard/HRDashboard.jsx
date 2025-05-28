import React, { useState, useEffect } from 'react';
import { jobOfferService } from '../../services/jobOfferService';
import CreateJobOffer from '../job-offer/CreateJobOffer';
import NavBar from '../navbar/NavBar';
import {
  Box,
  Paper,
  Button,
  TextField,
  Typography,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem
} from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';

const MainPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  //marginTop: theme.spacing(12),
  background: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
}));

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
      await jobOfferService.updateJobOffer(selectedJobOffer.id, jobOfferData);
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
        educationNeeded: offer.educationNeeded,
        skills: offer.offerSkills?.map(os => os.skill.skillName) || [],
        description: offer.description || '',
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
        alert('Job offer deleted successfully');
      } catch (error) {
        console.error('Error deleting job offer:', error);
        alert(error.response?.data?.message || 'Error deleting job offer. Please try again.');
      }
    }
  };

  const filterJobOffers = () => {
    const filtered = jobOffers.filter(offer =>
      offer.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.educationNeeded.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOffers(filtered);
  };

  const columns = [
    { 
      field: 'jobName', 
      headerName: 'Job Title', 
      flex: 1,
      renderCell: (params) => (
        <Button
          onClick={() => navigate(`/job-offer/${params.id}/cvs`)}
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            textTransform: 'none',
            '&:hover': { textDecoration: 'underline', background: 'transparent' }
          }}
        >
          {params.value}
        </Button>
      )
    },
    { 
      field: 'educationNeeded', 
      headerName: 'Education Required', 
      flex: 1 
    },
    { 
      field: 'skills', 
      headerName: 'Skills Required', 
      flex: 2,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {params.value.map((skill, index) => (
            <SkillChip key={index} label={skill} size="small" />
          ))}
        </Stack>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 200, whiteSpace: 'pre-line', wordBreak: 'break-word' }}
        >
          {params.value}
        </Typography>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteJobOffer(params.id);
          }}
          color="error"
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedJobOffer(jobOffers.find(offer => offer.id === params.id));
            setOpenCreateDialog(true);
          }}
          color="primary"
        />,
      ],
    },
  ];

  return (
    <>
      <NavBar />
      <Box sx={{ 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh', 
        pt: 12, 
        pb: 4 
      }}>
        <MainPaper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Job Offers Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Create Job Offer
            </Button>
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search job offers by title, education, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
          <Paper sx={{ height: 600, width: '100%', borderRadius: 3, boxShadow: 2 }}>
            <DataGrid
              rows={filteredOffers}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              components={{ Toolbar: GridToolbar }}
              componentsProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              sx={{
                borderRadius: 3,
                background: '#fff',
                '& .MuiDataGrid-columnHeaders': {
                  background: (theme) => theme.palette.grey[100],
                  color: (theme) => theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: 15,
                  textTransform: 'uppercase',
                },
                '& .MuiDataGrid-row:hover': {
                  background: (theme) => theme.palette.action.hover,
                },
                '& .MuiDataGrid-cell': {
                  py: 1.5,
                },
              }}
            />
          </Paper>
        </MainPaper>
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