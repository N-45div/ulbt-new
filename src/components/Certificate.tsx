import React from 'react';

interface CertificateProps {
  userName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
}

const Certificate: React.FC<CertificateProps> = ({ userName, courseTitle, completionDate, certificateId }) => {
  return (
    <div className="w-full max-w-2xl mx-auto border p-6 rounded-lg shadow-lg bg-white text-center">
      <h1 className="text-2xl font-bold">Certificate of Completion</h1>
      <p className="mt-2 text-lg">This certifies that</p>
      <h2 className="text-3xl font-semibold my-2">{userName}</h2>
      <p className="text-lg">has successfully completed</p>
      <h3 className="text-xl font-medium my-2">{courseTitle}</h3>
      <p className="mt-4">on {completionDate}</p>
      <p className="mt-4 text-sm">Certificate ID: {certificateId}</p>
    </div>
  );
};

export default Certificate;