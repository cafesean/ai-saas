import { type Metadata } from 'next';
import ResetPasswordClient from './ResetPasswordClient';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set your new password',
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}