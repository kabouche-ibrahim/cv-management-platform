import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { testService } from '../../services/testService';
import { jobOfferService } from '../../services/jobOfferService';
import { Box, TextField, Typography, Paper, Grid, Button, List, ListItem, IconButton, Radio, RadioGroup, FormControl, FormLabel, FormControlLabel, Checkbox, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../navbar/NavBar';

const QUESTION_TYPES = [
  {
    id: 'mcq',
    type: 'Multiple Choice',
    template: {
      type: 'mcq',
      question: '',
      options: [],
      correctAnswers: [],
      defaultGrade: 1
    }
  },
  {
    id: 'text',
    type: 'Text',
    template: {
      type: 'text',
      question: '',
      expectedAnswer: '',
      defaultGrade: 1
    }
  },
  {
    id: 'boolean',
    type: 'True/False',
    template: {
      type: 'boolean',
      question: '',
      correctAnswer: false, // Ensure default value
      defaultGrade: 1
    }
  },
  {
    id: 'coding',
    type: 'SQL Query',
    template: {
      type: 'coding',
      description: '',
      defaultGrade: 1
    }
  }
];

const CodeEditor = ({ questionId, onQueryChange, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);
  const [result, setResult] = useState('');
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sqlInitialized, setSqlInitialized] = useState(false);

  const handleQueryChange = (newQuery) => {
    setQuery(newQuery);
    onQueryChange(questionId, newQuery);
  };

  // Load SQL.js safely
  useEffect(() => {
    // Create a script element to load SQL.js
    const script = document.createElement('script');
    script.src = 'https://sql.js.org/dist/sql-wasm.js';
    script.async = true;
    
    script.onload = () => {
      // Initialize SQL.js after the script is loaded
      initializeSqlJs();
    };
    
    document.body.appendChild(script);
    
    // Clean up
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeDatabase = (db) => {
    try {
      // Create tables with sample data
      db.run(`
        -- Create employees table
        CREATE TABLE employees (
          id INTEGER PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT,
          hire_date TEXT,
          department_id INTEGER,
          salary REAL
        );
        
        -- Insert sample employees
        INSERT INTO employees VALUES (1, 'John', 'Smith', 'john.smith@example.com', '2020-01-15', 1, 75000);
        INSERT INTO employees VALUES (2, 'Jane', 'Doe', 'jane.doe@example.com', '2019-05-20', 2, 82000);
        INSERT INTO employees VALUES (3, 'Michael', 'Johnson', 'michael.j@example.com', '2021-03-10', 1, 67000);
        INSERT INTO employees VALUES (4, 'Emily', 'Davis', 'emily.d@example.com', '2018-11-08', 3, 90000);
        INSERT INTO employees VALUES (5, 'Robert', 'Wilson', 'r.wilson@example.com', '2022-01-05', 2, 72000);
        
        -- Create departments table
        CREATE TABLE departments (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          location TEXT
        );
        
        -- Insert sample departments
        INSERT INTO departments VALUES (1, 'Engineering', 'Building A');
        INSERT INTO departments VALUES (2, 'Marketing', 'Building B');
        INSERT INTO departments VALUES (3, 'Finance', 'Building C');
        
        -- Create projects table
        CREATE TABLE projects (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          start_date TEXT,
          end_date TEXT,
          budget REAL
        );
        
        -- Insert sample projects
        INSERT INTO projects VALUES (1, 'Website Redesign', '2023-01-10', '2023-06-30', 50000);
        INSERT INTO projects VALUES (2, 'Mobile App Development', '2023-02-15', '2023-08-20', 75000);
        INSERT INTO projects VALUES (3, 'Database Migration', '2023-03-01', '2023-05-15', 30000);
        
        -- Create employee_projects (junction table)
        CREATE TABLE employee_projects (
          employee_id INTEGER,
          project_id INTEGER,
          role TEXT,
          hours_allocated INTEGER,
          PRIMARY KEY (employee_id, project_id),
          FOREIGN KEY (employee_id) REFERENCES employees (id),
          FOREIGN KEY (project_id) REFERENCES projects (id)
        );
        
        -- Insert sample employee-project relationships
        INSERT INTO employee_projects VALUES (1, 1, 'Lead Developer', 120);
        INSERT INTO employee_projects VALUES (2, 1, 'Designer', 80);
        INSERT INTO employee_projects VALUES (3, 2, 'Developer', 160);
        INSERT INTO employee_projects VALUES (4, 3, 'Project Manager', 100);
        INSERT INTO employee_projects VALUES (5, 2, 'Tester', 60);
        INSERT INTO employee_projects VALUES (1, 3, 'Developer', 90);
      `);
      
      console.log('Database initialized with sample data');
    } catch (err) {
      console.error('Error initializing database:', err);
    }
  };
  
  const initializeSqlJs = async () => {
    try {
      if (window.initSqlJs) {
        const SQL = await window.initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });
        
        const database = new SQL.Database();
        initializeDatabase(database); 
        setDb(database);
        setSqlInitialized(true);
      } else {
        setError('SQL.js not loaded properly');
      }
    } catch (err) {
      console.error('SQL.js initialization error:', err);
      setError('Failed to initialize SQL.js: ' + err.message);
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
        {isLoading ? 'Running...' : sqlInitialized ? 'Run' : 'Loading SQL...'}
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
            <TableContainer key={i} component={Paper} sx={{ mb: 2 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {resultSet.columns?.map((col, j) => (
                      <TableCell 
                        key={j}
                        sx={{ 
                          bgcolor: '#f5f5f5',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultSet.values?.map((row, k) => (
                    <TableRow 
                      key={k}
                      sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
                    >
                      {row.map((cell, l) => (
                        <TableCell key={l}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ))}
        </Box>
      )}
    </Box>
  );
};

const TestBuilder = () => {
  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [sqlQueries, setSqlQueries] = useState({});
  const [testDescription, setTestDescription] = useState('');
  const [jobOffers, setJobOffers] = useState([]);
  const [selectedJobOffer, setSelectedJobOffer] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTestId, setEditTestId] = useState(null);
  const [totalGrade, setTotalGrade] = useState(0);
  

  useEffect(() => {
    loadJobOffers();
    // Check if we're in edit mode by checking URL params
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditTestId(parseInt(editId));
      loadTestData(parseInt(editId));
    }
  }, [location]);

  useEffect(() => {
    // Calculate total grade whenever questions change
    updateTotalGrade();
  }, [questions]);

  const loadJobOffers = async () => {
    try {
      const offers = await jobOfferService.getAllJobOffers();
      setJobOffers(offers);
    } catch (error) {
      console.error('Error loading job offers:', error);
    }
  };

  const loadTestData = async (testId) => {
    try {
      const test = await testService.getTestById(testId);
      setTestTitle(test.testTitle);
      setTestDescription(test.testDescription);
      setSelectedJobOffer({ id: test.jobOfferId });
      
      const formattedQuestions = test.questions.map((q, index) => {
        let questionData = {
          id: `q-${index}`,
          type: q.questionType,
          question: q.questionText,
          defaultGrade: q.defaultGrade || 1
        };

        switch (q.questionType) {
          case 'mcq':
            return {
              ...questionData,
              options: q.answers.map(a => a.answerValue),
              correctAnswers: q.answers
                .map((a, i) => a.answerIsCorrect ? i : null)
                .filter(i => i !== null)
            };
          case 'text':
            return {
              ...questionData,
              expectedAnswer: q.answers[0]?.answerValue || ''
            };
          case 'boolean':
            // Fix: Properly handle boolean questions
            const trueAnswer = q.answers.find(a => a.answerValue === 'true');
            return {
              ...questionData,
              correctAnswer: trueAnswer ? trueAnswer.answerIsCorrect : false,
            };
          case 'coding':
            const sqlQuery = q.answers[0]?.answerValue || '';
            setSqlQueries(prev => ({
              ...prev,
              [`q-${index}`]: sqlQuery
            }));
            return {
              ...questionData,
              type: 'coding',
              description: q.questionText || ''
            };
          default:
            return questionData;
        }
      });

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error loading test:', error);
      alert('Error loading test data');
    }
  };

  const handleSaveTest = async () => {
    if (!testTitle) {
      alert('Please enter a test title');
      return;
    }
  
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
  
    const testData = {
      title: testTitle,
      testDescription: testDescription,
      jobOfferId: selectedJobOffer?.id,
      questions: questions.map(q => {
        let questionData = {
          type: q.type,
          question: q.question || q.description || '',
          defaultGrade: parseFloat(q.defaultGrade) || 1
        };
  
        switch (q.type) {
          case 'mcq':
            return {
              ...questionData,
              options: q.options.map((opt, idx) => ({
                value: opt,
                isCorrect: q.correctAnswers.includes(idx)
              }))
            };
          case 'text':
            return {
              ...questionData,
              expectedAnswer: q.expectedAnswer || ''
            };
          case 'boolean':
            return {
              ...questionData,
              correctAnswer: Boolean(q.correctAnswer) // Ensure boolean value
            };
          case 'coding':
            return {
              ...questionData,
              answers: [{
                answerValue: sqlQueries[q.id] || '',
                answerIsCorrect: true
              }]
            };
          default:
            return questionData;
        }
      })
    };
  
    try {
      const response = isEditMode 
        ? await testService.updateTest(editTestId, testData)
        : await testService.createTest(testData);
  
      console.log(`Test ${isEditMode ? 'updated' : 'created'}:`, response);
      navigate('/tests');
    } catch (error) {
      console.error('Error saving test:', error);
      alert(`Error ${isEditMode ? 'updating' : 'saving'} test: ` + error.response?.data?.message || error.message);
    }
  };
  
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    if (result.source.droppableId === 'questionTypes' && result.destination.droppableId === 'testForm') {
      const questionType = QUESTION_TYPES.find(type => type.id === result.draggableId);
      setQuestions([...questions, { id: `q-${questions.length}`, ...JSON.parse(JSON.stringify(questionType.template)) }]);
    }
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    updatedQuestions[questionIndex].correctAnswers = updatedQuestions[questionIndex].correctAnswers
      .filter(answer => answer !== optionIndex)
      .map(answer => answer > optionIndex ? answer - 1 : answer);
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleSqlQueryChange = (questionId, query) => {
    setSqlQueries(prev => ({
      ...prev,
      [questionId]: query
    }));
  };

  const renderQuestionContent = (question, index) => {
    const commonGradeInput = (
      <TextField
        type="number"
        label="Question Grade"
        value={question.defaultGrade || 0}
        onChange={(e) => {
          const newGrade = parseFloat(e.target.value) || 0;
          updateQuestion(index, 'defaultGrade', newGrade);
        }}
        InputProps={{ inputProps: { min: 0, step: 0.5 } }}
        sx={{ mb: 2, width: '150px' }}
      />
    );

    switch (question.type) {
      case 'mcq':
        return (
          <Box sx={{ mt: 2 }}>
            {commonGradeInput}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Question Text"
              value={question.question}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              sx={{ mb: 2 }}
            />
            {question.options.map((option, optionIndex) => (
              <Box key={optionIndex} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[optionIndex] = e.target.value;
                    updateQuestion(index, 'options', newOptions);
                  }}
                  sx={{ mr: 1 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={question.correctAnswers.includes(optionIndex)}
                      onChange={(e) => {
                        const newCorrectAnswers = e.target.checked
                          ? [...question.correctAnswers, optionIndex]
                          : question.correctAnswers.filter(i => i !== optionIndex);
                        updateQuestion(index, 'correctAnswers', newCorrectAnswers);
                      }}
                    />
                  }
                  label="Correct"
                />
                <IconButton onClick={() => removeOption(index, optionIndex)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddCircleIcon />}
              onClick={() => addOption(index)}
              sx={{ mt: 1 }}
            >
              Add Option
            </Button>
          </Box>
        );

        case 'text':
          return (
            <Box sx={{ mt: 2 }}>
              {commonGradeInput}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Question Text"
                value={question.question}
                onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                sx={{ mb: 2 }}
              />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Expected Answer"
              value={question.expectedAnswer}
              onChange={(e) => updateQuestion(index, 'expectedAnswer', e.target.value)}
            />
          </Box>
        );

        case 'boolean':
          return (
            <Box sx={{ mt: 2 }}>
              {commonGradeInput}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Question Text"
                value={question.question}
                onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                sx={{ mb: 2 }}
              />
            <FormControl component="fieldset">
              <FormLabel component="legend">Correct Answer</FormLabel>
              <RadioGroup
                row
                // Fix for the toString() error - ensure we have a boolean value before conversion
                value={String(!!question.correctAnswer)}
                onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value === 'true')}
              >
                <FormControlLabel value="true" control={<Radio />} label="True" />
                <FormControlLabel value="false" control={<Radio />} label="False" />
              </RadioGroup>
            </FormControl>
          </Box>
        );

        case 'coding':
        return (
          <Box sx={{ mt: 2 }}>
            {commonGradeInput}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Problem Description"
              value={question.description || ''}
              onChange={(e) => updateQuestion(index, 'description', e.target.value)}
              sx={{ mb: 2 }}
            />
            <CodeEditor 
              questionId={question.id}
              onQueryChange={handleSqlQueryChange}
              initialValue={sqlQueries[question.id] || ''}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  const updateTotalGrade = () => {
    const total = questions.reduce((sum, question) => sum + (parseFloat(question.defaultGrade) || 0), 0);
    setTotalGrade(total);
  };
  

  return (
    <>
    <NavBar/>
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ p: 4, mt: 8 }}>
        <Grid container spacing={5}>
          <Grid item xs={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Question Types</Typography>
              <Droppable droppableId="questionTypes" isDropDisabled>
                {(provided) => (
                  <List {...provided.droppableProps} ref={provided.innerRef}>
                    {QUESTION_TYPES.map((type, index) => (
                      <Draggable key={type.id} draggableId={type.id} index={index}>
                        {(provided) => (
                          <ListItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Paper sx={{ p: 2, width: '100%' }}>{type.type}</Paper>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Paper>
          </Grid>

          <Grid item xs={9}>
            <Paper sx={{ p: 3 }}>
              <TextField 
                fullWidth 
                label="Test Title" 
                value={testTitle} 
                onChange={(e) => setTestTitle(e.target.value)} 
                sx={{ mb: 3 }} 
              />

              <TextField 
                  fullWidth 
                  label="Test Description" 
                  multiline
                  rows={3}
                  value={testDescription} 
                  onChange={(e) => setTestDescription(e.target.value)} 
                  sx={{ mb: 3 }} 
                />

              <Box sx={{ mb: 3, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  Total Grade: {totalGrade}
                </Typography>
              </Box>
              
              {/* Add job offer selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Link to Job Offer</InputLabel>
                <Select
                  value={selectedJobOffer?.id || ''}
                  onChange={(e) => setSelectedJobOffer(jobOffers.find(o => o.id === e.target.value))}
                >
                  <MenuItem value="">None</MenuItem>
                  {jobOffers.map((offer) => (
                    <MenuItem key={offer.id} value={offer.id}>
                      {offer.jobName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Droppable droppableId="testForm">
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ minHeight: 400 }}>
                    {questions.map((question, index) => (
                      <Draggable key={question.id} draggableId={question.id} index={index}>
                        {(provided) => (
                          <Paper ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle1">{question.type} Question</Typography>
                              <IconButton onClick={() => removeQuestion(index)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                            {renderQuestionContent(question, index)}
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>

              {/* Add save button */}
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSaveTest}
                sx={{ mt: 2 }}
              >
                {isEditMode ? 'Update Test' : 'Save Test'}
            </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DragDropContext>
    </>
  );
};

export default TestBuilder;