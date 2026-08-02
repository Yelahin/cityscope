import { ApiError } from "@/app/lib/api/client";
import { ApiErrorResponse } from "@/app/lib/types";
import Login from "@/app/login/page";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { fetchApi } = vi.hoisted(() => ({
  fetchApi: vi.fn(),
}));

vi.mock("@/app/lib/api/client", () => ({
  default: fetchApi,
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

const assignMock = vi.fn();

Object.defineProperty(window, "location", {
  value: { assign: assignMock },
  writable: true,
});

describe("Login", () => {
  it("should display inputs for username, password and Login button", () => {
    render(<Login />);

    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should make POST request to token endpoint on valid form submit", async () => {
    render(<Login />);

    const user = userEvent.setup();

    const username = "testUsername";
    const password = "testPassword1";

    await user.click(screen.getByPlaceholderText("Username"));
    await user.type(screen.getByPlaceholderText("Username"), username);

    await user.click(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), password);

    expect(fetchApi).toHaveBeenCalledTimes(0);

    await user.click(screen.getByRole("button"));

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledWith("token/", undefined, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    expect(assignMock).toHaveBeenCalledTimes(1);
  });

  it("should display correspondet error when API raise 401 status code", async () => {
    vi.mocked(fetchApi).mockRejectedValue(
      new ApiError("Invalid username", 401, null),
    );
    render(<Login />);

    const user = userEvent.setup();

    const username = "testUsername";
    const password = "testPassword1";

    await user.click(screen.getByPlaceholderText("Username"));
    await user.type(screen.getByPlaceholderText("Username"), username);

    await user.click(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), password);

    expect(fetchApi).toHaveBeenCalledTimes(0);

    await user.click(screen.getByRole("button"));

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("Invalid username or password."),
    ).toBeInTheDocument();
  });

  it("should display correspondet error when unexpected error occur", async () => {
    vi.mocked(fetchApi).mockRejectedValue(new Error("Something went wrong!"));
    render(<Login />);

    const user = userEvent.setup();

    const username = "testUsername";
    const password = "testPassword1";

    await user.click(screen.getByPlaceholderText("Username"));
    await user.type(screen.getByPlaceholderText("Username"), username);

    await user.click(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), password);

    expect(fetchApi).toHaveBeenCalledTimes(0);

    await user.click(screen.getByRole("button"));

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("Login failed. Please try again."),
    ).toBeInTheDocument();
  });
});
