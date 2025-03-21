import React, { useState } from 'react';
import { Button } from '@mui/material';
import UploadCVDialog from '../upload/UploadCVDialog';

const UserDashboard = () => {
  const [openUpload, setOpenUpload] = useState(false);
  return (
    <div>
      <h1>Please upload your resume</h1>
      <Button
        variant="contained"
        onClick={() => setOpenUpload(true)}
      >
        Upload Your resume
      </Button>
      <UploadCVDialog
        open={openUpload}
        handleClose={() => setOpenUpload(false)}
        isHR={false}
      />
    </div>
  );
};

export default UserDashboard;