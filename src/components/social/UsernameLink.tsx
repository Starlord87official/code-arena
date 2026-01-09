import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UsernameLinkProps {
  username: string;
  className?: string;
  children?: React.ReactNode;
}

export function UsernameLink({ username, className, children }: UsernameLinkProps) {
  return (
    <Link
      to={`/profile/${username}`}
      className={cn(
        "hover:text-primary transition-colors hover:underline",
        className
      )}
    >
      {children || username}
    </Link>
  );
}
