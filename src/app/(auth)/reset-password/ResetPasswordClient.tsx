'use client';

import Link from 'next/link';
import Image from 'next/image';
import AuthHeader from '@/components/auth/AuthHeader';

export default function ResetPasswordClient() {
  return (
    <div>
      <AuthHeader title="Reset Password" />
      <div className="mt-8">
        <p className="text-sm text-gray-600 text-center">
          Please enter your new password below.
        </p>

        <form className="mt-6 space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Reset Password
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password? {' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}