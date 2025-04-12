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
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadTest();
  }, [uuid]);

  const loadTest = async () => {
    try {
      // Extract cvId from UUID
      const parts = uuid.split('-');
      const cvId = parts.slice(2).join('-');  
      
      const data = await testService.getTestByLink(uuid);
      console.log('Received test data with answers:', {
        questions: data.questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          answers: q.answers.map(a => ({
            id: a.id,
            value: a.answerValue,
            isCorrect: a.answerIsCorrect
          }))
        }))
      });
      setTest(data);
      
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

  const calculateGrade = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;
  
    test.questions.forEach((question) => {
      const grade = question.defaultGrade || 1; 
      maxPossibleScore += grade;
  
      // Get all correct answers for this question
      const correctAnswers = question.answers.filter(a => a.answerIsCorrect);
      
      
      console.log(`Question ${question.id} (${question.questionType})`);
      console.log('All answers:', question.answers);
      console.log('Correct answers:', correctAnswers);
  
      switch (question.questionType) {
        case 'mcq':
          const selectedAnswerId = parseInt(answers[question.id]);
          console.log('User selected answer ID:', selectedAnswerId);
          
          // Check if selected answer is among correct answers
          if (correctAnswers.some(a => a.id === selectedAnswerId)) {
            console.log('Correct MCQ answer! Adding', grade, 'points');
            totalScore += grade;
          }
          break;
  
        case 'boolean':
          const userBoolAnswer = answers[question.id]; // 'true' or 'false'
          console.log('User selected boolean:', userBoolAnswer);
          
          // Find the correct boolean answer in all answers
          const correctAnswer = question.answers.find(a => a.answerIsCorrect);
          console.log('Correct boolean answer value:', correctAnswer?.answerValue);
          
          if (correctAnswer && correctAnswer.answerValue === userBoolAnswer) {
            console.log('Correct boolean answer! Adding', grade, 'points');
            totalScore += grade;
          }
          break;
  
        case 'text':
          const userTextAnswer = (textAnswers[question.id] || '').trim().toLowerCase();
          console.log('User text answer:', userTextAnswer);
          
          // Check if user's text matches any correct text answer
          if (correctAnswers.some(a => 
            a.answerValue.trim().toLowerCase() === userTextAnswer
          )) {
            console.log('Correct text answer! Adding', grade, 'points');
            totalScore += grade;
          }
          break;
  
        case 'coding':
          const userSqlAnswer = (sqlAnswers[question.id] || '').trim().toLowerCase();
          console.log('User SQL answer:', userSqlAnswer);
          
          // Check if user's SQL matches the correct SQL answer
          if (correctAnswers.some(a => 
            a.answerValue.trim().toLowerCase() === userSqlAnswer
          )) {
            console.log('Correct SQL answer! Adding', grade, 'points');
            totalScore += grade;
          }
          break;
      }
    });
  
    if (maxPossibleScore <= 0) {
      console.error('Invalid maxScore calculated - setting to 1');
      maxPossibleScore = 1;
    }
  
    return {
      score: totalScore,
      maxScore: maxPossibleScore,
      percentage: (maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0)
    };
  };

  const handleSubmit = async () => {
    if (!userId || !test) {
      alert('Error: Missing required data');
      return;
    }
  
    try {
      // Validate answers
      const unanswered = test.questions.filter(q => {
        switch (q.questionType) {
          case 'mcq':
          case 'boolean':
            return !answers[q.id];
          case 'text':
            return !textAnswers[q.id];
          case 'coding':
            return !sqlAnswers[q.id];
          default:
            return false;
        }
      });
  
      if (unanswered.length > 0) {
        alert('Please answer all questions before submitting');
        return;
      }
  
      const gradeInfo = calculateGrade();
      console.log('Grade calculation:', gradeInfo);
  
      const allAnswers = test.questions.map((question) => {
        const base = { questionId: question.id };
        
        switch (question.questionType) {
          case 'mcq':
            return {
              ...base,
              answerId: parseInt(answers[question.id])
            };
          case 'boolean':
            // Find the answer ID that matches the user's selected value
            const boolAnswer = question.answers.find(
              a => a.answerValue === answers[question.id]
            );
            return {
              ...base,
              answerId: boolAnswer?.id
            };
          case 'text':
            return {
              ...base,
              answerText: textAnswers[question.id] || ''
            };
          case 'coding':
            return {
              ...base,
              sqlAnswer: sqlAnswers[question.id] || ''
            };
          default:
            return null;
        }
      }).filter(Boolean);
  
      const submitData = {
        testId: parseInt(test.id),
        userId: parseInt(userId),
        answers: allAnswers,
        score: parseFloat(gradeInfo.score.toFixed(2)),
        maxScore: parseFloat(gradeInfo.maxScore.toFixed(2))
        // percentage field removed from submission data
      };
  
      console.log('Submitting data:', submitData);
      const response = await testService.submitTest(submitData);
      console.log('Submission response:', response);
  
      // Calculate percentage on frontend for display purposes
      const percentage = (gradeInfo.score / gradeInfo.maxScore) * 100;
      
      alert(`Test submitted successfully! Your score: ${percentage.toFixed(1)}%`);
      navigate('/');
    } catch (error) {
      console.error('Error submitting test:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert('Error submitting test: ' + errorMessage);
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