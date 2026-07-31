import { render, screen, within } from "@testing-library/react";
import Header from "@/app/ui/header";
import { useAuth } from "@/app/ui/AuthContext";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/",
}));

vi.mock("@/app/ui/AuthContext", async () => {
  const actual = await vi.importActual("@/app/ui/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mocked(useAuth).mockReturnValue({
  user: null,
  setUser: vi.fn(),
  logout: vi.fn(),
});

describe("Header", () => {
  it("should redirect user when user click on the Cityscope icon", () => {
    render(<Header />);

    const icon = screen.getByTestId("cityscope-icon-link");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("href", "/");
  });

  it("should redirect user when user click on the Cityscope logo", () => {
    render(<Header />);

    const icon = screen.getByTestId("cityscope-logo-link");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("href", "/");
  });

  it("should contain Sign Up and Login buttons for unauthenticated user", () => {
    render(<Header />);

    const nav = screen.getByRole("navigation");
    const signUpButton = within(nav).getByRole("link", { name: "Sign Up" });
    expect(signUpButton).toBeInTheDocument();

    const loginButton = within(nav).getByRole("link", { name: "Login" });
    expect(loginButton).toBeInTheDocument();
  });

  it("should conatin Profile and Logout buttons for authenticated user", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "testUser", email: "testEmail@gmail.com" },
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);

    const nav = screen.getByRole("navigation");
    const signUpButton = within(nav).getByRole("link", { name: "Profile" });
    expect(signUpButton).toBeInTheDocument();

    const loginButton = within(nav).getByRole("button", { name: "Logout" });
    expect(loginButton).toBeInTheDocument();
  });

  it("should display burger menu", () => {
    render(<Header />);

    const burgerMenu = screen.getByTestId("burger-menu");
    expect(burgerMenu).toBeInTheDocument();
  });

  it("should close the burger menu when user click on the Cityscope icon", async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Check that the burger menu is closed by default
    const burgerMenu = screen.getByTestId("burger-menu");
    expect(burgerMenu).toHaveClass("opacity-0");

    // Open the burger menu
    const burgerMenuButton = screen.getByTestId("burger-menu-button");
    await user.click(burgerMenuButton);
    expect(burgerMenu).toHaveClass("opacity-100");

    // Check that the Cityscope icon closes the burger menu
    const icon = screen.getByTestId("cityscope-icon-link");
    await user.click(icon);
    expect(burgerMenu).toHaveClass("opacity-0");
  });

  it("should close the burger menu when user click on the Cityscope logo", async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Check that the burger menu is closed by default
    const burgerMenu = screen.getByTestId("burger-menu");
    expect(burgerMenu).toHaveClass("opacity-0");

    // Open the burger menu
    const burgerMenuButton = screen.getByTestId("burger-menu-button");
    await user.click(burgerMenuButton);
    expect(burgerMenu).toHaveClass("opacity-100");

    // Check that the Cityscope icon closes the burger menu
    const logo = screen.getByTestId("cityscope-logo-link");
    await user.click(logo);
    expect(burgerMenu).toHaveClass("opacity-0");
  });
});
