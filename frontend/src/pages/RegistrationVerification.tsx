import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// Styled Components
const VerificationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
`;

const StatusMessage = styled.div<{ status: string }>`
  background-color: ${({ status }) => getBackgroundColor(status)};
  color: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
`;

const StatusTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

const StatusText = styled.p`
  font-size: 18px;
  line-height: 1.5;
`;

// Helper function to determine background color based on status
const getBackgroundColor = (status: string): string => {
  switch (status) {
    case 'success':
      return '#28a745';
    case 'token_expired':
    case 'invalid_token':
    case 'database_error':
    case 'unknown_error':
      return '#dc3545';
    case 'already_verified':
      return '#ffc107';
    default:
      return '#6c757d';
  }
};

// Helper function to get the message based on status
const getStatusMessage = (status: string | null): { title: string; message: string } => {
  switch (status) {
    case 'success':
      return {
        title: 'You are successfully verified!',
        message: 'Your account has been activated! You can now log in to continue.',
      };
    case 'token_expired':
      return {
        title: 'Verification Link Expired',
        message: 'Your verification link has expired. Please request a new verification email.',
      };
    case 'invalid_token':
      return {
        title: 'Invalid Verification Link',
        message: 'The verification link is invalid. Please check your email or request a new verification email.',
      };
    case 'already_verified':
      return {
        title: 'Already Verified',
        message: 'Your account is already verified. You can log in.',
      };
    case 'unknown_error':
      return {
        title: 'Unknown Error',
        message: 'An unknown error occurred. Please try again later.',
      };
    default:
      return {
        title: 'Verification Status Unknown',
        message: 'The verification status is unclear. Please contact support if the issue persists.',
      };
  }
};

const RegistrationVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // Extract 'status' query parameter from URL
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status');
    setStatus(statusParam);

    // Redirect to login after 10 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 10000);

    return () => clearTimeout(timer);
  }, [location.search, navigate]);

  const { title, message } = getStatusMessage(status);

  return (
    <VerificationContainer>
      <StatusMessage status={status || 'default'}>
        <StatusTitle>{title}</StatusTitle>
        <StatusText>{message}</StatusText>
      </StatusMessage>
    </VerificationContainer>
  );
};

export default RegistrationVerification;
