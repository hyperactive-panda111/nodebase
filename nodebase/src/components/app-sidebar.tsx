'use client';

import {
    CreditCardIcon,
    FolderOpenIcon,
    HistoryIcon,
    KeyIcon,
    LogOutIcon,
    StarIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';


const menuItems = [
    {
        title: 'Main',
        items: [
            {
                title: 'Workflows',
                icon: FolderOpenIcon,
                url: '/workflows',
            },
            {
                title: 'Credentials',
                icon: KeyIcon,
                url: '/credentials',
            },
            {
                title: 'Executions',
                icon: HistoryIcon,
                url: '/executions',
            },
        ]
    }
];

export const AppSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Sidebar collapsible='icon'>
            <SidebarHeader className='list-none'>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        className='gap-x-4 h-10 px-4'
                    >
                        <Link href='/workflows' prefetch>
                        <Image src={'logo.svg'} width={30} height={30} alt={'nodebase'}/>
                        <span className='font-semibold text-sm'>Nodebase</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent className='list-none'>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={
                                                item.url === '/'
                                                ? pathname === '/'
                                                : pathname.startsWith(item.url)
                                            }
                                            asChild
                                            className='gap-x-4 h-10 px-4'
                                        >
                                            <Link href={item.url} prefetch>
                                                <item.icon className='size-4'/>
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={'Upgrade to Pro'}
                            className='gap-x-4 h-10 px-4'
                            onClick={() => {}}
                        >
                            <StarIcon className='h-4 w-4'/>
                            <span>Upgrade to Pro</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={'Billing portal'}
                            className='gap-x-4 h-10 px-4'
                            onClick={() => {}}
                        >
                            <CreditCardIcon className='h-4 w-4'/>
                            <span>Billing Portal</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={'Sign out'}
                            className='gap-x-4 h-10 px-4'
                            onClick={() => authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => router.push('/login'),
                                },
                            })}
                        >
                            <LogOutIcon className='h-4 w-4'/>
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}