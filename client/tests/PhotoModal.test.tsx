import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import PhotoModal from '@/app/community/PhotoModal';
import { useUser } from '@/app/context';
import { likePhoto, unlikePhoto } from '@/lib/supabase/api/photo_gallery/photoLikeService';
import Image from 'next/image';
import { Button } from '@/components/shadcn/button';

jest.mock('@/app/context', () => ({
  useUser: jest.fn(),
}));
jest.mock('@/lib/supabase/api/photo_gallery/photoLikeService', () => ({
  likePhoto: jest.fn(),
  unlikePhoto: jest.fn(),
}));
jest.mock('next/image', () => ({ src, alt, fill, style, priority, ...props }: any) => (
  <img src={src} alt={alt} style={style} {...(fill ? { style: { ...style, objectFit: 'contain', width: '100%', height: '100%' } } : {})} {...props} />
));
jest.mock('@/components/shadcn/button', () => ({
  Button: ({ children, className, onClick, ...props }: any): JSX.Element => (
    <button className={className} onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

interface Photo {
  id: number;
  url: string;
  title?: string;
  caption?: string;
  location: string;
  username?: string;
  created_at?: string;
  likes: number;
  likedByCurrentUser?: boolean;
  user_id: string;
}

describe('PhotoModal', () => {
  const user = userEvent.setup();
  const mockUser = { id: 'user1' };
  const mockPhoto: Photo = {
    id: 1,
    url: '/photo1.jpg',
    title: 'Test Photo',
    caption: 'Test Caption',
    location: 'Lake Ontario',
    username: 'testuser',
    created_at: '2025-08-01T12:00:00Z',
    likes: 5,
    likedByCurrentUser: false,
    user_id: 'owner123',
  };
  const mockOnClose = jest.fn();
  const mockOnLikeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (likePhoto as jest.Mock).mockResolvedValue(undefined);
    (unlikePhoto as jest.Mock).mockResolvedValue(undefined);
  });

  it('toggles like and updates like count when user is logged in', async () => {
    render(<PhotoModal photo={mockPhoto} onClose={mockOnClose} onLikeChange={mockOnLikeChange} />);
    const likeButton = screen.getByRole('button', { name: '5 Likes' });
    await act(async () => {
      await user.click(likeButton);
    });
    await waitFor(() => {
      expect(likePhoto).toHaveBeenCalledWith(1, 'user1', 'owner123');
      expect(mockOnLikeChange).toHaveBeenCalledWith(1, true, 6);
      expect(screen.getByText('6 Likes')).toBeInTheDocument();
      expect(likeButton).toHaveClass('bg-pink-600');
    });

    await act(async () => {
      await user.click(likeButton);
    });
    await waitFor(() => {
      expect(unlikePhoto).toHaveBeenCalledWith(1, 'user1', 'owner123');
      expect(mockOnLikeChange).toHaveBeenCalledWith(1, false, 5);
      expect(screen.getByText('5 Likes')).toBeInTheDocument();
      expect(likeButton).not.toHaveClass('bg-pink-600');
    });
  });

  it('rolls back like state on likePhoto error', async () => {
    (likePhoto as jest.Mock).mockRejectedValue(new Error('Like failed'));
    render(<PhotoModal photo={mockPhoto} onClose={mockOnClose} onLikeChange={mockOnLikeChange} />);
    const likeButton = screen.getByRole('button', { name: '5 Likes' });
    await act(async () => {
      await user.click(likeButton);
    });
    await waitFor(() => {
      expect(likePhoto).toHaveBeenCalledWith(1, 'user1', 'owner123');
      expect(mockOnLikeChange).not.toHaveBeenCalled();
      expect(screen.getByText('5 Likes')).toBeInTheDocument();
      expect(likeButton).not.toHaveClass('bg-pink-600');
    });
  });

  it('rolls back unlike state on unlikePhoto error', async () => {
    const likedPhoto = { ...mockPhoto, likedByCurrentUser: true, likes: 6 };
    (unlikePhoto as jest.Mock).mockRejectedValue(new Error('Unlike failed'));
    render(<PhotoModal photo={likedPhoto} onClose={mockOnClose} onLikeChange={mockOnLikeChange} />);
    const likeButton = screen.getByRole('button', { name: '6 Likes' });
    await act(async () => {
      await user.click(likeButton);
    });
    await waitFor(() => {
      expect(unlikePhoto).toHaveBeenCalledWith(1, 'user1', 'owner123');
      expect(mockOnLikeChange).not.toHaveBeenCalled();
      expect(screen.getByText('6 Likes')).toBeInTheDocument();
      expect(likeButton).toHaveClass('bg-pink-600');
    });
  });

  it('renders photo details correctly', async () => {
    render(<PhotoModal photo={mockPhoto} onClose={mockOnClose} onLikeChange={mockOnLikeChange} />);
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Test Photo' })).toHaveAttribute('src', '/photo1.jpg');
      expect(screen.getByText('Test Photo')).toBeInTheDocument();
      expect(screen.getByText('Test Caption')).toBeInTheDocument();
      expect(screen.getByText((_, el) => el?.textContent === 'Lake: Ontario')).toBeInTheDocument();
      expect(screen.getByText((_, el) => el?.textContent === 'By: testuser')).toBeInTheDocument();
      expect(screen.getByText((_, el) => el?.textContent === 'Date: 8/1/2025')).toBeInTheDocument();
    });
  });

  it('renders default values for missing photo details', async () => {
    const photoWithoutDetails: Photo = {
      id: 2,
      url: '/photo1.jpg',
      location: 'Lake Ontario',
      likes: 0,
      likedByCurrentUser: false,
      user_id: 'owner123',
    };
    render(<PhotoModal photo={photoWithoutDetails} onClose={mockOnClose} onLikeChange={mockOnLikeChange} />);
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Photo' })).toHaveAttribute('src', '/photo1.jpg');
      expect(screen.getByText('Untitled')).toBeInTheDocument();
      expect(screen.getByText('No caption available')).toBeInTheDocument();
      expect(screen.getByText((_, el) => el?.textContent === 'Lake: Ontario')).toBeInTheDocument();
      expect(screen.getByText((_, el) => el?.textContent === 'By: Unknown')).toBeInTheDocument();
      expect(screen.getByText((_, el) => el?.textContent === 'Date: Unknown')).toBeInTheDocument();
    });
  });

  it('renders location without splitting when no space in location', async () => {
    const photoWithSimpleLocation: Photo = {
      id: 3,
      url: '/photo1.jpg',
      location: 'Ontario',
      likes: 0,
      likedByCurrentUser: false,
      user_id: 'owner123',
    };
    render(<PhotoModal photo={photoWithSimpleLocation} onClose={mockOnClose} onLikeChange={mockOnLikeChange} />);
    await waitFor(() => {
      expect(screen.getByText((_, el) => el?.textContent === 'Lake: Ontario')).toBeInTheDocument();
    });
  });
});
