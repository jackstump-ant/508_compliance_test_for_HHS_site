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
      {/* Official US Government Banner */}
      <GovBanner />

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

      {/* Footer/Identifier */}
      <Identifier>
        <IdentifierMasthead aria-label="Agency identifier">
          <IdentifierLogos>
            <IdentifierLogo href="#">
              <span className="usa-identifier__logo-text">
                Section 508 Compliance Office
              </span>
            </IdentifierLogo>
          </IdentifierLogos>
          <IdentifierIdentity domain="compliance.agency.gov">
            An official website of the{' '}
            <Link href="#">U.S. General Services Administration</Link>
          </IdentifierIdentity>
        </IdentifierMasthead>
        <IdentifierLinks navProps={{ 'aria-label': 'Important links' }}>
          <IdentifierLinkItem>
            <IdentifierLink href="#">About GSA</IdentifierLink>
          </IdentifierLinkItem>
          <IdentifierLinkItem>
            <IdentifierLink href="#">Accessibility support</IdentifierLink>
          </IdentifierLinkItem>
          <IdentifierLinkItem>
            <IdentifierLink href="#">FOIA requests</IdentifierLink>
          </IdentifierLinkItem>
          <IdentifierLinkItem>
            <IdentifierLink href="#">No FEAR Act data</IdentifierLink>
          </IdentifierLinkItem>
          <IdentifierLinkItem>
            <IdentifierLink href="#">
              Office of the Inspector General
            </IdentifierLink>
          </IdentifierLinkItem>
          <IdentifierLinkItem>
            <IdentifierLink href="#">Performance reports</IdentifierLink>
          </IdentifierLinkItem>
          <IdentifierLinkItem>
            <IdentifierLink href="#">Privacy policy</IdentifierLink>
          </IdentifierLinkItem>
        </IdentifierLinks>
        <IdentifierGov aria-label="U.S. government information and services">
          <div className="usa-identifier__usagov-description">
            Looking for U.S. government information and services?
          </div>
          <Link href="https://www.usa.gov/" className="usa-link">
            Visit USA.gov
          </Link>
        </IdentifierGov>
      </Identifier>
    </>
  );
}
