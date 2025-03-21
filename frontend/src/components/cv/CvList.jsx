import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box
} from '@mui/material';
import axios from 'axios';
import NavBar from '../navbar/NavBar';
import { useParams } from 'react-router-dom';
import UploadCVDialog from '../upload/UploadCVDialog';
import { jobOfferService } from '../../services/jobOfferService';

const CvList = () => {
  const [cvs, setCvs] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [open, setOpen] = useState(false);
  const [currentCv, setCurrentCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { offerId } = useParams();
  const [jobOffer, setJobOffer] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [offerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cvsResponse, testsResponse, jobOfferResponse] = await Promise.all([
        jobOfferService.getCvsByJobOfferId(offerId),
        axios.get('http://localhost:4000/tests'),
        jobOfferService.getJobOfferById(offerId)
      ]);
  
      console.log('Fetched CVs:', cvsResponse);
      console.log('Fetched Tests:', testsResponse.data);
      console.log('Fetched Job Offer:', jobOfferResponse);
  
      setJobOffer(jobOfferResponse);
      
      // Update the formatting to match the new response structure
      const formattedCvs = cvsResponse.map(application => ({
        ...application.user,
        applications: [{
          jobOffer: application.jobOffer
        }]
      }));
  
      setCvs(formattedCvs);
      setTests(testsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      if (!currentCv || !selectedTest) {
        alert('Please select a test first');
        return;
      }
  
      const testLink = `${selectedTest}-${currentCv.applications[0].jobOffer.id}-${currentCv.cvId}`;
      const testUrl = `${window.location.origin}/take-test/${testLink}`;
      
      navigator.clipboard.writeText(testUrl);
      alert('Test link copied to clipboard!');
      setOpen(false);
    } catch (error) {
      console.error('Error generating test link:', error);
      alert('Error generating test link');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <NavBar />
      <Box sx={{ p: 4, mt: 8 }}>
        {jobOffer ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              {jobOffer.jobName}
            </Typography>
            <Typography variant="body1" paragraph>
              {jobOffer.description}
            </Typography>
            <Typography variant="subtitle1">
              Required Education: {jobOffer.educationNeeded}
            </Typography>
          </Box>
        ) : (
          <Typography variant="h4" gutterBottom>
            CV List
          </Typography>
        )}

        {offerId && (
          <Button
            variant="contained"
            sx={{ mb: 3 }}
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload CVs
          </Button>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>CV ID</TableCell>
                <TableCell>Job Offer</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cvs.map((cv) => (
                <TableRow key={cv.cvId}>
                  <TableCell>{cv.firstName || 'No Name'}</TableCell>
                  <TableCell>{cv.email || 'No Email'}</TableCell>
                  <TableCell>{cv.cvId}</TableCell>
                  <TableCell>
                    {cv.applications?.[0]?.jobOffer?.jobName || 'No Job Offer'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        setCurrentCv(cv);
                        setOpen(true);
                      }}
                      disabled={!cv.applications?.[0]?.jobOffer}
                    >
                      Generate Test Link
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Generate Test Link</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Test</InputLabel>
              <Select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
              >
                {tests
                  .filter(test => test.jobOfferId === currentCv?.applications?.[0]?.jobOffer?.id)
                  .map(test => (
                    <MenuItem key={test.id} value={test.id}>
                      {test.testTitle}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleGenerateLink} 
              disabled={!selectedTest}
              variant="contained"
            >
              Generate Link
            </Button>
          </DialogActions>
        </Dialog>

        <UploadCVDialog 
          open={uploadDialogOpen}
          handleClose={() => setUploadDialogOpen(false)}
          isHR={true}
          jobOfferId={offerId}
        />
      </Box>
    </>
  );
};

export default CvList;