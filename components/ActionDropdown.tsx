import React, { useState } from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from 'next/image';
import { Models } from 'node-appwrite';
import { actionsDropdownItems } from '@/constants';
import { ActionType } from '@/types';


const ActionDropdown = ({ file }: { file: Models.Document }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // open up a further model according to action
    const [action, setAction] = useState<ActionType | null>(null);

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger className='shad-no-focus'>
                    <Image
                        src="/assets/icons/dots.svg"
                        alt='dots'
                        width={34}
                        height={34}
                    />
                </DropdownMenuTrigger>

                {/* display the content after click */}
                <DropdownMenuContent>
                    <DropdownMenuLabel className='max-w-[200px] truncate'>{file.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actionsDropdownItems.map((menuItem) => (
                        <DropdownMenuItem key={menuItem.value}
                            className='shad-dropdown-item'
                            onClick={() => {
                                setAction(menuItem)

                                if (["rename", "share", "delete", "details"].includes(menuItem.value)) {
                                    setIsModalOpen(true);
                                }
                            }}
                        >
                            {menuItem.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

        </Dialog>

    )
}

export default ActionDropdown