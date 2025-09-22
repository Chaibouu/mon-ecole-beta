import { ReactNode, useState } from 'react';

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, open: boolean) => ReactNode;
  activeCondition: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const SidebarLinkGroup = ({
  children,
  activeCondition,
  isOpen: controlledOpen,
  onToggle,
}: SidebarLinkGroupProps) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(activeCondition);

  // Utiliser l'état contrôlé si fourni, sinon utiliser l'état interne
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleClick = () => {
    if (onToggle) {
      // État contrôlé : utiliser la fonction de callback
      onToggle(!open);
    } else {
      // État non contrôlé : utiliser l'état interne
      setInternalOpen(!open);
    }
  };

  return <li>{children(handleClick, open)}</li>;
};

export default SidebarLinkGroup;