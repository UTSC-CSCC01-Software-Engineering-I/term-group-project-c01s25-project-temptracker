import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { useRouter } from 'next/navigation';
import CommunityPage from '@/app/community/page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        // Simulate Next.js Link behavior by calling router.push
        const router = jest.requireMock('next/navigation').useRouter();
        router.push(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
});
jest.mock('@/app/community/PhotoGallery', () => () => (
  <div data-testid="photo-gallery">PhotoGallery Component</div>
));

describe('CommunityPage', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders all static content correctly', () => {
    render(<CommunityPage />);
    expect(screen.getByText('Welcome to the Community (WIP)')).toBeInTheDocument();
    expect(
      screen.getByText(/Mark your place in the community by earning badges/)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Leaderboard/i })).toBeInTheDocument();
    expect(screen.getByText('See top contributors and badges earned')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse Community Members/i })).toBeInTheDocument();
    expect(
      screen.getByText('Discover other GLOW contributors and view their profiles')
    ).toBeInTheDocument();
    expect(screen.getByText('GLOW Photo Gallery')).toBeInTheDocument();
    expect(
      screen.getByText(/The photo gallery is a developmental feature/)
    ).toBeInTheDocument();
    expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
  });

  it('navigates to leaderboard when leaderboard link is clicked', async () => {
    const user = userEvent.setup();
    render(<CommunityPage />);
    const leaderboardLink = screen.getByRole('link', { name: /View Leaderboard/i });
    await act(async () => {
      await user.click(leaderboardLink);
    });
    expect(mockPush).toHaveBeenCalledWith('/community/stats');
  });

  it('navigates to users page when users link is clicked', async () => {
    const user = userEvent.setup();
    render(<CommunityPage />);
    const usersLink = screen.getByRole('link', { name: /Browse Community Members/i });
    await act(async () => {
      await user.click(usersLink);
    });
    expect(mockPush).toHaveBeenCalledWith('/users');
  });
});