import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  Alert,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NavBar from '../navbar/NavBar';
import { testService } from '../../services/testService';

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

const AnswerBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const TestResults = () => {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  const toggleSubmissionDetails = (submissionId) => {
    setExpandedSubmission(expandedSubmission === submissionId ? null : submissionId);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) throw new Error('Test ID is undefined');
        setLoading(true);
        const [testData, resultsData] = await Promise.all([
          testService.getTestById(id),
          testService.getTestResults(id),
        ]);
        setTest(testData);
        setResults(resultsData);
      } catch (error) {
        setError('Failed to load test results');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Function to calculate percentage from score and maxScore
  const calculatePercentage = (score, maxScore) => {
    if (!maxScore || maxScore === 0) return 0;
    return parseFloat(((score / maxScore) * 100).toFixed(1));
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'primary';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  const handleViewCV = (cvUrl) => {
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 4, mt: 8 }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <>
      <NavBar />
      <Box sx={{ background: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <MainPaper>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            Test Results: {test?.testTitle || 'Unknown Test'}
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            {test?.testDescription}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip
              label={`Total Questions: ${test?.questions?.length || 0}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Total Submissions: ${results.length}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Max Possible Score: ${test?.questions?.reduce((sum, q) => sum + q.defaultGrade, 0) || 0}`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </MainPaper>

        {results.length === 0 ? (
          <Alert severity="info" sx={{ mt: 4 }}>No submissions found for this test.</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Score</TableHeaderCell>
                  <TableHeaderCell>Percentage</TableHeaderCell>
                  <TableHeaderCell>Submission Date</TableHeaderCell>
                  <TableHeaderCell align="center">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => {
                  const percentage = calculatePercentage(result.score, result.maxScore);
                  return (
                    <React.Fragment key={result.id}>
                      <TableRowStyled>
                        <TableCell>{`${result.user?.firstName || ''} ${result.user?.lastName || ''}`}</TableCell>
                        <TableCell>{result.user?.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Typography color="primary" fontWeight={600}>
                            {`${result.score} / ${result.maxScore}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${percentage}%`}
                            color={getScoreColor(percentage)}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>{new Date(result.submittedAt).toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => toggleSubmissionDetails(result.id)}
                              sx={{ borderRadius: 2, fontWeight: 600 }}
                            >
                              {expandedSubmission === result.id ? 'Hide Answers' : 'View Answers'}
                            </Button>
                            {result.user?.cvUrl && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleViewCV(result.user.cvUrl)}
                                sx={{ borderRadius: 2, fontWeight: 600 }}
                              >
                                View CV
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRowStyled>
                      {expandedSubmission === result.id && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <AnswerBox>
                              <Typography variant="h6" gutterBottom>
                                Submitted Answers
                              </Typography>
                              {test.questions.map((question) => {
                                const userAnswer = result.userAnswers?.find(
                                  a => a.userQuestionId === question.id
                                );
                                return (
                                  <Box key={question.id} sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {question.questionText}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                      Type: {question.questionType}
                                    </Typography>
                                    {userAnswer ? (
                                      <Box>
                                        {question.questionType === 'mcq' || question.questionType === 'boolean' ? (
                                          <Typography>
                                            Selected: {userAnswer.answer?.answerValue}
                                            {userAnswer.answer?.answerIsCorrect && (
                                              <Chip label="Correct" color="success" size="small" sx={{ ml: 1 }} />
                                            )}
                                          </Typography>
                                        ) : (
                                          <Typography>
                                            Answer: {userAnswer.answer?.answerValue}
                                          </Typography>
                                        )}
                                      </Box>
                                    ) : (
                                      <Typography color="error">No answer submitted</Typography>
                                    )}
                                  </Box>
                                );
                              })}
                            </AnswerBox>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
};

export default TestResults;