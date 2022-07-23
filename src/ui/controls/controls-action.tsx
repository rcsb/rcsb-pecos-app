import classNames from 'classnames';
import { useRef, useState, useEffect } from 'react';
import { Icon, DeleteSvg, PlusSignSvg } from '../icons';

type ActionControlProps = {
    info: string
    onClick: (param?: string) => void
    className?: string
}

type SelectionProps = {
    component: JSX.Element
    options: string[]
    onClick: (param?: string) => void
};

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

function MenuItem({ option, onClick }: {option: string, onClick: () => void;}) {
    return (
        <div className='dropdown-item' onClick={() => onClick()}>
            {option}
        </div>
    );
}

export function SelectableControl(props: SelectionProps) {

    const componentRef = useRef<HTMLElement>(null);

    const [showOptions, setVisibility] = useState(false);

    useEffect(() => {
        const checkIfClickedOutside = (e: Event) => {
            // If the menu is open and the clicked target is not within the menu, then close the menu
            if (showOptions && componentRef.current && !componentRef.current.contains(e.target as HTMLElement)) {
                setVisibility(false);
            }
        };
        document.addEventListener('keydown', checkIfClickedOutside);
        document.addEventListener('mousedown', checkIfClickedOutside);
        return () => {
            // Cleanup the event listener
            document.removeEventListener('keydown', checkIfClickedOutside);
            document.removeEventListener('mousedown', checkIfClickedOutside);
        };
    }, [showOptions]);

    const toogleVisibility = () => {
        setVisibility(!showOptions);
    };

    const onSelect = (opt: string) => {
        setVisibility(false);
        props.onClick(opt);
    };

    const renderOptions = (options: string[]) => {
        return <>
            {
                options.map((o, i) => {
                    return <MenuItem
                        key={i}
                        option={o}
                        onClick={() => onSelect(o)}
                    />;
                })
            }
        </>;
    };

    return <span ref={componentRef}>
        <span
            onClick={toogleVisibility}
            className={classNames('dropdown', 'new-item-select')}>
            {props.component}
        </span>
        {showOptions && <div className='dropdown-content'>{renderOptions(props.options)}</div>}
    </span>;
}

// export function DownloadActionControl(props: SelectableControlProps) {

// }