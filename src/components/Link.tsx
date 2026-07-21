import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export default function Link({ to, children, className, ...props }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (props.onClick) {
      props.onClick(e);
    }

    if (e.defaultPrevented) {
      return;
    }

    // Check if user is cmd+clicking / ctrl+clicking to open in new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      return;
    }
    
    e.preventDefault();
    window.history.pushState(null, '', to);
    // Dispatch popstate event so App.tsx can intercept the path change and update its state smoothly
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
