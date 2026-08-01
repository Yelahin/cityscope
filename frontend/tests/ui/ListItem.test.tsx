import ListItem from "@/app/ui/ListItem";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

describe("ListItem", () => {
  it("should display children in list item", () => {
    const { rerender } = render(
      <ListItem onClick={() => null}>
        <p>Test ListItem</p>
      </ListItem>,
    );

    expect(screen.getByText("Test ListItem")).toBeInTheDocument();

    rerender(
      <ListItem onClick={() => null}>
        <p>Test</p>
      </ListItem>,
    );

    expect(screen.queryByText("Test ListItem")).not.toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should trigger onClick function when click on list item", async () => {
    function Wrapper() {
      const [count, setCount] = useState<number>(0);

      return (
        <ListItem onClick={() => setCount((prev) => prev + 1)}>
          <p>{`ListItem ${count}`}</p>
        </ListItem>
      );
    }

    const user = userEvent.setup();

    render(<Wrapper />);
    expect(screen.getByText("ListItem 0")).toBeInTheDocument();

    await user.click(screen.getByText("ListItem 0"));

    expect(screen.queryByText("ListItem 0")).not.toBeInTheDocument();
    expect(screen.getByText("ListItem 1")).toBeInTheDocument();

    await user.click(screen.getByText("ListItem 1"));

    expect(screen.queryByText("ListItem 1")).not.toBeInTheDocument();
    expect(screen.getByText("ListItem 2")).toBeInTheDocument();
  });
});
