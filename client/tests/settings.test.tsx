import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import SettingsPage from '@/app/settings/page';
import { useSettingsForm } from '@/hooks/useSettingsForm';

// Mock dependencies
jest.mock('@/hooks/useSettingsForm', () => ({
  useSettingsForm: jest.fn(),
}));
jest.mock('@/components/shadcn/button', () => ({
  Button: ({ children, className, onClick, variant, ...props }: any) => (
    <button className={className} onClick={onClick} data-variant={variant} {...props}>
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
  Label: ({ htmlFor, children, ...props }: any) => (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));
jest.mock('@/components/shadcn/textarea', () => ({
  Textarea: ({ id, placeholder, value, onChange, className, maxLength, rows, ...props }: any) => (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      maxLength={maxLength}
      rows={rows}
      {...props}
    />
  ),
}));
jest.mock('@/app/settings/SettingsSection', () => ({
  __esModule: true,
  default: ({ heading, subheading, children }: any) => (
    <div>
      <h2>{heading}</h2>
      <p>{subheading}</p>
      {children}
    </div>
  ),
}));
jest.mock('@/app/settings/ToggleSwitch', () => ({
  __esModule: true,
  default: ({ label, description, checked, onCheckedChange }: any) => (
    <div>
      <label>{label}</label>
      <p>{description}</p>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        aria-label={label}
      />
    </div>
  ),
}));
jest.mock('@/app/settings/NotificationItem', () => ({
  __esModule: true,
  default: ({ icon, iconBgColor, iconTextColor, title, description, checked, onCheckedChange }: any) => (
    <div>
      <div className={`${iconBgColor} ${iconTextColor}`}>{icon}</div>
      <label>{title}</label>
      <p>{description}</p>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        aria-label={title}
      />
    </div>
  ),
}));
jest.mock('@/app/settings/SecurityButton', () => ({
  __esModule: true,
  default: ({ icon, title, description, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant} aria-label={title}>
      <div>{icon}</div>
      <span>{title}</span>
      <p>{description}</p>
    </button>
  ),
}));
jest.mock('@/app/settings/DeleteAccountModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, userEmail }: any) =>
    isOpen ? (
      <div role="dialog" aria-label="Delete account modal">
        <p>Confirm deletion for {userEmail}</p>
        <button onClick={onClose} aria-label="Close modal">
          Close
        </button>
      </div>
    ) : null,
}));
jest.mock('@/app/settings/ProfilePictureUpload', () => ({
  __esModule: true,
  default: ({ currentImageUrl, onFileChange, selectedFile }: any) => (
    <div>
      <p>Current image: {currentImageUrl || 'None'}</p>
      <input
        type="file"
        onChange={(e) => onFileChange(e.target.files?.[0])}
        aria-label="Profile picture upload"
      />
      <p>Selected file: {selectedFile ? selectedFile.name : 'None'}</p>
    </div>
  ),
}));
jest.mock('lucide-react', () => ({
  Trophy: () => <span>TrophyIcon</span>,
  Users: () => <span>UsersIcon</span>,
  Key: () => <span>KeyIcon</span>,
  Trash2: () => <span>Trash2Icon</span>,
}));

describe('SettingsPage', () => {
  const user = userEvent.setup();
  const mockUseSettingsForm = {
    formData: {
      username: 'testuser',
      biography: 'Test bio',
      publicProfile: true,
      badgeNotifications: true,
      communityUpdates: false,
      profilePicture: null,
      currentProfilePictureUrl: '/profile.jpg',
    },
    errors: {
      usernameError: '',
      biographyError: '',
    },
    showDeleteModal: false,
    setShowDeleteModal: jest.fn(),
    handleUsernameChange: jest.fn(),
    handleBiographyChange: jest.fn(),
    handleProfilePictureChange: jest.fn(),
    handleSave: jest.fn(),
    handleReset: jest.fn(),
    handleSendPasswordReset: jest.fn(),
    handleDeleteAccount: jest.fn(),
    setPublicProfile: jest.fn(),
    setBadgeNotifications: jest.fn(),
    setCommunityUpdates: jest.fn(),
    user: { email: 'test@example.com' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSettingsForm as jest.Mock).mockReturnValue(mockUseSettingsForm);
  });

  it('renders hero section correctly', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
      expect(
        screen.getByText('Manage your account preferences and security settings'),
      ).toBeInTheDocument();
    });
  });

  it('renders account security section correctly', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Account Security' })).toBeInTheDocument();
      expect(screen.getByText('Manage your account security settings')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send Password Reset' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete Account' })).toBeInTheDocument();
    });
  });

  it('renders action buttons correctly', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Reset Changes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });
  });

  it('handles username input change', async () => {
    render(<SettingsPage />);
    const usernameInput = screen.getByLabelText('Display Name');
    await act(async () => {
      await user.clear(usernameInput);
      await user.type(usernameInput, 'newuser');
    });
    expect(mockUseSettingsForm.handleUsernameChange).toHaveBeenCalled();
  });

  it('handles biography input change', async () => {
    render(<SettingsPage />);
    const biographyTextarea = screen.getByLabelText('Biography');
    await act(async () => {
      await user.clear(biographyTextarea);
      await user.type(biographyTextarea, 'New bio');
    });
    expect(mockUseSettingsForm.handleBiographyChange).toHaveBeenCalled();
  });

  it('handles profile picture change', async () => {
    render(<SettingsPage />);
    const fileInput = screen.getByLabelText('Profile picture upload');
    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    await act(async () => {
      await user.upload(fileInput, file);
    });
    expect(mockUseSettingsForm.handleProfilePictureChange).toHaveBeenCalledWith(file);
  });

  it('handles public profile toggle', async () => {
    render(<SettingsPage />);
    const toggle = screen.getByLabelText('Public Profile');
    await act(async () => {
      await user.click(toggle);
    });
    expect(mockUseSettingsForm.setPublicProfile).toHaveBeenCalledWith(false);
  });

  it('handles badge notifications toggle', async () => {
    render(<SettingsPage />);
    const toggle = screen.getByLabelText('Badge Notifications');
    await act(async () => {
      await user.click(toggle);
    });
    expect(mockUseSettingsForm.setBadgeNotifications).toHaveBeenCalledWith(false);
  });

  it('handles community updates toggle', async () => {
    render(<SettingsPage />);
    const toggle = screen.getByLabelText('Community Updates');
    await act(async () => {
      await user.click(toggle);
    });
    expect(mockUseSettingsForm.setCommunityUpdates).toHaveBeenCalledWith(true);
  });

  it('handles send password reset click', async () => {
    render(<SettingsPage />);
    const button = screen.getByRole('button', { name: 'Send Password Reset' });
    await act(async () => {
      await user.click(button);
    });
    expect(mockUseSettingsForm.handleSendPasswordReset).toHaveBeenCalled();
  });

  it('handles delete account click', async () => {
    render(<SettingsPage />);
    const button = screen.getByRole('button', { name: 'Delete Account' });
    await act(async () => {
      await user.click(button);
    });
    expect(mockUseSettingsForm.handleDeleteAccount).toHaveBeenCalled();
  });

  it('handles reset changes click', async () => {
    render(<SettingsPage />);
    const button = screen.getByRole('button', { name: 'Reset Changes' });
    await act(async () => {
      await user.click(button);
    });
    expect(mockUseSettingsForm.handleReset).toHaveBeenCalled();
  });

  it('handles save changes click', async () => {
    render(<SettingsPage />);
    const button = screen.getByRole('button', { name: 'Save Changes' });
    await act(async () => {
      await user.click(button);
    });
    expect(mockUseSettingsForm.handleSave).toHaveBeenCalled();
  });

  it('displays username error when present', async () => {
    (useSettingsForm as jest.Mock).mockReturnValue({
      ...mockUseSettingsForm,
      errors: { usernameError: 'Username is required', biographyError: '' },
    });
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByLabelText('Display Name')).toHaveClass('border-red-500');
    });
  });

  it('displays biography error when present', async () => {
    (useSettingsForm as jest.Mock).mockReturnValue({
      ...mockUseSettingsForm,
      errors: { usernameError: '', biographyError: 'Biography too long' },
    });
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('Biography too long')).toBeInTheDocument();
      expect(screen.getByLabelText('Biography')).toHaveClass('border-red-500');
    });
  });

  it('renders delete account modal when showDeleteModal is true', async () => {
    (useSettingsForm as jest.Mock).mockReturnValue({
      ...mockUseSettingsForm,
      showDeleteModal: true,
    });
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Delete account modal' })).toBeInTheDocument();
      expect(screen.getByText('Confirm deletion for test@example.com')).toBeInTheDocument();
    });
  });

  it('does not render delete account modal when showDeleteModal is false', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Delete account modal' })).not.toBeInTheDocument();
    });
  });

  it('closes delete account modal', async () => {
    (useSettingsForm as jest.Mock).mockReturnValue({
      ...mockUseSettingsForm,
      showDeleteModal: true,
    });
    render(<SettingsPage />);
    const closeButton = screen.getByRole('button', { name: 'Close modal' });
    await act(async () => {
      await user.click(closeButton);
    });
    expect(mockUseSettingsForm.setShowDeleteModal).toHaveBeenCalledWith(false);
  });

  it('handles missing currentProfilePictureUrl', async () => {
    (useSettingsForm as jest.Mock).mockReturnValue({
      ...mockUseSettingsForm,
      formData: { ...mockUseSettingsForm.formData, currentProfilePictureUrl: null },
    });
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('Current image: None')).toBeInTheDocument();
    });
  });
});