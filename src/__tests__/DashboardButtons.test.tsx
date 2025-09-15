import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardButtons } from "../components/DashboardButtons";
import { FEATURES } from "../data/features";
import "@testing-library/jest-dom/extend-expect";

describe("DashboardButtons", () => {
  it("renders all feature buttons", () => {
    render(
      <MemoryRouter>
        <DashboardButtons />
      </MemoryRouter>
    );

    FEATURES.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.short)).toBeInTheDocument();
    });
  });

  it("navigates to feature info page on click", () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardButtons />
      </MemoryRouter>
    );

    const firstFeatureLink = container.querySelector(
      `a[href="/feature/${FEATURES[0].id}"]`
    );
    expect(firstFeatureLink).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(
      <MemoryRouter>
        <DashboardButtons />
      </MemoryRouter>
    );

    FEATURES.forEach((feature) => {
      const description = screen.getByText(feature.short);
      expect(description).toHaveAttribute("id", `feature-${feature.id}-desc`);
    });
  });
});
