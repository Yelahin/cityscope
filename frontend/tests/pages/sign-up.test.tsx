import { ApiError } from "@/app/lib/api/client";
import { ApiErrorResponse } from "@/app/lib/types";
import SignUp from "@/app/sign-up/page";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { push, fetchApi } = vi.hoisted(() => ({
  push: vi.fn(),
  fetchApi: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
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

describe("sign-up", () => {
  it("should display 3 inputs for username, email and password", () => {
    render(<SignUp />);

    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("Sign Up");
  });

  it("should make POST request to register endpoint on submitting valid form", async () => {
    render(<SignUp />);

    const user = userEvent.setup();

    const username = "testUsername";
    const email = "testEmail@gmail.com";
    const password = "testPassword1";

    await user.click(screen.getByPlaceholderText("Username"));
    await user.type(screen.getByPlaceholderText("Username"), username);

    await user.click(screen.getByPlaceholderText("Email"));
    await user.type(screen.getByPlaceholderText("Email"), email);

    await user.click(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), password);

    expect(fetchApi).toHaveBeenCalledTimes(0);

    await user.click(screen.getByRole("button"));

    expect(push).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledWith("register/", undefined, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
  });

  it("should return empty form after successful submition", async () => {
    render(<SignUp />);

    const user = userEvent.setup();

    await user.click(screen.getByPlaceholderText("Username"));
    await user.type(screen.getByPlaceholderText("Username"), "testUsername");

    await user.click(screen.getByPlaceholderText("Email"));
    await user.type(
      screen.getByPlaceholderText("Email"),
      "testEmail@gmail.com",
    );

    await user.click(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), "testPassword1");

    expect(fetchApi).toHaveBeenCalledTimes(0);

    await user.click(screen.getByRole("button"));

    expect(push).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledTimes(1);

    const usernameInput = screen.getByPlaceholderText(
      "Username",
    ) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText("Email") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      "Password",
    ) as HTMLInputElement;

    expect(usernameInput.value).toBe("");
    expect(emailInput.value).toBe("");
    expect(passwordInput.value).toBe("");
  });

  it("should return validation error messages on submittion empty form", async () => {
    render(<SignUp />);

    const user = userEvent.setup();

    await user.click(screen.getByRole("button"));

    expect(push).toHaveBeenCalledTimes(0);
    expect(fetchApi).toHaveBeenCalledTimes(0);

    // Username
    expect(
      screen.getByText("Username should be at least 3 characters long!"),
    ).toBeInTheDocument();

    // Email
    expect(screen.getByText("Enter valid email address!")).toBeInTheDocument();

    // Password
    expect(
      screen.getByText("Password should be at least 6 characters long!"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password should contain lower case letter!"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password should contain upper case letter!"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password should contain number!"),
    ).toBeInTheDocument();
  });

  it("should return validation error on submitting form with invalid username", async () => {
    render(<SignUp />);

    const user = userEvent.setup();

    const username = "us";
    const email = "testEmail@gmail.com";
    const password = "testPassword1";

    await user.click(screen.getByPlaceholderText("Username"));
    await user.type(screen.getByPlaceholderText("Username"), username);

    await user.click(screen.getByPlaceholderText("Email"));
    await user.type(screen.getByPlaceholderText("Email"), email);

    await user.click(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), password);

    await user.click(screen.getByRole("button"));

    expect(push).toHaveBeenCalledTimes(0);
    expect(fetchApi).toHaveBeenCalledTimes(0);
    expect(
      screen.getByText("Username should be at least 3 characters long!"),
    ).toBeInTheDocument();
  });

  it("should return validation error on submittiong form with invalid email", async () => {
    render(<SignUp />);

    const user = userEvent.setup();

    const username = "testUser";
    const email = "testEmail";
    const password = "testPassword1";

    await user.click(screen.getByPlaceholderText("Username"));
    await user.type(screen.getByPlaceholderText("Username"), username);

    await user.click(screen.getByPlaceholderText("Email"));
    await user.type(screen.getByPlaceholderText("Email"), email);

    await user.click(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), password);

    await user.click(screen.getByRole("button"));

    expect(push).toHaveBeenCalledTimes(0);
    expect(fetchApi).toHaveBeenCalledTimes(0);
    expect(screen.getByText("Enter valid email address!")).toBeInTheDocument();
  });

  it("should return validation error on submittiong form with invalid password", async () => {
    render(<SignUp />);

    const user = userEvent.setup();

    const username = "testUser";
    const email = "testEmail@gmail.com";
    const password = "short";

    await user.click(screen.getByPlaceholderText("Username"));
    await user.type(screen.getByPlaceholderText("Username"), username);

    await user.click(screen.getByPlaceholderText("Email"));
    await user.type(screen.getByPlaceholderText("Email"), email);

    await user.click(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), password);

    await user.click(screen.getByRole("button"));

    expect(push).toHaveBeenCalledTimes(0);
    expect(fetchApi).toHaveBeenCalledTimes(0);
    expect(
      screen.getByText("Password should be at least 6 characters long!"),
    ).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), "LONGPASSWORD");

    await user.click(screen.getByRole("button"));
    expect(
      screen.queryByText("Password should be at least 6 characters long!"),
    ).not.toBeInTheDocument();
    expect(push).toHaveBeenCalledTimes(0);
    expect(fetchApi).toHaveBeenCalledTimes(0);
    expect(
      screen.getByText("Password should contain lower case letter!"),
    ).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), "longpassword");

    await user.click(screen.getByRole("button"));
    expect(
      screen.queryByText("Password should contain lower case letter!"),
    ).not.toBeInTheDocument();
    expect(push).toHaveBeenCalledTimes(0);
    expect(fetchApi).toHaveBeenCalledTimes(0);
    expect(
      screen.getByText("Password should contain upper case letter!"),
    ).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), "longPASSWORD");

    await user.click(screen.getByRole("button"));
    expect(
      screen.queryByText("Password should contain upper case letter!"),
    ).not.toBeInTheDocument();
    expect(push).toHaveBeenCalledTimes(0);
    expect(fetchApi).toHaveBeenCalledTimes(0);
    expect(
      screen.getByText("Password should contain number!"),
    ).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), "longPASSWORD1");

    await user.click(screen.getByRole("button"));
    expect(
      screen.queryByText("Password should be at least 6 characters long!"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Password should contain lower case letter!"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Password should contain upper case letter!"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Password should contain number!"),
    ).not.toBeInTheDocument();
    expect(push).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledTimes(1);
  });

  it("should return API error if one occured during fetching", async () => {
    vi.mocked(fetchApi).mockRejectedValue(
      new ApiError("User with 'testUsername' already exist", 403, {
        detail: undefined,
        message: {
          username: ["User with 'testUsername' username alredy registered"],
        },
      }),
    );
    render(<SignUp />);

    const user = userEvent.setup();

    const username = "testUsername";
    const email = "testEmail@gmail.com";
    const password = "testPassword1";

    await user.click(screen.getByPlaceholderText("Username"));
    await user.type(screen.getByPlaceholderText("Username"), username);

    await user.click(screen.getByPlaceholderText("Email"));
    await user.type(screen.getByPlaceholderText("Email"), email);

    await user.click(screen.getByPlaceholderText("Password"));
    await user.type(screen.getByPlaceholderText("Password"), password);

    expect(fetchApi).toHaveBeenCalledTimes(0);

    await user.click(screen.getByRole("button"));

    expect(
      screen.getByText("User with 'testUsername' username alredy registered"),
    ).toBeInTheDocument();

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledTimes(0);
  });
});
