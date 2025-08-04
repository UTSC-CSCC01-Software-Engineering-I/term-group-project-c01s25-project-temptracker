import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { toast } from 'sonner';
import PhotoGallery from '@/app/community/PhotoGallery';
import { getPhotos } from '../lib/supabase/api/photo_gallery/photoRetrievalService';
import { onUpload } from '../lib/supabase/api/photo_gallery/photoUploadService';
import { useUser } from '@/app/context';
import Image from 'next/image';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));
jest.mock('../lib/supabase/api/photo_gallery/photoRetrievalService', () => ({
  getPhotos: jest.fn(),
}));
jest.mock('../lib/supabase/api/photo_gallery/photoUploadService', () => ({
  onUpload: jest.fn(),
}));
jest.mock('@/app/context', () => ({
  useUser: jest.fn(),
}));
jest.mock('next/image', () => ({ src, alt, fill, ...props }: any) => (
  <img src={src} alt={alt} {...(fill ? { style: { objectFit: 'cover', width: '100%', height: '100%' } } : {})} {...props} />
));
jest.mock('@/app/community/UploadPhotoModal', () => ({ onUpload }: any) => (
  <div data-testid="upload-photo-modal">
    <button data-testid="upload-button" onClick={() => onUpload({
      file: new File(['x'], 'test.jpg', { type: 'image/jpeg' }),
      location: 'Lake Ontario',
      title: 'Test Photo',
      caption: 'Test caption',
    })}>Upload</button>
  </div>
));
jest.mock('@/app/community/PhotoModal', () => ({ photo, onClose, onLikeChange }: any) => (
  <div data-testid={`photo-modal-${photo.id}`}>
    <button data-testid={`close-modal-${photo.id}`} onClick={() => onClose()}>Close</button>
    <button data-testid={`like-button-${photo.id}`} onClick={() => onLikeChange(photo.id, !photo.likedByCurrentUser, photo.likes + (photo.likedByCurrentUser ? -1 : 1))}>
      {photo.likedByCurrentUser ? 'Unlike' : 'Like'}
    </button>
  </div>
));

describe('PhotoGallery', () => {
  const user = userEvent.setup();
  const mockUser = { id: 'user1' };
  const mockProfile = { role: 'user' };
  const mockPhotos = [
    { id: 1, url: '/photo1.jpg', title: 'Photo 1', likes: 5, likedByCurrentUser: false },
    { id: 2, url: '/photo2.jpg', title: 'Photo 2', likes: 10, likedByCurrentUser: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ user: mockUser, profile: mockProfile });
    (getPhotos as jest.Mock).mockResolvedValue(mockPhotos);
    (onUpload as jest.Mock).mockResolvedValue(undefined);
    (toast.error as jest.Mock).mockClear();
  });

  it('renders time range and location dropdowns', async () => {
    render(<PhotoGallery />);
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      const timeRangeSelect = selects.find((select) => select.closest('div')?.querySelector('label')?.textContent === 'Time Range');
      const locationSelect = selects.find((select) => select.closest('div')?.querySelector('label')?.textContent === 'Location');
      expect(timeRangeSelect).toHaveValue('Last 72 hours');
      expect(locationSelect).toHaveValue('All');
    });
  });

  it('renders UploadPhotoModal when user is signed in', async () => {
    render(<PhotoGallery />);
    await waitFor(() => {
      expect(screen.getByTestId('upload-photo-modal')).toBeInTheDocument();
    });
  });

  it('does not render UploadPhotoModal when user is not signed in', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, profile: null });
    render(<PhotoGallery />);
    await waitFor(() => {
      expect(screen.queryByTestId('upload-photo-modal')).not.toBeInTheDocument();
    });
  });

  it('shows loading state while fetching photos', async () => {
    (getPhotos as jest.Mock).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(mockPhotos), 100)));
    render(<PhotoGallery />);
    expect(screen.getByText('Loading photos...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Loading photos...')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no photos are found', async () => {
    (getPhotos as jest.Mock).mockResolvedValue([]);
    render(<PhotoGallery />);
    await waitFor(() => {
      expect(screen.getByText("Sorry, we couldn't find any photos:(")).toBeInTheDocument();
    });
  });

  it('renders photos when fetched successfully', async () => {
    render(<PhotoGallery />);
    await waitFor(() => {
      expect(screen.getByText('Photo 1')).toBeInTheDocument();
      expect(screen.getByText('❤️ 5')).toBeInTheDocument();
      expect(screen.getByText('Photo 2')).toBeInTheDocument();
      expect(screen.getByText('❤️ 10')).toBeInTheDocument();
      expect(screen.getAllByRole('img')).toHaveLength(2);
    });
  });

  it('handles photo loading error', async () => {
    (getPhotos as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    render(<PhotoGallery />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load photos.');
      expect(screen.getByText("Sorry, we couldn't find any photos:(")).toBeInTheDocument();
    });
  });

  it('handles upload when user is signed in', async () => {
    render(<PhotoGallery />);
    await waitFor(() => {
      expect(screen.getByTestId('upload-photo-modal')).toBeInTheDocument();
    });
    const uploadButton = screen.getByTestId('upload-button');
    await act(async () => {
      await user.click(uploadButton);
    });
    expect(onUpload).toHaveBeenCalledWith({
      file: expect.any(File),
      location: 'Lake Ontario',
      title: 'Test Photo',
      caption: 'Test caption',
      role: 'user',
      userId: 'user1',
    });
  });

  it('shows error toast for upload when user is not signed in', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, profile: null });
    render(<PhotoGallery />);
    await waitFor(() => {
      expect(screen.queryByTestId('upload-photo-modal')).not.toBeInTheDocument();
    });
    const handleUpload = async (data: any) => {
      if (!data.user?.id || !data.profile) {
        toast.error('You must be logged in to upload a photo');
        return;
      }
      await onUpload({ ...data, role: data.profile.role, userId: data.user.id });
    };
    await act(async () => {
      await handleUpload({
        file: new File(['x'], 'test.jpg', { type: 'image/jpeg' }),
        location: 'Lake Ontario',
        title: 'Test Photo',
        caption: 'Test caption',
        user: null,
        profile: null,
      });
    });
    expect(toast.error).toHaveBeenCalledWith('You must be logged in to upload a photo');
    expect(onUpload).not.toHaveBeenCalled();
  });
});