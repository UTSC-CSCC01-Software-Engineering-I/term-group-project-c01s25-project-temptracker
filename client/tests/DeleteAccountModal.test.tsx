import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import DeleteAccountModal from '@/app/settings/DeleteAccountModal';
import { useUser } from '@/app/context';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { getAccessToken, signOut } from '@/lib/authSession';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/dialog';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';

// Mock dependencies
jest.mock('@/app/context', () => ({
  useUser: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('axios');
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));
jest.mock('@/lib/authSession', () => ({
  getAccessToken: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock('@/components/shadcn/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: any) =>
    open ? <div role="dialog" aria-label="Delete account modal">{children}</div> : null,
  DialogContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children, className }: any) => <div className={className}>{children}</div>,
}));
jest.mock('@/components/shadcn/button', () => ({
  Button: ({ children, className, onClick, variant, disabled, ...props }: any) => (
    <button
      className={className}
      onClick={onClick}
      data-variant={variant}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}));
jest.mock('@/components/shadcn/input', () => ({
  Input: ({ id, type, placeholder, value, onChange, className, ...props }: any) => (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  ),
}));
jest.mock('@/components/shadcn/label', () => ({
  Label: ({ htmlFor, children, className, ...props }: any) => (
    <label htmlFor={htmlFor} className={className} {...props}>
      {children}
    </label>
  ),
}));

describe('DeleteAccountModal', () => {
  const user = userEvent.setup();
  const mockUser = { id: 'user1', email: 'test@example.com' };
  const mockOnClose = jest.fn();
  const mockPush = jest.fn();
  const mockAccessToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (getAccessToken as jest.Mock).mockResolvedValue(mockAccessToken);
    (signOut as jest.Mock).mockResolvedValue(undefined);
    (axios.delete as jest.Mock).mockResolvedValue({ status: 204 });
  });

  beforeAll(() => {
    // Suppress console.error in tests
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('renders modal when isOpen is true', async () => {
    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} userEmail="test@example.com" />);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Delete account modal' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Delete Account' })).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete your account/),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Please enter your email address to confirm deletion:')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByText('Expected: test@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete Account' })).toBeDisabled();
    });
  });

  it('does not render modal when isOpen is false', async () => {
    render(<DeleteAccountModal isOpen={false} onClose={mockOnClose} userEmail="test@example.com" />);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Delete account modal' })).not.toBeInTheDocument();
    });
  });

  it('handles email input change and enables Delete button when email matches', async () => {
    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} userEmail="test@example.com" />);
    const emailInput = screen.getByLabelText('Please enter your email address to confirm deletion:');
    await act(async () => {
      await user.type(emailInput, 'test@example.com');
    });
    await waitFor(() => {
      expect(emailInput).toHaveValue('test@example.com');
      expect(screen.getByRole('button', { name: 'Delete Account' })).not.toBeDisabled();
    });
  });

  it('disables Delete button when email does not match', async () => {
    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} userEmail="test@example.com" />);
    const emailInput = screen.getByLabelText('Please enter your email address to confirm deletion:');
    await act(async () => {
      await user.type(emailInput, 'wrong@example.com');
    });
    await waitFor(() => {
      expect(emailInput).toHaveValue('wrong@example.com');
      expect(screen.getByRole('button', { name: 'Delete Account' })).toBeDisabled();
    });
  });

  it('disables Delete button when email is empty', async () => {
    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} userEmail="test@example.com" />);
    const emailInput = screen.getByLabelText('Please enter your email address to confirm deletion:');
    await waitFor(() => {
      expect(emailInput).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Delete Account' })).toBeDisabled();
    });
  });

  it('calls handleClose and resets confirmationEmail on Cancel click', async () => {
    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} userEmail="test@example.com" />);
    const emailInput = screen.getByLabelText('Please enter your email address to confirm deletion:');
    await act(async () => {
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
    });
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(emailInput).toHaveValue('');
    });
  });

  it('shows error toast when email does not match on Delete click', async () => {
    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} userEmail="test@example.com" />);
    const emailInput = screen.getByLabelText('Please enter your email address to confirm deletion:');
    await act(async () => {
      await user.type(emailInput, 'wrong@example.com');
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete Account' })).toBeDisabled();
      expect(toast.error).not.toHaveBeenCalled();
      expect(axios.delete).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('deletes account successfully and redirects on Delete click', async () => {
    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} userEmail="test@example.com" />);
    const emailInput = screen.getByLabelText('Please enter your email address to confirm deletion:');
    await act(async () => {
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'Delete Account' }));
    });
    await waitFor(() => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      expect(axios.delete).toHaveBeenCalledWith(
        `${apiUrl}/users/user1`,
        { headers: { Authorization: 'Bearer mock-token' } }
      );

      expect(toast.success).toHaveBeenCalledWith('Account deleted successfully');
      expect(signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error toast on non-204 response', async () => {
    (axios.delete as jest.Mock).mockResolvedValue({ status: 400 });
    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} userEmail="test@example.com" />);
    const emailInput = screen.getByLabelText('Please enter your email address to confirm deletion:');
    await act(async () => {
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'Delete Account' }));
    });
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Failed to delete account');
      expect(signOut).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error toast on API error', async () => {
    (axios.delete as jest.Mock).mockRejectedValue(new Error('Network error'));
    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} userEmail="test@example.com" />);
    const emailInput = screen.getByLabelText('Please enter your email address to confirm deletion:');
    await act(async () => {
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'Delete Account' }));
    });
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('An error occurred while deleting your account');
      expect(signOut).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});