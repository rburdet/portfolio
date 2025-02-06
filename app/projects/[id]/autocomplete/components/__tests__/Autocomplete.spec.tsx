import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import Autocomplete from "../Autocomplete";

// Mock fetch globally
global.fetch = jest.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}

interface ProductResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

const mockProducts: ProductResponse = {
  products: [
    {
      id: 1,
      title: "iPhone 9",
      description: "foo",
      price: 549,
      thumbnail: "https://dummy.jpg",
    },
    {
      id: 2,
      title: "iPhone X",
      description: "bar",
      price: 899,
      thumbnail: "https://dummy.jpg",
    },
  ],
  total: 2,
  skip: 0,
  limit: 2,
};


describe("Autocomplete Component", () => {
  const user = userEvent.setup({ delay: null });

  beforeEach(() => {
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockClear();
    // Setup default mock response
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockProducts)
      })
    );
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders input field with correct attributes", () => {
    render(<Autocomplete />);

    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Search products...");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
  });

  it("displays suggestions when user types", async () => {
    render(<Autocomplete />);
    const input = screen.getByRole("combobox");
    
    await user.type(input, "iphone");
    
    // Fast-forward debounce timer
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      const suggestions = screen.getAllByRole("option");
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toHaveTextContent("iPhone 9");
      expect(suggestions[1]).toHaveTextContent("iPhone X");
    });
  });

  it("handles keyboard navigation correctly", async () => {
    render(<Autocomplete />);
    const input = screen.getByRole("combobox");
    
    await user.type(input, "iphone");
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    await user.keyboard("{ArrowDown}");
    expect(screen.getAllByRole("option")[0]).toHaveClass("suggestion-item--active");

    await user.keyboard("{ArrowDown}");
    expect(screen.getAllByRole("option")[1]).toHaveClass("suggestion-item--active");

    await user.keyboard("{ArrowUp}");
    expect(screen.getAllByRole("option")[0]).toHaveClass("suggestion-item--active");
  });

  it("selects suggestion on enter key", async () => {
    render(<Autocomplete />);
    const input = screen.getByRole("combobox");
    
    await user.type(input, "iphone");
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(input).toHaveValue("iPhone 9");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes suggestions on escape key", async () => {
    render(<Autocomplete />);
    const input = screen.getByRole("combobox");
    
    await user.type(input, "iphone");
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("handles click selection of suggestions", async () => {
    render(<Autocomplete />);
    const input = screen.getByRole("combobox");
    
    await user.type(input, "iphone");
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    await user.click(screen.getAllByRole("option")[0]);

    expect(input).toHaveValue("iPhone 9");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("handles empty query correctly", async () => {
    render(<Autocomplete />);
    const input = screen.getByRole("combobox");
    
    await user.clear(input);
    jest.advanceTimersByTime(500);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
