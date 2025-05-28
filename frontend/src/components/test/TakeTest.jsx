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
import { useRef } from 'react';

const TakeTest = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [sqlAnswers, setSqlAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [userId, setUserId] = useState(null);


const CodeEditor = ({ questionId, value, onChange }) => {
  const [query, setQuery] = useState(value || '');
  const [result, setResult] = useState('');
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sqlInitialized, setSqlInitialized] = useState(false);
  const initializedRef = useRef(false);
  const scriptLoadedRef = useRef(false);

  // Keep query in sync with value prop
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Load SQL.js and initialize DB - Fixed version
  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeSqlJs = async () => {
      try {
        // Check if SQL.js is already loaded globally
        if (window.initSqlJs) {
          const SQL = await window.initSqlJs({
            locateFile: file => `https://sql.js.org/dist/${file}`
          });
          const database = new SQL.Database();
          initializeDatabase(database);
          setDb(database);
          setSqlInitialized(true);
          return;
        }

        // Load script only if not already loaded
        if (!scriptLoadedRef.current) {
          scriptLoadedRef.current = true;
          
          const script = document.createElement('script');
          script.src = 'https://sql.js.org/dist/sql-wasm.js';
          script.async = true;
          
          script.onload = async () => {
            try {
              // Wait a bit for the script to fully initialize
              setTimeout(async () => {
                if (window.initSqlJs) {
                  const SQL = await window.initSqlJs({
                    locateFile: file => `https://sql.js.org/dist/${file}`
                  });
                  const database = new SQL.Database();
                  initializeDatabase(database);
                  setDb(database);
                  setSqlInitialized(true);
                } else {
                  setError('SQL.js failed to load properly');
                }
              }, 100);
            } catch (err) {
              setError('Failed to initialize SQL.js: ' + err.message);
            }
          };

          script.onerror = () => {
            setError('Failed to load SQL.js script');
          };

          // Check if script already exists to avoid duplicates
          const existingScript = document.querySelector('script[src="https://sql.js.org/dist/sql-wasm.js"]');
          if (!existingScript) {
            document.head.appendChild(script);
          } else {
            // Script already exists, just wait for it to be ready
            const checkReady = setInterval(() => {
              if (window.initSqlJs) {
                clearInterval(checkReady);
                initializeSqlJs();
              }
            }, 100);
          }
        }
      } catch (err) {
        setError('Error during SQL.js setup: ' + err.message);
      }
    };

    initializeSqlJs();

    // Cleanup function
    return () => {
      // Don't remove script as it might be used by other components
      // Just clean up our specific resources
      if (db) {
        try {
          db.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []); // Empty dependency array is correct here

  const initializeDatabase = (database) => {
    try {
      database.run(`
        CREATE TABLE employees (
          id INTEGER PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT,
          hire_date TEXT,
          department_id INTEGER,
          salary REAL
        );
        INSERT INTO employees VALUES (1, 'John', 'Smith', 'john.smith@example.com', '2020-01-15', 1, 75000);
        INSERT INTO employees VALUES (2, 'Jane', 'Doe', 'jane.doe@example.com', '2019-05-20', 2, 82000);
        INSERT INTO employees VALUES (3, 'Michael', 'Johnson', 'michael.j@example.com', '2021-03-10', 1, 67000);
        INSERT INTO employees VALUES (4, 'Emily', 'Davis', 'emily.d@example.com', '2018-11-08', 3, 90000);
        INSERT INTO employees VALUES (5, 'Robert', 'Wilson', 'r.wilson@example.com', '2022-01-05', 2, 72000);
        
        CREATE TABLE departments (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          location TEXT
        );
        INSERT INTO departments VALUES (1, 'Engineering', 'Building A');
        INSERT INTO departments VALUES (2, 'Marketing', 'Building B');
        INSERT INTO departments VALUES (3, 'Finance', 'Building C');
        
        CREATE TABLE projects (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          start_date TEXT,
          end_date TEXT,
          budget REAL
        );
        INSERT INTO projects VALUES (1, 'Website Redesign', '2023-01-10', '2023-06-30', 50000);
        INSERT INTO projects VALUES (2, 'Mobile App Development', '2023-02-15', '2023-08-20', 75000);
        INSERT INTO projects VALUES (3, 'Database Migration', '2023-03-01', '2023-05-15', 30000);
        
        CREATE TABLE employee_projects (
          employee_id INTEGER,
          project_id INTEGER,
          role TEXT,
          hours_allocated INTEGER,
          PRIMARY KEY (employee_id, project_id)
        );
        INSERT INTO employee_projects VALUES (1, 1, 'Lead Developer', 120);
        INSERT INTO employee_projects VALUES (2, 1, 'Designer', 80);
        INSERT INTO employee_projects VALUES (3, 2, 'Developer', 160);
        INSERT INTO employee_projects VALUES (4, 3, 'Project Manager', 100);
        INSERT INTO employee_projects VALUES (5, 2, 'Tester', 60);
        INSERT INTO employee_projects VALUES (1, 3, 'Developer', 90);
      `);
    } catch (err) {
      setError('Error initializing database: ' + err.message);
    }
  };

  const executeQuery = async () => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    if (!query.trim()) {
      setError('Please enter a SQL query');
      setResult(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const results = db.exec(query);
      if (results.length === 0) {
        setResult([{ columns: [], values: [] }]);
      } else {
        setResult(results);
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Controlled: update parent on user input
  const handleQueryChange = (newQuery) => {
    setQuery(newQuery);
    onChange(newQuery);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        value={query}
        placeholder="Enter your SQL query here"
        onChange={(e) => handleQueryChange(e.target.value)}
        error={!!error}
        disabled={isLoading}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={executeQuery}
        disabled={isLoading || !sqlInitialized}
        sx={{ mb: 2 }}
      >
        {isLoading ? 'Running...' : sqlInitialized ? 'Run Query' : 'Loading SQL...'}
      </Button>
      {error && (
        <Box sx={{
          mt: 2,
          p: 2,
          bgcolor: '#ffebee',
          color: '#c62828',
          borderRadius: 1,
          border: '1px solid #ef9a9a'
        }}>
          {error}
        </Box>
      )}
      {isLoading && (
        <Box sx={{
          mt: 2,
          p: 2,
          bgcolor: '#e3f2fd',
          color: '#1565c0',
          borderRadius: 1,
          border: '1px solid #90caf9'
        }}>
          Executing query...
        </Box>
      )}
      {!error && !isLoading && Array.isArray(result) && (
        <Box sx={{ mt: 2 }}>
          {result.map((resultSet, i) => (
            <Box key={i} sx={{ mb: 2, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {resultSet.columns?.map((col, j) => (
                      <th key={j} style={{ 
                        background: '#f5f5f5', 
                        fontWeight: 'bold', 
                        textTransform: 'uppercase', 
                        border: '1px solid #ddd', 
                        padding: 8 
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultSet.values?.map((row, k) => (
                    <tr key={k}>
                      {row.map((cell, l) => (
                        <td key={l} style={{ 
                          border: '1px solid #ddd', 
                          padding: 8 
                        }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

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

  const calculateGrade = async () => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    let pendingGrades = [];
  
    // First pass - process all non-text questions immediately
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
          // For text questions, add to pending grades for semantic analysis
          const userTextAnswer = (textAnswers[question.id] || '').trim();
          
          // Skip if empty answer
          if (!userTextAnswer) break;
          
          pendingGrades.push({
            questionId: question.id,
            userAnswer: userTextAnswer,
            correctAnswers: correctAnswers.map(a => a.answerValue),
            grade: grade
          });
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
  
    // Handle text questions with semantic similarity if there are any
    if (pendingGrades.length > 0) {
      for (const item of pendingGrades) {
        try {
          let highestSimilarity = 0;
    
    // Check against all possible correct answers
          for (const correctAnswer of item.correctAnswers) {
            const response = await axios.post('http://localhost:8000/grading', {
              user_answer: item.userAnswer,
              correct_answer: correctAnswer
            }, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
              
              if (response.data && typeof response.data.cosine_similarity === 'number') {
                  const similarity = response.data.cosine_similarity;
                  console.log(`Semantic similarity for Q${item.questionId}: ${similarity}`);
                  
                  // Keep track of highest similarity score
                  if (similarity > highestSimilarity) {
                      highestSimilarity = similarity;
                  }
              }
          }
          
          // Award partial or full points based on similarity threshold
          // You can adjust these thresholds based on your requirements
          if (highestSimilarity > 0.8) {
            // Full points for high similarity
            totalScore += item.grade;
            console.log(`Full points (${item.grade}) for Q${item.questionId}, similarity: ${highestSimilarity}`);
          } else if (highestSimilarity > 0.6) {
            // Partial points for medium similarity
            const partialPoints = item.grade * 0.7;
            totalScore += partialPoints;
            console.log(`Partial points (${partialPoints}) for Q${item.questionId}, similarity: ${highestSimilarity}`);
          } else if (highestSimilarity > 0.4) {
            // Minimal points for low similarity
            const minimalPoints = item.grade * 0.3;
            totalScore += minimalPoints;
            console.log(`Minimal points (${minimalPoints}) for Q${item.questionId}, similarity: ${highestSimilarity}`);
          } else {
            console.log(`No points for Q${item.questionId}, similarity too low: ${highestSimilarity}`);
          }
        } catch (error) {
          console.error('Error calculating semantic similarity:', error);
          // Fallback to exact match if API fails
          const userTextAnswer = item.userAnswer.toLowerCase();
          if (item.correctAnswers.some(a => 
            a.trim().toLowerCase() === userTextAnswer
          )) {
            totalScore += item.grade;
            console.log(`Fallback exact match - correct for Q${item.questionId}, adding ${item.grade} points`);
          }
        }
      }
    }
  
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
  
      setLoading(true); // Add loading state while processing
  
      // Now calculateGrade is async
      const gradeInfo = await calculateGrade();
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
    } finally {
      setLoading(false); // Make sure to clear loading state
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
        <CodeEditor
          questionId={question.id}
          value={sqlAnswers[question.id] || ''}
          onChange={(val) => setSqlAnswers({
            ...sqlAnswers,
            [question.id]: val
          })}
        />
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