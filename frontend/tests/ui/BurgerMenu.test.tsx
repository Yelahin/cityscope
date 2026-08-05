import { useAuth } from "@/app/ui/AuthContext";
import BurgerMenu from "@/app/ui/BurgerMenu";
import {
  authenticatedUserPages,
  unAuthenticatedUserPages,
} from "@/app/ui/BurgerMenu";
import { render, screen, within } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
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

const logout = vi.fn().mockResolvedValue(undefined);

describe("BurgerMenu", () => {
  it("should return null if user is undefined", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: undefined,
      setUser: vi.fn(),
      logout,
    });

    function Wrapper() {
      const [isOpen, setIsOpen] = useState<boolean>(false);
      return <BurgerMenu isOpen={isOpen} setIsOpen={setIsOpen} />;
    }

    const { container } = render(<Wrapper />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should display burger menu when "isOpen" set to true', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      setUser: vi.fn(),
      logout,
    });

    function Wrapper() {
      const [isOpen, setIsOpen] = useState<boolean>(true);
      return <BurgerMenu isOpen={isOpen} setIsOpen={setIsOpen} />;
    }

    render(<Wrapper />);

    const burgerMenu = screen.getByTestId("burger-menu");
    expect(burgerMenu).toBeInTheDocument();
    expect(burgerMenu).toHaveClass("opacity-100");
    expect(burgerMenu).not.toHaveClass("opacity-0");
  });

  it('should not display burger menu when "isOpen" set to false', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      setUser: vi.fn(),
      logout,
    });

    function Wrapper() {
      const [isOpen, setIsOpen] = useState<boolean>(false);
      return <BurgerMenu isOpen={isOpen} setIsOpen={setIsOpen} />;
    }

    render(<Wrapper />);

    const burgerMenu = screen.getByTestId("burger-menu");
    expect(burgerMenu).toBeInTheDocument();
    expect(burgerMenu).toHaveClass("opacity-0");
    expect(burgerMenu).not.toHaveClass("opacity-100");
  });

  it('should change "isOpen" state clicking on burger menu button', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      setUser: vi.fn(),
      logout,
    });

    const user = userEvent.setup();

    function Wrapper() {
      const [isOpen, setIsOpen] = useState<boolean>(false);
      return <BurgerMenu isOpen={isOpen} setIsOpen={setIsOpen} />;
    }

    render(<Wrapper />);

    const burgerMenu = screen.getByTestId("burger-menu");
    expect(burgerMenu).toBeInTheDocument();
    expect(burgerMenu).toHaveClass("opacity-0");
    expect(burgerMenu).not.toHaveClass("opacity-100");

    const burgerMenuButton = screen.getByRole("button");
    await user.click(burgerMenuButton);
    expect(burgerMenu).toHaveClass("opacity-100");
    expect(burgerMenu).not.toHaveClass("opacity-0");

    await user.click(burgerMenuButton);
    expect(burgerMenu).toHaveClass("opacity-0");
    expect(burgerMenu).not.toHaveClass("opacity-100");
  });

  it("should display correspondent links for unathenticated user", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      setUser: vi.fn(),
      logout,
    });

    function Wrapper() {
      const [isOpen, setIsOpen] = useState<boolean>(false);
      return <BurgerMenu isOpen={isOpen} setIsOpen={setIsOpen} />;
    }

    render(<Wrapper />);

    const burgerMenu = screen.getByTestId("burger-menu");
    expect(burgerMenu).toBeInTheDocument();

    const list = within(burgerMenu).getByRole("list");
    expect(list).toBeInTheDocument();

    if (unAuthenticatedUserPages.length > 0) {
      unAuthenticatedUserPages.forEach((page) => {
        const link = within(list).getByText(page.label);
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", page.href);
      });
    }
  });

  it("should display correspondent links for anuthenticated user", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "testUser", email: "testEmail@gmail.com" },
      setUser: vi.fn(),
      logout,
    });

    function Wrapper() {
      const [isOpen, setIsOpen] = useState<boolean>(false);
      return <BurgerMenu isOpen={isOpen} setIsOpen={setIsOpen} />;
    }

    render(<Wrapper />);

    const burgerMenu = screen.getByTestId("burger-menu");
    expect(burgerMenu).toBeInTheDocument();

    const list = within(burgerMenu).getByRole("list");
    expect(list).toBeInTheDocument();

    if (authenticatedUserPages.length > 0) {
      authenticatedUserPages.forEach((page) => {
        if (page.href !== "/logout") {
          const link = within(list).getByText(page.label);
          expect(link).toBeInTheDocument();
          expect(link).toHaveAttribute("href", page.href);
        } else {
          const logoutButton = within(list).getByText(page.label);
          expect(logoutButton).toBeInTheDocument();
        }
      });
    }
  });

  it("should logout user when clicked on Log out button", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "testUser", email: "testEmail@gmail.com" },
      setUser: vi.fn(),
      logout,
    });

    const user = userEvent.setup();

    function Wrapper() {
      const [isOpen, setIsOpen] = useState<boolean>(false);
      return <BurgerMenu isOpen={isOpen} setIsOpen={setIsOpen} />;
    }

    render(<Wrapper />);

    const burgerMenu = screen.getByTestId("burger-menu");
    expect(burgerMenu).toBeInTheDocument();

    const list = within(burgerMenu).getByRole("list");
    expect(list).toBeInTheDocument();

    if (authenticatedUserPages.length > 0) {
      const logoutButton = within(list).getByText("Log Out");
      expect(logoutButton).toBeInTheDocument();

      await user.click(logoutButton);
      expect(logout).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith("/");
      expect(refresh).toHaveBeenCalledTimes(1);
    }
  });
});
