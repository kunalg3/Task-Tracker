import { describe, expect, it, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import tasksReducer from "./features/tasks/taskSlice";
import App from "./App";

function renderWithStore(ui) {
  const store = configureStore({
    reducer: { tasks: tasksReducer },
  });
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}

describe("App integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds a task and shows it in the list", async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.type(
      screen.getByPlaceholderText(/finish redux assignment/i),
      "Ship tests",
    );
    await user.click(screen.getByRole("button", { name: /add task/i }));

    expect(screen.getByText("Ship tests")).toBeInTheDocument();
  });

  it("filters active/completed", async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    // Add two tasks
    await user.type(
      screen.getByPlaceholderText(/finish redux assignment/i),
      "A",
    );
    await user.click(screen.getByRole("button", { name: /add task/i }));
    await user.type(
      screen.getByPlaceholderText(/finish redux assignment/i),
      "B",
    );
    await user.click(screen.getByRole("button", { name: /add task/i }));

    // Complete task B (most recent appears first due to unshift)
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    await user.click(screen.getByRole("button", { name: /active/i }));
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("B")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /completed/i }));
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });
});

