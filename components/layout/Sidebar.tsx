import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LayoutDashboardIcon,
  SchoolIcon,
  UsersIcon,
  CheckSquareIcon,
  HistoryIcon,
  UserIcon,
} from '../Icons';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
  { name: 'Classes', href: '/classes', icon: SchoolIcon },
  { name: 'Students', href: '/students', icon: UsersIcon },
  { name: 'Mark Attendance', href: '/attendance/mark', icon: CheckSquareIcon },
  {
    name: 'Attendance History',
    href: '/attendance/history',
    icon: HistoryIcon,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onMobileClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawer = (
    <div className="flex flex-col h-full bg-indigo-700">
      <Toolbar className="flex items-center px-4 bg-indigo-800">
        <SchoolIcon className="h-8 w-auto text-white" />
        <Typography variant="h6" className="ml-3 text-white font-bold">
          Attendance Pro
        </Typography>
      </Toolbar>
      <Divider className="bg-indigo-600" />
      <List className="flex-1 px-2 py-4 space-y-1">
        {navigation.map(item => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors duration-200 ${
                isActive
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
              }`
            }
            onClick={isMobile && onMobileClose ? onMobileClose : undefined}
          >
            <ListItemIcon className="min-w-0 mr-3 text-indigo-300">
              <item.icon className="h-6 w-6" />
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              className="text-inherit"
              primaryTypographyProps={{ className: 'font-medium' }}
            />
          </NavLink>
        ))}
      </List>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            backgroundColor: 'transparent',
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
          border: 'none',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
