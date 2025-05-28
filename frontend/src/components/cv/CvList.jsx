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
  Box,
  Chip,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import NavBar from '../navbar/NavBar';
import { useParams } from 'react-router-dom';
import UploadCVDialog from '../upload/UploadCVDialog';
import { jobOfferService } from '../../services/jobOfferService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Styled components for a professional look
const MainPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(10),
  marginBottom: theme.spacing(6),
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: '95%',
  width: '100%', 
  background: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
}));

const TableHeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  background: theme.palette.grey[100],
  color: theme.palette.primary.main,
  textTransform: 'uppercase',
  fontSize: 15,
}));

const TableRowStyled = styled(TableRow)(({ theme }) => ({
  transition: 'background 0.2s',
  '&:hover': {
    background: theme.palette.action.hover,
  },
}));

const ScoreChip = styled(Chip)(({ theme, score }) => ({
  fontWeight: 600,
  backgroundColor:
    score >= 0.8
      ? theme.palette.success.light
      : score >= 0.6
      ? theme.palette.info.light
      : score >= 0.4
      ? theme.palette.warning.light
      : theme.palette.error.light,
  color:
    score >= 0.8
      ? theme.palette.success.contrastText
      : score >= 0.6
      ? theme.palette.info.contrastText
      : score >= 0.4
      ? theme.palette.warning.contrastText
      : theme.palette.error.contrastText,
}));

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
  const [scores, setScores] = useState({});

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [offerId, scores]);

  useEffect(() => {
    const loadScores = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/recommendation/${offerId}`);
        const scoreMap = {};
        response.data.forEach(([cvId, scores], index) => {
          scoreMap[cvId] = {
            ...scores,
            rank: index + 1
          };
        });
        setScores(scoreMap);
      } catch (error) {
        console.error('Error loading scores:', error);
      }
    };
    loadScores();
  }, [offerId]);

  const handleViewCV = (cvUrl) => {
    window.open(cvUrl, '_blank');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [cvsResponse, testsResponse, jobOfferResponse] = await Promise.all([
        jobOfferService.getCvsByJobOfferId(offerId),
        axios.get('http://localhost:4000/tests'),
        jobOfferService.getJobOfferById(offerId)
      ]);
      setJobOffer(jobOfferResponse);

      const formattedCvs = cvsResponse.map(application => ({
        ...application.user,
        applications: [{
          jobOffer: application.jobOffer
        }]
      }));

      // Sort CVs based on scores (if available)
      const sortedCvs = [...formattedCvs].sort((a, b) => {
        const scoreA = scores[a.cvId]?.combined || 0;
        const scoreB = scores[b.cvId]?.combined || 0;
        return scoreB - scoreA; // Descending order
      });

      setCvs(sortedCvs);
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

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 4, mt: 8 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );

  return (
    <>
      <NavBar />
      <Box sx={{ background: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <MainPaper>
          {jobOffer ? (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                {jobOffer.jobName}
              </Typography>
              <Box
                sx={{
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  p: 2,
                  mb: 2,
                  background: '#fafbfc'
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {jobOffer.description || '*No description provided*'}
                </ReactMarkdown>
              </Box>
              <Typography variant="subtitle1" color="text.secondary">
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
              sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload CVs
            </Button>
          )}

          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, width: '100%', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Rank</TableHeaderCell>
                  <TableHeaderCell>Full Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>CV ID</TableHeaderCell>
                  <TableHeaderCell>Job Offer</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                  <TableHeaderCell>Score</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cvs.map((cv) => (
                  <TableRowStyled key={cv.cvId}>
                    <TableCell>
                      <Chip
                        label={scores[cv.cvId]?.rank || 'N/A'}
                        color="primary"
                        sx={{ fontWeight: 600 }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{cv.firstName || 'No Name'}</Typography>
                    </TableCell>
                    <TableCell>{cv.email || 'No Email'}</TableCell>
                    <TableCell>{cv.cvId}</TableCell>
                    <TableCell>
                      <Typography color="primary" fontWeight={600}>
                        {cv.applications?.[0]?.jobOffer?.jobName || 'No Job Offer'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          onClick={() => handleViewCV(cv.cvUrl)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          View CV
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => {
                            setCurrentCv(cv);
                            setOpen(true);
                          }}
                          disabled={!cv.applications?.[0]?.jobOffer}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          Generate Test Link
                        </Button>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {scores[cv.cvId] ? (
                        <ScoreChip
                          label={`${(scores[cv.cvId].combined * 100).toFixed(1)}%`}
                          score={scores[cv.cvId].combined}
                          size="small"
                        />
                      ) : (
                        <Chip label="N/A" color="default" size="small" />
                      )}
                    </TableCell>
                  </TableRowStyled>
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
                  label="Select Test"
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
        </MainPaper>
      </Box>
    </>
  );
};

export default CvList;