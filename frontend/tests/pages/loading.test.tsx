import Loading from "@/app/loading";
import { render, screen } from "@testing-library/react";

describe("Loading", () => {
  it("should contain Spinner component", () => {
    render(<Loading />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should display 'Loading...'", () => {
    render(<Loading />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
