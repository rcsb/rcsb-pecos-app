type ButtonControlProps = {
    label: string,
    isDisabled?: boolean,
    onClick: () => void,
    style?: React.CSSProperties,
    className?: string
}

export function ActionButtonControl(props: ButtonControlProps) {
    return <button
        disabled={props.isDisabled}
        className={props.className}
        onClick={props.onClick}>
        {props.label}
    </button>;
}