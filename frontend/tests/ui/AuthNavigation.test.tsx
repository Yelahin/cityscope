import { useAuth } from '@/app/ui/AuthContext';
import AuthNavigation from '@/app/ui/AuthNavigation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const push = vi.fn();
const refresh = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: push,
        refresh: refresh,
    }),
}));

vi.mock('@/app/ui/AuthContext', async () => {
    const actual = await vi.importActual('@/app/ui/AuthContext');
    return {
        ...actual,
        useAuth: vi.fn(),
    }
});

const logout = vi.fn().mockResolvedValue(undefined);

describe('AuthNavigation', () => {
    it('should return null if user is undefined', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: undefined,
            setUser: vi.fn(),
            logout,
        });

        const { container } = render(<AuthNavigation />);

        expect(container).toBeEmptyDOMElement();
    });

    it('should return Sign Up and Login buttons if user unauthenticated', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            setUser: vi.fn(),
            logout,
        });

        render(<AuthNavigation />);

        const signUpButton = screen.getByRole('link', {'name': 'Sign Up'});
        expect(signUpButton).toBeInTheDocument();

        const loginButton = screen.getByRole('link', {'name': 'Login'});
        expect(loginButton).toBeInTheDocument();
    });

    it('should return Profile and Logout buttons if user loged in', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {username: "testUser", email: "testEmail@gmail.com"},
            setUser: vi.fn(),
            logout,
        });

        render(<AuthNavigation />);

        const profileButton = screen.getByRole('link', {'name': 'Profile'});
        expect(profileButton).toBeInTheDocument();

        const logoutButton = screen.getByRole('button', {'name': 'Logout'});
        expect(logoutButton).toBeInTheDocument();
    });

    it('should redirect user when clicked on Sign Up button', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            setUser: vi.fn(),
            logout,
        });

        render(<AuthNavigation />);
        const signUpButton = screen.getByRole('link', {'name': 'Sign Up'});
        expect(signUpButton).toBeInTheDocument();
        expect(signUpButton).toHaveAttribute('href', '/sign-up');
    });

    it('should redirect user when clicked on Login button', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            setUser: vi.fn(),
            logout,
        });

        render(<AuthNavigation />);
        const loginButton = screen.getByRole('link', {'name': 'Login'});
        expect(loginButton).toBeInTheDocument();
        expect(loginButton).toHaveAttribute('href', '/login');
    });

    it('should redirect user when clicked on Profile button', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {username: "testUser", email: "testEmail@gmail.com"},
            setUser: vi.fn(),
            logout,
        });

        render(<AuthNavigation />);
        const profileButton = screen.getByRole('link', {'name': 'Profile'});
        expect(profileButton).toBeInTheDocument();
        expect(profileButton).toHaveAttribute('href', '/profile');
    });

    it('should redirect user when clicked on Logout button', async () => {
        const user = userEvent.setup();

        vi.mocked(useAuth).mockReturnValue({
            user: {username: "testUser", email: "testEmail@gmail.com"},
            setUser: vi.fn(),
            logout,
        });

        render(<AuthNavigation />);
        const logoutButton = screen.getByRole('button', {'name': 'Logout'});
        expect(logoutButton).toBeInTheDocument();

        await user.click(logoutButton);
        
        expect(logout).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith('/');
        expect(refresh).toHaveBeenCalledTimes(1);
    });
});