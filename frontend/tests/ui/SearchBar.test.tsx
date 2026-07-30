import SearchBar from '@/app/ui/SearchBar';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import { it, expect, describe } from 'vitest';

vi.mock('next/navigation', () => ({
    useSearchParams: vi.fn(),
}));

describe('SearchBar', () => {
   it('should placeholder equal to "Search..."', () => {
    vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>
    );

    render(<SearchBar handleSubmit={() => null} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search...');
   });

   it('should contain input button', () => {
    vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>
    );

    render(<SearchBar handleSubmit={() => null} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
   });

   it('should change value when triggered onChange', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>
    );

    const user = userEvent.setup();
    render(<SearchBar handleSubmit={() => null} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');

    await user.type(input, 'value');
    expect(input).toHaveValue('value');

    await user.type(input, ' 1');
    expect(input).toHaveValue('value 1');

    await user.clear(input);
    expect(input).toHaveValue('');
   });

   it('should apply provided in props onSubmit on input', async() => {
    vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>
    );

    let count = 0;

    const user = userEvent.setup();
    render(<SearchBar handleSubmit={() => count += 1} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'value');
    expect(input).toHaveValue('value');
    expect(count).toBe(0);

    const button = screen.getByRole('button');
    await user.click(button);
    expect(count).toBe(1);

    await user.click(input);
    await user.keyboard('{Enter}');
    expect(count).toBe(2);
   });
});