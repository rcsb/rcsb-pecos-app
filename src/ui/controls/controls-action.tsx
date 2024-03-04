import { Icon, DeleteSvg, PlusSignSvg } from '../icons';

type ActionControlProps = {
    info: string
    onClick: (param?: string) => void
    className?: string
}

export function AddActionControl(props: ActionControlProps) {
    return <Icon
        svg={PlusSignSvg}
        title={props.info}
        onClick={props.onClick}
        style={{ padding: '3px' }}
        className={props.className}
    />;
}

export function DeleteActionControl(props: ActionControlProps) {
    return <Icon
        svg={DeleteSvg}
        title={props.info}
        onClick={props.onClick}
        style={{ padding: '3px' }}
        className={props.className}
    />;
}
