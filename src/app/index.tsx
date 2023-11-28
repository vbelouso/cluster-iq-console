import * as React from "react";
import "@patternfly/react-core/dist/styles/base.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout/AppLayout";
import Overview from "./Overview/Overview";
import Clusters from "./Clusters/Clusters";
import ClusterDetails from "./ClusterDetails/ClusterDetails";
import AccountDetails from "./AccountDetails/AccountDetails";
import Servers from "./Servers/Servers"
import Accounts from "./Accounts/Accounts"

const AppRoutes = (): React.ReactElement => (
  <Routes>
    <Route path="/" element={<Overview />} />
    <Route path="clusters" element={<Clusters />} />
    <Route path="servers" element={<Servers />} />
    <Route path="accounts" element={<Accounts />} />
    <Route path="accounts/:accountName" element={<AccountDetails />} />
    <Route path="accounts/:accountName/clusters/:clusterName" element={<ClusterDetails />} />
  </Routes>
);

const App: React.FunctionComponent = () => (
  <Router>
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  </Router>
);

export default App;
