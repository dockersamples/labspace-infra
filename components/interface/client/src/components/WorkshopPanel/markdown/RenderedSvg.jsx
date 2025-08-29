export function RenderedSvg({ node, children, ...rest }) {
    return (
        <svg {...rest}>
            {children}
        </svg>
    );
}