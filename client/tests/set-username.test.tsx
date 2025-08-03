import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import SetUsernamePage from '@/app/set-username/page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: { session: null },
        error: null,
      })
    ),
    updateUser: jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: { user: { id: 'user-123' } },
        error: null,
      })
    ),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn(),
        maybeSingle: jest.fn(),
      }),
    }),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: null,
          error: null,
        })
      ),
    }),
  }),
};

describe('SetUsernamePage', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    // Reset mock implementations to avoid stale state
    mockSupabase.auth.getSession.mockReset();
    mockSupabase.auth.getSession.mockImplementation(() =>
      Promise.resolve({
        data: { session: null },
        error: null,
      })
    );
    mockSupabase.from().select().eq().single.mockReset();
    mockSupabase.from().select().eq().maybeSingle.mockReset();
    mockSupabase.auth.updateUser.mockReset();
    mockSupabase.from().update().eq.mockReset();
  });

  it('renders the form correctly', () => {
    render(<SetUsernamePage />);
    expect(screen.getByText('Choose a Username')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set Username' })).toBeInTheDocument();
  });

  it('redirects to login if no session is found', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: new Error('No session'),
    });

    await act(async () => {
      render(<SetUsernamePage />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Session not found');
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects to home if username already exists', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null,
    });
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: { username: 'existing-user' },
      error: null,
    });

    await act(async () => {
      render(<SetUsernamePage />);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('displays error for username less than 3 characters', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null,
    });
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: null,
    });

    await act(async () => {
      render(<SetUsernamePage />);
    });

    const input = screen.getByLabelText(/Username/);
    const submitButton = screen.getByRole('button', { name: 'Set Username' });

    await act(async () => {
      await user.type(input, 'ab');
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Username must be at least 3 characters');
    });
  });

  it('displays error for username already taken', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null,
    });
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: null,
    });
    mockSupabase.from().select().eq().maybeSingle.mockResolvedValue({
      data: { id: 'other-user' },
      error: null,
    });

    await act(async () => {
      render(<SetUsernamePage />);
    });

    const input = screen.getByLabelText(/Username/);
    const submitButton = screen.getByRole('button', { name: 'Set Username' });

    await act(async () => {
      await user.type(input, 'takenuser');
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Username is already taken');
    });
  });

  it('successfully sets username and redirects', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null,
    });
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: null,
    });
    mockSupabase.from().select().eq().maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });
    mockSupabase.from().update().eq.mockResolvedValue({
      data: null,
      error: null,
    });
    mockSupabase.auth.updateUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    await act(async () => {
      render(<SetUsernamePage />);
    });

    const input = screen.getByLabelText(/Username/);
    const submitButton = screen.getByRole('button', { name: 'Set Username' });

    await act(async () => {
      await user.type(input, 'validuser');
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Username set!');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles auth metadata update failure', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null,
    });
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: null,
    });
    mockSupabase.from().select().eq().maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });
    mockSupabase.from().update().eq.mockResolvedValue({
      data: null,
      error: null,
    });
    mockSupabase.auth.updateUser.mockResolvedValue({
      data: null,
      error: new Error('Metadata update failed'),
    });

    await act(async () => {
      render(<SetUsernamePage />);
    });

    const input = screen.getByLabelText(/Username/);
    const submitButton = screen.getByRole('button', { name: 'Set Username' });

    await act(async () => {
      await user.type(input, 'validuser');
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith('Username set, but failed to update auth metadata');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});