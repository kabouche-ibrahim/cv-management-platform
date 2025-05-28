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
  Typography,
  IconButton,
  Box,
  Badge,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services/testService';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NavBar from '../navbar/NavBar';

// Styled components for professional look
const MainPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(12),
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

const TestsList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionCounts, setSubmissionCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const data = await testService.getAllTests();
        setTests(data);
        
        // Fetch submission counts for each test
        const counts = {};
        for (const test of data) {
          const results = await testService.getTestResults(test.id);
          counts[test.id] = Array.isArray(results) ? results.length : 0;
        }
        setSubmissionCounts(counts);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setError('Failed to load tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleViewTest = (testId) => {
    navigate(`/tests/${testId}`);
  };

  const handleViewResults = (testId) => {
    navigate(`/tests/${testId}/results`);
  };

  const handleDeleteTest = async (testId) => {
    try {
      await testService.deleteTest(testId);
      setTests(tests.filter(test => test.id !== testId));
    } catch (error) {
      console.error('Error deleting test:', error);
      setError('Failed to delete test');
    }
  };

  // const handleEditTest = (testId) => {
  //   navigate(`/test-builder?edit=${testId}`);
  // };

  if (loading) return <div>Loading tests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <NavBar />
      <Box sx={{ background: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <MainPaper>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
            Tests List
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Job Offer</TableHeaderCell>
                  <TableHeaderCell>Questions</TableHeaderCell>
                  <TableHeaderCell>Submissions</TableHeaderCell>
                  <TableHeaderCell align="center">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tests.map((test) => (
                  <TableRowStyled key={test.id}>
                    <TableCell>{test.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{test.testTitle}</TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                      {test.testDescription}
                    </TableCell>
                    <TableCell>
                      {test.jobOffer?.jobName ? (
                        <Badge
                          color="primary"
                          badgeContent=" "
                          variant="dot"
                          sx={{ mr: 1 }}
                        >
                          <span style={{ fontWeight: 500 }}>{test.jobOffer.jobName}</span>
                        </Badge>
                      ) : (
                        <Typography color="text.secondary" fontStyle="italic">
                          No job offer linked
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography color="primary" fontWeight={600}>
                        {test.questions?.length || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        badgeContent={submissionCounts[test.id] || 0} 
                        color="primary"
                        showZero
                        sx={{ mr: 1 }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewResults(test.id)}
                          startIcon={<AssessmentIcon />}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          View Grades
                        </Button>
                      </Badge>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => handleViewTest(test.id)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          View Test
                        </Button>
                        {/* <IconButton 
                          color="primary"
                          onClick={() => handleEditTest(test.id)}
                        >
                          <EditIcon />
                        </IconButton> */}
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteTest(test.id)}
                          sx={{ borderRadius: 2 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRowStyled>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MainPaper>
      </Box>
    </>
  );
};

export default TestsList;