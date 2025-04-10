import { type Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account to start using our services',
};

export default function RegisterPage() {
  return <RegisterClient />;
}