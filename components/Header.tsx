import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header>
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/account">Account</Link></li>
          <li><Link href="/messages">Messages</Link></li>
          {/* Add other navigation items as needed */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
