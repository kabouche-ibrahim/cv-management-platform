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
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services/testService';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NavBar from '../navbar/NavBar';

const TestsList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const data = await testService.getAllTests();
        setTests(data);
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

  const handleDeleteTest = async (testId) => {
    try {
      await testService.deleteTest(testId);
      setTests(tests.filter(test => test.id !== testId));
    } catch (error) {
      console.error('Error deleting test:', error);
      setError('Failed to delete test');
    }
  };

  const handleEditTest = (testId) => {
    navigate(`/test-builder?edit=${testId}`);
  };

  if (loading) return <div>Loading tests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
    <NavBar />
    <Paper sx={{ p: 4, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Tests List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Job Offer</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>{test.id}</TableCell>
                <TableCell>{test.testTitle}</TableCell>
                <TableCell>{test.testDescription}</TableCell>
                <TableCell>{test.jobOffer?.jobName || 'No job offer linked'}</TableCell>
                <TableCell>{test.questions?.length || 0}</TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleViewTest(test.id)}
                  >
                    View Test
                  </Button>
                  <IconButton 
                    color="primary"
                    onClick={() => handleEditTest(test.id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error"
                    onClick={() => handleDeleteTest(test.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
    </>
  );
};

export default TestsList;