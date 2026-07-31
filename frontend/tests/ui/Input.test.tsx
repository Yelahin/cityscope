import Input from "@/app/ui/Input";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

describe("Input", () => {
  it("should display placeholder", () => {
    const placeholder = "TestPlaceholder";
    const { container } = render(
      <Input
        placeholder={placeholder}
        value=""
        isButton={false}
        onChange={() => null}
      />,
    );

    const div = container.querySelector("div")!;
    expect(div).toBeInTheDocument();
    const input = within(div).getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", placeholder);
  });

  it("should set default type to textbox", () => {
    render(
      <Input
        placeholder=""
        value="First Value"
        isButton={false}
        onChange={() => null}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("should apply input type from props", async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [value, setValue] = useState<number>(0);

      return (
        <Input
          placeholder=""
          type="number"
          value={value}
          isButton={true}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      );
    }

    render(<Wrapper />);

    const input = screen.getByRole("spinbutton");
    expect(input).toBeInTheDocument();

    await user.type(input, "100");
    expect(input).toHaveValue(100);

    await user.clear(input);
    await user.type(input, "some");
    expect(input).toHaveValue(0);
  });

  it("should change input value to provided in props", () => {
    const { rerender } = render(
      <Input
        placeholder=""
        value="First Value"
        isButton={false}
        onChange={() => null}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("First Value");
    expect(input).not.toHaveValue("Seond Value");

    rerender(
      <Input
        placeholder=""
        value="Second Value"
        isButton={false}
        onChange={() => null}
      />,
    );
    expect(input).toHaveValue("Second Value");
    expect(input).not.toHaveValue("First Value");
  });

  it("should apply onChange function", async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [value, setValue] = useState<string>("");

      return (
        <Input
          placeholder=""
          value={value}
          isButton={false}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }

    render(<Wrapper />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");

    await user.type(input, "New value");
    expect(input).toHaveValue("New value");

    await user.type(input, " 2");
    expect(input).toHaveValue("New value 2");

    await user.clear(input);
    expect(input).toHaveValue("");
  });

  it("should apply onSubmit when clicked Enter", async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [value, setValue] = useState<string>("");

      return (
        <Input
          placeholder=""
          value={value}
          isButton={false}
          onChange={(e) => setValue(e.target.value)}
          onSubmit={() => setValue("Clicked onSubmit")}
        />
      );
    }

    render(<Wrapper />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    await user.type(input, "onChange value");
    expect(input).toHaveValue("onChange value");

    await user.click(input);
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("Clicked onSubmit");
  });

  it("should display button when isButton set to true", () => {
    const { rerender } = render(
      <Input
        placeholder=""
        value="First Value"
        isButton={false}
        onChange={() => null}
      />,
    );

    let button = screen.queryByRole("button");
    expect(button).toBeNull();

    rerender(
      <Input
        placeholder=""
        value="First Value"
        isButton={true}
        onChange={() => null}
      />,
    );
    button = screen.queryByRole("button");
    expect(button).not.toBeNull();
    expect(button).toBeInTheDocument();
  });

  it("should trigger onSubmit when clicked on button", async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [value, setValue] = useState<string>("");

      return (
        <Input
          placeholder=""
          value={value}
          isButton={true}
          onChange={(e) => setValue(e.target.value)}
          onSubmit={() => setValue("Clicked onSubmit")}
        />
      );
    }

    render(<Wrapper />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    await user.type(input, "onChange value");
    expect(input).toHaveValue("onChange value");

    const button = screen.getByRole("button");
    await user.click(button);
    expect(input).toHaveValue("Clicked onSubmit");
  });

  it("should omit onSubmit if no onSubmit was provided", async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [value, setValue] = useState<string>("");

      return (
        <Input
          placeholder=""
          value={value}
          isButton={true}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }

    render(<Wrapper />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    await user.type(input, "First Value");
    expect(input).toHaveValue("First Value");

    const button = screen.getByRole("button");
    await user.click(button);
    expect(input).toHaveValue("First Value");

    await user.click(input);
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("First Value");
  });
});
