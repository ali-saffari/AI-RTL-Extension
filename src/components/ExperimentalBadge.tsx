import React from 'react';
import { createPortal } from 'react-dom';

const EXPERIMENTAL_TOOLTIP =
    'این قابلیت آزمایشی هست و ممکنه توی برخی سایت‌ها به‌درستی کار نکنه. اگر مشاهده کردین به پشتیبانی خبر بدید.';

const TOOLTIP_WIDTH = 228;
const GAP = 8;
const PAD = 8;
const ARROW = 6;

interface ExperimentalBadgeProps {
    isDarkMode: boolean;
}

interface TooltipPos {
    top: number;
    left: number;
    width: number;
    placement: 'top' | 'bottom';
    arrowLeft: number;
}

function intersectRects(a: DOMRect, b: Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>): DOMRect {
    const left = Math.max(a.left, b.left);
    const top = Math.max(a.top, b.top);
    const right = Math.min(a.right, b.right);
    const bottom = Math.min(a.bottom, b.bottom);
    return new DOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
}

function getBoundaryRect(element: HTMLElement): DOMRect {
    let boundary = new DOMRect(PAD, PAD, window.innerWidth - PAD * 2, window.innerHeight - PAD * 2);
    let node: HTMLElement | null = element.parentElement;

    while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        const overflow = `${style.overflow}|${style.overflowX}|${style.overflowY}`;
        if (/(auto|scroll|hidden|clip|overlay)/.test(overflow)) {
            boundary = intersectRects(boundary, node.getBoundingClientRect());
        }
        node = node.parentElement;
    }

    return boundary;
}

function getScrollParents(element: HTMLElement): Array<HTMLElement | Window> {
    const parents: Array<HTMLElement | Window> = [];
    let node: HTMLElement | null = element.parentElement;

    while (node) {
        const style = window.getComputedStyle(node);
        const overflow = `${style.overflow}|${style.overflowX}|${style.overflowY}`;
        if (/(auto|scroll|overlay)/.test(overflow)) {
            parents.push(node);
        }
        node = node.parentElement;
    }

    parents.push(window);
    return parents;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

const ExperimentalBadge: React.FC<ExperimentalBadgeProps> = ({ isDarkMode }) => {
    const [open, setOpen] = React.useState(false);
    const [pos, setPos] = React.useState<TooltipPos | null>(null);
    const chipRef = React.useRef<HTMLSpanElement>(null);
    const tooltipRef = React.useRef<HTMLSpanElement>(null);
    const tooltipBg = isDarkMode ? '#1f1f33' : '#1e293b';

    const updatePosition = React.useCallback(() => {
        const chip = chipRef.current;
        const tooltip = tooltipRef.current;
        if (!chip || !tooltip) {
            return;
        }

        const chipRect = chip.getBoundingClientRect();
        const boundary = getBoundaryRect(chip);
        const width = Math.min(TOOLTIP_WIDTH, Math.max(120, boundary.width - PAD * 2));
        const height = tooltip.offsetHeight || 72;
        const availableWidth = Math.max(0, boundary.width);
        const availableHeight = Math.max(0, boundary.height);

        if (availableWidth < 80 || availableHeight < 40) {
            setPos(null);
            return;
        }

        let left = chipRect.left + chipRect.width / 2 - width / 2;
        left = clamp(left, boundary.left + PAD, boundary.right - width - PAD);

        const spaceBelow = boundary.bottom - chipRect.bottom - GAP;
        const spaceAbove = chipRect.top - boundary.top - GAP;
        const showBelow = spaceBelow >= height || spaceBelow >= spaceAbove;

        let top: number;
        let placement: 'top' | 'bottom';
        if (showBelow) {
            placement = 'bottom';
            top = chipRect.bottom + GAP;
            if (top + height > boundary.bottom - PAD) {
                top = Math.max(boundary.top + PAD, boundary.bottom - height - PAD);
            }
        } else {
            placement = 'top';
            top = chipRect.top - GAP - height;
            if (top < boundary.top + PAD) {
                top = boundary.top + PAD;
            }
        }

        const chipCenter = chipRect.left + chipRect.width / 2;
        const arrowLeft = clamp(chipCenter - left - ARROW, 12, width - 12 - ARROW * 2);

        setPos({ top, left, width, placement, arrowLeft });
    }, []);

    React.useLayoutEffect(() => {
        if (!open) {
            setPos(null);
            return undefined;
        }

        updatePosition();
        const frame = window.requestAnimationFrame(updatePosition);

        const chip = chipRef.current;
        if (!chip) {
            window.cancelAnimationFrame(frame);
            return undefined;
        }

        const parents = getScrollParents(chip);
        parents.forEach((parent) => {
            parent.addEventListener('scroll', updatePosition, { capture: true, passive: true });
        });
        window.addEventListener('resize', updatePosition);

        return () => {
            window.cancelAnimationFrame(frame);
            parents.forEach((parent) => {
                parent.removeEventListener('scroll', updatePosition, { capture: true } as EventListenerOptions);
            });
            window.removeEventListener('resize', updatePosition);
        };
    }, [open, updatePosition]);

    const tooltip = open && typeof document !== 'undefined'
        ? createPortal(
            (
                <span
                    ref={tooltipRef}
                    role="tooltip"
                    style={{
                        position: 'fixed',
                        top: pos?.top ?? -9999,
                        left: pos?.left ?? -9999,
                        zIndex: 2147483647,
                        width: pos?.width ?? TOOLTIP_WIDTH,
                        padding: '8px 10px',
                        borderRadius: 8,
                        fontFamily: 'iranyekan',
                        fontSize: '0.72rem',
                        fontWeight: 400,
                        lineHeight: 1.75,
                        color: '#ffffff',
                        backgroundColor: tooltipBg,
                        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.28)',
                        whiteSpace: 'normal',
                        textAlign: 'right',
                        direction: 'rtl',
                        pointerEvents: 'none',
                        visibility: pos ? 'visible' : 'hidden',
                    }}
                >
                    {pos ? (
                        <span
                            style={{
                                position: 'absolute',
                                left: pos.arrowLeft,
                                width: 0,
                                height: 0,
                                ...(pos.placement === 'bottom'
                                    ? {
                                        top: -ARROW,
                                        borderLeft: `${ARROW}px solid transparent`,
                                        borderRight: `${ARROW}px solid transparent`,
                                        borderBottom: `${ARROW}px solid ${tooltipBg}`,
                                    }
                                    : {
                                        bottom: -ARROW,
                                        borderLeft: `${ARROW}px solid transparent`,
                                        borderRight: `${ARROW}px solid transparent`,
                                        borderTop: `${ARROW}px solid ${tooltipBg}`,
                                    }),
                            }}
                        />
                    ) : null}
                    {EXPERIMENTAL_TOOLTIP}
                </span>
            ),
            document.body
        )
        : null;

    return (
        <>
            <span
                ref={chipRef}
                tabIndex={0}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    padding: '0 4px',
                    borderRadius: 3,
                    fontSize: '0.5rem',
                    fontWeight: 500,
                    lineHeight: 1.5,
                    whiteSpace: 'nowrap',
                    cursor: 'help',
                    outline: 'none',
                    color: isDarkMode ? 'rgba(255, 183, 77, 0.9)' : '#e67e22',
                    border: `1px solid ${isDarkMode ? 'rgba(255, 152, 0, 0.28)' : 'rgba(230, 126, 34, 0.28)'}`,
                    background: isDarkMode ? 'rgba(255, 152, 0, 0.08)' : 'rgba(230, 126, 34, 0.08)',
                }}
            >
                آزمایشی
            </span>
            {tooltip}
        </>
    );
};

export default ExperimentalBadge;
