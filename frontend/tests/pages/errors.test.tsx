import Error from "@/app/error";
import GlobalError from "@/app/global-error";
import NotFound from "@/app/not-found";
import { render, screen } from "@testing-library/react";

describe("errors", () => {
  it("should display buttons and error message for error.tsx", () => {
    render(<Error reset={() => null} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
    expect(screen.getByText("Return Home")).toBeInTheDocument();
    expect(screen.getByText("Return Home")).toHaveAttribute("href", "/");
  });

  it("should display buttons and error message for global-error.tsx", () => {
    render(<GlobalError reset={() => null} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
    expect(screen.getByText("Return Home")).toBeInTheDocument();
    expect(screen.getByText("Return Home")).toHaveAttribute("href", "/");
  });

  it("should display status code, error message and button to return to the main page", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByText("Return Home")).toBeInTheDocument();
    expect(screen.getByText("Return Home")).toHaveAttribute("href", "/");
  });
});
