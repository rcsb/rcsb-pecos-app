import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import ArrowDownIcon from '../icons/arrow-down';
import InputItemsMenu from './input-items-menu';

export default function MutateItemType({ showTitle, onItemSelection }) {
    const ref = useRef();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function toggleMenuState() {
        setIsMenuOpen(!isMenuOpen);
    }

    function handleItemSelection(itemId) {
        setIsMenuOpen(false);
        onItemSelection(itemId);
    }

    useEffect(() => {
        const checkIfClickedOutside = e => {
            // If the menu is open and the clicked target is not within the menu,
            // then close the menu
            if (isMenuOpen && ref.current && !ref.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('keydown', checkIfClickedOutside);
        document.addEventListener('mousedown', checkIfClickedOutside);

        return () => {
            // Cleanup the event listener
            document.removeEventListener('keydown', checkIfClickedOutside);
            document.removeEventListener('mousedown', checkIfClickedOutside);
        };
    }, [isMenuOpen]);

    return (
        <span ref={ref}>
            <span title={showTitle}
                className={classNames('dropdown', 'new-item-select')}
                onClick={() => toggleMenuState()}>
                <ArrowDownIcon />
            </span>
            {isMenuOpen && <InputItemsMenu onSelect={handleItemSelection} />}
        </span>
    );
}
