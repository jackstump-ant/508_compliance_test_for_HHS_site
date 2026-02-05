'use client';

import React from 'react';
import {
  GovBanner,
  Header,
  Title,
  NavMenuButton,
  PrimaryNav,
  Identifier,
  IdentifierMasthead,
  IdentifierLogos,
  IdentifierLogo,
  IdentifierIdentity,
  IdentifierLinks,
  IdentifierLinkItem,
  IdentifierLink,
  IdentifierGov,
  IdentifierLinkItem as LinkItem,
  Link,
} from '@trussworks/react-uswds';

interface GovernmentLayoutProps {
  children: React.ReactNode;
}

export default function GovernmentLayout({ children }: GovernmentLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const navItems = [
    <Link key="home" href="/" className="usa-nav__link">
      <span>Home</span>
    </Link>,
    <Link key="upload" href="/upload" className="usa-nav__link">
      <span>Submit Document</span>
    </Link>,
    <Link key="dashboard" href="/dashboard" className="usa-nav__link">
      <span>Reviewer Dashboard</span>
    </Link>,
  ];

  return (
    <>
      {/* Official US Government Banner - hidden for cleaner look */}
      {/* <GovBanner /> */}

      {/* Site Header */}
      <Header basic={true}>
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>
              <Link href="/" title="Home" aria-label="Home">
                508 Compliance Review
              </Link>
            </Title>
            <NavMenuButton onClick={toggleMobileNav} label="Menu" />
          </div>
          <PrimaryNav
            items={navItems}
            mobileExpanded={mobileNavOpen}
            onToggleMobileNav={toggleMobileNav}
          />
        </div>
      </Header>

      {/* Main Content */}
      <main id="main-content" className="usa-section">
        <div className="grid-container">
          {children}
        </div>
      </main>

      {/* Footer/Identifier - removed for cleaner look */}
    </>
  );
}
