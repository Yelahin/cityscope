import { OutlineButton, OutlineButtonLink } from "@/app/ui/OutlineButton";
import { PrimaryButton, PrimaryButtonLink } from "@/app/ui/PrimaryButton";
import { SecondaryButton, SecondaryButtonLink } from "@/app/ui/SecondaryButton";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("buttons", () => {
  it("should call onClick when primary button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<PrimaryButton onClick={onClick}>Save</PrimaryButton>);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when primary button is disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <PrimaryButton onClick={onClick} disabled>
        Save
      </PrimaryButton>,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("should support submit type for primary button", () => {
    render(<PrimaryButton type="submit">Submit</PrimaryButton>);

    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("should call onClick when secondary button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<SecondaryButton onClick={onClick}>Clear</SecondaryButton>);

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should call onClick when outline button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<OutlineButton onClick={onClick}>Cancel</OutlineButton>);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render button links with correct href", () => {
    render(
      <>
        <PrimaryButtonLink href="/places/1">Primary link</PrimaryButtonLink>
        <SecondaryButtonLink href="/search">Secondary link</SecondaryButtonLink>
        <OutlineButtonLink href="/profile">Outline link</OutlineButtonLink>
      </>,
    );

    expect(screen.getByRole("link", { name: "Primary link" })).toHaveAttribute(
      "href",
      "/places/1",
    );
    expect(
      screen.getByRole("link", { name: "Secondary link" }),
    ).toHaveAttribute("href", "/search");
    expect(screen.getByRole("link", { name: "Outline link" })).toHaveAttribute(
      "href",
      "/profile",
    );
  });
});
