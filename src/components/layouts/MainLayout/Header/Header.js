import React from 'react';
import cn from 'clsx';
import styles from './styles.module.scss';
import SelectMode from '@/components/common/SelectMode/SelectMode';
import { ReactComponent as LogoIcon } from './icons/duck.svg';

const Header = ({ className }) => {
  return (
    <div className={cn(styles.header, className)}>
      <div className={styles.title}>
        <LogoIcon className={styles.logoIcon} /> <div>Duck Paint</div>
      </div>
      <SelectMode />
    </div>
  );
};

export default Header;
