import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { testService } from '../../services/testService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Styled components for a professional look
const MainPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  marginTop: theme.spacing(10),
  marginBottom: theme.spacing(6),
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: 900,
  background: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
}));

const QuestionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  background: theme.palette.background.paper,
  transition: 'box-shadow 0.2s, transform 0.2s',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px) scale(1.01)',
  },
}));

const AnswerChip = styled(Chip)(({ theme, correct }) => ({
  marginRight: theme.spacing(1),
  backgroundColor: correct
    ? theme.palette.success.light
    : theme.palette.grey[200],
  color: correct
    ? theme.palette.success.contrastText
    : theme.palette.text.primary,
  fontWeight: correct ? 700 : 400,
  border: correct ? `1.5px solid ${theme.palette.success.main}` : undefined,
}));

const TestView = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [totalGrade, setTotalGrade] = useState(0);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await testService.getTestById(id);
        setTest(data);
        const total = data.questions.reduce(
          (sum, question) => sum + (question.defaultGrade || 0),
          0
        );
        setTotalGrade(total);
      } catch (error) {
        console.error('Error fetching test:', error);
      }
    };
    fetchTest();
  }, [id]);

  if (!test)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );

  return (
    <MainPaper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {test.testTitle}
        </Typography>
        <Chip
          label={`Total Grade: ${totalGrade} points`}
          color="primary"
          sx={{ fontSize: '1.1rem', fontWeight: 600 }}
        />
      </Box>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Test ID: {test.id}
      </Typography>
      <Typography variant="body1" sx={{ my: 2 }}>
        {test.testDescription}
      </Typography>
      <Divider sx={{ my: 3 }} />

      {test.questions.map((question, index) => (
        <QuestionPaper key={question.id}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Question {index + 1}: {question.questionText}
            </Typography>
            <Chip
              label={`${question.defaultGrade || 0} points`}
              color="secondary"
              size="small"
              sx={{ ml: 2, fontWeight: 600 }}
            />
          </Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Type: <b>{question.questionType}</b>
          </Typography>
          <List>
            {question.answers.map((answer) => (
              <ListItem key={answer.id} disableGutters>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AnswerChip
                    label={answer.answerValue}
                    correct={answer.answerIsCorrect ? 1 : 0}
                    icon={
                      answer.answerIsCorrect ? (
                        <Tooltip title="Correct answer">
                          <CheckCircleIcon color="success" fontSize="small" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Incorrect answer">
                          <CancelIcon color="disabled" fontSize="small" />
                        </Tooltip>
                      )
                    }
                  />
                  <Typography variant="body2" color={answer.answerIsCorrect ? 'success.main' : 'text.secondary'}>
                    {answer.answerIsCorrect ? 'Correct' : ''}
                  </Typography>
                </Stack>
              </ListItem>
            ))}
          </List>
        </QuestionPaper>
      ))}
    </MainPaper>
  );
};

export default TestView;