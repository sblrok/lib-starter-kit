import styled from 'react-emotion';
import getTheme from '@lskjs/theme/getTheme';

export const Wrapper = styled('main')`
  background: ${p => getTheme(p.theme, 'colors.mainBackground')};
`;

export const Header = styled('header')`
  background: ${p => getTheme(p.theme, 'colors.white')};
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.04), 0 2px 4px 0 rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 1;
`;

export const TopBar = styled('div')`
  background: ${p => getTheme(p.theme, 'colors.header')};
  color: ${p => getTheme(p.theme, 'colors.white')};
`;

export const SubBar = styled('div')`
  background: ${p => getTheme(p.theme, 'colors.white')};
  color: ${p => getTheme(p.theme, 'colors.main')};
`;

export const Body = styled('section')`
  position: relative;
`;
