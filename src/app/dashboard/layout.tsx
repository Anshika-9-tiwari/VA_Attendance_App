'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import { Stack } from '@mui/system';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GroupIcon from '@mui/icons-material/Group';
import ReportIcon from '@mui/icons-material/Report';
import LogoutIcon from '@mui/icons-material/Logout';
import Image from 'next/image';
import { CalendarDays, CalendarOff, LayoutDashboard, Layers } from 'lucide-react';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard /> },
  { text: 'Attendance', href: '/dashboard/attendancetracker', icon: <CalendarDays /> },
  { text: 'Employee', href: '/dashboard/employee', icon: <GroupIcon /> },
  { text: 'Leave Management', href: '/dashboard/leavemanagement', icon: <CalendarOff /> },
  { text: 'Attendance Reports', href: '/dashboard/attendancereports', icon: <ReportIcon /> },
  { text: 'Work Reports', href: '/dashboard/workreports', icon: <Layers /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    window.location.href = '/';
  };

  const drawerContent = (
    <>
      {/* Top Section with Logo and Close Button */}
      <Toolbar sx={{ justifyContent: 'space-between', py: 3 }}>
        <IconButton
          onClick={toggleDrawer}
          sx={{
            color: 'white',
            '&:hover': { backgroundColor: 'white', color: 'black' },
            padding: 0.5,
            marginRight: 0,
            marginTop: 1,
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ display: 'flex' }}>
          <Image
            src="/Velocity-ALogo2.png"
            alt="Velocity Logo"
            width={190}
            height={60}
            style={{
              objectFit: 'contain',
              maxHeight: '60px',
              maxWidth: '160px',
              marginRight: '10px',
              marginTop: '0px',
              padding: '0em',
            }}
            priority
          />
        </Box>
      </Toolbar>

      {/* Sidebar Menu */}
      <Stack
        direction={'column'}
        marginTop={7}
        spacing={0}
        sx={{ alignItems: 'left', justifyContent: 'left', width: { drawerWidth } }}
      >
        <List disablePadding>
          {menuItems.map(({ text, href, icon }) => (
            <ListItem key={text} disablePadding>
              <Link href={href} style={{ width: '100%' }}>
                <ListItemButton
                  selected={pathname === href}
                  sx={{
                    color: 'white',
                    pl: 2,
                    borderLeft: pathname === href ? '4px solid white' : 'none',
                    '&:hover': { backgroundColor: 'white', color: 'black' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {icon}
                    <ListItemText primary={text} />
                  </Box>
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
      </Stack>

      {/*Sign Out */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          width: '100%',
          px: 2,
        }}
      >
        <ListItemButton
          onClick={handleSignOut}
          sx={{
            color: 'white',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            '&:hover': { bgcolor: 'white', color: 'red' },
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <LogoutIcon />
          Sign Out
        </ListItemButton>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Toggle Drawer when closed */}
      {!open && (
        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            top: 15,
            left: 10,
            zIndex: 1200,
            backgroundColor: 'red',
            borderRadius: '0 4px 4px 0',
            color: 'white',
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}

      {/* Drawer */}
      <Drawer
        variant="persistent"
        open={open}
        anchor="left"
        sx={{
          width: drawerWidth,
          maxHeight: '850vh',
          flexShrink: 0,
          display: open ? 'block' : 'none',
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #a0dec3 0%, #7bad97 100%)',
            color: 'white',
            borderRight: 'none',
            borderTopRightRadius: '10px',
            borderBottomRightRadius: '5px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            transition: 'width 0.3s ease',
            zIndex: 1200,
            position: 'relative',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          ml: open ? `1%` : '0%',
          transition: 'margin 0.3s ease',
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
