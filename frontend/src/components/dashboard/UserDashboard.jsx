import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  CircularProgress, 
  Card, 
  CardContent, 
  CardActions,
  Container,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import UploadCVDialog from '../upload/UploadCVDialog';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jobOfferService } from '../../services/jobOfferService';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
}));

const DescriptionBox = styled(Box)(({ theme }) => ({
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  borderRadius: '4px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  maxHeight: '200px',
  overflow: 'auto',
  '& pre': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1),
    borderRadius: '4px',
    overflow: 'auto',
  },
  '& code': {
    fontFamily: 'monospace',
    backgroundColor: theme.palette.grey[100],
    padding: '2px 4px',
    borderRadius: '4px',
  },
}));

const UserDashboard = () => {
  const [openUpload, setOpenUpload] = useState(false);
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJobOffer, setSelectedJobOffer] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchJobOffers = async () => {
      try {
        setLoading(true);
        const response = await jobOfferService.getAllJobOffers();
        
        const formattedOffers = response.map(offer => ({
          id: offer.id,
          jobName: offer.jobName,
          description: offer.description,
          educationNeeded: offer.educationNeeded,
          skills: offer.offerSkills?.map(os => os.skill.skillName) || []
        }));
        
        setJobOffers(formattedOffers);
        setError(null);
      } catch (err) {
        console.error('Error fetching job offers:', err);
        setError('Failed to load job offers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobOffers();
  }, []);

  const handleSelectJobOffer = (jobOffer) => {
    setSelectedJobOffer(jobOffer);
    setOpenUpload(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ 
        mb: 4,
        textAlign: 'center',
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'white',
        p: 3,
        borderRadius: 2,
        boxShadow: 3
      }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Explore Our available Job Offers
        </Typography>
        <Typography variant="subtitle1">
          Find your perfect match from our curated list of job positions
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : error ? (
        <Paper sx={{ 
          p: 3, 
          bgcolor: 'error.light', 
          my: 2,
          textAlign: 'center'
        }}>
          <Typography color="error.dark" variant="h6">
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Paper>
      ) : jobOffers.length === 0 ? (
        <Paper sx={{ 
          p: 4, 
          my: 2,
          textAlign: 'center',
          bgcolor: 'background.default'
        }}>
          <Typography variant="h6" color="text.secondary">
            No job offers available at this time. Please check back later.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {jobOffers.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job.id}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main'
                    }}
                  >
                    {job.jobName}
                  </Typography>
                  
                  <DescriptionBox>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {job.description || 'No description available'}
                    </ReactMarkdown>
                  </DescriptionBox>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Education Requirements:
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {job.educationNeeded || 'Not specified'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Required Skills:
                  </Typography>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    {job.skills && job.skills.length > 0 ? (
                      job.skills.map((skill, index) => (
                        <SkillChip 
                          key={index}
                          label={skill}
                          size="small"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No specific skills listed
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleSelectJobOffer(job)}
                    sx={{
                      px: 4,
                      py: 1,
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                    fullWidth
                  >
                    Apply Now
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedJobOffer && (
        <UploadCVDialog
          open={openUpload}
          handleClose={() => {
            setOpenUpload(false);
            setSelectedJobOffer(null);
          }}
          isHR={false}
          jobOfferId={selectedJobOffer.id}
        />
      )}
    </Container>
  );
};

export default UserDashboard;