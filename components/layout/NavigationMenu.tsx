import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import {
  HEADER_ADMIN_CLICKED,
  HEADER_IMMEDIATE_HELP_CLICKED,
  HEADER_LOGIN_CLICKED,
  HEADER_OUR_BLOOM_TEAM_CLICKED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const listStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  height: '100%',
  marginLeft: { xs: 0, md: 'auto' },
  marginRight: { xs: 0, md: 0.5 },
  gap: { xs: 2, md: 0 },
} as const;

const listItemStyle = {
  width: 'auto',
  mb: 0,
} as const;

const listItemTextStyle = {
  span: {
    fontSize: 16,
  },
} as const;

const listButtonStyle = {
  borderRadius: 20,
  color: 'text.primary',
  fontFamily: 'Monterrat, sans-serif',
  paddingY: 0.5,

  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
} as const;

interface NavigationItem {
  title: string;
  href: string;
  target?: string;
  event: string;
  qaId?: string;
}

interface NavigationMenuProps {
  setAnchorEl?: Dispatch<SetStateAction<null | HTMLElement>>;
}

const NavigationMenu = (props: NavigationMenuProps) => {
  const { setAnchorEl } = props;
  const t = useTranslations('Navigation');
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });
  const [navigationLinks, setNavigationLinks] = useState<Array<NavigationItem>>([]);
  const router = useRouter();

  useEffect(() => {
    let links: Array<NavigationItem> = [];

    if (!user.loading) {
      if (partnerAdmin && partnerAdmin.partner) {
        links.push({
          title: t('admin'),
          href: '/partner-admin/create-access-code',
          event: HEADER_ADMIN_CLICKED,
          qaId: 'partner-admin-menu-button',
        });
      }

      links.push({
        title: t('meetTheTeam'),
        href: '/meet-the-team',
        event: HEADER_OUR_BLOOM_TEAM_CLICKED,
        qaId: 'meet-team-menu-button',
      });

      if (!partnerAdmin.partner) {
        links.push({
          title: t('immediateHelp'),
          qaId: 'immediate-help-menu-button',
          href: 'https://www.chayn.co/help',
          target: '_blank',
          event: HEADER_IMMEDIATE_HELP_CLICKED,
        });
      }

      if (!user.token) {
        links.push({
          title: t('login'),
          href: '/auth/login',
          event: HEADER_LOGIN_CLICKED,
          qaId: 'login-menu-button',
        });
      }
    }

    setNavigationLinks(links);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerAccesses, t, user, partnerAdmin]);

  return (
    <List sx={listStyle} onClick={() => setAnchorEl && setAnchorEl(null)}>
      {navigationLinks.map((link) => (
        <ListItem sx={listItemStyle} key={link.title} disablePadding>
          <ListItemButton
            sx={listButtonStyle}
            component={Link}
            href={link.href}
            qa-id={link.qaId}
            target={link.target || '_self'}
            onClick={() => {
              logEvent(link.event, eventUserData);
            }}
          >
            <ListItemText sx={listItemTextStyle} primary={link.title} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default NavigationMenu;
