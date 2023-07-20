import { useMemo } from "react";
import { Routes, Route, Navigate  } from 'react-router-dom';

import useRoutePathReloader from "./hooks/useRoutePathReloader";

import useCanister from "./feature/canister-provider/useCanister";

import NavMenu from './components/Header';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Payments from "./pages/Payments";
import SendPayment from './pages/SendPayment';
import PaymentDetails from './pages/PaymentDetails';

const App =() => {
  useRoutePathReloader();
  return useMemo(() => <Layout />, []);
}

const Layout = () => {
  return (
    <div className="min-w-[19rem] xl:container xl:mx-auto">
      <NavMenu />
      <div className="absolute inset-x-0 bottom-[1rem] top-[4.25rem] h-full xl:container xl:mx-auto">
        <AppRoutes />
      </div>
    </div>
  )
};

const AppRoutes = () => {
  const { isAuthenticated } = useCanister();
  const protectedRoutes = (
    <>
    <Route path="/" exact element={<Home />} />
    <Route path="/payments" exact element={<Payments />} />
    <Route path="/payments/create" exact element={<SendPayment />} />
    <Route path="/payments/p/:id" exact element={<PaymentDetails />} />
    </>
  );
  const publicRoutes = (
    <Route path="/" exact element={<Landing />} />
  );
  return (
    <Routes>
      {isAuthenticated ? protectedRoutes : publicRoutes}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
};

export default App;
