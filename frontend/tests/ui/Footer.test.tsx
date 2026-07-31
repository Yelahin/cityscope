import Footer from '@/app/ui/footer';
import { render, screen, within } from '@testing-library/react';

describe('Footer', () => {
    it('should display project owner name', () => {
        render(<Footer />);

        const footer = screen.getByRole('contentinfo');
        expect(footer).toBeInTheDocument();

        const text = within(footer).getByText(/Illia Yelahin/i);
        expect(text).toBeInTheDocument();
    });

    it('should display copyright symbol', () => {
        render(<Footer />);

        const footer = screen.getByRole('contentinfo');
        expect(footer).toBeInTheDocument();

        const symbol = within(footer).getByText(/©/i);
        expect(symbol).toBeInTheDocument();
    });
});