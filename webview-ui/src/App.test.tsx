import App from "./App";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("should render", async () => {
  it("should render", () => {
    render(<App />);
    screen.debug();
  });
});
      