import React, { useEffect, useRef, useState } from 'react';

import { ChevronDownIcon } from '@heroicons/react/solid';

import { classNames } from '@utils/classname-utils';
import { useOnClickOutside } from '@utils/utils';

export interface SelectBoxProps {
    defaultValue?: any,
    handleSelect?: { (value: any): void },
    placeholder?: string,
    modalAlignment?: string,
    children: React.ReactElement[],
}

const SelectBox = ({
    defaultValue,
    handleSelect,
    placeholder = 'Select',
    modalAlignment = 'left',
    children,
}: SelectBoxProps) => {
    const [showModal, setShowModal] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useOnClickOutside(ref, () => setShowModal(false));

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSelectBoxItemValue, setSelectedSelectBoxItemValue] = useState(defaultValue);

    type ValueToNameMapping = {
        [value: string]: string
    }
    const valueToNameMapping: ValueToNameMapping = {};
    const consturctValueToNameMapping = () => {
        React.Children.map(children, (child) => {
            valueToNameMapping[child.props.value] = child.props.name;
        });
    };
    consturctValueToNameMapping();

    useEffect(() => {
        if (selectedSelectBoxItemValue) {
            if(handleSelect) handleSelect(selectedSelectBoxItemValue);
            setShowModal(false);
        }
    }, [selectedSelectBoxItemValue]);

    const getOptionNamesFromChildren = (children: React.ReactElement[]): string[] => (
        React.Children.map(children, (child) => {
            return String(child.props.name);
        })
    );

    const getFilteredOptionNames = (searchQuery: string, allOptionNames: string[]) => {
        return searchQuery === ''
            ? allOptionNames
            : allOptionNames.filter((optionName: string) => {
                return optionName.toLowerCase().includes(searchQuery.toLowerCase());
            });
    };

    const allOptionNames = getOptionNamesFromChildren(children);
    const filteredOptionNames = new Set(getFilteredOptionNames(searchQuery, allOptionNames));
    
    return (
        <>
            <div className="relative">
                <form>
                    <input
                        key={ selectedSelectBoxItemValue ? valueToNameMapping[selectedSelectBoxItemValue] : null }
                        className="w-full inline-flex rounded-md border border-gray-300 pl-4 pr-6 py-2 bg-white text-sm
                                font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-opacity-100
                                focus:outline-none focus:ring-blue-300"
                        type="input"
                        placeholder={ selectedSelectBoxItemValue ? undefined : placeholder }
                        defaultValue={
                            selectedSelectBoxItemValue ? valueToNameMapping[selectedSelectBoxItemValue] : undefined
                        }
                        onChange={ (e) => setSearchQuery(e.target.value) }
                        onClick={ () => setShowModal(true) }
                    />
                </form>
                <ChevronDownIcon
                    className="absolute top-1/2 right-2 h-5 w-5 text-gray-400 -translate-y-1/2"
                    aria-hidden="true"
                />
                { showModal && (filteredOptionNames.size !== 0) ? (
                    <div
                        ref={ ref }
                        className={ classNames(
                            'absolute min-w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5',
                            'divide-y divide-gray-100 focus:outline-none -bottom-1 translate-y-full min-w-full',
                            modalAlignment === 'left' ? 'left-0' : 'right-0'
                        ) }
                    >
                        { React.Children.map(children, (child) => {
                            if (filteredOptionNames.has(String(child.props.name))) {
                                return (
                                    <>
                                        { React.cloneElement(child, {
                                            setSelectedSelectBoxItemValue: setSelectedSelectBoxItemValue,
                                        }) }
                                    </>
                                );
                            }
                            return null;
                        }) }
                    </div>
                ) : null }
            </div>
        </>
    );
};

export default SelectBox;
