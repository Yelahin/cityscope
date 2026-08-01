import fetchApi, { ApiError } from "@/app/lib/api/client";
import { ApiErrorResponse } from "@/app/lib/types";
import { useAuth } from "@/app/ui/AuthContext";
import SaveSearch from "@/app/ui/SaveSearch";
import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: push,
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/app/ui/AuthContext", async () => {
  const actual = await vi.importActual("@/app/ui/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock("@/app/lib/api/client", () => ({
  default: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    data: ApiErrorResponse | null;

    constructor(
      message: string,
      status: number,
      data: ApiErrorResponse | null,
    ) {
      super(message);
      this.status = status;
      this.data = data;
    }
  },
}));

describe("SaveSearch", () => {
  it("should open form when click on button", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "testUser", email: "testEmail@gmail.com" },
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<SaveSearch />);

    const user = userEvent.setup();

    expect(document.querySelector("form")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("save-search-button"));

    expect(document.querySelector("form")).toBeInTheDocument();
  });

  it("should close form when click on close button", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "testUser", email: "testEmail@gmail.com" },
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<SaveSearch />);

    const user = userEvent.setup();

    expect(document.querySelector("form")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("save-search-button"));

    expect(document.querySelector("form")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));

    expect(document.querySelector("form")).not.toBeInTheDocument();
  });

  it("should redirect user on click button if user is unauthenticated", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<SaveSearch />);

    const user = userEvent.setup();

    expect(document.querySelector("form")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("save-search-button"));

    expect(document.querySelector("form")).not.toBeInTheDocument();
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(`/login?next=${encodeURIComponent("/")}`);
  });

  it("should display error if user trying to save search with empty name", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "testUser", email: "testEmail@gmail.com" },
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<SaveSearch />);

    const user = userEvent.setup();

    expect(screen.queryByTestId("saved-search-error")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("save-search-button"));
    expect(document.querySelector("form")).toBeInTheDocument();

    await user.click(screen.getByText("Save"));

    expect(screen.getByTestId("saved-search-error")).toBeInTheDocument();
  });

  it("should make POST request to saved search endpoint on submiting valid form", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "testUser", email: "testEmail@gmail.com" },
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<SaveSearch />);

    const user = userEvent.setup();

    await user.click(screen.getByTestId("save-search-button"));
    expect(document.querySelector("form")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), "Search name");
    await user.click(screen.getByText("Save"));

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledWith("searches/", undefined, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Search name", params: {} }),
    });

    expect(screen.queryByTestId("saved-search-error")).not.toBeInTheDocument();
  });

  it("should display error when POST request failed", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "testUser", email: "testEmail@gmail.com" },
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(fetchApi).mockRejectedValue(
      new ApiError("API error: something went wrong", 500, null),
    );

    render(<SaveSearch />);

    const user = userEvent.setup();

    await user.click(screen.getByTestId("save-search-button"));
    expect(document.querySelector("form")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), "Search name");
    await user.click(screen.getByText("Save"));

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledWith("searches/", undefined, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Search name", params: {} }),
    });

    expect(screen.getByTestId("saved-search-error")).toBeInTheDocument();
  });
});
