import * as React from "react";
import {
  Page,
  Masthead,
  MastheadToggle,
  MastheadMain,
  MastheadBrand,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  Nav,
  NavItem,
  NavList,
} from "@patternfly/react-core";
import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon";
import { RedhatIcon } from "@patternfly/react-icons";

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const onSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const header = (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton
          variant="plain"
          aria-label="Global navigation"
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={onSidebarToggle}
          id="vertical-nav-toggle"
        >
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <RedhatIcon style={{ color: 'red', fontSize: '2.8em' }} />
        <MastheadBrand style={{ marginLeft: '10px', color:  'white', fontSize: '2em' }} href="https://github.com/RHEcosystemAppEng/cluster-iq" target="_blank">
        ClusterIQ
        </MastheadBrand>
      </MastheadMain>
    </Masthead>
  );

  const PageNav = (
    <Nav aria-label="Nav">
      <NavList>
        <NavItem itemId={0} to="/">
          Overview
        </NavItem>
        <NavItem itemId={1} to="/accounts">
          Accounts
        </NavItem>
        <NavItem itemId={2} to="/clusters">
          Clusters
        </NavItem>
        <NavItem itemId={3} to="/servers">
          Servers
        </NavItem>
        <NavItem itemId={4} to="/billing">
          Billing
        </NavItem>
      </NavList>
    </Nav>
  );
  const sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen} id="vertical-sidebar">
      <PageSidebarBody>{PageNav}</PageSidebarBody>
    </PageSidebar>
  );

  const pageId = "primary-app-container";

  return (
    <Page header={header} sidebar={sidebar} mainContainerId={pageId}>
      {children}
    </Page>
  );
};

export { AppLayout };
