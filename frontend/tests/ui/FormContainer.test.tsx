import FormContainer from "@/app/ui/FormContainer";
import { render, screen } from "@testing-library/react";

describe("FormContainer", () => {
  it("should render children", () => {
    render(
      <FormContainer>
        <p>Form content</p>
      </FormContainer>,
    );

    expect(screen.getByText("Form content")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <FormContainer className="custom-form-class">
        <p>Form content</p>
      </FormContainer>,
    );

    expect(container.firstChild).toHaveClass("custom-form-class");
  });
});
