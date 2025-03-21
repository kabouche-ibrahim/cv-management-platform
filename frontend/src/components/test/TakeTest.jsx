import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField
} from '@mui/material';
import axios from 'axios';
import { testService } from '../../services/testService';

const TakeTest = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [sqlAnswers, setSqlAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [cvUserId, setCvUserId] = useState(null);
  const [userId, setUserId] = useState(null);


  useEffect(() => {
    loadTest();
  }, [uuid]);

  const loadTest = async () => {
    try {
      console.log('Full UUID:', uuid); // Debugging UUID extraction

        // Extract cvId from UUID
        const parts = uuid.split('-');
        const cvId = parts.slice(2).join('-');  

        console.log('Extracted cvId:', cvId); // Debugging cvId extraction
      // Get test using the entire uuid as testLink
      const data = await testService.getTestByLink(uuid);
      setTest(data);
      
      // Extract cvId from UUID
     
      console.log('Extracted cvId:', cvId);
      
      if (cvId) {
        try {
          const userResponse = await axios.get(`http://localhost:4000/users/by-cv/${cvId}`);
          console.log("✅ User Response:", userResponse.data);
        
          if (userResponse.data) {
            setUserId(userResponse.data.id);
            console.log("✅ Set User ID:", userResponse.data.id); 
          } else {
            console.error("❌ User response is empty:", userResponse);
          }
        } catch (error) {
          console.error("❌ Error loading user:", error.response?.data || error.message);
        }
      }
    } catch (error) {
      console.error('Error loading test:', error);
    } finally {
      setLoading(false);
    }
};

  

  const handleSubmit = async () => {
    if (!userId) {
      alert('Error: Unable to identify the user associated with this test link');
      return;
    }

    try {
      const allAnswers = test.questions.map(question => {
        switch (question.questionType) {
          case 'mcq':
          case 'boolean':
            return {
              questionId: question.id,
              answerId: parseInt(answers[question.id])
            };
          case 'text':
            return {
              questionId: question.id,
              answerText: textAnswers[question.id]
            };
          case 'coding':
            return {
              questionId: question.id,
              sqlAnswer: sqlAnswers[question.id]
            };
          default:
            return null;
        }
      }).filter(answer => answer !== null);

      await testService.submitTest({
        testId: test.id,
        userId: userId,
        answers: allAnswers
      });

      alert('Test submitted successfully!');
      navigate('/'); 
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test: ' + error.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (!test) return <Typography>Test not found</Typography>;

  const renderQuestion = (question) => {
    switch (question.questionType) {
      case 'mcq':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
          >
            {question.answers.map((answer) => (
              <FormControlLabel
                key={answer.id}
                value={answer.id.toString()}
                control={<Radio />}
                label={answer.answerValue}
              />
            ))}
          </RadioGroup>
        );

      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={textAnswers[question.id] || ''}
            onChange={(e) => setTextAnswers({
              ...textAnswers,
              [question.id]: e.target.value
            })}
            placeholder="Enter your answer here"
          />
        );

      case 'boolean':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
            >
              <FormControlLabel value="true" control={<Radio />} label="True" />
              <FormControlLabel value="false" control={<Radio />} label="False" />
            </RadioGroup>
          </FormControl>
        );

      case 'coding':
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Write your SQL query below:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={sqlAnswers[question.id] || ''}
              onChange={(e) => setSqlAnswers({
                ...sqlAnswers,
                [question.id]: e.target.value
              })}
              placeholder="Write your SQL query here"
            />
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );

  if (!test) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography>Test not found</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>{test.testTitle}</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>{test.testDescription}</Typography>

        {test.questions.map((question) => (
          <Box key={question.id} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{question.questionText}</Typography>
            {renderQuestion(question)}
          </Box>
        ))}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          size="large"
          sx={{ mt: 3 }}
        >
          Submit Test
        </Button>
      </Paper>
    </Box>
  );
};

export default TakeTest;