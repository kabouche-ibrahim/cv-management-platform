import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Box, Button, TextField, Typography } from '@mui/material';

const registerSchema = Yup.object().shape({
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Required'),
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Required'),
  address: Yup.string().required('Required'),
  phoneNumber: Yup.string()
    .matches(/^0[0-9]{8}$/, 'Phone number must start with 0 and be 9 digits')
    .required('Required'),
});

const Register = ({ isHRCreation = false, editUser = null, onClose = null }) => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const formattedData = {
        ...values,
        dateOfBirth: values.dateOfBirth,
        phoneNumber: values.phoneNumber.toString(),
        role: isHRCreation ? 'HR' : 'USER' 
      };

      if (editUser) {
        await authService.updateUser(editUser.id, formattedData);
      } else {
        await authService.register(formattedData);
      }
      
      if (isHRCreation && onClose) {
        onClose();
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Registration failed' 
      });
    }
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: isHRCreation ? 'auto' : '100vh',
        padding: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        {isHRCreation ? 'Create HR User' : 'Register'}
      </Typography>
      <Formik
        initialValues={{
          firstName: editUser?.firstName || '',
          lastName: editUser?.lastName || '',
          email: editUser?.email || '',
          password: '',
          dateOfBirth: editUser?.dateOfBirth || '',
          address: editUser?.address || '',
          phoneNumber: editUser?.phoneNumber || '',
        }}
        validationSchema={registerSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting, handleChange, handleBlur, values }) => (
          <Form style={{ width: '400px' }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName && Boolean(errors.firstName)}
                helperText={touched.firstName && errors.firstName}
                variant="outlined"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName && Boolean(errors.lastName)}
                helperText={touched.lastName && errors.lastName}
                variant="outlined"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                variant="outlined"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                variant="outlined"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={values.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                helperText={touched.dateOfBirth && errors.dateOfBirth}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
                variant="outlined"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                placeholder="0XXXXXXXX"
                value={values.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                helperText={touched.phoneNumber && errors.phoneNumber}
                variant="outlined"
              />
            </Box>
            {errors.submit && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errors.submit}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default Register;
