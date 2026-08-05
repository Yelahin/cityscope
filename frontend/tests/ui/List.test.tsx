import List from "@/app/ui/List";
import { render, screen, within } from "@testing-library/react";

describe("List", () => {
  it("should display children", () => {
    const { rerender } = render(
      <List>
        <p>Test List</p>
      </List>,
    );

    expect(screen.getByText("Test List")).toBeInTheDocument();

    rerender(
      <List>
        <p>Another List test</p>
      </List>,
    );

    expect(screen.queryByText("Test List")).not.toBeInTheDocument();
    expect(screen.getByText("Another List test")).toBeInTheDocument();
  });

  it("should display children inside of unordered list", () => {
    render(
      <List>
        <p>Test List</p>
      </List>,
    );

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(within(list).getByText("Test List")).toBeInTheDocument();
  });
});
