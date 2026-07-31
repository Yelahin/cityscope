import ScrollableRow from '@/app/ui/ScrollableRow';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ScrollableRow', () => {
    beforeEach(() => {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
            configurable: true,
            value: 100,
        });

        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
            configurable: true,
            value: 1000,
        });

        HTMLElement.prototype.scrollBy = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
            this.scrollLeft = options.left ?? 0;
            fireEvent.scroll(this);
        }) as typeof HTMLElement.prototype.scrollBy;
    });

    it('should display children elements', () => {
        render(<ScrollableRow requiredToSelect={[] as string[]} scrollTrigger={0} ><p>Test ScrollableRow</p></ScrollableRow>);

        expect(screen.getByText('Test ScrollableRow')).toBeInTheDocument();
    });

    it('should not render buttons if row is too short', () => {
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
            configurable: true,
            value: 100,
        });

        render(<ScrollableRow requiredToSelect={[] as string[]} scrollTrigger={0} ><div></div></ScrollableRow>);

        expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('should render button scrollRight when row is long enough', async () => {
        render(
            <ScrollableRow requiredToSelect={[] as string[]} scrollTrigger={0}><div></div></ScrollableRow>
        );

        const buttons = await screen.findAllByRole('button');
        expect(buttons).toHaveLength(1);
        expect(await screen.findByTestId('scroll-right')).toBeInTheDocument();
    });

    it('should render button scrollLeft and scrollRight when user scrolled little to the right', async () => {
        render(
            <ScrollableRow requiredToSelect={[] as string[]} scrollTrigger={0}><div></div></ScrollableRow>
        );

        const user = userEvent.setup();

        let buttons = await screen.findAllByRole('button');
        expect(buttons).toHaveLength(1);

        await user.click(await screen.findByTestId('scroll-right'));

        expect(await screen.findByTestId('scroll-left')).toBeInTheDocument();
        expect(await screen.findByTestId('scroll-right')).toBeInTheDocument();
        buttons = await screen.findAllByRole('button');
        expect(buttons).toHaveLength(2);
    });

    it('should render button scrollRight when row is scroll to the right end', async () => {
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
            configurable: true,
            value: 200,
        });

        render(
            <ScrollableRow requiredToSelect={[] as string[]} scrollTrigger={0}><div></div></ScrollableRow>
        );

        const user = userEvent.setup();

        let buttons = await screen.findAllByRole('button');
        expect(buttons).toHaveLength(1);
        expect(await screen.findByTestId('scroll-right'));

        await user.click(await screen.findByTestId('scroll-right'));

        buttons = await screen.findAllByRole('button');
        expect(buttons).toHaveLength(1);
        expect(await screen.findByTestId('scroll-left')).toBeInTheDocument();
    });

    it('should not render scrollLeft button if row back in the start position', async () => {
       Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
            configurable: true,
            value: 200,
        });

        render(
            <ScrollableRow requiredToSelect={[] as string[]} scrollTrigger={0}><div></div></ScrollableRow>
        );

        const user = userEvent.setup();

        let buttons = await screen.findAllByRole('button');
        expect(buttons).toHaveLength(1);
        expect(await screen.findByTestId('scroll-right'));

        await user.click(await screen.findByTestId('scroll-right'));

        buttons = await screen.findAllByRole('button');
        expect(buttons).toHaveLength(1);
        expect(await screen.findByTestId('scroll-left')).toBeInTheDocument();

        await user.click(await screen.findByTestId('scroll-left'));


        buttons = await screen.findAllByRole('button');
        expect(buttons).toHaveLength(1);
        expect(await screen.findByTestId('scroll-right')).toBeInTheDocument();
    });
});