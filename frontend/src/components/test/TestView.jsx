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
  Chip 
} from '@mui/material';
import { testService } from '../../services/testService';

const TestView = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [totalGrade, setTotalGrade] = useState(0);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await testService.getTestById(id);
        setTest(data);
       
        const total = data.questions.reduce((sum, question) => sum + (question.defaultGrade || 0), 0);
        setTotalGrade(total);
      } catch (error) {
        console.error('Error fetching test:', error);
      }
    };
    fetchTest();
  }, [id]);

  if (!test) return <div>Loading...</div>;

  return (
    <Paper sx={{ p: 3, m: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          {test.testTitle}
        </Typography>
        <Chip 
          label={`Total Grade: ${totalGrade} points`}
          color="primary"
          sx={{ fontSize: '1.1rem' }}
        />
      </Box>
      
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Test ID: {test.id}
      </Typography>
      <Typography variant="body1" sx={{ my: 2 }}>
        {test.testDescription}
      </Typography>
      <Divider sx={{ my: 2 }} />
      
      {test.questions.map((question, index) => (
        <Box key={question.id} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Question {index + 1}: {question.questionText}
            </Typography>
            <Chip 
              label={`${question.defaultGrade || 0} points`}
              color="secondary"
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
          
          <Typography color="textSecondary" sx={{ mt: 1 }}>
            Type: {question.questionType}
          </Typography>
          
          <List>
            {question.answers.map((answer) => (
              <ListItem key={answer.id}>
                <ListItemText
                  primary={answer.answerValue}
                  secondary={`Correct: ${answer.answerIsCorrect ? 'Yes' : 'No'}`}
                />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      ))}
    </Paper>
  );
};

export default TestView;