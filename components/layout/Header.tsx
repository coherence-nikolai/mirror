import Link from 'next/link'
import styles from './Header.module.css'

type HeaderProps = {
  rightSlot?: React.ReactNode
}

export default function Header({ rightSlot }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/mirror" className="t-logo" style={{ textDecoration: 'none' }}>
        Mirror
      </Link>
      <nav className={styles.nav}>
        {rightSlot}
      </nav>
    </header>
  )
}
